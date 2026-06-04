import { NodeWebWorker } from "../../node-worker";
import { Infer } from "./infer";

export class WorkerInfer {
  /** @private @type {Infer} */
  static instance;
  /** @private */
  static tag = self.name.concat(" ", WorkerInfer.name);

  /**
   * @private
   * @param {ArrayBuffer} data
   */
  static async process(data) {
    const start = performance.now();

    // Will error on non typed array types, like string[], etc. - no buffer property
    const msg = [data, /** @type {TypedArray} */ (await WorkerInfer.instance.process(data)).buffer];
    self.postMessage(msg, msg);

    console.log(WorkerInfer.tag, WorkerInfer.process.name, performance.now() - start);
  }

  /**
   * @private
   */
  static async dispose() {
    console.debug(WorkerInfer.tag, WorkerInfer.dispose.name);

    await WorkerInfer.instance.dispose();
    WorkerInfer.instance = undefined;
    self.removeEventListener("messageerror", NodeWebWorker.onMessageError);
    self.removeEventListener("message", WorkerInfer.message);
    self.removeEventListener("message", WorkerInfer.configure);

    NodeWebWorker.postDone();
  }

  /**
   * @private
   * @param {MessageEvent<[("process" | "dispose"), ArrayBuffer]>} ev
   */
  static message(ev) {
    WorkerInfer[ev.data[0]](ev.data[1]);
  }

  /**
   * @private
   * @param {MessageEvent<[ModelInfo, InferenceInfo]>} ev
   * @returns {Promise<void>}
   */
  static async configure(ev) {
    console.debug(WorkerInfer.tag, WorkerInfer.configure.name, ev.data);

    WorkerInfer.instance = await Infer.create(...ev.data, self.name);
    self.addEventListener("message", WorkerInfer.message);

    NodeWebWorker.postDone();
  }

  static start() {
    console.debug(WorkerInfer.tag, WorkerInfer.start.name);

    self.addEventListener("messageerror", NodeWebWorker.onMessageError);
    self.addEventListener("message", WorkerInfer.configure, { once: true });

    NodeWebWorker.postDone();
  }
}
