import { categories, getProductBySlug, products } from "@/data/products";
import type { AssistantAction, DispatchResult } from "@/lib/actions/types";
import { pageRoutes, sectionIds } from "./siteMap";

/**
 * The agent's tools, defined once. `scripts/sync-agent.ts` registers them with
 * ElevenLabs; the browser runs them by turning arguments into an `AssistantAction`
 * for the shared dispatcher. Arguments are validated against the real site map and
 * catalogue, so the model can't reach anything a shopper couldn't.
 */

interface ToolParam {
  type: "string" | "number" | "integer";
  description: string;
  enum?: readonly string[];
}

type Args = Record<string, unknown>;
type Parsed = { ok: true; action: AssistantAction } | { ok: false; error: string };

export interface AgentTool {
  name: string;
  description: string;
  /** Blocking tools make the agent wait for the real result before it speaks again. */
  blocking: boolean;
  params: Record<string, ToolParam>;
  required: string[];
  toAction: (args: Args) => Parsed;
  /** What the agent hears back when the action succeeded. */
  done?: (action: AssistantAction) => string;
}

const slugs = products.map((p) => p.slug);
const colorNames = Array.from(new Set(products.flatMap((p) => p.colors.map((c) => c.name))));
const sizes = Array.from(new Set(products.flatMap((p) => p.sizes)));

const ok = (action: AssistantAction): Parsed => ({ ok: true, action });
const fail = (error: string): Parsed => ({ ok: false, error });

const str = (args: Args, key: string) => (typeof args[key] === "string" ? (args[key] as string).trim() : "");
const oneOf = (value: string, options: readonly string[]) => options.find((o) => o.toLowerCase() === value.toLowerCase());

function product(args: Args) {
  const slug = str(args, "product_slug");
  return getProductBySlug(oneOf(slug, slugs) ?? "");
}

const productParam: ToolParam = { type: "string", description: "The product's slug from the catalogue.", enum: slugs };
const sectionParam: ToolParam = { type: "string", description: "Section id from the site map.", enum: sectionIds };

function productAction(type: "add_to_wishlist" | "remove_from_wishlist" | "remove_from_cart") {
  return (args: Args): Parsed => {
    const p = product(args);
    return p ? ok({ type, productId: p.id }) : fail(`Unknown product. Use one of: ${slugs.join(", ")}`);
  };
}

const nameOf = (id: string) => products.find((p) => p.id === id)?.name ?? "the piece";

