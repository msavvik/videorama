// @ts-ignore
import uiHtml from "./html/ui.html?raw";
import { ConfigOptions } from "../../config-options";
import { DepthImageBasedStereoDefaults } from "./dib-stereo-defaults";
import { ControlsOverlay } from "../../../../ui/controls-overlay";

export class UiDepthImageBasedStereo {
  /** @private */
  static keyCapture = {
    KeyR: UiDepthImageBasedStereo.onKeyReset,
    KeyE: UiDepthImageBasedStereo.onKeySeparation,
    KeyD: UiDepthImageBasedStereo.onKeyFocus,
    KeyG: UiDepthImageBasedStereo.onKeyGamma,
    KeyS: UiDepthImageBasedStereo.onKeySwapLR
  };

  /**
   * @private
   * @this {UiDepthImageBasedStereo}
   */
  static onKeyReset() {
    console.debug(UiDepthImageBasedStereo.name, UiDepthImageBasedStereo.onKeyReset.name);

    Object.assign(this.options, DepthImageBasedStereoDefaults.options);
    this.updateOptions();
  }

  /**
   * @private
   * @this {UiDepthImageBasedStereo}
   * @param {KeyboardEvent} ev
   */
  static onKeySeparation(ev) {
    console.debug(UiDepthImageBasedStereo.name, UiDepthImageBasedStereo.onKeySeparation.name);

    this.options.separation = ConfigOptions.clipModify(
      this.options.separation,
      ev.shiftKey,
      DepthImageBasedStereoDefaults.configSeparation
    );

    this.updateOptions();
  }

  /**
   * @private
   * @this {UiDepthImageBasedStereo}
   * @param {KeyboardEvent} ev
   */
  static onKeyFocus(ev) {
    console.debug(UiDepthImageBasedStereo.name, UiDepthImageBasedStereo.onKeyFocus.name);

    this.options.focus = ConfigOptions.clipModify(this.options.focus, ev.shiftKey, DepthImageBasedStereoDefaults.configFocus);

    this.updateOptions();
  }

  /**
   * @private
   * @this {UiDepthImageBasedStereo}
   * @param {KeyboardEvent} ev
   */
  static onKeyGamma(ev) {
    console.debug(UiDepthImageBasedStereo.name, UiDepthImageBasedStereo.onKeyGamma.name);

    this.options.gamma = ConfigOptions.clipModify(this.options.gamma, ev.shiftKey, DepthImageBasedStereoDefaults.configGamma);

    this.updateOptions();
  }

  /**
   * @private
   * @this {UiDepthImageBasedStereo}
   */
  static onKeySwapLR() {
    console.debug(UiDepthImageBasedStereo.name, UiDepthImageBasedStereo.onKeySwapLR.name);

    this.options.swapLR = !this.options.swapLR;
    this.updateOptions();
  }

  /**
   * @private
   * @param {KeyboardEvent} ev
   */
  onKey = (ev) =>
    UiDepthImageBasedStereo.keyCapture[/** @type {keyof typeof UiDepthImageBasedStereo.keyCapture} */ (ev.code)]?.call(this, ev);

  /**
   * @param {IOptionsNode} node
   */
  constructor(node) {
    console.debug(UiDepthImageBasedStereo.name);

    /** @private */
    this.node = node;
    /** @private */
    this.options = { ...DepthImageBasedStereoDefaults.options };
  }

  /**
   * @private
   */
  updateOptions() {
    this.node.setOptions(this.options);

    document.getElementById("eyeSeparation").innerText = String(this.options.separation);
    document.getElementById("depthFocusDistance").innerText = String(this.options.focus);
    document.getElementById("depthGamma").innerText = String(this.options.gamma);
    document.getElementById("swapLeftRight").innerText = String(this.options.swapLR);

    if (document.fullscreenElement) ControlsOverlay.show();
  }

  /**
   * @param {string} uiContainerId
   */
  show(uiContainerId) {
    console.debug(UiDepthImageBasedStereo.name, this.show.name, uiContainerId);

    document
      .getElementById(uiContainerId)
      .appendChild(new DOMParser().parseFromString(uiHtml, "text/html").getElementById(UiDepthImageBasedStereo.name));

    document.getElementById("eyeSeparation-config").innerText = ConfigOptions.stringFrom(
      DepthImageBasedStereoDefaults.configSeparation
    );

    document.getElementById("depthFocusDistance-config").innerText = ConfigOptions.stringFrom(
      DepthImageBasedStereoDefaults.configFocus
    );

    document.getElementById("depthGamma-config").innerText = ConfigOptions.stringFrom(DepthImageBasedStereoDefaults.configGamma);

    this.updateOptions();

    window.addEventListener("keydown", this.onKey, { passive: true });
  }

  dispose() {
    console.debug(UiDepthImageBasedStereo.name, this.dispose.name);

    window.removeEventListener("keydown", this.onKey);
    document.getElementById(UiDepthImageBasedStereo.name)?.remove();

    this.node = undefined;
    this.options = undefined;
  }
}
