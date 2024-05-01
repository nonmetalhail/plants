import {LitElement, html, css} from 'lit';

class ChipSet extends LitElement {
    static properties = {
        _focusableIndex: {
            type: Number,
            state: true
        }
    };

    get chips() {
        const slot = this.shadowRoot.querySelector('slot');
        return slot.assignedElements()
            .filter((node) => node.matches('pl-chip'));
    }

    internals = this.attachInternals();

    constructor() {
        super();

        this.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.internals.role = 'toolbar';
    }

    resetTabIndexes() {

        this._focusableIndex = 0;
        this.updateTabIndexes();
    }

    updateTabIndexes() {
        if (!this.chips.length) return;

        for (const chip of this.chips) {
            chip.setAttribute('tabindex', -1);
        }
        
        // set to 0 if we dont have a focus index yet
        this._focusableIndex = this._focusableIndex ?? 0;
        // if we removed the last item
        if (this._focusableIndex >= this.chips.length - 1) {
            this._focusableIndex = this.chips.length -1;
            this.chips[this._focusableIndex].focus();
        }
        this.chips[this._focusableIndex].setAttribute('tabindex', 0);
    }

    handleKeyDown(evt) {
        const isLeft = evt.key === 'ArrowLeft';
        const isRight = evt.key === 'ArrowRight';
        const isHome = evt.key === 'Home';
        const isEnd = evt.key === 'End';

        if (!isLeft && !isRight && !isHome && !isEnd) {
          return;
        }

        evt.preventDefault();

        // dont do anything if we only have one chip
        if (this.chips.length < 2) return;

        if (isHome || isEnd) {
            this._focusableIndex = isHome ? 0 : chips.length - 1;
            
        } else {
            this._focusableIndex = isLeft ? 
                Math.max(0, this._focusableIndex - 1) :
                Math.min(this.chips.length -1, this._focusableIndex + 1);
        }

        this.chips[this._focusableIndex].focus();
        this.updateTabIndexes();
    }

    render() {
        return html`
            <slot @slotchange=${this.updateTabIndexes}></slot>
        `;
    }
}

customElements.define('pl-chip-set', ChipSet);