export const agentTools: AgentTool[] = [
  {
    name: "navigate_to_page",
    description: "Open a page of the site. Say a few words about where you're going in the same reply.",
    blocking: false,
    params: { page: { type: "string", description: "The page route.", enum: pageRoutes } },
    required: ["page"],
    toAction: (args) => {
      const page = oneOf(str(args, "page"), pageRoutes);
      return page ? ok({ type: "navigate", href: page }) : fail(`Unknown page. Use one of: ${pageRoutes.join(", ")}`);
    },
  },
  {
    name: "scroll_page",
    description: "Scroll the current page up or down by about a screen, or jump to the very top or bottom.",
    blocking: false,
    params: { direction: { type: "string", description: "Where to scroll.", enum: ["up", "down", "top", "bottom"] } },
    required: ["direction"],
    toAction: (args) => {
      const direction = oneOf(str(args, "direction"), ["up", "down", "top", "bottom"]) as "up" | "down" | "top" | "bottom" | undefined;
      return direction ? ok({ type: "scroll", direction }) : fail("direction must be up, down, top or bottom");
    },
  },
  {
    name: "scroll_to_section",
    description: "Scroll to a section of the site, opening its page first if needed. Use highlight_section instead when you are about to explain it.",
    blocking: false,
    params: { section_id: sectionParam },
    required: ["section_id"],
    toAction: (args) => {
      const id = oneOf(str(args, "section_id"), sectionIds);
      return id ? ok({ type: "scroll_to_section", sectionId: id }) : fail("Unknown section id — use an id from the site map");
    },
  },
  {
    name: "highlight_section",
    description:
      "Scroll to a section (opening its page if needed) and draw a soft ring around it. Call this whenever you explain or point out a specific part of the site, then explain it in the same reply.",
    blocking: false,
    params: { section_id: sectionParam },
    required: ["section_id"],
    toAction: (args) => {
      const id = oneOf(str(args, "section_id"), sectionIds);
      return id ? ok({ type: "highlight_section", sectionId: id }) : fail("Unknown section id — use an id from the site map");
    },
  },
  {
    name: "open_product",
    description: "Open a product's page.",
    blocking: false,
    params: { product_slug: productParam },
    required: ["product_slug"],
    toAction: (args) => {
      const p = product(args);
      return p ? ok({ type: "open_product", productSlug: p.slug }) : fail(`Unknown product. Use one of: ${slugs.join(", ")}`);
    },
  },
  {
    name: "show_products",
    description: "Open the shop filtered to matching products. Every filter is optional; call with none to show everything.",
    blocking: false,
    params: {
      category: { type: "string", description: "Product category.", enum: categories },
      color: { type: "string", description: "Colour name.", enum: colorNames },
      size: { type: "string", description: "Size the shopper needs.", enum: sizes },
      max_price: { type: "number", description: "Highest price in US dollars." },
    },
    required: [],
    toAction: (args) => {
      const category = oneOf(str(args, "category"), categories);
      const color = oneOf(str(args, "color"), colorNames);
      const size = oneOf(str(args, "size"), sizes);
      const maxPrice = typeof args.max_price === "number" && args.max_price > 0 ? Math.round(args.max_price) : undefined;
      if (str(args, "category") && !category) return fail(`Unknown category. Use one of: ${categories.join(", ")}`);
      if (str(args, "color") && !color) return fail(`Unknown colour. Available: ${colorNames.join(", ")}`);
      return ok({ type: "filter_products", category, color: color?.toLowerCase(), size, maxPrice });
    },
  },
  {
    name: "search_products",
    description: "Search the catalogue by keywords (e.g. 'linen', 'silk dress') and show the results in the shop.",
    blocking: false,
    params: { query: { type: "string", description: "What to search for." } },
    required: ["query"],
    toAction: (args) => {
      const query = str(args, "query").slice(0, 80);
      return query ? ok({ type: "navigate", href: `/shop?q=${encodeURIComponent(query)}` }) : fail("query is empty");
    },
  },
  {
    name: "add_to_cart",
    description: "Add a product to the shopping bag and open the bag. Ask for the size first if the shopper hasn't said it.",
    blocking: true,
    params: {
      product_slug: productParam,
      size: { type: "string", description: "Size to add. Must be one the product comes in.", enum: sizes },
      color: { type: "string", description: "Colour name. Must be one the product comes in.", enum: colorNames },
      quantity: { type: "integer", description: "How many, 1 to 9. Defaults to 1." },
    },
    required: ["product_slug"],
    toAction: (args) => {
      const p = product(args);
      if (!p) return fail(`Unknown product. Use one of: ${slugs.join(", ")}`);
      const size = oneOf(str(args, "size"), p.sizes);
      if (str(args, "size") && !size) return fail(`${p.name} comes in ${p.sizes.join(", ")}`);
      const color = p.colors.find((c) => c.name.toLowerCase() === str(args, "color").toLowerCase());
      if (str(args, "color") && !color) return fail(`${p.name} comes in ${p.colors.map((c) => c.name).join(", ")}`);
      const quantity = typeof args.quantity === "number" ? Math.min(9, Math.max(1, Math.round(args.quantity))) : undefined;
      return ok({ type: "add_to_cart", productId: p.id, size, colorId: color?.id, quantity });
    },
    done: (a) => (a.type === "add_to_cart" ? `Added ${nameOf(a.productId)}${a.size ? ` in ${a.size}` : ""} to the bag; the bag is now open.` : "Done."),
  },
  {
    name: "remove_from_cart",
    description: "Remove a product from the shopping bag.",
    blocking: true,
    params: { product_slug: productParam },
    required: ["product_slug"],
    toAction: productAction("remove_from_cart"),
    done: (a) => (a.type === "remove_from_cart" ? `Removed ${nameOf(a.productId)} from the bag.` : "Done."),
  },
  {
    name: "add_to_wishlist",
    description: "Save a product to the shopper's wishlist.",
    blocking: true,
    params: { product_slug: productParam },
    required: ["product_slug"],
    toAction: productAction("add_to_wishlist"),
    done: (a) => (a.type === "add_to_wishlist" ? `Saved ${nameOf(a.productId)} to the wishlist.` : "Done."),
  },
  {
    name: "remove_from_wishlist",
    description: "Remove a product from the shopper's wishlist.",
    blocking: true,
    params: { product_slug: productParam },
    required: ["product_slug"],
    toAction: productAction("remove_from_wishlist"),
    done: (a) => (a.type === "remove_from_wishlist" ? `Removed ${nameOf(a.productId)} from the wishlist.` : "Done."),
  },
  {
    name: "open_cart",
    description: "Open the shopping bag drawer so the shopper can review it or check out.",
    blocking: false,
    params: {},
    required: [],
    toAction: () => ok({ type: "open_cart" }),
  },
  {
    name: "close_cart",
    description: "Close the shopping bag drawer.",
    blocking: false,
    params: {},
    required: [],
    toAction: () => ok({ type: "close_cart" }),
  },
];

/** Runs a tool call through `dispatch`; the returned text is what the agent hears back. */
export function runAgentTool(name: string, args: unknown, dispatch: (action: AssistantAction) => DispatchResult) {
  const tool = agentTools.find((t) => t.name === name);
  if (!tool) return `Error: unknown tool ${name}`;
  const parsed = tool.toAction(args && typeof args === "object" ? (args as Args) : {});
  if (!parsed.ok) return `Error: ${parsed.error}`;
  const result = dispatch(parsed.action);
  return result.ok ? (tool.done?.(parsed.action) ?? "Done.") : `Error: ${result.reason}`;
}

/** Tool definition in the ElevenLabs client-tool format. */
export function toElevenLabsToolConfig(tool: AgentTool) {
  return {
    type: "client" as const,
    name: tool.name,
    description: tool.description,
    expects_response: tool.blocking,
    response_timeout_secs: 10,
    parameters: {
      type: "object" as const,
      properties: Object.fromEntries(
        Object.entries(tool.params).map(([key, p]) => [key, { type: p.type, description: p.description, ...(p.enum ? { enum: [...p.enum] } : {}) }]),
      ),
      required: tool.required,
    },
  };
}
