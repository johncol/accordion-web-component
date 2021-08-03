import { keyPressedIsAnyOf, Keys } from './../utils.js';

export class AccordionSection extends HTMLElement {
  constructor() {
    super();
    this.configure();
  }

  configure() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(this.buildStyleElement());
    shadow.appendChild(this.buildComponent());
  }

  buildComponent() {
    const template = document.querySelector('#accordion-section-template');
    const element = document.importNode(template.content, true);
    element.querySelector('header h3').innerHTML = this.title;
    this.addToggleListeners(element);
    return element;
  }

  addToggleListeners(root) {
    const header = root.querySelector('section > header');

    header.addEventListener('click', (_) => this.toggleContainingSection(header));
    header.addEventListener('keypress', (event) => {
      if (keyPressedIsAnyOf(event, Keys.ENTER, Keys.SPACE)) {
        this.toggleContainingSection(header);
      }
    });
  }

  toggleContainingSection(header) {
    const section = header.parentElement;
    const openState = this.toggleOpenAttr(section);
    openState ? this.openSection(section) : this.closeSection(section);
  }

  toggleOpenAttr(element) {
    const newOpenState = element.dataset.open === 'true' ? false : true;
    element.dataset.open = newOpenState;
    return newOpenState;
  }

  openSection(section) {
    const naturalHeight = section.scrollHeight;
    section.style.height = `${naturalHeight}px`;

    const listenTransitionendEvent = (_) => {
      section.style.height = 'auto';
      section.removeEventListener('transitionend', listenTransitionendEvent);
    };
    section.addEventListener('transitionend', listenTransitionendEvent);
  }

  closeSection(section) {
    const naturalHeight = section.scrollHeight;
    const closedHeight = this.calculateClosedHeight(section);

    section.style.transition = '';
    requestAnimationFrame(() => {
      section.style.transition = null;

      section.style.height = `${naturalHeight}px`;
      requestAnimationFrame(() => (section.style.height = closedHeight));
    });
  }

  calculateClosedHeight(section) {
    const sectionStyle = getComputedStyle(section);
    const paddingTop = Number.parseInt(sectionStyle.paddingTop);
    const paddingBottom = Number.parseInt(sectionStyle.paddingBottom);
    const headerHeight = section.children[0].scrollHeight;
    return `${paddingTop + headerHeight + paddingBottom}px`;
  }

  get title() {
    return this.getAttribute('title');
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

      section[data-open='true'] header > [role='button']::before {
        transform: rotateZ(90deg);
      }

      section .section-content {
        opacity: 0;
        transition: opacity var(--transitions-duration) ease-in-out;
      }

      section[data-open='true'] .section-content {
        opacity: 1;
      }
    `;
    return styleElement;
  }
}
