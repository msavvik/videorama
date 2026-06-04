// @ts-nocheck
import overlayHtml from "./html/overlay.html?raw";
import "./html/overlay.css";

export class Overlay {
  /** @private */
  static overlayId = "overlay-container";

  /**
   * Will error when called in non full screen. No document.fullscreenElement present.
   * @param {HTMLElement} content
   */
  static show(content) {
    console.debug(Overlay.name, Overlay.show.name, content.id);

    document.getElementById(Overlay.overlayId)?.remove();
    document.fullscreenElement.appendChild(
      new DOMParser().parseFromString(overlayHtml, "text/html").getElementById(Overlay.overlayId)
    );
    document.getElementById(Overlay.overlayId).appendChild(content);
  }

  static remove() {
    console.debug(Overlay.name, Overlay.remove.name);
    
    document.getElementById(Overlay.overlayId)?.remove();
  }
}
