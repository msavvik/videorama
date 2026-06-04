import { NodeWebWorker } from "../../node-worker";
import { StereoSideBySide } from "./stereo-sbs";

export class WorkerStereoSideBySide {
  /** @private @type {StereoSideBySide} */
  static instance = undefined;
  /** @private */
  static tag = self.name.concat(" ", WorkerStereoSideBySide.name);

  /**
   * @private
   * @param  {VideoFrame} data
   */
  static process(data) {
    const start = performance.now();

    WorkerStereoSideBySide.instance.process(data);
    self.postMessage(data, [data]);

    console.log(WorkerStereoSideBySide.tag, WorkerStereoSideBySide.process.name, performance.now() - start);
  }

  /**
   * @private
   */
  static dispose() {
    console.debug(WorkerStereoSideBySide.tag, WorkerStereoSideBySide.dispose.name);

    WorkerStereoSideBySide.instance.dispose();
    WorkerStereoSideBySide.instance = undefined;
    self.removeEventListener("messageerror", NodeWebWorker.onMessageError);
    self.removeEventListener("message", WorkerStereoSideBySide.message);
    self.removeEventListener("message", WorkerStereoSideBySide.configure);

    NodeWebWorker.postDone();
  }

  /**
   * @private
   * @param {MessageEvent<[("process" | "dispose"), any]>} ev
   */
  static message(ev) {
    WorkerStereoSideBySide[ev.data[0]](ev.data[1]);
  }

  /**
   * @private
   * @param {MessageEvent<[lrCanvas: OffscreenCanvas]>} ev
   */
  static configure(ev) {
    console.debug(WorkerStereoSideBySide.tag, WorkerStereoSideBySide.configure.name, ev.data);

    WorkerStereoSideBySide.instance = StereoSideBySide.create(...ev.data, self.name);
    self.addEventListener("message", WorkerStereoSideBySide.message);

    NodeWebWorker.postDone();
  }

  static start() {
    console.debug(self.name, WorkerStereoSideBySide.name, WorkerStereoSideBySide.start.name);

    self.addEventListener("messageerror", NodeWebWorker.onMessageError);
    self.addEventListener("message", WorkerStereoSideBySide.configure, { once: true });

    NodeWebWorker.postDone();
  }
}
