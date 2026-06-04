// @ts-ignore
import uiHtml from "./html/ui.html?raw";
import { ConfigOptions } from "../../config-options";
import { StereoFrameSwitchDefaults } from "./stereo-fs-defaults";
import { ControlsOverlay } from "../../../../ui/controls-overlay";

export class UiStereoFrameSwitch {
  /** @private */
  static keyCapture = {
    KeyR: UiStereoFrameSwitch.onKeyReset,
    KeyF: UiStereoFrameSwitch.onKeyFullScreen,
    KeyT: UiStereoFrameSwitch.onKeySwitch,
    KeyL: UiStereoFrameSwitch.onKeySwitchDelay,
    KeyO: UiStereoFrameSwitch.onKeyOrderToggle
  };

  /**
   * @private
   * @this {UiStereoFrameSwitch}
   */
  static onKeyReset() {
    console.debug(UiStereoFrameSwitch.name, UiStereoFrameSwitch.onKeyReset.name);

    Object.assign(this.options, StereoFrameSwitchDefaults.options);
    this.updateOptions();
  }

  /**
   * @private
   * @this {UiStereoFrameSwitch}
   */
  static onKeyFullScreen() {
    console.debug(UiStereoFrameSwitch.name, UiStereoFrameSwitch.onKeyFullScreen.name);

    (document.fullscreenElement
      ? document.exitFullscreen()
      : document.getElementById(this.containerId).requestFullscreen()
    ).catch((err) =>
      console.error(UiStereoFrameSwitch.name, UiStereoFrameSwitch.onKeyFullScreen.name, "Error:", err?.message ?? err)
    );
  }

  /**
   * @private
   * @this {UiStereoFrameSwitch}
   */
  static onKeySwitch() {
    console.debug(UiStereoFrameSwitch.name, UiStereoFrameSwitch.onKeySwitch.name);

    this.options.switch = !this.options.switch;
    this.updateOptions();
  }

  /**
   * @private
   * @this {UiStereoFrameSwitch}
   * @param {KeyboardEvent} ev
   */
  static onKeySwitchDelay(ev) {
    console.debug(UiStereoFrameSwitch.name, UiStereoFrameSwitch.onKeySwitchDelay.name);

    this.options.switchDelay = ConfigOptions.clipModify(
      this.options.switchDelay,
      ev.shiftKey,
      StereoFrameSwitchDefaults.configSwitchDelay
    );

    this.updateOptions();
  }

  /**
   * @private
   * @this {UiStereoFrameSwitch}
   * @param {KeyboardEvent} ev
   */
  static onKeyOrderToggle(ev) {
    this.options.toggleLrOrder = true;
    this.updateOptions(false);
    this.options.toggleLrOrder = false;
  }

  /**
   * @private
   * @param {KeyboardEvent} ev
   */
  onKey = (ev) =>
    UiStereoFrameSwitch.keyCapture[/** @type {keyof typeof UiStereoFrameSwitch.keyCapture} */ (ev.code)]?.call(this, ev);

  /**
   * @param {{setOptions(options: Object.<string,any>): void}} node
   * @param {string} containerId
   */
  constructor(node, containerId) {
    console.debug(UiStereoFrameSwitch.name);

    /** @private */
    this.node = node;
    /** @private */
    this.options = { ...StereoFrameSwitchDefaults.options };
    /** @private */
    this.containerId = containerId;
  }

  /**
   * @private
   * @param {boolean} [updateOverlay=true]
   */
  updateOptions(updateOverlay = true) {
    this.node.setOptions(this.options);

    document.getElementById("frameSwitchDelay").innerText = String(this.options.switchDelay);
    document.getElementById("frameSwitch").innerText = String(this.options.switch);

    if (updateOverlay && document.fullscreenElement) ControlsOverlay.show();
  }

  /**
   * @param {string} uiContainerId
   */
  show(uiContainerId) {
    console.debug(UiStereoFrameSwitch.name, this.show.name, uiContainerId);

    document
      .getElementById(uiContainerId)
      .appendChild(new DOMParser().parseFromString(uiHtml, "text/html").getElementById(UiStereoFrameSwitch.name));
    document.getElementById("frameSwitchDelay-config").innerText = ConfigOptions.stringFrom(
      StereoFrameSwitchDefaults.configSwitchDelay
    );

    this.updateOptions();

    window.addEventListener("keydown", this.onKey, { passive: true });
  }

  dispose() {
    console.debug(UiStereoFrameSwitch.name, this.dispose.name);

    window.removeEventListener("keydown", this.onKey);

    this.node = undefined;
    this.options = undefined;
    this.containerId = undefined;
  }
}
