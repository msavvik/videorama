export class ControlInfo {
  /**
   * @private
   * @this {HTMLElement}
   * @param {string} info
   */
  static paragraph(info) {
    const infoElement = document.createElement("p");
    infoElement.innerHTML = info;
    this.appendChild(infoElement);
  }

  /**
   *
   * @param {string} containerId
   * @param {string[]} info
   */
  static show(containerId, info) {
    const container = document.getElementById(containerId);

    if (container) {
      info.forEach(ControlInfo.paragraph, container);
    } else {
      console.warn(ControlInfo.name, ControlInfo.show.name, "no container:", containerId);
    }
  }

  /**
   *
   * @param {string} containerId
   */
  static clear(containerId) {
    const container = document.getElementById(containerId);

    if (container) {
      while (container.lastChild) {
        container.lastChild.remove();
      }
    } else {
      console.warn(ControlInfo.name, ControlInfo.show.name, "no container:", containerId);
    }
  }
}
