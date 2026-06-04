// @ts-ignore
import workerUrl from "./infer-worker-instance.js?url";
import { NodeWorker } from "../../node-worker";
import { Spinner } from "../../../../ui/spinner";

/** @typedef {NodeInfer} InferUnderlyingWorker */

/** @implements {Transformer<any[], any[]>} */
export class NodeInfer {
  /** @private */
  static instanceId = 0;

  /**
   * @param {NodeInferOptions} options
   * @returns {Promise<TransformStream<any[], any[]>>}
   */
  static async create(options) {
    const tag = options.tag ?? `${NodeInfer.name}-${NodeInfer.instanceId}`;
    NodeInfer.instanceId++;
    console.debug(tag, NodeInfer.create.name);
    Spinner.setLabel(tag, options.model.name);

    const worker = await NodeWorker.create(workerUrl, tag);
    await worker.configure(options.model, options.inference);

    return new TransformStream(new NodeInfer(worker, options, tag), options.writableStrategy, options.readableStrategy);
  }

  /**
   * @private
   * @param {NodeWorker} underlyingWorker
   * @param {NodeInferOptions} options
   * @param {string} tag
   */
  constructor(underlyingWorker, options, tag) {
    /** @private */
    this.tag = tag.concat(" ", NodeInfer.name);
    console.debug(this.tag);

    /** @private */
    this.worker = underlyingWorker;
    /** @private */
    this.sampleIndex = options.input.sample;
    /** @private */
    this.inferenceIndex = options.output.sample;
    /** @private @type {(Promise<any[] | null> | undefined)} */
    this.workerResult = Promise.resolve(null);
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

    [chunk[this.sampleIndex], chunk[this.inferenceIndex]] = await (this.workerResult = this.worker.process(
      chunk[this.sampleIndex]
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

    NodeInfer.instanceId--;
    if (NodeInfer.instanceId < 0) {
      throw new Error(`Invalid instanceId: ${NodeInfer.instanceId}`);
    }

    await this.workerResult;
    await this.worker.dispose();
    this.worker.terminate();

    this.worker = undefined;
    this.workerResult = undefined;

    Spinner.clearLabel(this.tag);
  }
}
