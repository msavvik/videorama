import { Spinner } from "../../../../ui/spinner";

/** @implements {UnderlyingSink<any[]>} */
export class SinkChunk {
  /**
   * @param {NodeSinkChunkOptions} [options]
   * @returns {Promise<WritableStream<any[]>>}
   */
  static create(options) {
    console.debug(SinkChunk.name, SinkChunk.create.name);
    Spinner.setLabel(SinkChunk.name);

    return Promise.resolve(new WritableStream(new SinkChunk(), options?.strategy));
  }

  /** @private */
  constructor() {
    console.debug(SinkChunk.name);
  }

  /**
   * @param {WritableStreamDefaultController} controller
   */
  start(controller) {
    console.debug(SinkChunk.name, this.start.name);

    Spinner.clearLabel(SinkChunk.name);
  }

  /**
   * @param {any[]} chunk
   * @param {WritableStreamDefaultController} controller
   */
  write(chunk, controller) {
    const start = performance.now();

    // Stick with assumption; if chunk[i] and chunk[i].close exists, chunk[i].close is a function.
    for (let i = chunk.length - 1; i >= 0; i--) {
      chunk[i] && chunk[i].close && chunk[i].close();
      chunk[i] = undefined;
    }

    console.log(SinkChunk.name, this.write.name, performance.now() - start);
  }

  close() {
    console.debug(SinkChunk.name, this.close.name);
  }

  /**
   * @param {any} reason
   */
  abort(reason) {
    console.debug(SinkChunk.name, this.abort.name, reason);
  }
}
