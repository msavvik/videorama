// @ts-ignore
import workerUrl from "./image-sampler-worker-instance.js?url";
import { NodeWorker } from "../../node-worker";
import { Spinner } from "../../../../ui/spinner";

/** @implements {Transformer<any[], any[]>} */
export class NodeImageSampler {
  /** @private */
  static instanceId = 0;

  /**
   * @param {NodeImageSamplerOptions} options
   * @returns {Promise<TransformStream<any[], any[]>>}
   */
  static async create(options) {
    const tag = options.tag ?? `${NodeImageSampler.name}-${NodeImageSampler.instanceId}`;
    NodeImageSampler.instanceId++;

    console.debug(tag, NodeImageSampler.create.name);
    Spinner.setLabel(tag);

    const worker = await NodeWorker.create(workerUrl, tag);
    await worker.configure(options.layout);

    return new TransformStream(new NodeImageSampler(worker, options, tag), options.writableStrategy, options.readableStrategy);
  }

  /**
   * @private
   * @param {NodeWorker} underlyingWorker
   * @param {NodeImageSamplerOptions} options
   * @param {string} tag
   */
  constructor(underlyingWorker, options, tag) {
    /** @private */
    this.tag = this.tag = tag.concat(" ", NodeImageSampler.name);
    console.debug(this.tag);

    /** @private */
    this.worker = underlyingWorker;
    /** @private */
    this.frameIndex = options.input.frame;
    /** @private */
    this.sampleIndex = options.output.sample;
    /** @private @type {(Promise<(any[] | null)> | undefined)} */
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

    [chunk[this.frameIndex], chunk[this.sampleIndex]] = await (this.workerResult = this.worker.process(chunk[this.frameIndex]));
    controller.enqueue(chunk);

    console.log(this.tag, this.transform.name, performance.now() - start);
  }

  /**
   * @param {TransformStreamDefaultController<any[]>} controller
   */
  async flush(controller) {
    console.debug(this.tag, this.flush.name);
    Spinner.setLabel(this.tag, this.flush.name);

    NodeImageSampler.instanceId--;
    if (NodeImageSampler.instanceId < 0) {
      throw new Error(`Invalid instanceId: ${NodeImageSampler.instanceId}`);
    }

    await this.workerResult;
    await this.worker.dispose();
    this.worker.terminate();

    this.workerResult = undefined;
    this.worker = undefined;

    Spinner.clearLabel(this.tag);
  }
}
