// @ts-nocheck
import htmlControls from "./html/controls-overlay.html?raw";
import "./html/controls-overlay.css";
import { Overlay } from "../overlay";

export class ControlsOverlay {
  /** @type {Readonly<number>} */
  static defaultHideTimeout = 3000;
  /** @private */
  static hideTimeoutValue = ControlsOverlay.defaultHideTimeout;
  /** @private */
  static timeoutId = 0;

  /** @private */
  static controlsSourceId = "control-info";
  /** @private @type {HTMLElement} */
  static restoreParentElement = null;

  static {
    document.addEventListener("fullscreenchange", ControlsOverlay.remove);
  }

  static set hideTimeout(timeout) {
    ControlsOverlay.hideTimeoutValue = timeout;
    console.debug(ControlsOverlay.name, "hideTimeout", ControlsOverlay.hideTimeoutValue);
  }

  /**
   * @param {string} elementId
   */
  static set sourceElementId(elementId) {
    ControlsOverlay.controlsSourceId = elementId;
    console.debug(ControlsOverlay.name, "sourceElement", ControlsOverlay.controlsSourceId);
  }

  static show() {
    if (ControlsOverlay.restoreParentElement == null) {
      const controls = document.getElementById(ControlsOverlay.controlsSourceId);
      ControlsOverlay.restoreParentElement = controls.parentElement;

      Overlay.show(new DOMParser().parseFromString(htmlControls, "text/html").getElementById("controls-overlay-wrapper"));

      document.getElementById("controls-overlay").appendChild(controls);
    }

    // in auto hide mode, extend overlay display time.
    if (ControlsOverlay.hideTimeoutValue != 0) {
      clearTimeout(ControlsOverlay.timeoutId);
      ControlsOverlay.timeoutId = setTimeout(ControlsOverlay.remove, ControlsOverlay.hideTimeoutValue);
    }
  }

  static remove() {
    if (ControlsOverlay.restoreParentElement != null) {
      clearTimeout(ControlsOverlay.timeoutId);

      ControlsOverlay.restoreParentElement.appendChild(document.getElementById(ControlsOverlay.controlsSourceId));
      ControlsOverlay.restoreParentElement = null;
      Overlay.remove();
    }
  }
}
