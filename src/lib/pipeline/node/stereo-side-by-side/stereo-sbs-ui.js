// @ts-ignore
import uiHtml from "./html/ui.html?raw";

export class UiStereoSideBySide {
  /** @private */
  static keyCapture = {
    KeyF: UiStereoSideBySide.onKeyFullScreen
  };

  /**
   * @private
   * @this {UiStereoSideBySide}
   */
  static onKeyFullScreen() {
    console.debug(UiStereoSideBySide.name, UiStereoSideBySide.onKeyFullScreen.name);

    (document.fullscreenElement
      ? document.exitFullscreen()
      : document.getElementById(this.containerId).requestFullscreen()
    ).catch((err) =>
      console.error(UiStereoSideBySide.name, UiStereoSideBySide.onKeyFullScreen.name, "Error:", err.message ?? err)
    );
  }

  /**
   * @private
   * @param {KeyboardEvent} ev
   */
  onKey = (ev) => UiStereoSideBySide.keyCapture[ev.code]?.call(this, ev);

  /**
   * @param {string} containerId
   */
  constructor(containerId) {
    console.debug(UiStereoSideBySide.name);

    /** @private */
    this.containerId = containerId;
  }

  /**
   * @param {string} uiContainerId
   */
  show(uiContainerId) {
    console.debug(UiStereoSideBySide.name, this.show.name, uiContainerId);

    document
      .getElementById(uiContainerId)
      .appendChild(new DOMParser().parseFromString(uiHtml, "text/html").getElementById(UiStereoSideBySide.name));

    window.addEventListener("keydown", this.onKey, { passive: true });
  }

  dispose() {
    console.debug(UiStereoSideBySide.name, this.dispose.name);

    window.removeEventListener("keydown", this.onKey);
    document.getElementById(UiStereoSideBySide.name)?.remove();

    this.containerId = undefined;
  }
}
