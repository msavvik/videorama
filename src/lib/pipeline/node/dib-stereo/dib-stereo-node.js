// @ts-ignore
import workerUrl from "./dib-stereo-worker-instance?url";
import { NodeWorker } from "../../node-worker";
import { Spinner } from "../../../../ui/spinner";
import { UiDepthImageBasedStereo } from "./dib-stereo-ui";

/**
 * @implements {Transformer<any[],any[]>}
 * @implements {IOptionsNode}
 */
export class NodeDepthImageBasedStereo {
  /** @private */
  static instanceId = 0;

  /**
   * @param {NodeDepthImageBasedStereoOptions} options
   * @returns {Promise<TransformStream<any[], any[]>>}
   */
  static async create(options) {
    const tag = options.tag ?? `${NodeDepthImageBasedStereo.name}-${NodeDepthImageBasedStereo.instanceId}`;
    NodeDepthImageBasedStereo.instanceId++;

    console.debug(tag, NodeDepthImageBasedStereo.name, NodeDepthImageBasedStereo.create.name);
    Spinner.setLabel(tag);

    const worker = await NodeWorker.create(workerUrl, tag);
    await worker.configure(options.media.width, options.media.height, options.layout);

    return new TransformStream(
      new NodeDepthImageBasedStereo(worker, options, tag),
      options.writableStrategy,
      options.readableStrategy
    );
  }

  /**
   * @private
   * @param {NodeWorker} instance
   * @param {NodeDepthImageBasedStereoOptions} options
   * @param {string} tag
   */
  constructor(instance, options, tag) {
    /** @private */
    this.tag = tag.concat(" ", NodeDepthImageBasedStereo.name);
    console.debug(this.tag);

    /** @private */
    this.worker = instance;
    /** @private @type {Promise<any[]>} */
    this.workerResult = Promise.resolve(null);
    /** @private */
    this.frameIndex = options.input.frame;
    /** @private */
    this.sampleIdex = options.input.depthSample;
    /** @private */
    this.dibIndex = options.output.dibFrame;

    if (options.uiId) {
      /** @private */
      this.uiId = options.uiId;
      /** @private */
      this.ui = new UiDepthImageBasedStereo(this);
    }
  }

  /**
   * @param  {DepthImageBasedStereoOptions} options
   */
  setOptions(options) {
    this.worker.postMessage(["options", options]);
  }

  /**
   * @param {TransformStreamDefaultController<any[]>} controller
   */
  start(controller) {
    console.debug(this.tag, this.start.name);

    this.ui?.show(this.uiId);

    Spinner.deleteStartingIn(this.tag);
  }

  /**
   * @param {any[]} chunk
   * @param {TransformStreamDefaultController<any[]>} controller
   */
  async transform(chunk, controller) {
    const start = performance.now();

    [chunk[this.frameIndex], chunk[this.sampleIdex], chunk[this.dibIndex]] = await (this.workerResult = this.worker.processMany(
      chunk[this.frameIndex],
      chunk[this.sampleIdex]
    ));
    controller.enqueue(chunk);

    console.log(this.tag, this.transform.name, performance.now() - start);
  }

  /**
   * @param {TransformStreamDefaultController<any[]>} controller
   */
  async flush(controller) {
    console.debug(this.tag, this.flush.name);
    Spinner.setLabel(this.tag);

    if (this.ui) {
      this.ui.dispose();
      this.ui = undefined;
      this.uiId = undefined;
    }

    NodeDepthImageBasedStereo.instanceId--;
    if (NodeDepthImageBasedStereo.instanceId < 0) {
      throw new Error(`Invalid instanceId: ${NodeDepthImageBasedStereo.instanceId}`);
    }

    await this.workerResult;
    await this.worker.dispose();
    this.worker.terminate();

    this.workerResult = undefined;
    this.worker = undefined;

    Spinner.clearLabel(this.tag);
  }
}
