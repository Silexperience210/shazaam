import { b as require_jsx_runtime, d as useRouterState, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/site-shell-CbG8r53R.js
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var badgeVariants = cva("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide", {
	variants: { variant: {
		quiet: "border-border bg-surface-2 text-muted",
		accent: "border-transparent bg-accent text-accent-fg",
		live: "border-border bg-surface text-fg",
		rail: "border-border bg-bg text-fg"
	} },
	defaultVariants: { variant: "quiet" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var RECIPIENT = {
	name: "Rob",
	handle: "rob@bitsaga.be",
	display: "rob@bitsaga.be",
	dnsHost: "rob.user._bitcoin-payment.bitsaga.be",
	dnsType: "TXT",
	label: "Bitsaga",
	scanPub: "02c8a3f0e1d94b6c7a2f91d0b4e8c6a1f3d5b7c9e0a2d4f6b8c0e2a4d6f8b0c2e4",
	spendPub: "03a91c4e7b2d80f5c6e1a3b9d0f2c4e6a8b0d2f4c6e8a0b2d4f6c8e0a2b4d6f8c0",
	sp: "sp1qqgste7k9hx0dql4cu80wv2rqxevajuz34em0d5jkkf0n4w5q8n2k42u7w0s3jn54",
	lno: "lno1zcss9mk8y3wle8tee4gef8ty6cvwgum7ghj9npqpqssyh3w4x5k7m9n2p4r6t8v0w1y3z5a7c9e",
	nodeAlias: "bitsaga"
};
var SENDER = {
	name: "Alice",
	wallet: "Umbra"
};
function buildUri(opts) {
	const params = new URLSearchParams();
	params.set("lno", RECIPIENT.lno);
	params.set("sp", RECIPIENT.sp);
	if (opts?.amountBtc && opts.amountBtc > 0) params.set("amount", trimAmount(opts.amountBtc));
	params.set("label", RECIPIENT.label);
	if (opts?.memo) params.set("message", opts.memo);
	return `bitcoin:?${params.toString()}`;
}
function trimAmount(n) {
	return n.toFixed(8).replace(/\.?0+$/, "") || "0";
}
var STACK_LAYERS = [
	{
		id: "human",
		kicker: "Couche 0",
		title: "Identité humaine",
		protocol: "BIP-353",
		summary: "Un nom du type utilisateur@domaine. Rien à régénérer, rien à négocier. C’est ce que tu donnes, graves, ou mets sur une carte de visite."
	},
	{
		id: "dns",
		kicker: "Couche 1",
		title: "Résolution DNSSEC",
		protocol: "BIP-353",
		summary: "Le portefeuille interroge un enregistrement TXT signé DNSSEC. Pas d’HTTP, pas de serveur LNURL, pas de fuite d’IP vers le destinataire."
	},
	{
		id: "uri",
		kicker: "Couche 2",
		title: "Enveloppe unifiée",
		protocol: "BIP-321",
		summary: "Un URI bitcoin: qui porte deux méthodes réutilisables et privées : une offre Lightning (lno) et une adresse Silent Payment (sp). Aucune adresse classique."
	},
	{
		id: "lightning",
		kicker: "Rail A",
		title: "Lightning statique",
		protocol: "BOLT 12",
		summary: "L’offre est permanente. Chaque paiement déclenche un invoice_request en onion message, une facture fraîche, un payment_hash unique, des chemins aveuglés."
	},
	{
		id: "silent",
		kicker: "Rail B",
		title: "On-chain silencieux",
		protocol: "BIP-352",
		summary: "L’expéditeur dérive une sortie Taproot unique par ECDH sur ses inputs. L’adresse sp1q n’apparaît jamais on-chain. Aucune transaction de notification."
	},
	{
		id: "wallet",
		kicker: "Couche 3",
		title: "Portefeuille séparé",
		protocol: "Scan / spend",
		summary: "Clé de scan chaude (watch-only). Clé de dépense froide (SeedSigner). Nœud Lightning à solde limité. DNS indépendant. Aucun point unique de compromission."
	}
];
var LINKS = [
	{
		to: "/",
		label: "Système"
	},
	{
		to: "/lab",
		label: "Laboratoire"
	},
	{
		to: "/stack",
		label: "Architecture"
	}
];
function SiteShell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-40 border-b border-border/80 bg-bg/85 backdrop-blur-md",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "flex items-center gap-2.5 text-fg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-7 place-items-center rounded-[var(--radius-xs)] bg-accent text-accent-fg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-xl leading-none tracking-tight",
							children: "Umbra"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex items-center gap-1 sm:gap-2",
						children: LINKS.map((link) => {
							const active = pathname === link.to;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: link.to,
								className: cn("rounded-[var(--radius-sm)] px-2.5 py-2 text-sm transition-colors duration-[var(--motion-quick)] sm:px-3", active ? "text-fg" : "text-muted hover:text-fg"),
								children: link.label
							}, link.to);
						})
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Umbra — identifiant Bitcoin unifié. BIP-352 × BOLT 12 × BIP-353 × BIP-321." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Simulation locale. Aucune chaîne réelle, aucune clé privée." })]
				})
			})
		]
	});
}
function Mark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 16 16",
		className: "size-3.5",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M8 1.2 3.2 4.1v7.8L8 14.8l4.8-2.9V4.1L8 1.2Zm0 1.7 3.2 1.9v.9L8 4.8 4.8 5.7v-.9L8 2.9Zm-3.2 3.3 3.2 1.9 3.2-1.9v1.15L8 9.25 4.8 7.35V6.2Zm0 2.4 3.2 1.9 3.2-1.9v1.2L8 11.7 4.8 9.8V8.6Z",
			fill: "currentColor"
		})
	});
}
//#endregion
export { SiteShell as a, STACK_LAYERS as i, RECIPIENT as n, buildUri as o, SENDER as r, cn as s, Badge as t };
