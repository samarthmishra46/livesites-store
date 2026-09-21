/**
 * One-time LiveAvatar setup: stores the ElevenLabs API key in LiveAvatar's vault so
 * its worker can connect to our agent, and saves the resulting id as
 * LIVEAVATAR_SECRET_ID. Also lists the stock avatars with `--list`.
 *
 *   npm run avatar:setup
 *   npm run avatar:setup -- --list
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { requestJson } from "@/lib/server/requestJson";

const API = "https://api.liveavatar.com";

const envFiles = [".env.local", ".env"].filter((f) => existsSync(f));
for (const file of envFiles) process.loadEnvFile(file);

function saveEnv(name: string, value: string) {
  const file = envFiles[0];
  if (!file) {
    console.log(`Add to your env file:\n  ${name}=${value}`);
    return;
  }
  const text = readFileSync(file, "utf8");
  const line = `${name}=${value}`;
  const pattern = new RegExp(`^${name}=.*$`, "m");
  writeFileSync(file, pattern.test(text) ? text.replace(pattern, line) : `${text.trimEnd()}\n${line}\n`);
  console.log(`Saved ${name} to ${file}.`);
}

function env(name: string, required = true) {
  const value = process.env[name]?.trim();
  if (required && !value) {
    console.error(`Missing ${name} in .env.local or .env (see .env.example).`);
    process.exit(1);
  }
  return value ?? "";
}

async function main() {
  if (process.argv.includes("--list")) {
    const res = await requestJson(`${API}/v1/avatars/public?page_size=100`);
    const { data } = JSON.parse(res.text) as { data?: { results?: { id: string; name: string; status: string }[] } };
    for (const a of data?.results ?? []) if (a.status === "ACTIVE") console.log(`${a.id}  ${a.name}`);
    return;
  }

  const apiKey = env("LIVEAVATAR_API_KEY");
  const elevenLabsKey = env("ELEVENLABS_API_KEY");
  if (env("LIVEAVATAR_SECRET_ID", false)) {
    console.log("LIVEAVATAR_SECRET_ID is already set — delete it from your env file to register a new one.");
    return;
  }

  const res = await requestJson(`${API}/v1/secrets`, {
    method: "POST",
    headers: { "X-API-KEY": apiKey },
    body: { secret_type: "ELEVENLABS_API_KEY", secret_value: elevenLabsKey, secret_name: "Livesites agent key" },
  });
  if (!res.ok) throw new Error(`POST /v1/secrets → ${res.status}\n${res.text}`);

  const { data } = JSON.parse(res.text) as { data?: { id?: string } };
  if (!data?.id) throw new Error(`Unexpected response: ${res.text}`);
  saveEnv("LIVEAVATAR_SECRET_ID", data.id);
  console.log("LiveAvatar can now reach the Livesites agent.");
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
