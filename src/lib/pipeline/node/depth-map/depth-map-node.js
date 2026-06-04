// @ts-ignore
import workerUrl from "./depth-map-worker-instance?url";
import { NodeWorker } from "../../node-worker";
import { Spinner } from "../../../../ui/spinner";
import { UiDepthMap } from "./depth-map-ui";

/**
 * @implements {Transformer<any[],any[]>}
 * @implements {IOptionsNode}
 */
export class NodeDepthMap {
  /** @private */
  static instanceId = 0;

  /**
   * @param {NodeDepthMapOptions} options
   * @returns
   */
  static async create(options) {
    const tag = options.tag ?? `${NodeDepthMap.name}-${NodeDepthMap.instanceId}`;
    NodeDepthMap.instanceId++;

    console.debug(tag, NodeDepthMap.create.name);
    Spinner.setLabel(tag);

    const worker = await NodeWorker.create(workerUrl, tag);
    await worker.configure(
      /** @type {DepthMapCreateOptions} */ ({ sample: options.sample, depth: options.depth, invertRange: options.invertRange })
    );

    return new TransformStream(new NodeDepthMap(worker, options, tag), options.writableStrategy, options.readableStrategy);
  }

  /**
   * @private
   * @param {NodeWorker} workerInstance
   * @param {NodeDepthMapOptions} options
   * @param {string} tag
   */
  constructor(workerInstance, options, tag) {
    /** @private */
    this.tag = tag.concat(" ", NodeDepthMap.name);
    console.debug(this.tag);

    /** @private */
    this.worker = workerInstance;
    /** @private @type {Promise<any[]>} */
    this.workerResult = Promise.resolve(null);
    /** @private */
    this.sampleIndex = options.input.sample;
    /** @private */
    this.depthIndex = options.output.sample;

    if (options.uiId) {
      /** @private */
      this.uiId = options.uiId;
      /** @private */
      this.ui = new UiDepthMap(this, options.rangeOptions);
    }
  }

  /**
   * @param {DepthMapOptions} options
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

    [chunk[this.sampleIndex], chunk[this.depthIndex]] = await (this.workerResult = this.worker.process(chunk[this.sampleIndex]));

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

    NodeDepthMap.instanceId--;
    if (NodeDepthMap.instanceId < 0) {
      throw new Error(`Invalid instanceId: ${NodeDepthMap.instanceId}`);
    }

    await this.workerResult;
    await this.worker.dispose();
    this.worker.terminate();

    this.workerResult = undefined;
    this.worker = undefined;

    Spinner.clearLabel(this.tag);
  }
}
