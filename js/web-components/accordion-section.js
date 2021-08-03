import { keyPressedIsAnyOf, Keys } from './../utils.js';

export class AccordionSection extends HTMLElement {
  constructor() {
    super();
    this.configure();
  }

  configure() {
    this.shadow = this.attachShadow({ mode: 'closed' });
    this.shadow.appendChild(this.buildStyleElement());
    this.shadow.appendChild(this.buildComponent());
  }

  buildComponent() {
    const element = this.getElementFromTemplate();
    this.saveClassReferences(element);
    this.renderInputs();
    this.registerListeners();
    return element;
  }

  getElementFromTemplate() {
    const template = document.querySelector('#accordion-section-template');
    return document.importNode(template.content, true);
  }

  saveClassReferences(root) {
    this.root = root;
    this.section = root.querySelector('section');
    this.header = root.querySelector('section > header');
  }

  renderInputs() {
    this.root.querySelector('header h3').textContent = this.title;
  }

  registerListeners() {
    this.header.addEventListener('click', () => {
      this.toggleContainingSection();
    });

    this.header.addEventListener('keypress', (event) => {
      if (keyPressedIsAnyOf(event, Keys.ENTER, Keys.SPACE)) {
        this.toggleContainingSection();
      }
    });

    this.section.addEventListener('transitionend', () => {
      this.transitioning = false;
    });
  }

  toggleContainingSection() {
    if (!this.transitioning) {
      const open = this.dataOpen === 'true' ? false : true;
      this.dataOpen = open;
      open ? this.openSection() : this.closeSection();
    }
  }

  openSection() {
    const naturalHeight = this.section.scrollHeight;
    this.section.style.height = `${naturalHeight}px`;
    this.transitioning = true;

    const setHeightToAutoOnTransitionEnd = () => {
      this.section.style.height = 'auto';
      this.section.removeEventListener('transitionend', setHeightToAutoOnTransitionEnd);
    };
    this.section.addEventListener('transitionend', setHeightToAutoOnTransitionEnd);
  }

  closeSection() {
    const naturalHeight = this.section.scrollHeight;
    const closedHeight = this.calculateClosedHeight();

    this.section.style.transition = '';
    requestAnimationFrame(() => {
      this.section.style.transition = null;

      this.section.style.height = `${naturalHeight}px`;
      requestAnimationFrame(() => {
        this.section.style.height = closedHeight;
        this.transitioning = true;
      });
    });
  }

  calculateClosedHeight() {
    const sectionStyle = getComputedStyle(this.section);
    const paddingTop = Number.parseInt(sectionStyle.paddingTop);
    const paddingBottom = Number.parseInt(sectionStyle.paddingBottom);
    const headerHeight = this.section.children[0].scrollHeight;
    return `${paddingTop + headerHeight + paddingBottom}px`;
  }

  get title() {
    return this.getAttribute('title');
  }

  get dataOpen() {
    return this.getAttribute('data-open');
  }

  set dataOpen(dataOpen) {
    return this.setAttribute('data-open', dataOpen);
  }

  buildStyleElement() {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      section, section * {
        box-sizing: border-box;
        font-size: var(--font-size);
        color: var(--color);
      }

      section {
        border-bottom: 1px solid var(--border-color);
        padding: var(--vertical-padding) 0;
        height: calc(var(--header-height) + calc(var(--vertical-padding) * 2));
        transition: height var(--transitions-duration) ease-in-out;
        overflow: hidden;
      }

      section header {
        height: var(--header-height);
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      section header:focus-visible {
        outline: 1px dashed #aaa;
        outline-offset: 1px;
      }

      section header:focus-visible * {
        --color: #4660bd;
        color: var(--color);
      }

      section header > :is(h2, h3, h4, h5, h6) {
        font-weight: 600;
        letter-spacing: 0.05rem;
      }

      section header > [role='button'] {
        border: none;
        box-shadow: none;
        color: transparent;
        background-color: transparent;
        padding: 0;
        display: block;
        height: 1rem;
        width: 1rem;
        position: relative;
      }

      section header > [role='button']::after,
      section header > [role='button']::before {
        content: '';
        display: block;
        color: transparent;
        border: none;
        box-shadow: none;
        padding: 0;
        background-color: var(--color);
        width: 2px;
        height: 1rem;
        position: absolute;
        top: 0;
        left: 0;
        transform-origin: center;
        transition: transform var(--transitions-duration) ease-in-out;
      }

      section header > [role='button']::after {
        transform: rotateZ(90deg);
      }

      :host([data-open='true']) section header > [role='button']::before {
        transform: rotateZ(90deg);
      }

      section .section-content {
        opacity: 0;
        transition: opacity var(--transitions-duration) ease-in-out;
      }

      :host([data-open='true']) section .section-content {
        opacity: 1;
      }
    `;
    return styleElement;
  }
}
