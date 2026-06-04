import {
  SourceVideoElementPush,
  SinkChunk,
  NodeViewSample,
  NodeImageSampler,
  NodeInfer,
  NodeScaleVideoFrame
} from "../../lib/pipeline";

class Layout {
  /** @type {Readonly<number>} */
  static sourceFrame = 0;
  /** @type {Readonly<number>} */
  static sampleFrame = 1;
  /** @type {Readonly<number>} */
  static sampleData = 2;
  /** @type {Readonly<number>} */
  static sampleInferred = 3;
  /** @type {Readonly<number>} */
  static max = 3;
}

export class PipelineUpscale {
  /**
   * @param {MediaInfo} media
   * @param {ModelInfo} model
   * @param {InferenceInfo} inference
   * @returns {Promise<[VideoFrameSource, [(ReadableStream<any[]>), (WritableStream<any[]>), (TransformStream<any[], any[]>[])]]>}
   */
  static async create(media, model, inference) {
    console.debug(PipelineUpscale.name, PipelineUpscale.create.name);

    /** @type {TransformStream<any[], any[]>[]} */
    const streamNodes = [];

    streamNodes.push(
      await NodeScaleVideoFrame.create({
        input: { frame: Layout.sourceFrame },
        output: { frame: Layout.sampleFrame },
        scaling:
          media.width != model.input.width || media.height != model.input.height
            ? { resizeWidth: model.input.width, resizeHeight: model.input.height }
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
      await NodeViewSample.create({
        input: { sample: Layout.sampleData },
        displaySize: model.output,
        containerId: "upscale-browser",
        sample: model.input,
        method: "Normalise",
        norm: [1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0]
      })
    );

    streamNodes.push(
      await NodeViewSample.create({
        input: { sample: Layout.sampleInferred },
        containerId: "upscale-inferred",
        sample: model.output,
        method: "Normalise",
        norm: [1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0]
      })
    );

    const [frameSource, streamSource] = await SourceVideoElementPush.create({
      containerId: "input-container",
      media: media,
      uiId: "control-info",
      reframe: false,
      output: { frame: Layout.sourceFrame },
      chunkSize: Layout.max
    });

    const streamSink = await SinkChunk.create();

    return [frameSource, [streamSource, streamSink, streamNodes]];
  }
}
