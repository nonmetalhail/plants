import {LitElement, html, css} from 'lit';

class Chip extends LitElement {
  static shadowRootOptions = {
    ...LitElement.shadowRootOptions, 
    delegatesFocus: true
  };

  static properties = {
    label: {
      type: String
    }
  };

  static styles = css`
    #wrapper {
      display: inline-flex;
      gap: 8px;
      align-items: center;
      padding: 5px 10px;
      border-radius: 10px;
      border: 1px solid var(--taxo-grey-3);
      font-family: var(--plant-font-family, serif);
      background-color: RGBA(var(--taxo-primary-rgb), .3);
      cursor: pointer;
    }

    #wrapper:hover {
      background-color: RGBA(var(--taxo-primary-rgb), .6);
    }

    button {
      margin-top: 2px;
      padding: 0;
      background-color: transparent;
      border-color: transparent;
      font-size: 25px;
    }
  `;

  constructor() {
    super();    
  }

  _removeChip(evt) {
    const removeChip = new CustomEvent('remove-chip-clicked', {
      detail: {label: this.label},
      composed: true,
      bubbles: true,
      cancelable: true
    });
    this.dispatchEvent(removeChip);
    evt.stopPropagation();
  }

  render() {  
    return html`
      <span id="wrapper">
        <span>${this.label}</span>
        <!-- this is not an x. This is a different glyph -->
        <button @click=${this._removeChip}/>×</button>
      </span>
    `;
  }
}

customElements.define('pl-chip', Chip);
