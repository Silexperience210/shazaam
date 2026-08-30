import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as SiteShell, n as RECIPIENT, o as buildUri, s as cn, t as Badge } from "./site-shell-CbG8r53R.mjs";
import { n as QrMark, t as Button } from "./button-BC26bOGy.mjs";
import { d as Copy, m as ArrowRight, p as Check, r as Shield, t as Zap } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BYwAm97H.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TODAY = [
	"Nouvelle adresse à chaque facture, sinon clustering",
	"Lightning Address = HTTP + LNURL, fuite d’IP",
	"Deux QR, deux identités, deux habitudes",
	"Facture BOLT 11 périmée en quinze minutes",
	"BIP-47 exige une transaction de notification"
];
var UMBRA = [
	"Un nom à vie, gravable, dictable, imprimable",
	"DNSSEC + onion messages, aucun serveur web",
	"Un QR, deux rails, un bouton Payer",
	"Offre BOLT 12 permanente, facture fraîche à la volée",
	"Silent Payment : sortie Taproot unique, indiscernable"
];
function CompareUx() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "grid gap-4 md:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Column, {
			title: "Aujourd’hui",
			items: TODAY,
			muted: true
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Column, {
			title: "Umbra",
			items: UMBRA
		})]
	});
}
function Column({ title, items, muted }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: muted ? "rounded-[var(--radius-lg)] bg-bg-elevated p-5 shadow-[inset_0_0_0_1px_var(--color-border)]" : "rounded-[var(--radius-lg)] bg-surface p-5 shadow-[inset_0_0_0_1px_var(--color-border-strong)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "text-sm font-medium uppercase tracking-[0.14em] text-subtle",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 space-y-3",
			children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex gap-3 text-sm leading-relaxed text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-2 size-1 shrink-0 rounded-full bg-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: muted ? "text-muted" : "text-fg",
					children: item
				})]
			}, item))
		})]
	});
}
function IdentityCard({ className }) {
	const uri = buildUri();
	const [copied, setCopied] = (0, import_react.useState)(null);
	async function copy(kind, value) {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(kind);
			window.setTimeout(() => setCopied(null), 1600);
		} catch {}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: cn("rounded-[var(--radius-xl)] bg-surface p-4 sm:p-5", "shadow-[inset_0_0_0_1px_var(--color-border)]", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-[0.14em] text-subtle",
				children: "Recevoir"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-1 font-display text-3xl leading-none text-fg sm:text-4xl",
				children: RECIPIENT.name
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				variant: "live",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-success" }), "Statique"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 grid gap-5 sm:grid-cols-[minmax(0,9.5rem)_1fr] sm:items-start",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrMark, {
				payload: uri,
				className: "mx-auto w-40 sm:w-full",
				label: "QR BIP-321 unifié"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-sm text-fg sm:text-base",
						children: ["₿", RECIPIENT.display]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Un nom. Deux rails. Des adresses toujours neuves."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => copy("handle", RECIPIENT.handle),
							children: [copied === "handle" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {}), "Copier le nom"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => copy("uri", uri),
							children: [copied === "uri" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {}), "URI"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-5 grid gap-3 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Lightning",
								v: "BOLT 12 · lno"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "On-chain",
								v: "BIP-352 · sp1q"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "DNS",
								v: RECIPIENT.dnsHost,
								mono: true
							})
						]
					})
				]
			})]
		})]
	});
}
function Row({ k, v, mono }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-baseline justify-between gap-3 border-t border-border pt-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-subtle",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: cn("min-w-0 text-right text-fg", mono ? "break-all font-mono" : "truncate"),
			children: v
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 pb-20 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-10 pt-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)] lg:items-end lg:gap-12 lg:pt-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium uppercase tracking-[0.16em] text-subtle",
						children: "BIP-352 · BOLT 12 · BIP-353"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "mt-4 font-display text-[2.6rem] leading-[1.05] text-fg sm:text-6xl",
						children: ["Un identifiant.", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block italic text-muted",
							children: " Pour de bon."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg",
						children: "Silent Payments et une offre Lightning statique dans le même QR. Le portefeuille dérive une destination neuve à chaque paiement — on-chain ou Lightning — sans interaction, sans réutilisation, sans serveur web."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-col gap-3 sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "lg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/lab",
								children: ["Ouvrir le laboratoire", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "lg",
							variant: "outline",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/stack",
								children: "Voir l’architecture"
							})
						})]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdentityCard, {})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-16 grid gap-4 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						n: "1",
						k: "identifiant",
						d: `₿${RECIPIENT.display} — dictable, imprimable, éternel.`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						n: "2",
						k: "rails",
						d: "Lightning d’abord. Silent Payment en repli. Un bouton."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						n: "∞",
						k: "adresses",
						d: "Chaque paiement produit une sortie ou un hash unique."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-16 grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RailCard, {
					icon: Zap,
					kicker: "Rail A",
					title: "Lightning statique",
					protocol: "BOLT 12",
					body: "L’offre ne change jamais. Chaque paiement demande une facture fraîche par onion message, avec chemins aveuglés. Pas de LNURL, pas d’HTTPS vers le destinataire."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RailCard, {
					icon: Shield,
					kicker: "Rail B",
					title: "On-chain silencieux",
					protocol: "BIP-352",
					body: "L’expéditeur dérive une sortie Taproot par ECDH sur ses propres inputs. L’adresse sp1q n’apparaît jamais à la chaîne. Le destinataire scanne, sans notification."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-20",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-3xl text-fg sm:text-4xl",
						children: "Pourquoi c’est le killer app"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base",
						children: "Bitcoin a toujours su payer. Il n’a jamais eu un identifiant unique, privé, et dual-rail. C’est exactement le trou que comblent Silent Payments + BOLT 12 dans une enveloppe BIP-321, résolue par DNSSEC."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompareUx, {})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-16 rounded-[var(--radius-xl)] bg-surface px-5 py-8 shadow-[inset_0_0_0_1px_var(--color-border)] sm:px-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium uppercase tracking-[0.14em] text-subtle",
						children: "Politique de routage"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
						className: "mt-4 overflow-x-auto font-mono text-xs leading-relaxed text-fg sm:text-sm",
						children: `if lightning_reachable(offer):
    pay_bolt12(invoice_request)
else:
    pay_silent(derive_taproot(inputs, Bscan))
# jamais réutiliser une adresse classique`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-2xl text-sm text-muted",
						children: "L’expéditeur ne choisit pas le rail. Alice paie Rob. Le portefeuille décide. C’est toute l’UX."
					})
				]
			})
		]
	}) });
}
function Stat({ n, k, d }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-[var(--radius-lg)] bg-surface p-5 shadow-[inset_0_0_0_1px_var(--color-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-4xl text-fg",
				children: n
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-fg",
				children: k
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-relaxed text-muted",
				children: d
			})
		]
	});
}
function RailCard({ icon: Icon, kicker, title, protocol, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-[var(--radius-lg)] bg-bg-elevated p-5 shadow-[inset_0_0_0_1px_var(--color-border)] sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-subtle",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5" }),
					kicker,
					" · ",
					protocol
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-3 font-display text-2xl text-fg",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm leading-relaxed text-muted",
				children: body
			})
		]
	});
}
//#endregion
export { Home as component };
