export class Accordion extends HTMLElement {
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
    const template = document.querySelector('#accordion-template');
    const element = document.importNode(template.content, true);
    return element;
  }

  buildStyleElement() {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      .accordion {
        --font-size: 1.4rem;
        --color: #333;
        --border-color: #ddd;
        --vertical-padding: 1rem;
        --header-height: 2rem;
        --transitions-duration: 0.3s;
      }
    `;
    return styleElement;
  }
}
