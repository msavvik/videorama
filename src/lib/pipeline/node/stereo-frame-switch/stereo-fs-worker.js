import { NodeWebWorker } from "../../node-worker";
import { StereoFrameSwitch } from "./stereo-fs";

export class WorkerStereoFrameSwitch {
  /** @private @type {StereoFrameSwitch} */
  static instance = undefined;
  /** @private */
  static tag = self.name.concat(" ", WorkerStereoFrameSwitch.name);

  /**
   * @private
   * @param  {VideoFrame} data
   */
  static process(data) {
    const start = performance.now();

    WorkerStereoFrameSwitch.instance.process(data);
    self.postMessage(data, [data]);

    console.log(WorkerStereoFrameSwitch.tag, WorkerStereoFrameSwitch.process.name, performance.now() - start);
  }

  /**
   * @private
   * @param {StereoFrameSwitchOptions} data
   */
  static options(data) {
    console.debug(WorkerStereoFrameSwitch.tag, WorkerStereoFrameSwitch.options.name, data);

    WorkerStereoFrameSwitch.instance.setOptions(data);
  }

  /**
   * @private
   */
  static dispose() {
    console.debug(WorkerStereoFrameSwitch.tag, WorkerStereoFrameSwitch.dispose.name);

    WorkerStereoFrameSwitch.instance.dispose();
    WorkerStereoFrameSwitch.instance = undefined;
    self.removeEventListener("messageerror", NodeWebWorker.onMessageError);
    self.removeEventListener("message", WorkerStereoFrameSwitch.message);
    self.removeEventListener("message", WorkerStereoFrameSwitch.configure);

    NodeWebWorker.postDone();
  }

  /**
   * @private
   * @param {MessageEvent<[("process" | "options" | "dispose"), any]>} ev
   */
  static message(ev) {
    WorkerStereoFrameSwitch[ev.data[0]](ev.data[1]);
  }

  /**
   * @private
   * @param {MessageEvent<[OffscreenCanvas]>} ev
   */
  static configure(ev) {
    console.debug(WorkerStereoFrameSwitch.tag, WorkerStereoFrameSwitch.configure.name, ev.data);

    WorkerStereoFrameSwitch.instance = StereoFrameSwitch.create(...ev.data, self.name);
    self.addEventListener("message", WorkerStereoFrameSwitch.message);

    NodeWebWorker.postDone();
  }

  static start() {
    console.debug(WorkerStereoFrameSwitch.tag, WorkerStereoFrameSwitch.start.name);

    self.addEventListener("messageerror", NodeWebWorker.onMessageError);
    self.addEventListener("message", WorkerStereoFrameSwitch.configure, { once: true });

    NodeWebWorker.postDone();
  }
}
