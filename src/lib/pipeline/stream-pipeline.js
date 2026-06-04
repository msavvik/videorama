export class StreamPipeline {
  /**
   * @param {ReadableStream<any[]>} source
   * @param {WritableStream<any[]>} sink
   * @param { ...((TransformStream<any[], any[]> | TransformStream<any[], any[]>[])[]) } nodes
   */
  static link(source, sink, ...nodes) {
    return nodes
      .flat(2)
      .reduce((stream, node) => stream.pipeThrough(node), source)
      .pipeTo(sink);
  }
}
