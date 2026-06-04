// @ts-ignore
import uiHtml from "./html/ui.html?raw";
import { ConfigOptions } from "../../config-options";
import { ParallaxDefaults } from "./parallax-defaults";
import { ControlsOverlay } from "../../../../ui/controls-overlay";

export class UiParallax {
  /** @private */
  static keyCapture = {
    KeyR: UiParallax.onKeyReset,
    KeyF: UiParallax.onKeyFullScreen,
    KeyX: UiParallax.onKeyMaxDisplacementX,
    KeyY: UiParallax.onKeyMaxDisplacementY
  };

  /**
   * @private
   * @this {UiParallax}
   */
  static onKeyReset() {
    console.debug(UiParallax.name, UiParallax.onKeyReset.name);

    Object.assign(this.options, ParallaxDefaults.options);
    this.updateDisplacement();
    this.updateOptions();
  }

  /**
   * @private
   * @this {UiParallax}
   */
  static onKeyFullScreen() {
    console.debug(UiParallax.name, UiParallax.onKeyFullScreen.name);

    (document.fullscreenElement
      ? document.exitFullscreen()
      : document.getElementById(this.containerId).requestFullscreen()
    ).catch((err) => console.error(UiParallax.name, UiParallax.onKeyFullScreen.name, "Error:", err?.message ?? err));
  }

  /**
   * @private
   * @this {UiParallax}
   * @param {KeyboardEvent} ev
   */
  static onKeyMaxDisplacementX(ev) {
    console.debug(UiParallax.name, UiParallax.onKeyMaxDisplacementX.name);

    this.options.maxDisplacementX = ConfigOptions.clipModify(
      this.options.maxDisplacementX,
      ev.shiftKey,
      ParallaxDefaults.configMaxDisplacement
    );

    this.updateDisplacement();
    this.updateOptions();
  }

  /**
   * @private
   * @this {UiParallax}
   * @param {KeyboardEvent} ev
   */
  static onKeyMaxDisplacementY(ev) {
    console.debug(UiParallax.name, UiParallax.onKeyMaxDisplacementY.name);

    this.options.maxDisplacementY = ConfigOptions.clipModify(
      this.options.maxDisplacementY,
      ev.shiftKey,
      ParallaxDefaults.configMaxDisplacement
    );

    this.updateDisplacement();
    this.updateOptions();
  }

  /**
   * @private
   * @param {KeyboardEvent} ev
   */
  onKey = (ev) => UiParallax.keyCapture[/** @type {keyof typeof UiParallax.keyCapture} */ (ev.code)]?.call(this, ev);

  /**
   * @private
   * @param {MouseEvent} ev
   */
  onMouseMove = (ev) => {
    const containerEl = document.getElementById(this.containerId);
    const targetRect = containerEl.getBoundingClientRect();

    this.options.xPosition = (ev.clientX - targetRect.x) / targetRect.width;
    this.options.yPosition = (ev.clientY - targetRect.y) / targetRect.height;
    this.updateDisplacement();
    this.updateOptions(false);
  };

  /**
   * @private
   * @param {MouseEvent} ev
   */
  startMouseCapture = (ev) => {
    // Process "left/main" button click only.
    if (ev.button == 0) {
      console.debug(UiParallax.name, this.startMouseCapture.name);

      const containerEl = document.getElementById(this.containerId);
      containerEl.removeEventListener("mouseup", this.startMouseCapture);
      containerEl.addEventListener("mouseup", this.stopMouseCapture, { passive: true });
      containerEl.addEventListener("mousemove", this.onMouseMove, { passive: true });
    }
  };

  /**
   * @private
   * @param {MouseEvent} ev
   */
  stopMouseCapture = (ev) => {
    // Process "left/main" button click only.
    if (ev.button == 0) {
      console.debug(UiParallax.name, this.stopMouseCapture.name);

      const containerEl = document.getElementById(this.containerId);
      containerEl.removeEventListener("mouseup", this.stopMouseCapture);
      containerEl.removeEventListener("mousemove", this.onMouseMove);
      containerEl.addEventListener("mouseup", this.startMouseCapture, { passive: true });
    }
  };

  /**
   * @param {{setOptions(options: Object.<string,any>): void}} node
   * @param {string} containerId
   */
  constructor(node, containerId) {
    console.debug(UiParallax.name);

    /** @private */
    this.node = node;
    /**
     * Worker implementation uses displacement values only.
     * Storing additional information in options instance is a "shortcut", at a cost of dispatching superfluous data to worker.
     * @private
     */
    this.options = { ...ParallaxDefaults.options };
    /** @private */
    this.containerId = containerId;
    /** @private @type {string} */
    this.uiContainerId = undefined;
  }

  /**
   * @private
   */
  updateDisplacement() {
    this.options.xDisplacement = (0.5 - this.options.xPosition) * this.options.maxDisplacementX;
    this.options.yDisplacement = (0.5 - this.options.yPosition) * this.options.maxDisplacementY;
  }

  /**
   * @private
   * @param {boolean} [updateOverlay=true]
   */
  updateOptions(updateOverlay = true) {
    this.node.setOptions(this.options);

    document.getElementById("maxDisplacementX").innerText = String(this.options.maxDisplacementX);
    document.getElementById("maxDisplacementY").innerText = String(this.options.maxDisplacementY);
    document.getElementById("xDisplacement").innerText = String(this.options.xDisplacement);
    document.getElementById("yDisplacement").innerText = String(this.options.yDisplacement);

    if (updateOverlay && document.fullscreenElement) ControlsOverlay.show();
  }

  /**
   * @param {string} uiContainerId
   */
  show(uiContainerId) {
    console.debug(UiParallax.name, this.show.name, uiContainerId);

    document
      .getElementById(uiContainerId)
      .appendChild(new DOMParser().parseFromString(uiHtml, "text/html").getElementById(UiParallax.name));

    document.getElementById("maxDisplacementX-config").innerText = document.getElementById("maxDisplacementY-config").innerText =
      ConfigOptions.stringFrom(ParallaxDefaults.configMaxDisplacement);

    this.updateOptions();

    document.getElementById(this.containerId).addEventListener("mouseup", this.startMouseCapture, { passive: true });
    window.addEventListener("keydown", this.onKey, { passive: true });
  }

  dispose() {
    console.debug(UiParallax.name, this.dispose.name);

    const containerEl = document.getElementById(this.containerId);
    containerEl.removeEventListener("mouseup", this.startMouseCapture);
    containerEl.removeEventListener("mouseup", this.stopMouseCapture);
    containerEl.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("keydown", this.onKey);
    document.getElementById(UiParallax.name).remove();

    this.node = undefined;
    this.options = undefined;
    this.containerId = undefined;
  }
}
