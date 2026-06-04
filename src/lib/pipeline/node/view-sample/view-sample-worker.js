import { NodeWebWorker } from "../../node-worker";
import { SampleViewMethod, IViewMethod } from "./view-method";

export class WorkerViewSample {
  /** @private @type {IViewMethod} */
  static instance = undefined;
  /** @private */
  static tag = self.name.concat(" ", WorkerViewSample.name);

  /**
   * @private
   * @param {ArrayBuffer} data
   */
  static process(data) {
    const start = performance.now();

    WorkerViewSample.instance.process(data);
    self.postMessage(data, [data]);

    console.log(WorkerViewSample.tag, WorkerViewSample.process.name, performance.now() - start);
  }

  /**
   * @private
   */
  static dispose() {
    console.debug(WorkerViewSample.tag, WorkerViewSample.dispose.name);

    WorkerViewSample.instance.dispose();
    WorkerViewSample.instance = undefined;
    self.removeEventListener("messageerror", NodeWebWorker.onMessageError);
    self.removeEventListener("message", WorkerViewSample.message);
    self.removeEventListener("message", WorkerViewSample.configure);

    NodeWebWorker.postDone();
  }

  /**
   * @private
   * @param {MessageEvent<[("process" | "dispose"), any]>} ev
   */
  static message(ev) {
    WorkerViewSample[ev.data[0]](ev.data[1]);
  }

  /**
   * @private
   * @param {MessageEvent<[OffscreenCanvas, OptionsViewSample]>} ev
   */
  static async configure(ev) {
    console.debug(self.name, WorkerViewSample.name, WorkerViewSample.configure.name, ev.data);

    WorkerViewSample.instance = await SampleViewMethod.create(...ev.data, self.name);
    self.addEventListener("message", WorkerViewSample.message);

    NodeWebWorker.postDone();
  }

  static start() {
    console.debug(WorkerViewSample.tag, WorkerViewSample.start.name);

    self.addEventListener("messageerror", NodeWebWorker.onMessageError);
    self.addEventListener("message", WorkerViewSample.configure, { once: true });

    NodeWebWorker.postDone();
  }
}
