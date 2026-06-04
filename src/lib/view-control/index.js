/** @type {ViewControlHTMLInputElement} */
const DefaultController = {
  checked: undefined
};

/**
 *
 * @param {string} [controllerId]
 * @param {boolean} [checkedDefault]
 * @returns {ViewControlHTMLInputElement}
 */
export function viewControlElement(controllerId, checkedDefault = false) {
  if (!controllerId) {
    const controlEl = Object.create(DefaultController);
    controlEl.checked = checkedDefault;
    return controlEl;
  }

  const inputEl = /** @type {HTMLInputElement} */ (document.getElementById(controllerId));
  if ((inputEl && inputEl.type == "checkbox") || inputEl.type == "radio") return inputEl;

  throw new Error(`Bad HTMLInputElement type: ${inputEl?.type} elementId: '${controllerId}' element: ${inputEl}`);
}
