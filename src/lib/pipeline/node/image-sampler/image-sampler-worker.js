import { NodeWebWorker } from "../../node-worker";
import { ImageSampler } from "./image-sampler";

export class WorkerImageSampler {
  /** @private @type {(ImageSampler | undefined)} */
  static instance;
  /** @private */
  static tag = self.name.concat(" ", WorkerImageSampler.name);

  /**
   * @private
   * @param {TransferableCanvasImageSource} data
   * */
  static process(data) {
    const start = performance.now();

    const res = [data, WorkerImageSampler.instance.process(data).buffer];
    self.postMessage(res, res);

    console.log(WorkerImageSampler.tag, WorkerImageSampler.process.name, performance.now() - start);
  }

  /**
   * @private
   */
  static dispose() {
    console.debug(WorkerImageSampler.tag, WorkerImageSampler.dispose.name);

    WorkerImageSampler.instance.dispose();
    WorkerImageSampler.instance = undefined;
    self.removeEventListener("messageerror", NodeWebWorker.onMessageError);
    self.removeEventListener("message", WorkerImageSampler.message);
    self.removeEventListener("message", WorkerImageSampler.configure);

    NodeWebWorker.postDone();
  }

  /**
   * @private
   * @param { MessageEvent<["process" | "dispose", TransferableCanvasImageSource]> } ev
   * } ev
   */
  static message(ev) {
    WorkerImageSampler[ev.data[0]](ev.data[1]);
  }

  /**
   * @private
   * @param {MessageEvent<[SampleLayout]>} ev
   */
  static async configure(ev) {
    console.debug(WorkerImageSampler.tag, WorkerImageSampler.configure.name, ev.data[0]);

    WorkerImageSampler.instance = await ImageSampler.create(ev.data[0], self.name);
    self.addEventListener("message", WorkerImageSampler.message);

    NodeWebWorker.postDone();
  }

  static start() {
    console.debug(WorkerImageSampler.tag, WorkerImageSampler.start.name);

    self.addEventListener("messageerror", NodeWebWorker.onMessageError);
    self.addEventListener("message", WorkerImageSampler.configure, { once: true });

    NodeWebWorker.postDone();
  }
}
