import { error, json, readJson } from '../../lib/http';

export const config = { runtime: 'edge' };

/**
 * Phase 6.8 — Zero-Knowledge Cloud Relay (STUB).
 *
 * This is the relay endpoint described in spec §9a. The full protocol:
 *
 *   1. Client (Apple/Web) generates an ephemeral X25519 keypair.
 *   2. Client derives a shared secret from (its priv, relay long-term pub).
 *   3. Client encrypts the Claude payload with ChaCha20-Poly1305 using
 *      an HKDF-derived key from the shared secret.
 *   4. Client POSTs `{ ephemeralPublicKey, ciphertext }` here.
 *   5. Relay derives the same shared secret from (its priv, client pub).
 *   6. Relay decrypts the payload, calls Claude with the minimum context,
 *      encrypts the response, returns it.
 *   7. Client decrypts.
 *
 * The relay's long-term private key MUST be held in an HSM or
 * cloud KMS (AWS KMS, GCP Cloud KMS, Cloudflare). On Vercel Edge there
 * is no native HSM; Phase 6.11 wires this to a side-car running on a
 * KMS-equipped runtime (Cloud Run + GCP KMS is the recommended path).
 *
 * Until the HSM is set up, this stub:
 *   - Accepts the envelope shape from the client
 *   - Returns a 501 explaining what's needed
 *   - Documents the contract so client integration can be tested with
 *     a mock relay server.
 */

interface RelayEnvelope {
  ephemeralPublicKey: string;   // base64 of client's ephemeral X25519 public key
  ciphertext: string;            // base64 of ChaChaPoly combined box
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'GET') {
    // Public-key discovery endpoint — clients fetch the relay's long-term
    // pubkey before the first encrypted call.
    const pubkey = process.env.BENNETT_RELAY_PUBKEY;
    if (!pubkey) {
      return error(503, 'relay pubkey not provisioned. Phase 6.11 will wire this to KMS.');
    }
    return json({ relayPublicKey: pubkey, alg: 'x25519-chachapoly-hkdf-sha256-v1' });
  }
  if (req.method !== 'POST') return error(405, 'method not allowed');

  const body = await readJson<RelayEnvelope & { uid: string }>(req);
  if (!body?.ephemeralPublicKey || !body?.ciphertext || !body?.uid) {
    return error(400, 'ephemeralPublicKey, ciphertext, uid required');
  }

  // Phase 6.11: derive shared secret with KMS-held private key,
  // decrypt, call Claude, re-encrypt response.
  return error(
    501,
    'relay not yet provisioned with HSM-backed private key. ' +
    'See backend/api/crypto/relay.ts for the protocol contract.',
  );
}
