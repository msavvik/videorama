// @ts-ignore
import uiHtml from "./html/url-source.html?raw";

export class UrlSource {
  /** @private */
  static instanceId = 0;

  /**
   * @private
   * @param {Event} ev
   */
  onFieldChange = (ev) => {
    /** @type {HTMLInputElement} */ (document.getElementById(this.choiceId)).value = null;
  };

  /**
   * @private
   * @param {Event} ev
   */
  onChoiceChange = (ev) => {
    /** @type {HTMLInputElement} */ (document.getElementById(this.fieldId)).value = null;
  };

  /**
   * @param {UrlSourceOptions} options
   */
  constructor(options) {
    console.debug(UrlSource.name);

    /** @private */
    this.containerId = `${UrlSource.name}-${UrlSource.instanceId}`;
    UrlSource.instanceId++;

    const uiContainer = document.createElement("div");
    uiContainer.id = this.containerId;
    uiContainer.innerHTML = uiHtml;
    document.getElementById(options.parentId).appendChild(uiContainer);

    // Init field element
    let element = document.getElementById("url-field");
    element.addEventListener("change", this.onFieldChange, { passive: true });
    if (options.fieldProps?.onchange) {
      /** @private */
      this.fieldChangeCb = options.fieldProps.onchange;
      options.fieldProps.onchange = null;
      element.addEventListener("change", this.fieldChangeCb, { passive: true });
    }
    Object.assign(element, { type: "url", autocomplete: "off", ...options.fieldProps });
    /** @private */
    this.fieldId = element.id;

    // Init choice element
    element = document.getElementById("url-choice");
    element.addEventListener("change", this.onChoiceChange, { passive: true });
    if (options.choiceProps?.onchange) {
      /** @private */
      this.choiceChangeCb = options.choiceProps.onchange;
      options.choiceProps.onchange = null;
      element.addEventListener("change", this.choiceChangeCb, { passive: true });
    }
    Object.assign(element, { accept: "video/*", ...options.choiceProps });
    /** @private */
    this.choiceId = element.id;
  }

  /**
   * @param {string} urlValue
   */
  set url(urlValue) {
    /** @type {HTMLInputElement} */ (document.getElementById(this.fieldId)).value = urlValue;
    /** @type {HTMLInputElement} */ (document.getElementById(this.choiceId)).value = null;
  }

  /**
   * @returns {string}
   */
  get url() {
    const choiceEl = /** @type {HTMLInputElement} */ (document.getElementById(this.choiceId));

    return choiceEl.files[0]
      ? URL.createObjectURL(choiceEl.files[0])
      : /** @type {HTMLInputElement} */ (document.getElementById(this.fieldId)).value;
  }

  dispose() {
    console.debug(UrlSource.name, this.dispose.name);

    // instance validation
    UrlSource.instanceId--;
    if (UrlSource.instanceId < 0) {
      throw new Error(`Invalid instanceId: ${UrlSource.instanceId}`);
    }

    // field element removal
    let element = document.getElementById(this.fieldId);

    this.fieldId = undefined;
    element.removeEventListener("change", this.onFieldChange);
    if (this.fieldChangeCb) {
      element.removeEventListener("change", this.fieldChangeCb);
      this.fieldChangeCb = undefined;
    }

    // choice element removal
    element = document.getElementById(this.choiceId);
    this.choiceId = undefined;
    element.removeEventListener("change", this.onChoiceChange);
    if (this.choiceChangeCb) {
      element.removeEventListener("change", this.choiceChangeCb);
      this.choiceChangeCb = undefined;
    }

    // UI container removal
    document.getElementById(this.containerId).remove();
    this.containerId = undefined;
  }
}
