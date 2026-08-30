import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { s as cn } from "./site-shell-CbG8r53R.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-BC26bOGy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SIZE = 25;
function fnv(str) {
	let h = 2166136261;
	for (let i = 0; i < str.length; i++) {
		h ^= str.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}
function finderValue(x, y) {
	const inPattern = (ox, oy) => {
		const dx = x - ox;
		const dy = y - oy;
		if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return null;
		return dx === 0 || dy === 0 || dx === 6 || dy === 6 || dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
	};
	return inPattern(0, 0) ?? inPattern(18, 0) ?? inPattern(0, 18);
}
function isTiming(x, y) {
	if (finderValue(x, y) !== null) return false;
	return x === 6 || y === 6;
}
function modulesFor(payload) {
	const seed = fnv(payload);
	const cells = [];
	for (let y = 0; y < SIZE; y++) {
		const row = [];
		for (let x = 0; x < SIZE; x++) {
			const finder = finderValue(x, y);
			if (finder !== null) {
				row.push(finder);
				continue;
			}
			if (isTiming(x, y)) {
				row.push((x + y) % 2 === 0);
				continue;
			}
			const n = fnv(`${seed}:${x}:${y}:${payload.length}`);
			row.push((n & 3) !== 0);
		}
		cells.push(row);
	}
	return cells;
}
function QrMark({ payload, className, label }) {
	const cells = modulesFor(payload);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("relative aspect-square rounded-[var(--radius-md)] bg-fg p-3", className),
		role: "img",
		"aria-label": label ?? "QR unifié",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
			viewBox: `0 0 ${SIZE} ${SIZE}`,
			className: "size-full",
			shapeRendering: "crispEdges",
			children: cells.map((row, y) => row.map((on, x) => on ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x,
				y,
				width: 1,
				height: 1,
				fill: "currentColor",
				className: "text-accent-fg"
			}, `${x}-${y}`) : null))
		})
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[opacity,transform,background-color,color,border-color] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-accent text-accent-fg hover:opacity-90",
			outline: "border border-border-strong bg-transparent text-fg hover:bg-surface-2",
			ghost: "text-muted hover:bg-surface-2 hover:text-fg",
			subtle: "bg-surface-2 text-fg hover:bg-border"
		},
		size: {
			default: "h-11 rounded-[var(--radius-sm)] px-4 text-sm",
			sm: "h-9 rounded-[var(--radius-xs)] px-3 text-sm",
			lg: "h-12 rounded-[var(--radius-md)] px-5 text-sm",
			icon: "size-11 rounded-[var(--radius-sm)]",
			"icon-sm": "size-9 rounded-[var(--radius-xs)]"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		ref,
		...props
	});
});
Button.displayName = "Button";
//#endregion
export { QrMark as n, Button as t };
