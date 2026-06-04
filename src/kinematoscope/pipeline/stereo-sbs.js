import {
  SourceVideoElementPush,
  SinkChunk,
  NodeViewImage,
  NodeViewSample,
  NodeImageSampler,
  NodeInfer,
  NodeDepthMap,
  NodeScaleVideoFrame,
  NodeDepthImageBasedStereo,
  NodeStereoSideBySide
} from "../../lib/pipeline";

class Layout {
  static sourceFrame = 0;
  static sampleFrame = 1;
  static sampleData = 2;
  static sampleInferred = 3;
  static depthMap = 4;
  static dibFrame = 5;
  static max = 6;
}

export class PipelineStereoSideBySide {
  /**
   * @param {MediaInfo} media
   * @param {ModelInfo} model
   * @param {InferenceInfo} inference
   * @returns {Promise<[VideoFrameSource, [(ReadableStream<any[]>), (WritableStream<any[]>), (TransformStream<any[], any[]>[])]]>}
   */
  static async create(media, model, inference) {
    console.debug(PipelineStereoSideBySide.name, PipelineStereoSideBySide.create.name);

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
        sample: model.input,
        depth: { ...model.output, type: "float32", layout: "interleaved", format: "r" },
        rangeOptions: [
          { min: 0, max: 1 },
          { min: 0.5, max: 1 },
          { min: 0, max: 0.5 }
        ],
        uiId: "control-info"
      })
    );

    streamNodes.push(
      await NodeDepthImageBasedStereo.create({
        input: { frame: Layout.sourceFrame, depthSample: Layout.depthMap },
        output: { dibFrame: Layout.dibFrame },
        media: media,
        layout: { ...model.output, type: "float32", layout: "interleaved", format: "g" },
        uiId: "control-info"
      })
    );

    streamNodes.push(
      await NodeStereoSideBySide.create({
        input: { dibFrame: Layout.dibFrame },
        containerId: "output-container",
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
        sample: { ...model.output, layout: "interleaved", format: "g" },
        method: "Normalise",
        norm: [1.0 / 255.0],
        controlId: "debug-visible"
      })
    );

    streamNodes.push(
      await NodeViewImage.create({
        input: { image: Layout.dibFrame },
        containerId: "dib-frame",
        controlId: "debug-visible",
        size: model.output
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
