import { NodeWebWorker } from "../../node-worker";
import { ScaleVideoFrame } from "./scale-video-frame";

export class WorkerScaleVideoFrame {
  /** @private @type {ScaleVideoFrame} */
  static instance = undefined;
  /** @private */
  static tag = self.name.concat(" ", WorkerScaleVideoFrame.name);

  /**
   * @private
   * @param {VideoFrame} data
   */
  static async process(data) {
    const start = performance.now();

    const res = [data, await WorkerScaleVideoFrame.instance.process(data)];
    self.postMessage(res, res);

    console.log(WorkerScaleVideoFrame.tag, WorkerScaleVideoFrame.process.name, performance.now() - start);
  }

  /**
   * @private
   */
  static dispose() {
    console.debug(WorkerScaleVideoFrame.tag, WorkerScaleVideoFrame.dispose.name);

    WorkerScaleVideoFrame.instance.dispose();
    WorkerScaleVideoFrame.instance = undefined;
    self.removeEventListener("messageerror", NodeWebWorker.onMessageError);
    self.removeEventListener("message", WorkerScaleVideoFrame.message);
    self.removeEventListener("message", WorkerScaleVideoFrame.configure);

    NodeWebWorker.postDone();
  }

  /**
   * @private
   * @param {MessageEvent<[("process" | "dispose"), any]>} ev
   */
  static message(ev) {
    WorkerScaleVideoFrame[ev.data[0]](ev.data[1]);
  }

  /**
   * @private
   * @param {MessageEvent<[ScaleVideoFrameOptions]>} ev
   */
  static async configure(ev) {
    console.debug(WorkerScaleVideoFrame.tag, WorkerScaleVideoFrame.configure.name);

    WorkerScaleVideoFrame.instance = await ScaleVideoFrame.create(ev.data[0], self.name);
    self.addEventListener("message", WorkerScaleVideoFrame.message);

    NodeWebWorker.postDone();
  }

  static start() {
    console.debug(WorkerScaleVideoFrame.tag, WorkerScaleVideoFrame.start.name);

    self.addEventListener("messageerror", NodeWebWorker.onMessageError);
    self.addEventListener("message", WorkerScaleVideoFrame.configure, { once: true });

    NodeWebWorker.postDone();
  }
}
