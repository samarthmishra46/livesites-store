/**
 * Offline checks for the agent layer: tool argument validation, and that every
 * section in the site map is really tagged in the UI.
 *
 *   npm run agent:check
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { buildSystemPrompt } from "@/lib/agent/knowledge";
import { siteSections } from "@/lib/agent/siteMap";
import { agentTools, toElevenLabsToolConfig } from "@/lib/agent/tools";

const tool = (name: string) => {
  const t = agentTools.find((x) => x.name === name);
  assert.ok(t, `missing tool ${name}`);
  return t;
};

let passed = 0;
function check(name: string, fn: () => void) {
  fn();
  passed++;
  console.log(`  ✓ ${name}`);
}

check("tool names are unique and ElevenLabs configs are well-formed", () => {
  assert.equal(new Set(agentTools.map((t) => t.name)).size, agentTools.length);
  for (const t of agentTools) {
    const c = toElevenLabsToolConfig(t);
    for (const r of c.parameters.required) assert.ok(r in c.parameters.properties, `${t.name}: required ${r} not in properties`);
  }
});

check("navigation only reaches internal pages", () => {
  assert.equal(tool("navigate_to_page").toAction({ page: "https://evil.example" }).ok, false);
  assert.equal(tool("navigate_to_page").toAction({ page: "//evil.example" }).ok, false);
  assert.deepEqual(tool("navigate_to_page").toAction({ page: "/pricing" }), { ok: true, action: { type: "navigate", href: "/pricing" } });
});

check("unknown sections and products are rejected", () => {
  assert.equal(tool("highlight_section").toAction({ section_id: "body > div" }).ok, false);
  assert.equal(tool("scroll_to_section").toAction({ section_id: "" }).ok, false);
  assert.equal(tool("open_product").toAction({ product_slug: "gucci-bag" }).ok, false);
  assert.equal(tool("add_to_wishlist").toAction({ product_slug: 42 }).ok, false);
  assert.equal(tool("highlight_section").toAction({ section_id: "shipping.returns" }).ok, true);
});

check("cart validates size, colour and quantity against the product", () => {
  assert.equal(tool("add_to_cart").toAction({ product_slug: "silk-slip-dress", size: "XL" }).ok, false);
  assert.equal(tool("add_to_cart").toAction({ product_slug: "silk-slip-dress", color: "Camel" }).ok, false);
  assert.deepEqual(tool("add_to_cart").toAction({ product_slug: "linen-blazer", size: "m", color: "charcoal", quantity: 40 }), {
    ok: true,
    action: { type: "add_to_cart", productId: "p-linen-blazer", size: "M", colorId: "charcoal", quantity: 9 },
  });
});

check("search is URL-encoded and filters are validated", () => {
  assert.deepEqual(tool("search_products").toAction({ query: "silk & linen" }), {
    ok: true,
    action: { type: "navigate", href: "/shop?q=silk%20%26%20linen" },
  });
  assert.equal(tool("show_products").toAction({ category: "Shoes" }).ok, false);
  assert.deepEqual(tool("show_products").toAction({ category: "dresses", max_price: 150.4 }), {
    ok: true,
    action: { type: "filter_products", category: "Dresses", color: undefined, size: undefined, maxPrice: 150 },
  });
});

check("every site-map section is tagged in the UI", () => {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (path.endsWith(".tsx")) files.push(path);
    }
  };
  walk("app");
  walk("components");
  const source = files.map((f) => readFileSync(f, "utf8")).join("\n");
  for (const s of siteSections) {
    if (s.anchorId) {
      const page = readFileSync(join("app", s.route, "page.tsx"), "utf8");
      assert.ok(page.includes(`id="${s.anchorId}"`), `${s.id}: heading #${s.anchorId} not found in app${s.route}/page.tsx`);
    } else {
      assert.ok(source.includes(`data-agent-section="${s.id}"`), `${s.id}: no element tagged data-agent-section="${s.id}"`);
    }
  }
});

check("system prompt names the brand and every product", () => {
  const prompt = buildSystemPrompt();
  assert.ok(prompt.includes("Yuvichaar Funnels"));
  for (const slug of ["linen-blazer", "silk-slip-dress", "aurora-linen-set", "structured-leather-tote"]) assert.ok(prompt.includes(slug));
  console.log(`    (prompt ≈ ${Math.round(prompt.length / 4)} tokens)`);
});

console.log(`\n${passed} checks passed.`);
