import { plants } from './data/plants.mjs';
import { treeData } from './data/treeData.mjs';
import { images as imageData } from './data/imageData.mjs';
import {
  drawAncestorTree,
  generateCardData,
  generateImageData
} from './utils.js';

class Cards {
  constructor({
    containerSelector = '#wrapper',
    data
  }) {
    this.containerSelector = containerSelector;
    this._data = data;
    this.render();
  }

  gatherAncestors(current, nodes) {
    while (current.parent) {
      current = current.parent;
      nodes.add(current);
    }
    return nodes;
  }

  displayInfo(d, ancestors) {
    clearTimeout(this._timeout);
    const names = ancestors.map((n) => n.data.name);
    const miniTree = `<div class="minitree">${this.drawAncestorTree(names)}</div>`;
    const cardData = this.generateCardData(d);
    const imageHtml = this.generateImageData(d);
    const html = `${miniTree}${cardData}${imageHtml}`;
    this._nodes.infoCardContent
      .classed('hidden', false);
    this._nodes.infoSlot
      .html(html);
  }

  render() {
    let cards = '';
    for (const plant of this._data) {
      const d = generateCardData(plant);
      cards += `<div class="card">${d}</div>`;
    }
    const wrapper = document.querySelector(this.containerSelector);
    wrapper.innerHTML = cards;
  }
}

// main
(function() {
  new Cards({ data: plants });
})();