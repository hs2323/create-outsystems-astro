import AstroLogo from "../../images/astro.png?url";
import OutSystemsLogo from "../../images/outsystems.png?url";

interface DemoProps {
  header?: string;
  children?: string;
}

export default function Demo({
  header = "",
  children = "",
}: DemoProps): string {
  return `
    ${header}
    <div class="card-grid">
      <div class="card">
        <strong>HTML string component</strong>
        <div class="card-content">
          This card is rendered from a plain HTML string — no framework required.
          The <code>islands/html</code> renderer detects that the component is a
          function returning a string and emits it directly as markup.
        </div>
      </div>
      <div class="card">
        <strong>Static by design</strong>
        <div class="card-content">
          HTML string components have no runtime JS and no hydration step.
          They are fully resolved at build time, making them the lightest
          possible island.
        </div>
      </div>
      <div class="card">
        <strong>Slot content</strong>
        <div class="card-content">
          ${children}
        </div>
      </div>
    </div>
    <div class="counter-logos">
      <img alt="OutSystems logo" src="${OutSystemsLogo}" />
      <img alt="Astro logo" src="${AstroLogo}" />
    </div>
  `;
}
