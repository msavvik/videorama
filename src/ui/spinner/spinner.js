// @ts-nocheck
import spinnerHtml from "./html/spinner.html?raw";
import "./html/spinner.css";

export class Spinner {
  /**
   * Map 'key' contains label name, 'value' label+detail in html form.
   * @private
   * @type {Map<string, string>}
   */
  static entries = new Map();

  /**
   * @private
   */
  static refresh() {
    document.getElementById("spinner-labels").innerHTML = Spinner.entries.values().toArray().join(" ");
  }

  /**
   * @private
   * @param {string} label
   * @param {string[]} detail
   */
  static htmlFrom(label, detail) {
    return `<span class="spinner-label">${label} ${detail.join(" ")}</span>`;
  }

  /**
   * @param {string} label
   * @param  {...string} detail
   */
  static setLabel(label, ...detail) {
    if (Spinner.entries.size == 0) {
      document.body.append(new DOMParser().parseFromString(spinnerHtml, "text/html").getElementById("spinner"));
    }

    Spinner.entries.set(label, Spinner.htmlFrom(label, detail));
    Spinner.refresh();
  }

  /**
   * @param {string} label
   */
  static clearLabel(label) {
    if (Spinner.entries.delete(label)) {
      if (Spinner.entries.size == 0) {
        document.getElementById("spinner")?.remove();
      } else {
        Spinner.refresh();
      }
    }
  }

  /**
   * @param {string} subjectLabel
   */
  static deleteStartingIn(subjectLabel) {
    Spinner.entries
      .keys()
      .filter((key) => subjectLabel.startsWith(key))
      .toArray()
      .forEach((key) => Spinner.clearLabel(key));
  }

  static remove() {
    Spinner.entries.clear();
    document.getElementById("spinner")?.remove();
  }
}
