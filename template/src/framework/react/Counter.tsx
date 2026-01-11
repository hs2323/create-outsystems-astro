import { useState } from "react";

import OutSystemsLogo from "../../images/outsystems.png?url";
import AstroLogo from "../../images/astro.png?url";
import { Operation, setCounterCount } from "../../lib/setCounterCount";

export default function Counter({
  children,
  header,
  InitialCount,
  ShowMessage,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  InitialCount: number;
  ShowMessage: string;
}) {
  const [count, setCount] = useState(InitialCount);
  const add = () => setCount((i) => setCounterCount(i, Operation.Add));
  const subtract = () =>
    setCount((i) => setCounterCount(i, Operation.Subtract));
  const showParentMessage = () => (document as any)[ShowMessage](count);

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
        <img src={OutSystemsLogo} alt="OutSystems logo" />
        <img src={AstroLogo} alt="Astro logo" />
      </div>
    </>
  );
}
