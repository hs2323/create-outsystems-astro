import HTMLLogo from "../../images/html.png?url";

export default function Store(): string {
  return `
    <div class="card unused">
      <strong>HTML Store</strong>
      <div class="card-content">
        <img alt="HTML logo" height="150" src="${HTMLLogo}" />
        <div>
          <strong>The HTML integration does not support Nano Stores.</strong>
        </div>
      </div>
    </div>
  `;
}
