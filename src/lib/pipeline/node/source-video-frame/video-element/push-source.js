import { Spinner } from "../../../../../ui/spinner";
import { UiVideoElement } from "./video-element-ui";

/** @implements {VideoFrameSource} */
export class SourceVideoElementPush {
  /**
   * @private
   * @param {DOMHighResTimeStamp} time
   */
  onAnimationFrameTimed = (time) => {
    this.enqueueChunkTimed(time, this.pauseFrameDelay);
    this.requestId = requestAnimationFrame(this.onAnimationFrameTimed);
  };

  /**
   * @private
   * @type {VideoFrameRequestCallback}
   */
  onVideoFrameTimed = (now, meta) => {
    this.enqueueChunkTimed(now, this.playFrameDelay);
    this.requestId = this.video.requestVideoFrameCallback(this.onVideoFrameTimed);
  };

  /**
   * @private
   * @type {VideoFrameRequestCallback}
   */
  onVideoFrame = (now, meta) => {
    this.enqueueChunk();
    this.requestId = this.video.requestVideoFrameCallback(this.onVideoFrame);
  };

  /**
   * @private
   * @param {Event} ev
   */
  onPause = (ev) => {
    console.debug(SourceVideoElementPush.name, this.onPause.name, this.requestId);

    if (this.requestId != 0) {
      this.video.cancelVideoFrameCallback(this.requestId);
    }

    if (this.pauseFrameDelay) {
      this.requestId = self.requestAnimationFrame(this.onAnimationFrameTimed);
    }
  };

  /**
   * @private
   * @param {Event} ev
   */
  onPlay = (ev) => {
    console.debug(SourceVideoElementPush.name, this.onPlay.name, this.requestId);

    if (this.requestId != 0) {
      cancelAnimationFrame(this.requestId);
    }

    this.requestId = this.playFrameDelay
      ? this.video.requestVideoFrameCallback(this.onVideoFrameTimed)
      : this.video.requestVideoFrameCallback(this.onVideoFrame);
  };

  /**
   * @private
   * @param {ErrorEvent} ev
   */
  onVideoError = (ev) => {
    console.error(SourceVideoElementPush.name, [this.requestId, this.video.paused], "Error:", ev.message ?? ev);

    if (this.requestId != 0) {
      if (this.video.paused) {
        cancelAnimationFrame(this.requestId);
      } else {
        this.video.cancelVideoFrameCallback(this.requestId);
      }
      this.requestId = 0;
    }
  };

  /**
   * @param {SourceVideoElementOptions} options
   * @returns {Promise<[VideoFrameSource, ReadableStream<any[]>]>}
   */
  static async create(options) {
    console.debug(SourceVideoElementPush.name, SourceVideoElementPush.create.name, options.media.url);
    Spinner.setLabel(SourceVideoElementPush.name, options.media.url);

    /** @private @type {HTMLVideoElement} */
    const video = document.createElement("video");
    video.id = "frame-source";
    video.muted = true;
    video.controls = true;
    video.autoplay = false;
    video.preload = "none";
    video.src = options.media.url;

    document.getElementById(options.containerId).append(video);

    const frameSource = new SourceVideoElementPush(video, options);
    const streamSource = new ReadableStream(frameSource, options.strategy);

    return [frameSource, streamSource];
  }

  /**
   * @private
   * @param {HTMLVideoElement} videoElement
   * @param {SourceVideoElementOptions} options
   */
  constructor(videoElement, options) {
    /** @private @type {ReadableStreamDefaultController<any[]>} */
    this.streamController = undefined;
    /** @private */
    this.mediaUrl = options.media.url;
    /** @private */
    this.outputIndex = options.output.frame;
    /** @private */
    this.chunkTemplate = Array.from({ length: options.chunkSize }).fill(undefined);
    /** @private */
    this.video = videoElement;
    /** @private */
    this.requestId = 0;
    /** @private */
    this.nextFrameTime = 0;

    const playDelay = 1000.0 / options.playFps;
    /** @private */
    this.playFrameDelay = Number.isNaN(playDelay) ? 0 : playDelay;
    /** @private */
    this.pauseFrameDelay = 1000.0 / options.pauseFps;

    /** @private */
    this.getVideoFrameCb = options.reframe ? this.createVideoFrameReframe : this.createVideoFrame;

    if (options.uiId) {
      /** @private */
      this.uiId = options.uiId;
      /** @private */
      this.ui = new UiVideoElement(this.video.id);
    }
  }

  /**
   * @private
   */
  enqueueChunk() {
    const chunk = this.chunkTemplate.concat();
    chunk[this.outputIndex] = this.getVideoFrameCb();
    this.streamController.enqueue(chunk);
  }

  /**
   * @private
   * @param {DOMHighResTimeStamp} now
   * @param {number} delay
   */
  enqueueChunkTimed(now, delay) {
    if (now >= this.nextFrameTime) {
      this.nextFrameTime = now + delay;
      this.enqueueChunk();
    }
  }

  /**
   * @private
   */
  createVideoFrame() {
    return new VideoFrame(this.video, { alpha: "discard" });
  }

  /**
   * @private
   */
  createVideoFrameReframe() {
    const frame = new VideoFrame(this.video, { alpha: "discard" });
    const reframed = new VideoFrame(frame);
    frame.close();

    return reframed;
  }

  play() {
    return this.video.play();
  }

  /**
   * @param {ReadableStreamDefaultController<any[]>} controller
   */
  start(controller) {
    console.debug(SourceVideoElementPush.name, this.start.name, this.mediaUrl);

    this.video.addEventListener("error", this.onVideoError, { passive: true });
    this.video.addEventListener("play", this.onPlay, { passive: true });
    this.video.addEventListener("pause", this.onPause, { passive: true });

    this.streamController = controller;
    this.video.src = this.mediaUrl;
    this.ui?.show(this.uiId);

    Spinner.clearLabel(SourceVideoElementPush.name);
  }

  async dispose() {
    console.debug(SourceVideoElementPush.name, this.dispose.name, this.requestId, this.video.paused);
    Spinner.setLabel(SourceVideoElementPush.name, this.video.src);

    if (this.ui) {
      this.ui.dispose();
      this.ui = undefined;
      this.uiId = undefined;
    }

    this.video.removeEventListener("error", this.onVideoError);
    this.video.removeEventListener("play", this.onPlay);
    this.video.removeEventListener("pause", this.onPause);

    if (this.requestId != 0) {
      if (this.video.paused) {
        cancelAnimationFrame(this.requestId);
      } else {
        this.video.cancelVideoFrameCallback(this.requestId);
        this.video.pause();
      }
      this.requestId = 0;
    }

    this.getVideoFrameCb = undefined;

    this.video.src = "";
    this.video.remove();
    this.video = undefined;

    if (this.mediaUrl.startsWith("blob")) {
      URL.revokeObjectURL(this.mediaUrl);
    }
    this.mediaUrl = undefined;

    this.streamController.close();
    this.streamController = undefined;

    Spinner.clearLabel(SourceVideoElementPush.name);
  }
}
