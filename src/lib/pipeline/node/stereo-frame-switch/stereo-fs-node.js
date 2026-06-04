// @ts-ignore
import workerUrl from "./stereo-fs-worker-instance?url";
import { NodeWorker } from "../../node-worker";
import { Spinner } from "../../../../ui/spinner";
import { UiStereoFrameSwitch } from "./stereo-fs-ui";

/**
 * @implements {Transformer<any[],any[]>}
 * @implements {IOptionsNode}
 */
export class NodeStereoFrameSwitch {
  /** @private */
  static instanceId = 0;

  /**
   * @param {NodeStereoFrameSwitchOptions} options
   */
  static async create(options) {
    const nodeId = `${NodeStereoFrameSwitch.name}-${NodeStereoFrameSwitch.instanceId}`;
    NodeStereoFrameSwitch.instanceId++;
    const tag = options.tag ?? nodeId;

    console.debug(tag, NodeStereoFrameSwitch.create.name);
    Spinner.setLabel(tag);

    const frameCanvas = document.createElement("canvas");
    frameCanvas.id = nodeId.concat("-frame-switch");
    frameCanvas.width = options.media.width;
    frameCanvas.height = options.media.height;

    document.getElementById(options.containerId).appendChild(frameCanvas);

    const worker = await NodeWorker.create(workerUrl, tag);
    await worker.configure(frameCanvas.transferControlToOffscreen());

    return new TransformStream(
      new NodeStereoFrameSwitch(worker, options, frameCanvas.id, tag),
      options.writableStrategy,
      options.readableStrategy
    );
  }

  /**
   * @private
   * @param {NodeWorker} instance
   * @param {NodeStereoFrameSwitchOptions} options
   * @param {string} canvasId
   * @param {string} tag
   */
  constructor(instance, options, canvasId, tag) {
    /** @private */
    this.tag = tag.concat(" ", NodeStereoFrameSwitch.name);
    console.debug(this.tag);

    /** @private */
    this.worker = instance;
    /** @private */
    this.canvasId = canvasId;
    /** @private */
    this.dibIndex = options.input.dibFrame;
    /** @private @type {Promise<any[]>} */
    this.workerResult = Promise.resolve(null);

    if (options.uiId) {
      /** @private */
      this.uiId = options.uiId;
      /** @private */
      this.ui = new UiStereoFrameSwitch(this, options.containerId);
    }
  }

  /**
   * @param {StereoFrameSwitchOptions} options
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

    chunk[this.dibIndex] = await (this.workerResult = this.worker.process(chunk[this.dibIndex]));
    controller.enqueue(chunk);

    console.log(this.tag, this.transform.name, performance.now() - start);
  }

  /**
   * @param {TransformStreamDefaultController<any[]>} controller
   */
  async flush(controller) {
    console.debug(this.tag, this.flush.name);
    Spinner.setLabel(this.tag);

    NodeStereoFrameSwitch.instanceId--;
    if (NodeStereoFrameSwitch.instanceId < 0) {
      throw new Error(`Invalid instanceId: ${NodeStereoFrameSwitch.instanceId}`);
    }

    await this.workerResult;
    await this.worker.dispose();
    this.worker.terminate();

    if (this.ui) {
      this.ui.dispose();
      this.ui = undefined;
      this.uiId = undefined;
    }

    document.getElementById(this.canvasId).remove();

    this.canvasId = undefined;
    this.workerResult = undefined;
    this.worker = undefined;

    Spinner.clearLabel(this.tag);
  }
}
