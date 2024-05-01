import {LitElement, html, css} from 'lit';
import {map} from 'lit/directives/map.js';

import { images } from '../data/imageData.mjs';
import { plants } from '../data/plants.mjs';

import './pl-card.js';
import './pl-chip.js';
import './pl-chip-set.js';

class PlantList extends LitElement {
    static properties = {
        _filters: {
            type: Set,
            state: true
        },
        _tagMap: {
            type: Object,
            state: true
        },
        _currentSearchTerm: {
            type: String,
            state: true
        }
    };

    static styles = css`
        #plant-list {
            display: grid;
            gap: 10px;
        }

        hr {
            border-top: 1px solid var(--taxo-primary);
        }

        #filter-input {
            height: 40px;
            border-radius: 10px;
            border: 1px solid var(--taxo-grey-3);
            font-size: 18px;
        }
    `;

    get inputElem() {
        return this.shadowRoot.querySelector('input');
    }

    constructor() {
        super();

        this._filters = new Set();
        this._tagMap = {};
        this._currentSearchTerm = '';

        this.addEventListener('remove-chip-clicked', this._removeFilterTag);
    }

    CONFIDENCE = {
        1: 'High',
        2: 'Medium',
        3: 'Low'
      };
    _getConfidence(c=1) {
        return this.CONFIDENCE[c];
    }

    _buildFilters() {
        for (const plant of plants) {
            const name = plant.binomialName;
            let filters = [];
            for (const [prop, val] of Object.entries(plant)) {
                if (prop === 'links') continue;
                
                if (prop === 'confidence') {
                    const c = this._getConfidence(val);
                    filters.push(c);
                    continue;
                }

                if (typeof val === 'string') {
                    filters.push(val);
                }

                if (Array.isArray(val)) {
                    filters = [...filters, ...val];
                }
            }

            this._tagMap[name] = filters.join(' ').toLowerCase();
        }
    }
    
    _getFilteredPlants(filters) {
        return plants.filter(({binomialName}) => {
            const tags = this._tagMap[binomialName];
            for (const filter of filters) {
                if (!tags.includes(filter)) {
                    return false;
                }
            }

            return true;
        });
    }

    _searchTerm(evt) {
        const input = evt.composedPath()[0];
        this._currentSearchTerm = input.value.toLowerCase();
        evt.stopPropagation();
    }

    // FIXME search event does not work in Firefox. Need alternate if we want to support....
    _addFilterTag(evt) {
        const input = evt.composedPath()[0];
        if (input.value) {
            this._filters.add(this._currentSearchTerm);
            input.value = '';
        }
        this._currentSearchTerm = '';

        evt.stopPropagation();
    }

    _removeFilterTag(evt) {
        const {label} = evt.detail;
        this._filters.delete(label);
        this.inputElem.focus();
        this.requestUpdate();
        evt.stopPropagation();
    }

    _renderCards() {
        const allFilters = [...this._filters];
        if (this._currentSearchTerm) {
            allFilters.push(this._currentSearchTerm);
        }
        const plantList = allFilters.length ? this._getFilteredPlants(allFilters) : plants;
        return html`
            ${plantList.map((p) => this._renderCard(p))}
        `;
    }

    _renderCard(plant) {
        return html`
            <pl-card 
                .data=${plant} 
                .images=${images[plant.binomialName]}
            ></pl-card>
        `;
    }

    firstUpdated() {
        window.requestIdleCallback(this._buildFilters.bind(this));
    }

    render() {
        return html`
            <div id="filters">
                <span>
                    <label for="name">Filters: </label>
                    <input 
                        type="search"
                        id="filter-input" 
                        name="filter-input" 
                        @search=${this._addFilterTag}
                        @input=${this._searchTerm}
                    /> 
                </span>
                <span>
                    <pl-chip-set>
                        ${map(this._filters, (f) => html`<pl-chip label=${f}></pl-chip>`)}
                    </pl-chip-set>    
                </span>
            </div>
            <hr />
            <div id="plant-list">
                ${this._renderCards()}
            <div>
        `;
    }
}

customElements.define('pl-plant-list', PlantList);