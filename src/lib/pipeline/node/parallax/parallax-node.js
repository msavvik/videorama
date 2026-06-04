// @ts-ignore
import workerUrl from "./parallax-worker-instance?url";
import { NodeWorker } from "../../node-worker";
import { Spinner } from "../../../../ui/spinner";
import { UiParallax } from "./parallax-ui";

/**
 * @implements {Transformer<any[],any[]>}
 * @implements {IOptionsNode}
 */
export class NodeParallax {
  /** @private */
  static instanceId = 0;

  /**
   * @param {NodeParallaxOptions} options
   * @returns {Promise<TransformStream<any[], any[]>>}
   */
  static async create(options) {
    const nodeId = `${NodeParallax.name}-${NodeParallax.instanceId}`;
    NodeParallax.instanceId++;
    const tag = options.tag ?? nodeId;

    console.debug(tag, NodeParallax.create.name);
    Spinner.setLabel(tag);

    const canvas = document.createElement("canvas");
    canvas.id = nodeId;
    canvas.width = options.media.width;
    canvas.height = options.media.height;
    document.getElementById(options.containerId).appendChild(canvas);

    const worker = await NodeWorker.create(workerUrl, tag);
    await worker.configure(canvas.transferControlToOffscreen(), options.sample);

    return new TransformStream(
      new NodeParallax(worker, options, canvas.id, tag),
      options.writableStrategy,
      options.readableStrategy
    );
  }

  /**
   * @private
   * @param {NodeWorker} instance
   * @param {NodeParallaxOptions} options
   * @param {string} canvasId
   * @param {string} tag
   */
  constructor(instance, options, canvasId, tag) {
    /** @private */
    this.tag = tag.concat(" ", NodeParallax.name);
    console.debug(this.tag);

    /** @private */
    this.canvasId = canvasId;
    /** @private */
    this.frameIndex = options.input.frame;
    /** @private */
    this.sampleIdex = options.input.depthSample;
    /** @private */
    this.worker = instance;
    /** @private @type {Promise<any[]>} */
    this.workerResult = Promise.resolve(null);

    if (options.uiId) {
      /** @private */
      this.uiId = options.uiId;
      /** @private */
      this.ui = new UiParallax(this, options.containerId);
    }
  }

  /**
   * @param {ParallaxOptions} options
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

    [chunk[this.frameIndex], chunk[this.sampleIdex]] = await (this.workerResult = this.worker.processMany(
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

    document.getElementById(this.canvasId).remove();
    this.canvasId = undefined;

    NodeParallax.instanceId--;
    if (NodeParallax.instanceId < 0) {
      throw new Error(`Invalid instanceId: ${NodeParallax.instanceId}`);
    }

    await this.workerResult;
    await this.worker.dispose();
    this.worker.terminate();

    this.workerResult = undefined;
    this.worker = undefined;

    Spinner.clearLabel(this.tag);
  }
}
