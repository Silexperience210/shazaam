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
