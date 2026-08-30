import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as SiteShell, i as STACK_LAYERS, n as RECIPIENT, o as buildUri, s as cn, t as Badge } from "./site-shell-CbG8r53R.mjs";
import { c as Globe, h as ArrowDown, i as Radio, l as Fingerprint, r as Shield, s as KeyRound, t as Zap, u as Cpu } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stack-CSQDRJ6g.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ICONS = {
	human: Fingerprint,
	dns: Globe,
	uri: Radio,
	lightning: Zap,
	silent: Shield,
	wallet: KeyRound
};
function StackView() {
	const [active, setActive] = (0, import_react.useState)("human");
	const layer = STACK_LAYERS.find((l) => l.id === active);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:items-start",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "flex flex-col",
			children: STACK_LAYERS.map((item, i) => {
				const Icon = ICONS[item.id];
				const selected = item.id === active;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-col",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setActive(item.id),
						className: cn("flex w-full items-start gap-3 rounded-[var(--radius-md)] px-3 py-3 text-left transition-colors duration-[var(--motion-fast)]", selected ? "bg-surface" : "hover:bg-surface/60"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("mt-0.5 grid size-9 shrink-0 place-items-center rounded-[var(--radius-sm)]", selected ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "block text-[11px] uppercase tracking-[0.14em] text-subtle",
								children: [
									item.kicker,
									" · ",
									item.protocol
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 block text-sm text-fg",
								children: item.title
							})]
						})]
					}), i < STACK_LAYERS.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-4 items-center pl-[1.9rem]",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "size-3.5 text-border-strong" })
					})]
				}, item.id);
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "rounded-[var(--radius-xl)] bg-surface p-5 shadow-[inset_0_0_0_1px_var(--color-border)] sm:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "quiet",
					children: layer.protocol
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-3 font-display text-3xl text-fg sm:text-4xl",
					children: layer.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-prose text-sm leading-relaxed text-muted",
					children: layer.summary
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayerDetail, { id: active })
				})
			]
		})]
	});
}
function LayerDetail({ id }) {
	switch (id) {
		case "human": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spec, { rows: [
			["Affichage", `₿${RECIPIENT.display}`],
			["Usage", "Carte, oral, facture, site, donation"],
			["Propriété", "Jamais régénéré. Pas une adresse."]
		] });
		case "dns": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spec, { rows: [
			["Nom DNS", RECIPIENT.dnsHost],
			["Type", "TXT + DNSSEC"],
			["Sans", "HTTP, LNURL, serveur d’alias"]
		] });
		case "uri": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "break-all rounded-[var(--radius-sm)] bg-bg p-3 font-mono text-[11px] leading-relaxed text-muted shadow-[inset_0_0_0_1px_var(--color-border)]",
				children: buildUri()
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spec, { rows: [
				["lno", "Offre BOLT 12 réutilisable"],
				["sp", "Adresse Silent Payment"],
				["address", "Vide — pas de bc1q réutilisé"]
			] })]
		});
		case "lightning": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spec, { rows: [
			["Offre", RECIPIENT.lno.slice(0, 28) + "…"],
			["Transport", "Onion messages, chemins aveuglés"],
			["Par paiement", "invoice + payment_hash uniques"],
			["Nœud", `${RECIPIENT.nodeAlias} · solde chaud limité`]
		] });
		case "silent": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spec, { rows: [
			["Adresse", RECIPIENT.sp.slice(0, 22) + "…"],
			["Scan", "Bscan / bscan (watch-only)"],
			["Spend", "Bspend / bspend (airgap)"],
			["On-chain", "P2TR unique, indiscernable"]
		] });
		case "wallet": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WalletSplit, {});
	}
}
function Spec({ rows }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
		className: "divide-y divide-border rounded-[var(--radius-md)] bg-bg shadow-[inset_0_0_0_1px_var(--color-border)]",
		children: rows.map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-1 px-3 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
				className: "text-xs text-subtle",
				children: k
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
				className: "break-all font-mono text-xs text-fg sm:text-right",
				children: v
			})]
		}, k))
	});
}
function WalletSplit() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "grid gap-3 sm:grid-cols-2",
		children: [
			{
				icon: Globe,
				title: "DNS",
				body: "Zone DNSSEC chez le registrar. Hors ligne vis-à-vis des fonds. Publie l’URI, rien d’autre."
			},
			{
				icon: Radio,
				title: "Scanner",
				body: "Watch-only, toujours allumé. Détient bscan. Filtres compacts BIP-158. Ne peut pas signer."
			},
			{
				icon: Zap,
				title: "Nœud LN",
				body: "Core Lightning, offres BOLT 12. Solde opérationnel. Chemins aveuglés. Isolé du cold storage."
			},
			{
				icon: Cpu,
				title: "SeedSigner",
				body: "bspend airgap. PSBT en QR quand le scanner signale une sortie. Multi-sig possible plus tard."
			}
		].map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "rounded-[var(--radius-md)] bg-bg p-3 shadow-[inset_0_0_0_1px_var(--color-border)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-2 text-sm text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(b.icon, { className: "size-3.5 text-muted" }), b.title]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs leading-relaxed text-muted",
				children: b.body
			})]
		}, b.title))
	});
}
function StackPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:pt-14",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-[0.16em] text-subtle",
				children: "Architecture"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-4xl text-fg sm:text-5xl",
				children: "Quatre machines, zéro adresse réutilisée."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base",
				children: "DNS, scanner watch-only, nœud Lightning, et un SeedSigner. Chaque couche peut tomber sans emporter les fonds. Clique une couche pour voir ce qu’elle publie, ce qu’elle détient, et ce qu’elle ne peut pas faire."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StackView, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-14 grid gap-4 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, {
						title: "Confiance",
						body: "Le DNS est signé (DNSSEC). L’offre BOLT 12 est signée par le nœud. La sortie Silent Payment n’est valable que pour le spend key. Aucun serveur web dans le chemin."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, {
						title: "Vie privée",
						body: "Pas d’adresse réutilisée, pas de notification on-chain, pas de requête HTTP vers le destinataire. Les paiements Lightning et on-chain sont mutuellement non corrélables."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, {
						title: "Dégradation",
						body: "LN down : Silent Payment. Scanner down : les fonds restent, la détection attend. SeedSigner perdu : le scan ne dépense rien. DNS down : l’URI peut encore se partager en QR."
					})
				]
			})
		]
	}) });
}
function Note({ title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-[var(--radius-lg)] bg-surface p-5 shadow-[inset_0_0_0_1px_var(--color-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-sm font-medium text-fg",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm leading-relaxed text-muted",
			children: body
		})]
	});
}
//#endregion
export { StackPage as component };
