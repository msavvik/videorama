import { NodeWebWorker } from "../../node-worker";
import { DepthMap } from "./depth-map";

export class WorkerDepthMap {
  /** @private @type {DepthMap} */
  static instance = undefined;
  /** @private */
  static tag = self.name.concat(" ", WorkerDepthMap.name);

  /**
   * @private
   * @param {ArrayBuffer} data
   */
  static process(data) {
    const start = performance.now();

    const msg = [data, WorkerDepthMap.instance.process(data).buffer];
    self.postMessage(msg, msg);

    console.log(WorkerDepthMap.tag, WorkerDepthMap.process.name, performance.now() - start);
  }

  /**
   * @private
   * @param {DepthMapOptions} data
   */
  static options(data) {
    WorkerDepthMap.instance.setOptions(data);
  }

  /**
   * @private
   */
  static dispose() {
    console.debug(WorkerDepthMap.tag, WorkerDepthMap.dispose.name);

    WorkerDepthMap.instance.dispose();
    WorkerDepthMap.instance = undefined;
    self.removeEventListener("messageerror", NodeWebWorker.onMessageError);
    self.removeEventListener("message", WorkerDepthMap.message);
    self.removeEventListener("message", WorkerDepthMap.configure);

    NodeWebWorker.postDone();
  }

  /**
   * @private
   * @param {MessageEvent<["process" | "options" | "dispose", any]>} ev
   */
  static message(ev) {
    WorkerDepthMap[ev.data[0]](ev.data[1]);
  }

  /**
   * @private
   * @param {MessageEvent<[DepthMapCreateOptions]>} ev
   */
  static configure(ev) {
    console.debug(WorkerDepthMap.tag, WorkerDepthMap.configure.name, ev.data);

    WorkerDepthMap.instance = DepthMap.create(ev.data[0], self.name);
    self.addEventListener("message", WorkerDepthMap.message);

    NodeWebWorker.postDone();
  }

  static start() {
    console.debug(WorkerDepthMap.tag, WorkerDepthMap.start.name);

    self.addEventListener("messageerror", NodeWebWorker.onMessageError);
    self.addEventListener("message", WorkerDepthMap.configure, { once: true });

    NodeWebWorker.postDone();
  }
}
