import { NodeWebWorker } from "../../node-worker";
import { ViewImage } from "./view-image";

export class WorkerViewImage {
  /** @private @type {ViewImage} */
  static instance = undefined;
  /** @private */
  static tag = self.name.concat(" ", WorkerViewImage.name);

  /**
   * @private
   * @param {TransferableCanvasImageSource} data
   */
  static process(data) {
    const start = performance.now();

    WorkerViewImage.instance.process(data);
    self.postMessage(data, [data]);

    console.log(WorkerViewImage.tag, WorkerViewImage.process.name, performance.now() - start);
  }

  /**
   * @private
   */
  static dispose() {
    console.debug(WorkerViewImage.name, WorkerViewImage.dispose.name);

    WorkerViewImage.instance.dispose();
    WorkerViewImage.instance = undefined;
    self.removeEventListener("messageerror", NodeWebWorker.onMessageError);
    self.removeEventListener("message", WorkerViewImage.message);
    self.removeEventListener("message", WorkerViewImage.configure);

    NodeWebWorker.postDone();
  }

  /**
   * @private
   * @param {MessageEvent<[("process" | "dispose"), any]>} ev
   */
  static message(ev) {
    WorkerViewImage[ev.data[0]](ev.data[1]);
  }

  /**
   * @private
   * @param {MessageEvent<[OffscreenCanvas]>} ev
   */
  static async configure(ev) {
    console.debug(WorkerViewImage.tag, WorkerViewImage.configure.name);

    WorkerViewImage.instance = await ViewImage.create(ev.data[0], self.name);
    self.addEventListener("message", WorkerViewImage.message);

    NodeWebWorker.postDone();
  }

  static start() {
    console.debug(WorkerViewImage.tag, WorkerViewImage.start.name);

    self.addEventListener("messageerror", NodeWebWorker.onMessageError);
    self.addEventListener("message", WorkerViewImage.configure, { once: true });

    NodeWebWorker.postDone();
  }
}
