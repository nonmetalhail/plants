import { treeData } from './data/treeData.mjs';
import { images as imageData } from './data/imageData.mjs';
import * as d3 from './d3_bundle/dist/pd3.js';

class Taxonomy {
  constructor({
    containerSelector = '#chart-container',
    infoCardContent = '#info-card-content',
    infoSlotSelector = '#info-card-slot',
    infoButtonSelector = '#card-clear',
    data
  }) {
    this.containerSelector = containerSelector;
    this.infoCardContent = infoCardContent;
    this.infoSlotSelector = infoSlotSelector;
    this.infoButtonSelector = infoButtonSelector;
    this._data = { data };

    const width = 1200;
    const dy = width * .129;

    this._sizing = {
      width, //total width
      dx: 11, //vertical spacing
      dy, // horizontal spacing
      padding: 1 // horizontal padding for first and last column
    };
    this._styles = {
      nodes: { r: 3 },
      text: {
        size: 10,
        family: 'sans-serif',
        offset: 6,
        padding: 2
      }
    };

    this._selectedElems = [];
    this._focusedElem = null;

    this.init();
    this.render();
  }

  createMeasurementCanvas() {
    const { size, family } = this._styles.text;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.width = 10;
    ctx.height = 10;
    ctx.font = `${size}px ${family}`;
    this._measurementCanvas = ctx;
  }

  //  getLongestStringLength(data) {

  //   let longest = 0;
  //   for (const { binomialName } of data) {
  //     longest = Math.max(longest, ctx.measureText(binomialName).width);
  //   }
  //   return longest;
  // }

  initData() {
    const { dx, dy } = this._sizing;
    const root = d3.hierarchy(this._data.data);
    const descendants = root.descendants();
    const labels = descendants.map(d => d.data.name);

    // Compute the layout.
    d3.tree().nodeSize([dx, dy])(root);

    // Center the tree.
    let x0 = Infinity;
    let x1 = -x0;
    root.each(d => {
      if (d.x > x1) x1 = d.x;
      if (d.x < x0) x0 = d.x;
    });

    const height = x1 - x0 + dx * 2;

    this._data.root = root;
    this._data.descendants = descendants;
    this._data.labels = labels;

    this._sizing.x0 = x0;
    this._sizing.x1 = x1;
    this._sizing.height = height;
  }

  initChart() {
    const {
      dy,
      dx,
      x0,
      padding,
      width,
      height
    } = this._sizing;
    const div = d3.select(this.containerSelector);
    const svg = div.append('svg')
      .attr('viewBox', [-dy * padding / 2, x0 - dx, width, height])
      .attr('width', width)
      .attr('height', height)
      .attr('style', 'max-width: 100%; height: auto; height: intrinsic;')
      .attr('font-family', this._styles.text.family)
      .attr('font-size', this._styles.text.size)
      .attr('tabindex', 0);

    const linksNode = svg.append('g')
      .classed('links', true);

    const textNode = svg.append('g')
      .classed('nodes', true);

    const infoCardContent = d3.select(this.infoCardContent);
    const infoSlot = d3.select(this.infoSlotSelector);
    d3.select(this.infoButtonSelector).on('click', this.infoButtonClicked.bind(this));

    this._nodes = { div, svg, linksNode, textNode, infoCardContent, infoSlot };
  }

  buildTree() {
    const { root, labels } = this._data;
    const { offset, padding } = this._styles.text;
    const { linksNode, textNode } = this._nodes;

    const linkPaths = linksNode.selectAll('path')
      .data(root.links())
      .join('path')
        .attr('d', d3.linkHorizontal()
          .x(d => d.y)
          .y(d => d.x));


    const treeNodes = textNode.selectAll('g')
      .data(root.descendants())
      .join('g')
        .attr('class', d => d.children ? null : 'plant')
        .attr('transform', d => `translate(${d.y},${d.x})`)
        .attr('tabindex', -1);

    this._nodes.treeNodes = treeNodes;
    this._nodes.linkPaths = linkPaths;
    this.addListeners(treeNodes);

    // prime the pump for keyboard
    const firstNode = d3.select(treeNodes.node());
    this._focusedElem = firstNode;
    firstNode.attr('tabindex', 0);

    treeNodes.append('rect')
      .attr('pointer-events', 'all')
      .attr('x', (d,i) => d.children ? -this._measurementCanvas.measureText(labels[i]).width - offset - padding : offset - padding)
      .attr('y', -this._sizing.dx/2)
      .attr('width', (d,i) => this._measurementCanvas.measureText(labels[i]).width + offset - padding)
      .attr('height', this._sizing.dx);

    treeNodes.append('circle')
      .attr('r', this._styles.nodes.r)
      .attr('pointer-events', 'none');

    treeNodes.append('text')
      .attr('dy', '0.32em')
      .attr('x', d => d.children ? -offset : offset)
      .attr('text-anchor', d => d.children ? 'end' : 'start')
      .attr('pointer-events', 'none')
      .text((d, i) => labels[i])
      .call(text => text.clone(true))
        .classed('outline', true);
  }

  gatherAncestors(current, nodes) {
    while (current.parent) {
      current = current.parent;
      nodes.add(current);
    }
    return nodes;
  }

  gatherDescendants(current, nodes) {
    if (current.children) {
      for (const child of current.children) {
        nodes.add(child);
        this.gatherDescendants(child, nodes)
      }
    }

    return nodes;
  }

  infoButtonClicked() {
    console.log('click')
    this.addListeners();
    this.nodeLeave();
    this._nodes.div.on('click', null);
  }

