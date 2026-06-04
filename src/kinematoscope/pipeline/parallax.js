import {
  SourceVideoElementPush,
  SinkChunk,
  NodeViewImage,
  NodeViewSample,
  NodeImageSampler,
  NodeInfer,
  NodeParallax,
  NodeDepthMap,
  NodeScaleVideoFrame
} from "../../lib/pipeline";

class Layout {
  static sourceFrame = 0;
  static sampleFrame = 1;
  static sampleData = 2;
  static sampleInferred = 3;
  static depthMap = 4;
  static max = 5;
}

export class PipelineParallax {
  /**
   * @param {MediaInfo} media
   * @param {ModelInfo} model
   * @param {InferenceInfo} inference
   * @returns {Promise<[VideoFrameSource, [(ReadableStream<any[]>), (WritableStream<any[]>), (TransformStream<any[], any[]>[])]]>}
   */
  static async create(media, model, inference) {
    console.debug(PipelineParallax.name, PipelineParallax.create.name);

    /** @type {TransformStream<any[], any[]>[]} */
    const streamNodes = [];

    streamNodes.push(
      await NodeScaleVideoFrame.create({
        input: { frame: Layout.sourceFrame },
        output: { frame: Layout.sampleFrame },
        scaling:
          media.width != model.input.width || media.height != model.input.height
            ? { resizeWidth: model.input.width, resizeHeight: model.input.height, resizeQuality: "high" }
            : undefined
      })
    );

    streamNodes.push(
      await NodeImageSampler.create({
        input: { frame: Layout.sampleFrame },
        output: { sample: Layout.sampleData },
        layout: model.input
      })
    );

    streamNodes.push(
      await NodeInfer.create({
        input: { sample: Layout.sampleData },
        output: { sample: Layout.sampleInferred },
        model: model,
        inference: inference
      })
    );

    streamNodes.push(
      await NodeDepthMap.create({
        input: { sample: Layout.sampleInferred },
        output: { sample: Layout.depthMap },
        sample: { ...model.output, format: "r" },
        depth: { ...model.output, type: "float32", layout: "interleaved", format: "rr" },
        rangeOptions: [
          { min: 0, max: 1 },
          { min: 0.5, max: 1 },
          { min: 0, max: 0.5 }
        ],
        uiId: "control-info",
        invertRange: model.invertOutput
      })
    );

    streamNodes.push(
      await NodeParallax.create({
        input: { frame: Layout.sourceFrame, depthSample: Layout.depthMap },
        containerId: "output-container",
        sample: { ...model.output, type: "float32", layout: "interleaved", format: "rg" },
        media: media,
        uiId: "control-info"
      })
    );

    streamNodes.push(
      await NodeViewImage.create({
        input: { image: Layout.sampleFrame },
        containerId: "sample-source",
        controlId: "debug-visible",
        size: model.input
      })
    );

    streamNodes.push(
      await NodeViewSample.create({
        input: { sample: Layout.sampleData },
        containerId: "sample-data",
        sample: model.input,
        method: "MinMaxSample",
        controlId: "debug-visible"
      })
    );

    streamNodes.push(
      await NodeViewSample.create({
        input: { sample: Layout.sampleInferred },
        containerId: "sample-inferred",
        sample: model.output,
        method: "ColourMap",
        colourMap: "turbo",
        controlId: "debug-visible"
      })
    );

    streamNodes.push(
      await NodeViewSample.create({
        input: { sample: Layout.depthMap },
        containerId: "sample-depth",
        sample: { ...model.output, layout: "interleaved", format: "rg" },
        method: "Normalise",
        norm: [1.0 / 255.0, 1.0 / 255.0],
        controlId: "debug-visible"
      })
    );

    const [frameSource, streamSource] = await SourceVideoElementPush.create({
      containerId: "input-container",
      media: media,
      uiId: "control-info",
      reframe: true,
      pauseFps: 1,
      output: { frame: Layout.sourceFrame },
      chunkSize: Layout.max
    });

    const streamSink = await SinkChunk.create();

    return [frameSource, [streamSource, streamSink, streamNodes]];
  }
}
