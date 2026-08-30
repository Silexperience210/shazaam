import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as SiteShell, n as RECIPIENT, o as buildUri, r as SENDER, s as cn, t as Badge } from "./site-shell-CbG8r53R.mjs";
import { n as QrMark, t as Button } from "./button-BC26bOGy.mjs";
import { a as LoaderCircle, f as CloudLightning, h as ArrowDown, o as Link2, p as Check, r as Shield, t as Zap } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lab-CaJ1Uksg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
async function sha256(input) {
	const data = new TextEncoder().encode(input);
	return new Uint8Array(await crypto.subtle.digest("SHA-256", data));
}
function toHex(bytes, len) {
	const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
	return len ? hex.slice(0, len) : hex;
}
function to5bit(bytes) {
	const out = [];
	let acc = 0;
	let bits = 0;
	for (const b of bytes) {
		acc = acc << 8 | b;
		bits += 8;
		while (bits >= 5) {
			bits -= 5;
			out.push(acc >> bits & 31);
		}
	}
	if (bits > 0) out.push(acc << 5 - bits & 31);
	return out;
}
function encodeBech32(hrp, version, bytes, dataLen) {
	const chars = to5bit(bytes).map((v) => CHARSET[v]);
	while (chars.length < dataLen) chars.push(CHARSET[chars.length % 32]);
	return `${hrp}1${version}${chars.slice(0, dataLen).join("")}`;
}
async function digestTwice(seed) {
	const a = await sha256(seed);
	const b = await sha256(toHex(a) + seed);
	const out = /* @__PURE__ */ new Uint8Array(64);
	out.set(a, 0);
	out.set(b, 32);
	return out;
}
async function deriveSilentPayment(opts) {
	const bytes = await digestTwice([
		"bip352",
		opts.nonce,
		String(opts.k),
		String(opts.amountSats),
		RECIPIENT.scanPub,
		RECIPIENT.spendPub
	].join("|"));
	const inputHash = toHex(bytes.subarray(0, 16));
	const shared = toHex(bytes.subarray(16, 48));
	const taprootOutput = encodeBech32("bc", "p", bytes.subarray(32, 64), 58);
	return {
		id: toHex(bytes.subarray(0, 8)),
		taprootOutput,
		sharedSecret: `ss_${shared.slice(0, 24)}`,
		inputHash,
		k: opts.k
	};
}
async function deriveLightningInvoice(opts) {
	const bytes = await digestTwice([
		"bolt12",
		opts.nonce,
		String(opts.k),
		String(opts.amountSats),
		RECIPIENT.lno
	].join("|"));
	const preimage = toHex(bytes.subarray(0, 32));
	const paymentHash = toHex(bytes.subarray(32, 64));
	const invoice = encodeBech32("lnbc", "", bytes.subarray(8, 40), 72).replace("lnbc1", "lnbc");
	return {
		id: toHex(bytes.subarray(0, 8)),
		paymentHash,
		preimage,
		invoice: `${invoice}1p${CHARSET[opts.k % 32]}qq`,
		k: opts.k
	};
}
var LIGHTNING_STEPS = [
	{
		id: "parse",
		title: "Lire l’offre",
		detail: "Le portefeuille extrait lno de l’URI. L’offre est statique, signée, réutilisable."
	},
	{
		id: "onion",
		title: "invoice_request",
		detail: "Onion message via un chemin aveuglé. Le nœud destinataire n’est pas révélé au réseau."
	},
	{
		id: "invoice",
		title: "Facture fraîche",
		detail: "Le nœud répond avec une facture BOLT 12 : payment_hash unique, montant, expiry."
	},
	{
		id: "htlc",
		title: "Payer le HTLC",
		detail: "Routage Lightning classique. Chaque saut ne voit que le hop suivant."
	},
	{
		id: "settle",
		title: "Révélation du preimage",
		detail: "Le destinataire révèle le preimage. Le paiement se règle en secondes, hors chaîne."
	}
];
var SILENT_STEPS = [
	{
		id: "inputs",
		title: "Inputs éligibles",
		detail: "P2TR, P2WPKH, P2SH-P2WPKH ou P2PKH contrôlés par l’expéditeur. On somme les pubkeys."
	},
	{
		id: "hash",
		title: "input_hash",
		detail: "Hash(outpoint le plus petit ∥ A). Empêche qu’un même expéditeur soit lié d’un paiement à l’autre."
	},
	{
		id: "ecdh",
		title: "Secret partagé",
		detail: "ECDH : input_hash · a · Bscan. Seuls Alice et le scan de Rob peuvent le recalculer."
	},
	{
		id: "tweak",
		title: "Sortie Taproot",
		detail: "P = Bm + Hash(secret ∥ k)·G. Une adresse bc1p… neuve, indiscernable d’un Taproot banal."
	},
	{
		id: "scan",
		title: "Détection silencieuse",
		detail: "Le scanner de Rob parcourt les filtres compacts, recalcule P, reconnaît la sortie. Rien on-chain ne pointe vers sp1q."
	}
];
function satsToBtc(sats) {
	return sats / 1e8;
}
function formatSats(sats) {
	return new Intl.NumberFormat("fr-FR").format(sats);
}
function formatBtc(sats) {
	return satsToBtc(sats).toFixed(8).replace(/\.?0+$/, "") + " BTC";
}
function prefersReducedMotion() {
	if (typeof window === "undefined") return true;
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function stepMs() {
	return prefersReducedMotion() ? 40 : 520;
}
var AMOUNTS = [
	21e3,
	1e5,
	5e5,
	21e5
];
function PayLab() {
	const [amount, setAmount] = (0, import_react.useState)(1e5);
	const [lnUp, setLnUp] = (0, import_react.useState)(true);
	const [phase, setPhase] = (0, import_react.useState)("compose");
	const [step, setStep] = (0, import_react.useState)(0);
	const [receipts, setReceipts] = (0, import_react.useState)([]);
	const [current, setCurrent] = (0, import_react.useState)(null);
	const [nonce] = (0, import_react.useState)(() => Math.random().toString(36).slice(2));
	const timers = (0, import_react.useRef)([]);
	const rail = lnUp ? "lightning" : "silent";
	const uri = (0, import_react.useMemo)(() => buildUri({ amountBtc: amount / 1e8 }), [amount]);
	const steps = rail === "lightning" ? LIGHTNING_STEPS : SILENT_STEPS;
	const k = receipts.filter((r) => r.rail === rail).length;
	(0, import_react.useEffect)(() => {
		return () => {
			timers.current.forEach((t) => window.clearTimeout(t));
		};
	}, []);
	function clearTimers() {
		timers.current.forEach((t) => window.clearTimeout(t));
		timers.current = [];
	}
	function later(ms, fn) {
		const id = window.setTimeout(fn, ms);
		timers.current.push(id);
	}
	function reset() {
		clearTimers();
		setPhase("compose");
		setStep(0);
		setCurrent(null);
	}
	function resolveIdentity() {
		clearTimers();
		setPhase("resolve");
		setStep(0);
		later(stepMs() * 2.2, () => setPhase("ready"));
	}
	async function pay() {
		clearTimers();
		setPhase("paying");
		setStep(0);
		const derived = rail === "lightning" ? await deriveLightningInvoice({
			amountSats: amount,
			nonce,
			k
		}) : await deriveSilentPayment({
			amountSats: amount,
			nonce,
			k
		});
		const receipt = {
			rail,
			amountSats: amount,
			at: Date.now(),
			...derived
		};
		const delay = stepMs();
		steps.forEach((_, i) => {
			later(delay * (i + 1), () => setStep(i + 1));
		});
		later(delay * (steps.length + 1), () => {
			setCurrent(receipt);
			setReceipts((prev) => [receipt, ...prev].slice(0, 8));
			setPhase("settled");
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-[var(--radius-xl)] bg-surface p-4 shadow-[inset_0_0_0_1px_var(--color-border)] sm:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs font-medium uppercase tracking-[0.14em] text-subtle",
						children: [
							SENDER.wallet,
							" · ",
							SENDER.name
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 font-display text-3xl text-fg",
						children: "Payer"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "quiet",
						children: phaseLabel(phase)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-6 block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-subtle",
						children: "Destinataire"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1.5 flex h-11 items-center rounded-[var(--radius-sm)] bg-bg px-3 font-mono text-sm shadow-[inset_0_0_0_1px_var(--color-border)]",
						children: ["₿", RECIPIENT.handle]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
					className: "mt-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "text-xs text-subtle",
							children: "Montant"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex flex-wrap gap-2",
							children: AMOUNTS.map((sats) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									setAmount(sats);
									if (phase !== "compose" && phase !== "resolve") reset();
								},
								className: cn("h-10 rounded-full px-3.5 text-sm tabular-nums transition-colors duration-[var(--motion-quick)]", amount === sats ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted hover:text-fg"),
								children: [formatSats(sats), " sats"]
							}, sats))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs tabular-nums text-muted",
							children: formatBtc(amount)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex items-center justify-between gap-3 rounded-[var(--radius-md)] bg-bg px-3 py-3 shadow-[inset_0_0_0_1px_var(--color-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-fg",
						children: "Nœud Lightning joignable"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: lnUp ? "Le routeur choisit BOLT 12." : "Repli automatique sur Silent Payment."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						role: "switch",
						"aria-checked": lnUp,
						onClick: () => {
							setLnUp((v) => !v);
							if (phase !== "compose") reset();
						},
						className: cn("relative h-7 w-12 rounded-full transition-colors duration-[var(--motion-fast)]", lnUp ? "bg-accent" : "bg-border-strong"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("absolute top-0.5 left-0.5 size-6 rounded-full transition-transform duration-[var(--motion-fast)] ease-[var(--ease-out)]", lnUp ? "translate-x-5 bg-accent-fg" : "translate-x-0 bg-fg") })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 flex flex-col gap-2 sm:flex-row",
					children: phase === "compose" || phase === "resolve" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "flex-1",
						onClick: resolveIdentity,
						disabled: phase === "resolve",
						children: [phase === "resolve" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, {}), phase === "resolve" ? "Résolution DNSSEC…" : "Résoudre l’identité"]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "flex-1",
						onClick: pay,
						disabled: phase === "paying",
						children: [phase === "paying" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : rail === "lightning" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {}), phase === "paying" ? "Paiement en cours" : phase === "settled" ? "Payer à nouveau" : "Payer"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: reset,
						children: "Réinitialiser"
					})] })
				}),
				phase !== "compose" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UriPanel, {
					uri,
					phase,
					rail,
					step,
					current
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "grid gap-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiverPanel, {
				phase,
				current,
				receipts
			}), receipts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { receipts })]
		})]
	});
}
function phaseLabel(phase) {
	switch (phase) {
		case "compose": return "Prêt";
		case "resolve": return "DNS";
		case "ready": return "URI";
		case "paying": return "Transit";
		case "settled": return "Réglé";
	}
}
function UriPanel({ uri, phase, rail, step, current }) {
	const steps = rail === "lightning" ? LIGHTNING_STEPS : SILENT_STEPS;
	const active = Math.min(step, steps.length - 1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 border-t border-border pt-5",
		children: [
			phase === "resolve" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-2 text-sm text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }),
					"TXT ",
					RECIPIENT.dnsHost
				]
			}),
			phase !== "resolve" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-subtle",
					children: "URI BIP-321"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 break-all font-mono text-[11px] leading-relaxed text-muted",
					children: uri
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: rail === "lightning" ? "accent" : "quiet",
						children: "lno · Lightning"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: rail === "silent" ? "accent" : "quiet",
						children: "sp · Silent"
					})]
				})
			] }),
			(phase === "paying" || phase === "settled") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-5 space-y-2",
				children: steps.map((s, i) => {
					const done = phase === "settled" || i < step;
					const currentStep = phase === "paying" && i === active && step > 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: cn("rounded-[var(--radius-sm)] px-3 py-2.5 transition-colors duration-[var(--motion-fast)]", currentStep ? "bg-surface-2" : "bg-transparent"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("grid size-5 place-items-center rounded-full text-[10px]", done ? "bg-accent text-accent-fg" : "bg-border text-muted"),
								children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3" }) : i + 1
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-fg",
								children: s.title
							})]
						}), (currentStep || phase === "settled") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 pl-7 text-xs leading-relaxed text-muted",
							children: s.detail
						})]
					}, s.id);
				})
			}),
			phase === "settled" && current && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptFacts, { receipt: current })
		]
	});
}
function ReceiptFacts({ receipt }) {
	if (receipt.rail === "lightning") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
		className: "mt-4 grid gap-2 rounded-[var(--radius-md)] bg-bg p-3 text-xs shadow-[inset_0_0_0_1px_var(--color-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
				k: "payment_hash",
				v: receipt.paymentHash ?? ""
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
				k: "preimage",
				v: receipt.preimage ?? ""
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
				k: "facture",
				v: receipt.invoice ?? ""
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
		className: "mt-4 grid gap-2 rounded-[var(--radius-md)] bg-bg p-3 text-xs shadow-[inset_0_0_0_1px_var(--color-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
				k: "input_hash",
				v: receipt.inputHash ?? ""
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
				k: "secret",
				v: receipt.sharedSecret ?? ""
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
				k: "sortie P2TR",
				v: receipt.taprootOutput ?? ""
			})
		]
	});
}
function Fact({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "shrink-0 text-subtle",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "break-all font-mono text-fg",
			children: v
		})]
	});
}
function ReceiverPanel({ phase, current, receipts }) {
	const uri = buildUri();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-[var(--radius-xl)] bg-bg-elevated p-4 shadow-[inset_0_0_0_1px_var(--color-border)] sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs font-medium uppercase tracking-[0.14em] text-subtle",
					children: ["Destinataire · ", RECIPIENT.name]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 font-display text-3xl text-fg",
					children: "Recevoir"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "live",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-success" }), "QR figé"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-col items-center gap-4 sm:flex-row sm:items-start",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrMark, {
					payload: uri,
					className: "w-36 shrink-0"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 text-center sm:text-left",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono text-sm text-fg",
							children: ["₿", RECIPIENT.display]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed text-muted",
							children: "Ce QR ne change jamais. Chaque paiement atterrit sur une facture ou une sortie Taproot neuve, invisible depuis l’identifiant."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap justify-center gap-2 sm:justify-start",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "quiet",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudLightning, { className: "size-3" }), "Offre lno"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "quiet",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-3" }), "Scan sp1q"]
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 rounded-[var(--radius-md)] bg-surface p-4 shadow-[inset_0_0_0_1px_var(--color-border)]",
				children: phase === "settled" && current ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Incoming, { receipt: current }) : phase === "paying" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center gap-2 text-sm text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), "Écoute du rail choisi…"]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "En attente. Le QR reste le même — c’est tout l’intérêt."
				})
			}),
			receipts.length >= 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 text-xs leading-relaxed text-subtle",
				children: [
					receipts.length,
					" paiements reçus, ",
					new Set(receipts.map(outputOf)).size,
					" destinations distinctes. Aucune n’est l’adresse sp1q."
				]
			})
		]
	});
}
function Incoming({ receipt }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-success",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "size-3.5" }), "Reçu"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-1 font-display text-3xl tabular-nums text-fg",
			children: [formatSats(receipt.amountSats), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "ml-1 text-lg text-muted",
				children: "sats"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: receipt.rail === "lightning" ? "Lightning · facture unique, offre inchangée" : "On-chain · sortie Taproot unique, sp1q invisible"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 break-all font-mono text-[11px] text-subtle",
			children: receipt.rail === "lightning" ? receipt.paymentHash : receipt.taprootOutput
		})
	] });
}
function History({ receipts }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-[var(--radius-xl)] bg-surface p-4 shadow-[inset_0_0_0_1px_var(--color-border)] sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm font-medium text-fg",
				children: "Registre d’unlinkabilité"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs text-muted",
				children: [
					"Même destinataire, aucune adresse en commun. Un observateur on-chain ne peut pas les relier à ₿",
					RECIPIENT.display,
					"."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 divide-y divide-border",
				children: receipts.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-start justify-between gap-3 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-fg",
							children: [r.rail === "lightning" ? "Lightning" : "Silent", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "ml-2 text-xs text-subtle",
								children: ["k=", r.k]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 truncate font-mono text-[11px] text-muted",
							children: outputOf(r)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "shrink-0 text-sm tabular-nums text-fg",
						children: formatSats(r.amountSats)
					})]
				}, r.id))
			})
		]
	});
}
function outputOf(r) {
	return r.rail === "lightning" ? r.paymentHash ?? r.id : r.taprootOutput ?? r.id;
}
function LabPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:pt-14",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-[0.16em] text-subtle",
				children: "Laboratoire"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-4xl text-fg sm:text-5xl",
				children: "Alice paie Rob."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base",
				children: "Un nom, un montant, un bouton. Coupe Lightning pour forcer le repli Silent Payment. Observe une destination neuve à chaque règlement — l’identifiant, lui, ne bouge pas."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayLab, {})
			})
		]
	}) });
}
//#endregion
export { LabPage as component };
