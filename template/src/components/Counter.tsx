import { useState } from 'react';

import OutSystemsLogo from '../images/outsystems.png?url';
import AstroLogo from '../images/astro.png?url';

export default function Counter({
	count: initialCount,
	message,
}: {
	count: number;
	message: string;
}) {
	const [count, setCount] = useState(initialCount);
	const add = () => setCount((i) => i + 1);
	const subtract = () => setCount((i) => i - 1);
	const showParentMessage = () => document.counter_showmessage(count);

	return (
		<>
            <div><h1>Counter</h1></div>
			<div className="counter">
				<button onClick={subtract}>-</button>
				<pre>{count}</pre>
				<button onClick={add}>+</button>
			</div>
			<div className="counter-message">
                <button onClick={showParentMessage}>Console Message</button>
                <p>{message}</p>
            </div>
            <div className="logos">
                <img src={OutSystemsLogo} alt="OutSystems logo" />
                <img src={AstroLogo} alt="Astro logo" />
            </div>
		</>
	);
}
