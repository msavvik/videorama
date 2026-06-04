import { NodeWebWorker } from "../../node-worker";
import { Parallax } from "./parallax";
import * as PIXI from "pixi.js";

export class WorkerParallax {
  /** @private @type {Parallax} */
  static instance = undefined;
  /** @private */
  static tag = self.name.concat(" ", WorkerParallax.name);

  /**
   * @private
   * @param {[image: VideoFrame, depthSample: ArrayBuffer]} data
   */
  static process(data) {
    const start = performance.now();

    WorkerParallax.instance.process(data);
    self.postMessage(data, data);

    console.log(WorkerParallax.tag, WorkerParallax.process.name, performance.now() - start);
  }

  /**
   * @private
   * @param {ParallaxOptions} data
   */
  static options(data) {
    WorkerParallax.instance.setOptions(data);
  }

  /**
   * @private
   */
  static dispose() {
    console.debug(WorkerParallax.tag, WorkerParallax.dispose.name);

    WorkerParallax.instance.dispose();
    WorkerParallax.instance = undefined;
    self.removeEventListener("messageerror", NodeWebWorker.onMessageError);
    self.removeEventListener("message", WorkerParallax.message);
    self.removeEventListener("message", WorkerParallax.configure);

    NodeWebWorker.postDone();
  }

  /**
   * @private
   * @param {MessageEvent<[("process" | "options" | "dispose"), any]>} ev
   */
  static message(ev) {
    WorkerParallax[ev.data[0]](ev.data[1]);
  }

  /**
   * @private
   * @param {MessageEvent<[OffscreenCanvas, SampleLayout]>} ev
   */
  static async configure(ev) {
    console.debug(WorkerParallax.tag, WorkerParallax.configure.name, ev.data);

    PIXI.DOMAdapter.set(PIXI.WebWorkerAdapter);
    WorkerParallax.instance = await Parallax.create(ev.data[0], ev.data[1], self.name);
    self.addEventListener("message", WorkerParallax.message);

    NodeWebWorker.postDone();
  }

  static start() {
    console.debug(WorkerParallax.tag, WorkerParallax.start.name);

    self.addEventListener("messageerror", NodeWebWorker.onMessageError);
    self.addEventListener("message", WorkerParallax.configure, { once: true });

    NodeWebWorker.postDone();
  }
}
