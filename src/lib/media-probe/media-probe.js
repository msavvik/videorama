/**
 * @typedef VideoProbeResult
 * @property {number} width
 * @property {number} height
 *
 * @typedef {HTMLVideoElement & {probe: PromiseWithResolvers<VideoProbeResult>}} VideoProbe
 */

export class MediaProbe {
  /**
   * @private
   * @param {Event} ev
   */
  static onError(ev) {
    /** @type {VideoProbe} */ (ev.target).probe.reject(ev);
  }

  /**
   * @private
   * @param {Event} ev
   */
  static onMetadata(ev) {
    const video = /** @type {VideoProbe} */ (ev.target);
    video.probe.resolve({ width: video.videoWidth, height: video.videoHeight });
  }

  /**
   * @param {string} url
   */
  static async probe(url) {
    const video = /** @type {VideoProbe} */ (document.createElement("video"));

    video.probe = Promise.withResolvers();
    video.addEventListener("error", MediaProbe.onError);
    video.addEventListener("loadedmetadata", MediaProbe.onMetadata);
    video.preload = "metadata";
    video.src = url;

    try {
      const res = await video.probe.promise;
      console.debug(MediaProbe.name, MediaProbe.probe.name, url, res);
      return res;
    } catch (err) {
      if (video.src.startsWith("blob")) {
        URL.revokeObjectURL(video.src);
      }
      console.error(MediaProbe.name, MediaProbe.onError.name, err);
      throw err;
    } finally {
      video.removeEventListener("error", MediaProbe.onError);
      video.removeEventListener("loadedmetadata", MediaProbe.onMetadata);
      video.probe = undefined;
      video.src = "";
    }
  }
}
