import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const invoiceInput = z.object({
  offer: z.string().min(4),
  amountSats: z.number().int().positive(),
});

/**
 * Facture BOLT 12 depuis une offre, via le bolt12-server local (LNDK).
 *
 * La clé API reste strictement côté serveur (env `BOLT12_API_KEY`) : elle donne
 * accès au admin.macaroon LND, elle ne doit JAMAIS atterrir dans le bundle client.
 * `BOLT12_SERVER_URL` (défaut http://umbrel.local:3043) pointe vers le bolt12-server.
 *
 * Depuis le client : `await getBolt12Invoice({ data: { offer, amountSats } })`.
 */
export const getBolt12Invoice = createServerFn({ method: "POST" })
  .validator(invoiceInput)
  .handler(async ({ data }) => {
    const apiKey = process.env.BOLT12_API_KEY;
    const serverUrl = process.env.BOLT12_SERVER_URL ?? "http://umbrel.local:3043";

    if (!apiKey) {
      throw new Error("BOLT12_API_KEY non configurée côté serveur");
    }

    const res = await fetch(`${serverUrl}/api/v1/offers/invoice`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ offer: data.offer, amount: data.amountSats }),
      signal: AbortSignal.timeout(25000),
    });

    const body = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      error?: string;
      message?: string;
      data?: { invoice?: string; contents?: { payment_hash?: string } };
    };

    if (!res.ok || !body.success) {
      throw new Error(body.message ?? body.error ?? `bolt12-server erreur ${res.status}`);
    }

    return {
      invoice: body.data?.invoice ?? "",
      paymentHash: body.data?.contents?.payment_hash ?? "",
    };
  });

const bolt11Input = z.object({
  amountSats: z.number().int().positive(),
  description: z.string().max(80).optional(),
});

/**
 * Facture BOLT 11 RÉELLE via le bolt12-server (LND REST, pas LNDK) — la voie
 * fiable tant que le flux BOLT 12 (GetInvoice) est cassé. Clé API côté serveur,
 * jamais dans le bundle client. Nécessite un User-Agent non-bot (Cloudflare 1010).
 */
export const getBolt11Invoice = createServerFn({ method: "POST" })
  .validator(bolt11Input)
  .handler(async ({ data }) => {
    const apiKey = process.env.BOLT12_API_KEY;
    const serverUrl = process.env.BOLT12_SERVER_URL ?? "http://umbrel.local:3043";
    if (!apiKey) throw new Error("BOLT12_API_KEY non configurée côté serveur");

    const res = await fetch(`${serverUrl}/api/v1/invoices`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "user-agent": "Mozilla/5.0 (compatible; bolt12-client/2.3.1)",
      },
      body: JSON.stringify({
        amount: data.amountSats,
        description: data.description ?? "Don 21pay",
      }),
      signal: AbortSignal.timeout(25000),
    });

    const body = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      error?: string;
      message?: string;
      data?: { payment_request?: string; r_hash?: string };
    };

    if (!res.ok || !body.success) {
      throw new Error(body.message ?? body.error ?? `bolt12-server erreur ${res.status}`);
    }
    return {
      paymentRequest: body.data?.payment_request ?? "",
      paymentHash: body.data?.r_hash ?? "",
    };
  });

const settleInput = z.object({ paymentHash: z.string().min(1) });

/** Vérifie si un paiement (par r_hash) est réglé sur le nœud. */
export const checkPaymentSettled = createServerFn({ method: "POST" })
  .validator(settleInput)
  .handler(async ({ data }) => {
    const apiKey = process.env.BOLT12_API_KEY;
    const serverUrl = process.env.BOLT12_SERVER_URL ?? "http://umbrel.local:3043";
    if (!apiKey) return { settled: false };

    const res = await fetch(`${serverUrl}/api/v1/payments`, {
      headers: {
        "x-api-key": apiKey,
        "user-agent": "Mozilla/5.0 (compatible; bolt12-client/2.3.1)",
      },
      signal: AbortSignal.timeout(20000),
    });

    const body = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      data?: Array<{ hash?: string; type?: string }>;
    };
    if (!res.ok || !body.success) return { settled: false };

    const found = (body.data ?? []).some(
      (p) => p.type === "received" && p.hash === data.paymentHash,
    );
    return { settled: found };
  });