  addListeners() {
    this._nodes.treeNodes
      .on('mouseenter focus', this.nodeEnter.bind(this))
      .on('mouseleave blur', this.nodeLeave.bind(this))
      .on('click', this.removeListeners.bind(this))
      // dont want click to trigger a focus event
      .on('mousedown', (evt) => evt.preventDefault());

    this._nodes.svg
      .on('keyup', this.processKeyEvent.bind(this))
      .on('keydown', this.stopPageScroll.bind(this));
  }

  removeListeners(elem) {
    this._nodes.treeNodes
      .on('mouseenter keyfocus', null)
      .on('mouseleave keyblur', null)
      .on('click', null)
      .on('mousedown', null);

    setTimeout(() => {
      this._nodes.div.on('click', this.infoButtonClicked.bind(this));
    }, 50);
  }

  stopPageScroll(evt) {
    switch (evt.key) {
      case 'ArrowRight':
      case 'ArrowLeft': 
      case 'ArrowUp': 
      case 'ArrowDown': 
        evt.preventDefault();
        break;
    }
  }

  processKeyEvent(evt) {
    const key = evt.key;
    let node;
    console.log(key);
    switch (key) {
      case 'ArrowRight': {
        // go to children
        console.log(this._focusedElem)
        const datum = this._focusedElem.datum();
        node = datum.children?.[0];
        break;  
      }

      // go to parent
      case 'ArrowLeft': {
        const datum = this._focusedElem.datum();
        node = datum.parent;
      break;
      }

      // go to older sibling
      case 'ArrowUp': {
        const datum = this._focusedElem.datum();
        node = this.findSiblingElem(datum, -1);
        break;
      }

      // go to older sibling
      case 'ArrowDown': {
        const datum = this._focusedElem.datum();
        node = this.findSiblingElem(datum, 1);
        break;
      }

      case 'Escape':
        this._focusedElem.node().blur();
        break;
    }

    if (!node) return;
    this.selectNodeWithKeyboard(node)
  }

  findSiblingElem(d, dir) {
    if (!d.parent) return;
    const parent = d.parent;
    const siblings = parent.children;
    const self = siblings.indexOf(d);
    const sib = self + dir;

    // if we are at an edge on this branch, recursively walk 
    // the tree back to get the next percieved neighbor
    if (sib === -1 || sib === siblings.length) {
      const node = this.findSiblingElem(parent, dir);
      if (!node) return;

      const idx = dir === 1 ? 0 : node.children.length -1;
      return node.children[idx];
    }

    return siblings[sib];
  }

  selectNodeWithKeyboard(n) {
    this.unselectNodeWithKeyboard();
    const elem = this.findElemFromNode(n);
    this._focusedElem = d3.select(elem);
    this._focusedElem.attr('tabindex', 0);
    elem.focus();
  }

  unselectNodeWithKeyboard() {
    if (this._focusedElem) {
      this._focusedElem.node().blur();
      this._focusedElem.attr('tabindex', -1);
      this._focusedElem = null;
    }
  }

  findElemFromNode(data) {
    let elem;
    this._nodes.treeNodes.each(function(d) {
      if (d === data) {
        elem = this;
      }
    });
    return elem;
  }

  nodeEnter(evt, d) {
    console.log(d);
    const _this = this;
    let selectedNodes = this.gatherAncestors(d, new Set([d]));
    const ancestors = [...selectedNodes].reverse();
    selectedNodes = this.gatherDescendants(d, selectedNodes);

    this._nodes.treeNodes.each(function(d) {
      if (selectedNodes.has(d)) {
        const elem = d3.select(this);
        elem.classed('selected', true);
        _this._selectedElems.push(elem);
      }
    });
    this._nodes.linkPaths.each(function(d) {
      if (selectedNodes.has(d.source) && selectedNodes.has(d.target)) {
        const elem = d3.select(this);
        elem.classed('selected', true);
        _this._selectedElems.push(elem);
      }
    });

    this.displayInfo(d, ancestors);
  }

  nodeLeave(evt, d) {
    for (const elem of this._selectedElems) {
      elem.classed('selected', false);
    }
    this.clearInfo();
    this._selectedElems = [];
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

  clearInfo() {
    this._timeout = setTimeout(() => {
      this._nodes.infoCardContent
        .classed('hidden', true)
        .on('transitionend', () => {
          this._nodes.infoSlot.html('');
        }, { once: true });
    }, 300);
  }

  drawAncestorTree(ancestors) {
    return ancestors.reduce((acc, val, i) => {
      const space = i === 0 ? '' : `${new Array(i*2).fill('\xa0').join('')}${String.fromCharCode(172)}\xa0`;
      return `${acc}<div>${space}${val}</div>`;
    }, '');
  }

  generateCardData({ data }) {
    if (!data.binomialName) return '';

    const binomialName = `<h2 class="biomial-name">${data.binomialName}</h2>`;
    const commonName = data.commonNames?.length ? `<h3 class="common-names">${data.commonNames.join(', ')}</h3>` : '';
    const synomyns = data.synonyms?.length ? `<h5 class="synonyms">also known as: ${data.synonyms.join(', ')}</h5>` : '';

    return `${binomialName}${commonName}${synomyns}`;
  }

  generateImageData({ data }) {
    if (!imageData?.[data?.binomialName]) return '';
    const images = imageData[data.binomialName]
    .reduce((acc, val) => {
      return `${acc}<img class="image" src="${val}" />`;
    }, '');
    return `<div class="imageGrid">${images}</div>`;
  }

  init() {
    this.createMeasurementCanvas();
    this.initData();
    this.initChart();
  }

  render() {
    this.buildTree();
  }
}

// main
(function() {
  new Taxonomy({ data: treeData });
})();