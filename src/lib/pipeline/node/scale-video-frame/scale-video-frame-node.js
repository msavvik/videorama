// @ts-ignore
import workerUrl from "./scale-video-frame-worker-instance?url";
import { NodeWorker } from "../../node-worker";
import { Spinner } from "../../../../ui/spinner";

/** @implements {Transformer<any[], any[]>} */
export class NodeScaleVideoFrame {
  /** @private */
  static instanceId = 0;

  /**
   * @param {NodeScaleVideoFrameOptions} options
   * @returns {Promise<TransformStream<any[], any[]>>}
   */
  static async create(options) {
    const nodeId = `${NodeScaleVideoFrame.name}-${NodeScaleVideoFrame.instanceId}`;
    NodeScaleVideoFrame.instanceId++;
    const tag = options.tag ?? nodeId;

    console.debug(tag, NodeScaleVideoFrame.name, NodeScaleVideoFrame.create.name);
    Spinner.setLabel(tag);

    const worker = await NodeWorker.create(workerUrl, tag);

    await worker.configure(options.scaling);

    return new TransformStream(new NodeScaleVideoFrame(worker, options, tag), options.writableStrategy, options.readableStrategy);
  }

  /**
   * @private
   * @param {NodeWorker} instance
   * @param {NodeScaleVideoFrameOptions} options
   * @param {string} tag
   */
  constructor(instance, options, tag) {
    /** @private */
    this.tag = tag.concat(" ", NodeScaleVideoFrame.name);
    console.debug(this.tag);

    /** @private */
    this.worker = instance;
    /** @private */
    this.frameIndex = options.input.frame;
    /** @private */
    this.frameScaledIndex = options.output.frame;
    /** @private @type {Promise<any[]>} */
    this.workerResult = Promise.resolve(null);
  }

  /**
   * @param {TransformStreamDefaultController<any[]>} controller
   */
  start(controller) {
    console.debug(this.tag, NodeScaleVideoFrame.name, this.start.name);

    Spinner.deleteStartingIn(this.tag);
  }

  /**
   * @param {any[]} chunk
   * @param {TransformStreamDefaultController<any[]>} controller
   */
  async transform(chunk, controller) {
    const start = performance.now();

    [chunk[this.frameIndex], chunk[this.frameScaledIndex]] = await (this.workerResult = this.worker.process(
      chunk[this.frameIndex]
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

    NodeScaleVideoFrame.instanceId--;
    if (NodeScaleVideoFrame.instanceId < 0) {
      throw new Error(`Invalid instanceId: ${NodeScaleVideoFrame.instanceId}`);
    }

    await this.workerResult;
    await this.worker.dispose();
    this.worker.terminate();

    this.worker = undefined;
    this.workerResult = undefined;

    Spinner.clearLabel(this.tag);
  }
}
