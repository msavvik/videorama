// @ts-ignore
import uiHtml from "./html/ui.html?raw";
import { ConfigOptions } from "../../config-options";
import { DepthMapDefaults } from "./depth-map-defaults";
import { ControlsOverlay } from "../../../../ui/controls-overlay";

export class UiDepthMap {
  /** @private */
  static keyCapture = {
    KeyM: UiDepthMap.onKeyMapRange
  };

  /**
   * @private
   * @this {UiDepthMap}
   */
  static onKeyMapRange() {
    console.debug(UiDepthMap.name, UiDepthMap.onKeyMapRange.name);

    this.confRangeIndex = ConfigOptions.cycleIndex(this.confRangeIndex, this.confRangeOptions);
    Object.assign(this.options, this.confRangeOptions[this.confRangeIndex]);
    this.showOptions();
  }

  /**
   * @private
   * @param {KeyboardEvent} ev
   */
  onKey = (ev) =>  UiDepthMap.keyCapture[/** @type {keyof typeof UiDepthMap.keyCapture} */ (ev.code)]?.call(this);

  /**
   * @param {IOptionsNode} node
   * @param {DepthMapRange[]} rangeOptions
   */
  constructor(node, rangeOptions) {
    console.debug(UiDepthMap.name);

    /** @private */
    this.node = node;
    /** @private */
    this.confRangeIndex = 0;
    /** @private */
    this.confRangeOptions = rangeOptions;
    /** @private */
    this.options = Object.assign(DepthMapDefaults.options(), this.confRangeOptions[this.confRangeIndex]);
  }

  /**
   * @private
   */
  showOptions() {
    this.node.setOptions(this.options);
    document.getElementById("depthRange").innerText = `[${this.options.min},${this.options.max}]`;

    if (document.fullscreenElement) ControlsOverlay.show();
  }

  /**
   * @param {string} uiContainerId
   */
  show(uiContainerId) {
    console.debug(UiDepthMap.name, this.show.name, uiContainerId);

    document
      .getElementById(uiContainerId)
      .appendChild(new DOMParser().parseFromString(uiHtml, "text/html").getElementById(UiDepthMap.name));

    document.getElementById("depthRange-config").innerText = `${this.confRangeOptions
      .map((range) => `[${range.min},${range.max}]`)
      .join(", ")}`;

    this.showOptions();

    window.addEventListener("keydown", this.onKey, { passive: true });
  }

  dispose() {
    console.debug(UiDepthMap.name, this.dispose.name);

    window.removeEventListener("keydown", this.onKey);
    document.getElementById(UiDepthMap.name)?.remove();

    this.confRangeOptions = undefined;
    this.options = undefined;
    this.node = undefined;
  }
}
