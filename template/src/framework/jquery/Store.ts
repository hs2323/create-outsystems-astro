import JQueryLogo from "../../images/jquery.png?url";

export default function Store(): string {
  return `
    <div class="card unused">
      <strong>jQuery Store</strong>
      <div class="card-content">
        <img alt="jQuery logo" height="150" src=${JSON.stringify(JQueryLogo)} />
        <div><strong>jQuery does not have an official Nano Stores implementation.</strong></div>
      </div>
    </div>
  `;
}
