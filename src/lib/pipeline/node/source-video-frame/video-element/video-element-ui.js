// @ts-ignore
import uiHtml from "./html/ui.html?raw";

export class UiVideoElement {
  /** @private */
  keyCapture = {
    KeyP: UiVideoElement.onKeyPlayPause,
    ArrowLeft: UiVideoElement.onKeyRewind,
    ArrowRight: UiVideoElement.onKeyForward
  };

  /**
   * @private
   * @this {UiVideoElement}
   */
  static onKeyPlayPause() {
    const video = /** @type {HTMLVideoElement} */ (document.getElementById(this.videoId));
    console.debug(UiVideoElement.name, UiVideoElement.onKeyPlayPause.name, video.readyState, video.paused);

    if (video.readyState == HTMLMediaElement.HAVE_NOTHING) return;

    if (video.paused) {
      video
        .play()
        .catch((err) => console.error(UiVideoElement.name, UiVideoElement.onKeyPlayPause.name, "Error:", err.message ?? err));
    } else {
      video.pause();
    }
  }

  /**
   * @private
   * @this {UiVideoElement}
   */
  static onKeyForward() {
    const video = /** @type {HTMLVideoElement} */ (document.getElementById(this.videoId));
    console.debug(UiVideoElement.name, UiVideoElement.onKeyForward.name, video.readyState, video.seeking);

    if (video.readyState == HTMLMediaElement.HAVE_NOTHING || video.seeking) return;

    const pos = Math.round(video.currentTime);
    video.currentTime = video.duration - pos > 6 ? pos + 5 : pos;
  }

  /**
   * @private
   * @this {UiVideoElement}
   */
  static onKeyRewind() {
    const video = /** @type {HTMLVideoElement} */ (document.getElementById(this.videoId));
    console.debug(UiVideoElement.name, UiVideoElement.onKeyRewind.name, video.readyState, video.seeking);

    if (video.readyState == HTMLMediaElement.HAVE_NOTHING || video.seeking) return;

    const pos = Math.round(video.currentTime);
    video.currentTime = pos > 6 ? pos - 5 : 0;
  }

  /**
   * @private
   * @param {KeyboardEvent} ev
   */
  onKey = (ev) => this.keyCapture[/** @type {keyof typeof this.keyCapture} */ (ev.code)]?.call(this);

  /**
   * @param {string} videoId
   */
  constructor(videoId) {
    console.debug(UiVideoElement.name);

    /** @private */
    this.videoId = videoId;
  }

  /**
   * @param {string} uiContainerId
   */
  show(uiContainerId) {
    console.debug(UiVideoElement.name, this.show.name, uiContainerId);

    document
      .getElementById(uiContainerId)
      .appendChild(new DOMParser().parseFromString(uiHtml, "text/html").getElementById(UiVideoElement.name));

    window.addEventListener("keydown", this.onKey, { passive: true });
  }

  dispose() {
    console.debug(UiVideoElement.name, this.dispose.name);

    window.removeEventListener("keydown", this.onKey);
    document.getElementById(UiVideoElement.name).remove();

    this.videoId = undefined;
  }
}
