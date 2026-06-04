/** @template {{name?: string}} T */
export class Selector {
  clearSelection = () => {
    /** @type {HTMLSelectElement} */ (document.getElementById(this.idSelectEl)).selectedIndex = -1;
  };

  selection = () => {
    return structuredClone(
      this.options[/** @type {HTMLSelectElement} */ (document.getElementById(this.idSelectEl)).selectedIndex]
    );
  };

  /**
   * @param {boolean} flag
   */
  disabled = (flag) => {
    /** @type {HTMLSelectElement} */ (document.getElementById(this.idSelectEl)).disabled = flag;
  };

  /**
   * @param {boolean} flag
   */
  visible = (flag) => {
    /** @type {HTMLSelectElement} */ (document.getElementById(this.idContainerEl)).hidden = !flag;
  };

  /**
   * @param {string} parentId
   * @param {string} elementId
   * @param {T[]} options
   * @param {string} [label]
   * @param {(selection: T)=>void} [onChange]
   */
  constructor(parentId, elementId, options, label = "Choose: ", onChange) {
    /** @private */
    this.idContainerEl = `${elementId}-label`;
    /** @private */
    this.idSelectEl = `${elementId}-selector`;
    /** @private */
    this.options = options;

    const selectEl = document.createElement("select");
    selectEl.id = this.idSelectEl;

    for (const { name } of this.options) {
      const optionEl = document.createElement("option");
      optionEl.innerText = name;
      selectEl.appendChild(optionEl);
    }

    selectEl.selectedIndex = -1;

    if (onChange) {
      /** @private */
      this.changeCb = onChange;
      selectEl.onchange = (ev) =>
        this.changeCb(structuredClone(this.options[/** @type {HTMLSelectElement} */ (ev.target).selectedIndex]));
    }

    const labelEl = document.createElement("label");
    labelEl.id = this.idContainerEl;
    labelEl.htmlFor = this.idSelectEl;
    labelEl.innerText = label;

    // label element acts as a wrapper container select element
    labelEl.appendChild(selectEl);
    document.getElementById(parentId).appendChild(labelEl);
  }
}
