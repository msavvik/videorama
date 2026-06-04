// @ts-ignore
import workerUrl from "./stereo-sbs-worker-instance?url";
import { NodeWorker } from "../../node-worker";
import { Spinner } from "../../../../ui/spinner";
import { UiStereoSideBySide } from "./stereo-sbs-ui";

/** @implements {Transformer<any[],any[]>} */
export class NodeStereoSideBySide {
  /** @private */
  static instanceId = 0;

  /**
   * @param {NodeStereoSideBySideOptions} options
   * @returns {Promise<TransformStream<any[], any[]>>}
   */
  static async create(options) {
    const nodeId = `${NodeStereoSideBySide.name}-${NodeStereoSideBySide.instanceId}`;
    NodeStereoSideBySide.instanceId++;
    const tag = options.tag ?? nodeId;

    console.debug(tag, NodeStereoSideBySide.create.name);
    Spinner.setLabel(tag);

    const sbsCanvas = document.createElement("canvas");
    sbsCanvas.id = nodeId.concat("-sbs");
    sbsCanvas.width = options.media.width * 2;
    sbsCanvas.height = options.media.height;

    document.getElementById(options.containerId).appendChild(sbsCanvas);

    const worker = await NodeWorker.create(workerUrl, tag);
    await worker.configure(sbsCanvas.transferControlToOffscreen());

    return new TransformStream(
      new NodeStereoSideBySide(worker, options, sbsCanvas.id, tag),
      options.writableStrategy,
      options.readableStrategy
    );
  }

  /**
   * @private
   * @param {NodeWorker<any[]>} instance
   * @param {NodeStereoSideBySideOptions} options
   * @param {string} canvasId
   * @param {string} tag
   */
  constructor(instance, options, canvasId, tag) {
    /** @private */
    this.tag = tag.concat(" ", NodeStereoSideBySide.name);
    console.debug(this.tag);

    /** @private */
    this.canvasId = canvasId;
    /** @private */
    this.worker = instance;
    /** @private */
    this.dibIndex = options.input.dibFrame;
    /** @private @type {Promise<any[]>} */
    this.workerResult = Promise.resolve(null);

    if (options.uiId) {
      /** @private */
      this.uiId = options.uiId;
      /** @private */
      this.ui = new UiStereoSideBySide(options.containerId);
    }
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

    NodeStereoSideBySide.instanceId--;
    if (NodeStereoSideBySide.instanceId < 0) {
      throw new Error(`Invalid instanceId: ${NodeStereoSideBySide.instanceId}`);
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
    this.worker = undefined;
    this.workerResult = undefined;

    Spinner.clearLabel(this.tag);
  }
}
