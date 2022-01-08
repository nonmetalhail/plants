import { treeData } from './data/treeData.mjs';
import * as d3 from './d3_bundle/dist/pd3.js';

const state = {
  data: treeData,
  containerName: '#chart-container',
  sizing: {
    width: 1400,
    dx: 11,
    dy: 180,
    padding: 1 // horizontal padding for first and last column
  },
  styles: {
    nodes: {
      r: 3
    },
    text: {
      size: 10,
      family: 'sans-serif',
      offset: 6,
      padding: 2
    }
  }
 };

 let selectedNodes = null;
 let selectedElems = [];

 function createMeasurementCanvas(state) {
  const { size, family } = state.styles.text;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.width = 10;
  ctx.height = 10;
  ctx.font = `${size}px ${family}`;
  state.measurementCanvas = ctx;
 }

// function getLongestStringLength(data) {

//   let longest = 0;
//   for (const { binomialName } of data) {
//     longest = Math.max(longest, ctx.measureText(binomialName).width);
//   }
//   return longest;
// }

function initData(state) {
  const { dx, dy } = state.sizing;
  const root = d3.hierarchy(state.data);
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

  state.root = root;
  state.descendants = descendants;
  state.labels = labels;

  state.sizing.x0 = x0;
  state.sizing.x1 = x1;
  state.sizing.height = height;
}

function initChart(state) {
  const {
    containerName,
    sizing,
    styles
  } = state;
  const {
    dy,
    dx,
    x0,
    padding,
    width,
    height
  } = sizing;
  const div = d3.select(containerName);
  const svg = div.append('svg')
    .attr('viewBox', [-dy * padding / 2, x0 - dx, width, height])
    .attr('width', width)
    .attr('height', height)
    .attr('style', 'max-width: 100%; height: auto; height: intrinsic;')
    .attr('font-family', styles.text.family)
    .attr('font-size', styles.text.size);

  const linksNode = svg.append('g')
    .classed('links', true);

  const textNode = svg.append('g')
    .classed('nodes', true);

  state.nodes = { div, svg, linksNode, textNode };
}

function buildTree(state) {
  const {
    root,
    nodes,
    styles,
    labels,
    measurementCanvas,
    sizing
  } = state;
  const {
    offset,
    padding
  } = styles.text;
  const { linksNode, textNode } = nodes;

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
      .on('mouseenter', nodeEnter)
      .on('mouseleave', nodeLeave);

  treeNodes.append('rect')
    .attr('pointer-events', 'all')
    .attr('x', (d,i) => d.children ? -measurementCanvas.measureText(labels[i]).width - offset - padding : offset - padding)
    .attr('y', -sizing.dx/2)
    .attr('width', (d,i) => measurementCanvas.measureText(labels[i]).width + offset - padding)
    .attr('height', sizing.dx);

  treeNodes.append('circle')
    .attr('r', styles.nodes.r)
    .attr('pointer-events', 'none');

  treeNodes.append('text')
    .attr('dy', '0.32em')
    .attr('x', d => d.children ? -offset : offset)
    .attr('text-anchor', d => d.children ? 'end' : 'start')
    .attr('pointer-events', 'none')
    .text((d, i) => labels[i])
    .call(text => text.clone(true))
      .classed('outline', true);

  state.nodes.treeNodes = treeNodes;
  state.nodes.linkPaths = linkPaths;
}

function gatherAncestors(current, nodes) {
  while (current.parent) {
    current = current.parent;
    nodes.add(current);
  }
  return nodes;
}

function gatherDescendants(current, nodes) {
  if (current.children) {
    for (const child of current.children) {
      nodes.add(child);
      gatherDescendants(child, nodes)
    }
  }

  return nodes;
}

function nodeEnter(evt, d) {
  console.log(d);
  let selectedNodes = gatherAncestors(d, new Set([d]));
  selectedNodes = gatherDescendants(d, selectedNodes);

  state.nodes.treeNodes.each(function(d) {
    if (selectedNodes.has(d)) {
      const elem = d3.select(this);
      elem.classed('selected', true);
      selectedElems.push(elem);
    }
  });
  state.nodes.linkPaths.each(function(d) {
    if (selectedNodes.has(d.source) && selectedNodes.has(d.target)) {
      const elem = d3.select(this);
      elem.classed('selected', true);
      selectedElems.push(elem);
    }
  });
}

function nodeLeave(evt, d) {
  for (const elem of selectedElems) {
    elem.classed('selected', false);
  }
  selectedElems = [];
}

// main
(function() {
  createMeasurementCanvas(state);
  initData(state);
  initChart(state);
  buildTree(state);
})();