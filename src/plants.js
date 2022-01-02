import { Tree } from './tree.mjs';
import { treeData } from './data/treeData.mjs';

(function() {
  const treeSvg = Tree(treeData, {
    label: d => d.name,
    width: 1400
  });
  console.log(treeData)
  const div = document.getElementById('chart-container');
  div.appendChild(treeSvg);
})();