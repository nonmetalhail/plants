import {LitElement, html, css, nothing} from 'lit';
import {map} from 'lit/directives/map.js';

class Card extends LitElement {
  static properties = {
    data: {
      type: Object,
      attribute: false
    },
    images: {
      type: Array,
      attribute: false
    }
  };

  static styles = css`
    #container {
      padding: 10px 25px;
      border: 1px solid var(--taxo-grey-3);
      border-radius: 15px;
      font-family: var(--plant-font-family, serif);
    }
    
    .biomial-name {
      margin-block-end: 5px;
    }

    .common-names {
      margin-block-start: 5px;
      margin-block-end: 10px;
      color: var(--taxo-grey-2);
    }

    .synonyms {
      margin-block-start: 5px;
      font-weight: normal;
      font-style: italic;
      font-size: 16px;
    }

    .imageGrid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .image {
      max-height: 550px;
      object-fit: contain;
      object-position: 50% top;
    }

    ul {
      padding-inline-start: 16px;
      list-style: circle;
    }

    li {
      margin-block-end: 5px;
    }

    a {
      color: var(--taxo-secondary);
      text-decoration: unset;
    }

    a:hover, 
    a:focus {
      color: var(--taxo-focus-ring);
      text-decoration: revert;
    }

    .tags {
      font-size: 12px;
    }
  `;

  constructor() {
    super();    
  }

  CONFIDENCE = {
    1: 'High',
    2: 'Medium',
    3: 'Low'
  };
  _getConfidence(c=1) {
    return this.CONFIDENCE[c];
  }

  _linkHTML(links) {
    return html`
      <ul>
        ${links.map((l) => html`<li><a href="${l}" target="_blank">${l}</a></li>`)}
      </ul>
    `;
  }

  render() {
    if (!this.data) return;

    const {
      binomialName,
      confidence,
      commonNames,
      synonyms,
      links,
      alternate,
      note
    } = this.data;
  
    return html`
      <div id="container">
        <h2 class="biomial-name">${binomialName}</h2>
        ${ commonNames?.length ? html`<h3 class="common-names">${commonNames.join(', ')}</h3>` : nothing}
        ${ synonyms?.length ? html`<h5 class="synonyms">also known as: ${synonyms.join(', ')}</h5>` : nothing }
        ${ alternate ? html`<p>Possible alternative: ${alternate}</p>` : nothing }
        ${ note ? html`<p>Note:<br/>${note}</p>` : nothing }
        <div class="imageGrid">
        ${
          map(this.images ?? [], (v) => html`<img class="image" src=${v}/>`)
        }
        </div>
        ${links?.length ? this._linkHTML(links) : nothing}
        <p class="tags">Confidence: ${this._getConfidence(confidence)}</p>
      </div>
    `;
  }
}

customElements.define('pl-card', Card);
