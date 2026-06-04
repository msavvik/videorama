// @ts-ignore
import workerUrl from "./view-image-worker-instance?url";
import { NodeWorker } from "../../node-worker";
import { Spinner } from "../../../../ui/spinner";
import { viewControlElement } from "../../../view-control";

/**
 * @implements {Transformer<any[], any[]>}`
 */
export class NodeViewImage {
  /** @private */
  static instanceId = 0;

  /**
   * @param {NodeViewImageOptions} options
   * @returns {Promise<TransformStream<any[], any[]>>}
   */
  static async create(options) {
    const nodeId = `${NodeViewImage.name}-${NodeViewImage.instanceId}`;
    NodeViewImage.instanceId++;
    const tag = options.tag ?? nodeId;

    console.debug(tag, NodeViewImage.create.name);
    Spinner.setLabel(tag);

    const canvas = document.createElement("canvas");
    canvas.id = nodeId;
    canvas.width = options.size.width;
    canvas.height = options.size.height;

    const displaySize = options.displaySize ?? options.size;
    canvas.style.width = `${displaySize.width}px`;
    canvas.style.height = `${displaySize.height}px`;

    const container = document.getElementById(options.containerId);
    container.appendChild(canvas);
    container.parentElement.hidden = false;

    const worker = await NodeWorker.create(workerUrl, tag);
    await worker.configure(canvas.transferControlToOffscreen());

    return new TransformStream(
      new NodeViewImage(worker, options, canvas.id, tag),
      options.writableStrategy,
      options.readableStrategy
    );
  }

  /**
   * @param {NodeWorker<TransferableCanvasImageSource>} instance
   * @param {NodeViewImageOptions} options
   * @param {string} canvasId
   * @param {string} tag
   */
  constructor(instance, options, canvasId, tag) {
    /** @private */
    this.tag = tag.concat(" ", NodeWorker.name);
    console.debug(this.tag);

    /** @private */
    this.worker = instance;
    /** @private @type {Promise<TransferableCanvasImageSource>} */
    this.workerResult = Promise.resolve(null);
    /** @private */
    this.imageIndex = options.input.image;
    /** @private */
    this.viewControl = viewControlElement(options.controlId, true);
    /** @private */
    this.canvasId = canvasId;
    /** @private */
    this.containerId = options.containerId;
  }

  /**
   * @param {TransformStreamDefaultController<any[]>} controller
   */
  start(controller) {
    console.debug(this.tag, this.start.name);

    Spinner.deleteStartingIn(this.tag);
  }

  /**
   * @param {any[]} chunk
   * @param {TransformStreamDefaultController<any[]>} controller
   */
  async transform(chunk, controller) {
    const start = performance.now();

    if (this.viewControl.checked) {
      chunk[this.imageIndex] = await (this.workerResult = this.worker.process(chunk[this.imageIndex]));
    }
    controller.enqueue(chunk);

    console.log(this.tag, this.transform.name, performance.now() - start);
  }

  /**
   * @param {TransformStreamDefaultController<any[]>} controller
   */
  async flush(controller) {
    console.debug(this.tag, this.flush.name);
    Spinner.setLabel(this.tag);

    NodeViewImage.instanceId--;
    if (NodeViewImage.instanceId < 0) {
      throw new Error(`Invalid instanceId: ${NodeViewImage.instanceId}`);
    }

    await this.workerResult;
    await this.worker.dispose();
    this.worker.terminate();

    document.getElementById(this.canvasId).remove();
    document.getElementById(this.containerId).parentElement.hidden = true;

    this.workerResult = undefined;
    this.worker = undefined;
    this.canvasId = undefined;
    this.containerId = undefined;
    this.viewControl = undefined;

    Spinner.clearLabel(this.tag);
    this.tag = undefined;
  }
}
