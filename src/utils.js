import { images as imageData } from './data/imageData.mjs';
function drawAncestorTree(ancestors) {
  return ancestors.reduce((acc, val, i) => {
    const space = i === 0 ? '' : `${new Array(i*2).fill('\xa0').join('')}${String.fromCharCode(172)}\xa0`;
    return `${acc}<div>${space}${val}</div>`;
  }, '');
}

function generateCardData(data) {
  if (!data.binomialName) return '';

  const binomialName = `<h2 class="biomial-name">${data.binomialName}</h2>`;
  const commonName = data.commonNames?.length ? `<h3 class="common-names">${data.commonNames.join(', ')}</h3>` : '';
  const synomyns = data.synonyms?.length ? `<h5 class="synonyms">also known as: ${data.synonyms.join(', ')}</h5>` : '';

  return `${binomialName}${commonName}${synomyns}`;
}

function generateImageData(data) {
  if (!imageData?.[data?.binomialName]) return '';
  const images = imageData[data.binomialName]
  .reduce((acc, val) => {
    return `${acc}<img class="image" src="${val}" />`;
  }, '');
  return `<div class="imageGrid">${images}</div>`;
}

export {
  drawAncestorTree,
  generateCardData,
  generateImageData
}