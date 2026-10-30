/**
 * A low red sun cut by bands of fog, fixed to the bottom of the screen.
 * The fog bands drift slowly (switched off for reduced motion, see index.css).
 */

// Gaps in the sun, in a 100x100 box. Irregular on purpose: even stripes read as a template.
const FOG = [
	{ y: 15, h: 0.7, seconds: 11, delay: 0 },
	{ y: 24, h: 1.1, seconds: 9, delay: -3 },
	{ y: 31, h: 0.6, seconds: 13, delay: -6 },
	{ y: 40, h: 1.6, seconds: 10, delay: -2 },
	{ y: 47, h: 0.9, seconds: 12, delay: -8 },
	{ y: 55, h: 2, seconds: 8, delay: -5 },
	{ y: 63, h: 1.3, seconds: 14, delay: -1 },
	{ y: 72, h: 2.6, seconds: 10, delay: -7 },
	{ y: 82, h: 2, seconds: 12, delay: -4 },
	{ y: 92, h: 3.4, seconds: 9, delay: -9 },
];

export default function Backdrop() {
	return (
		<div
			className="backdrop"
			aria-hidden="true">
			<svg
				className="backdrop-sun"
				viewBox="0 0 100 100">
				<defs>
					<mask id="sun-fog">
						<rect
							width="100"
							height="100"
							fill="#fff"
						/>
						{FOG.map(({ y, h, seconds, delay }) => (
							<rect
								key={y}
								className="fog"
								y={y}
								width="100"
								height={h}
								fill="#000"
								style={{ animationDuration: `${seconds}s`, animationDelay: `${delay}s` }}
							/>
						))}
					</mask>
				</defs>
				<circle
					className="sun-disc"
					cx="50"
					cy="50"
					r="50"
					mask="url(#sun-fog)"
				/>
			</svg>
		</div>
	);
}
