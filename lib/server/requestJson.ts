import { Agent, request } from "node:https";

export interface JsonResponse {
  status: number;
  ok: boolean;
  text: string;
}

/**
 * Sockets are pooled and kept warm: starting an avatar session makes two upstream
 * calls in a row (ElevenLabs, then Anam), and reusing a connection saves the TCP
 * and TLS handshakes on every session after the first.
 */
const agent = new Agent({ keepAlive: true, keepAliveMsecs: 30_000, maxSockets: 64, family: 4 });

/**
 * Small JSON HTTPS request that resolves IPv4 only.
 *
 * `fetch` asks for A and AAAA records together, and some home routers never answer
 * the AAAA question for elevenlabs.io — the lookup then stalls for ~15s and fetch
 * fails with an unhelpful "fetch failed". ElevenLabs has no IPv6 address anyway, so
 * asking only for IPv4 costs nothing and keeps the agent working on such networks.
 */
export function requestJson(url: string, options: { method?: string; headers?: Record<string, string>; body?: unknown } = {}) {
  const { method = "GET", headers = {}, body } = options;
  const payload = body === undefined ? undefined : JSON.stringify(body);
  const target = new URL(url);

  return new Promise<JsonResponse>((resolve, reject) => {
    const req = request(
      {
        protocol: target.protocol,
        host: target.hostname,
        port: target.port || 443,
        path: `${target.pathname}${target.search}`,
        method,
        family: 4,
        agent,
        headers: {
          ...headers,
          ...(payload ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) } : {}),
        },
      },
      (res) => {
        let text = "";
        res.setEncoding("utf8");
        res.on("data", (chunk: string) => (text += chunk));
        res.on("end", () => {
          const status = res.statusCode ?? 0;
          resolve({ status, ok: status >= 200 && status < 300, text });
        });
      },
    );
    req.on("error", reject);
    req.setTimeout(15_000, () => req.destroy(new Error(`Timed out calling ${target.host}`)));
    if (payload) req.write(payload);
    req.end();
  });
}
