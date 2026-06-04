// @ts-ignore
import workerUrl from "./view-sample-worker-instance?url";
import { NodeWorker } from "../../node-worker";
import { Spinner } from "../../../../ui/spinner";
import { viewControlElement } from "../../../view-control";

/**
 * @implements {Transformer<any[], any[]>}
 */
export class NodeViewSample {
  /** @private */
  static instanceId = 0;

  /**
   * @param {NodeViewSampleOptions} options
   * @returns {Promise<TransformStream<any[], any[]>>}
   */
  static async create(options) {
    const nodeId = `${NodeViewSample.name}-${NodeViewSample.instanceId} ${options.method}`;
    NodeViewSample.instanceId++;
    const tag = options.tag ?? nodeId;

    console.debug(tag, NodeViewSample.create.name);
    Spinner.setLabel(tag);

    const canvas = document.createElement("canvas");
    canvas.id = nodeId;
    canvas.width = options.sample.width;
    canvas.height = options.sample.height;

    const displaySize = options.displaySize ?? options.sample;
    canvas.style.width = `${displaySize.width}px`;
    canvas.style.height = `${displaySize.height}px`;

    const container = document.getElementById(options.containerId);
    container.appendChild(canvas);
    container.parentElement.hidden = false;

    const worker = await NodeWorker.create(workerUrl, tag);
    await worker.configure(canvas.transferControlToOffscreen(), options);

    return new TransformStream(
      new NodeViewSample(worker, options, canvas.id, tag),
      options.writableStrategy,
      options.readableStrategy
    );
  }

  /**
   * @param {NodeWorker} instance
   * @param {NodeViewSampleOptions} options
   * @param {string} canvasId
   * @param {string} tag
   */
  constructor(instance, options, canvasId, tag) {
    /** @private */
    this.tag = tag.concat(" ", NodeWorker.name);
    console.debug(this.tag);

    /** @private */
    this.worker = instance;
    /** @private @type {Promise<any>} */
    this.workerResult = Promise.resolve(null);
    /** @private */
    this.sampleIndex = options.input.sample;
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
      chunk[this.sampleIndex] = await (this.workerResult = this.worker.process(chunk[this.sampleIndex]));
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

    NodeViewSample.instanceId--;
    if (NodeViewSample.instanceId < 0) {
      throw new Error(`Invalid instanceId: ${NodeViewSample.instanceId}`);
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
  }
}
