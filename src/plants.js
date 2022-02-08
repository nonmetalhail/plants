import { treeData } from './data/treeData.mjs';
import { images as imageData } from './data/imageData.mjs';
import * as d3 from './d3_bundle/dist/pd3.js';

class Taxonomy {
  constructor({
    containerSelector = '#chart-container',
    tooltipSelector = '#info-card',
    tooltipSlotSelector = '#info-card-slot',
    tooltipButtonSelector = '#card-clear',
    data
  }) {
    this.containerSelector = containerSelector;
    this.tooltipSelector = tooltipSelector;
    this.tooltipSlotSelector = tooltipSlotSelector;
    this.tooltipButtonSelector = tooltipButtonSelector;
    this._data = { data };

    this._sizing = {
      width: 1400,
      dx: 11,
      dy: 180,
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
      .attr('font-size', this._styles.text.size);

    const linksNode = svg.append('g')
      .classed('links', true);

    const textNode = svg.append('g')
      .classed('nodes', true);

    const tooltip = d3.select(this.tooltipSelector);
    const tooltipSlot = d3.select(this.tooltipSlotSelector);
    d3.select(this.tooltipButtonSelector).on('click', this.tooltipButtonClicked.bind(this));

    this._nodes = { div, svg, linksNode, textNode, tooltip, tooltipSlot };
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
        .attr('transform', d => `translate(${d.y},${d.x})`);

    this._nodes.treeNodes = treeNodes;
    this._nodes.linkPaths = linkPaths;
    this.addListeners(treeNodes);

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

  tooltipButtonClicked() {
    this.addListeners();
    this.nodeLeave();
  }

  addListeners() {
    this._nodes.treeNodes.on('mouseenter', this.nodeEnter.bind(this))
    .on('mouseleave', this.nodeLeave.bind(this))
    .on('click', this.removeListeners.bind(this));
  }

  removeListeners(elem) {
    this._nodes.treeNodes.on('mouseenter', null)
    .on('mouseleave', null)
    .on('click', null);
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

    this.displayTooltip(d, ancestors);
  }

  nodeLeave(evt, d) {
    for (const elem of this._selectedElems) {
      elem.classed('selected', false);
    }
    this.clearTooltip();
    this._selectedElems = [];
  }

  displayTooltip(d, ancestors) {
    clearTimeout(this._timeout);
    const names = ancestors.map((n) => n.data.name);
    const miniTree = this.drawAncestorTree(names);
    const cardData = this.generateCardData(d);
    const imageHtml = this.generateImageData(d);
    const html = `${miniTree}${cardData}${imageHtml}`;
    this._nodes.tooltip
      .classed('hidden', false);
    this._nodes.tooltipSlot
      .html(html);
  }

  clearTooltip() {
    this._timeout = setTimeout(() => {
      this._nodes.tooltip
        .classed('hidden', true)
        .on('transitionend', () => {
          this._nodes.tooltipSlot.html('');
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
      return `${acc}<img src="${val}" />`;
    }, '');
    return `<div class="images">${images}</div>`;
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