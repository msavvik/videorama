export class NodeWebWorker {
  /** @private */
  static doneMessage = Object();

  /**
   * @param {MessageEvent} ev
   */
  static onMessageError(ev) {
    console.error(self.name, NodeWebWorker.onMessageError.name, ev.data);
  }

  static postDone() {
    self.postMessage(NodeWebWorker.doneMessage);
  }
}
