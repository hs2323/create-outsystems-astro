import { useState } from 'react';

import OutSystemsLogo from '../../images/outsystems.png?url';
import AstroLogo from '../../images/astro.png?url';

export default function Counter({
	InitialCount,
	ShowMessage,
}: {
	InitialCount: number;
	ShowMessage: string;
}) {
	const [count, setCount] = useState(InitialCount);
	const add = () => setCount((i) => i + 1);
	const subtract = () => setCount((i) => i - 1);
	const showParentMessage = () => document[ShowMessage](count);

	return (
		<>
            <div className="counter-title">Counter</div>
			<div className="counter-controls">
				<button onClick={subtract}>-</button>
				<pre>{count}</pre>
				<button onClick={add}>+</button>
			</div>
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
