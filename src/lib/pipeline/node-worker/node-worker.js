/**
 * @typedef {"ArrayBuffer" | "MessagePort" | "ReadableStream" | "WritableStream" | "TransformStream" | "ImageBitmap" | "VideoFrame" | "OffscreenCanvas"} Transferable
 */

class TransferableObject {
  /** @private */
  static ArrayBuffer = true;
  /** @private */
  static MessagePort = true;
  /** @private */
  static ReadableStream = true;
  /** @private */
  static WritableStream = true;
  /** @private */
  static TransformStream = true;
  /** @private */
  static ImageBitmap = true;
  /** @private */
  static VideoFrame = true;
  /** @private */
  static OffscreenCanvas = true;

  /** @param {object} [o]  */
  static isTransferable(o) {
    return o && TransferableObject[/** @type {Transferable} */ (o.constructor.name)] == true;
  }
}

export class NodeWorker extends Worker {
  /**
   * @param {(string | URL)} scriptURL
   * @param {string} [tag]
   */
  static async create(scriptURL, tag) {
    console.debug(tag ?? "", NodeWorker.name, NodeWorker.create.name);

    const instance = new NodeWorker(scriptURL, tag);

    // Await worker instance start
    await instance.resolvers.promise;

    return instance;
  }

  /**
   * @private
   * @param {MessageEvent<any>} evt
   */
  onMessage = (evt) => {
    this.resolvers.resolve(evt.data);
  };

  /**
   * @private
   * @param {MessageEvent<any>} ev
   */
  onMessageError = (ev) => {
    this.resolvers.reject(ev.data);
  };

  /**
   * @private
   * @param {ErrorEvent} ev
   */
  onError = (ev) => {
    this.resolvers.reject(ev.message);
  };

  /**
   * @private
   * @param {(string | URL)} scriptURL
   * @param {string} [tag]
   */
  constructor(scriptURL, tag) {
    super(scriptURL, { name: tag, type: "module" });

    /** @private */
    this.tag = tag?.concat(" ", NodeWorker.name) ?? NodeWorker.name;
    console.debug(this.tag, scriptURL);

    /** @private @type {PromiseWithResolvers<any>} */
    this.resolvers = Promise.withResolvers();

    super.addEventListener("message", this.onMessage, { passive: true });
    super.addEventListener("messageerror", this.onMessageError, { passive: true });
    super.addEventListener("error", this.onError, { passive: true });
  }

  /**
   * @param  {...any} configData
   */
  async configure(...configData) {
    console.debug(this.tag, this.configure.name, configData);

    this.resolvers = Promise.withResolvers();
    super.postMessage(configData, configData.filter(TransferableObject.isTransferable));

    // await web worker configuration completion.
    await this.resolvers.promise;

    return this;
  }

  /**
   * @param {Transferable} data
   */
  process(data) {
    this.resolvers = Promise.withResolvers();
    super.postMessage(["process", data], [data]);
    return this.resolvers.promise;
  }

  /**
   * @param {...Transferable} data
   * @returns
   */
  processMany(...data) {
    this.resolvers = Promise.withResolvers();
    super.postMessage(["process", data], data);
    return this.resolvers.promise;
  }

  async dispose() {
    console.debug(this.tag, this.dispose.name);

    if (this.resolvers) {
      console.debug(this.tag, this.dispose.name, "awaiting pending operation");
      await this.resolvers.promise;
    }

    console.debug(this.tag, this.dispose.name, "disposing worker instance");
    this.resolvers = Promise.withResolvers();
    this.postMessage(["dispose"]);
    await this.resolvers.promise;
    this.resolvers = undefined;

    console.debug(this.tag, this.dispose.name, "removing worker event listeners");
    super.removeEventListener("message", this.onMessage);
    super.removeEventListener("messageerror", this.onMessageError);
    super.removeEventListener("error", this.onError);
  }
}
