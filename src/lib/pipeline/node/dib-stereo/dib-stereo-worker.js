import { NodeWebWorker } from "../../node-worker";
import { DepthImageBasedStereo } from "./dib-stereo";

export class WorkerDepthImageBasedStereo {
  /** @private @type {DepthImageBasedStereo} */
  static instance = undefined;
  /** @private */
  static tag = self.name.concat(" ", WorkerDepthImageBasedStereo.name);

  /**
   * @private
   * @param {[VideoFrame, ArrayBuffer]} data
   */
  static process(data) {
    const start = performance.now();

    data.push(WorkerDepthImageBasedStereo.instance.process(data));
    self.postMessage(data, data);

    console.log(WorkerDepthImageBasedStereo.tag, WorkerDepthImageBasedStereo.process.name, performance.now() - start);
  }

  /**
   * @private
   * @param {DepthImageBasedStereoOptions} data
   */
  static options(data) {
    WorkerDepthImageBasedStereo.instance.setOptions(data);
  }

  /**
   * @private
   */
  static dispose() {
    console.debug(WorkerDepthImageBasedStereo.tag, WorkerDepthImageBasedStereo.dispose.name);

    WorkerDepthImageBasedStereo.instance.dispose();
    WorkerDepthImageBasedStereo.instance = undefined;
    self.removeEventListener("messageerror", NodeWebWorker.onMessageError);
    self.removeEventListener("message", WorkerDepthImageBasedStereo.message);
    self.removeEventListener("message", WorkerDepthImageBasedStereo.configure);

    NodeWebWorker.postDone();
  }

  /**
   * @private
   * @param {MessageEvent<([("process" | "options" | "dispose"), any])>} ev
   */
  static message(ev) {
    WorkerDepthImageBasedStereo[ev.data[0]](ev.data[1]);
  }

  /**
   * @private
   * @param {MessageEvent<[width: number, height: number, layout: SampleLayout]>} ev
   */
  static async configure(ev) {
    console.debug(WorkerDepthImageBasedStereo.tag, WorkerDepthImageBasedStereo.configure.name, ev.data);

    WorkerDepthImageBasedStereo.instance = await DepthImageBasedStereo.create(...ev.data, self.name);
    self.addEventListener("message", WorkerDepthImageBasedStereo.message);

    NodeWebWorker.postDone();
  }

  static start() {
    console.debug(WorkerDepthImageBasedStereo.tag, WorkerDepthImageBasedStereo.start.name);

    self.addEventListener("messageerror", NodeWebWorker.onMessageError);
    self.addEventListener("message", WorkerDepthImageBasedStereo.configure, { once: true });

    NodeWebWorker.postDone();
  }
}
