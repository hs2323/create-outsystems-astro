import { useState } from "react";

import AstroLogo from "../../images/astro.png?url";
import OutSystemsLogo from "../../images/outsystems.png?url";
import { Operation, setCounterCount } from "../../lib/setCounterCount";

export default function Counter({
  children,
  header,
  initialCount,
  showMessage,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  initialCount: number;
  showMessage: string;
}) {
  const [count, setCount] = useState(initialCount);
  const add = () => setCount((i) => setCounterCount(i, Operation.Add));
  const subtract = () =>
    setCount((i) => setCounterCount(i, Operation.Subtract));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const showParentMessage = () => (document as any)[showMessage](count);

  return (
    <>
      {header}
      <div className="counter-controls">
        <button onClick={subtract}>-</button>
        <pre>{count}</pre>
        <button onClick={add}>+</button>
      </div>
      <div>{children}</div>
      <div className="counter-message">
        <button onClick={showParentMessage}>Send value</button>
      </div>
      <div className="counter-logos">
        <img alt="OutSystems logo" src={OutSystemsLogo} />
        <img alt="Astro logo" src={AstroLogo} />
      </div>
    </>
  );
}
