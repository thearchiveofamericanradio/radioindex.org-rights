/** Static Rights JSON served from compact assets bundled with this Worker deployment. */

export type Env = { ASSETS: Fetcher };

const SLICE = "rights";
const CORS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
	"Access-Control-Allow-Headers": "*",
};
const JSON_CACHE = "public, max-age=300, s-maxage=3600";

function json(body: unknown, status: number, cache = false): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			...(cache ? { "Cache-Control": JSON_CACHE } : {}),
			...CORS,
		},
	});
}

function maybeHead(request: Request, response: Response): Response {
	if (request.method !== "HEAD") return response;
	return new Response(null, { status: response.status, headers: response.headers });
}

async function asset(request: Request, env: Env, path: string): Promise<Response> {
	const assetUrl = new URL(request.url);
	assetUrl.pathname = `/${path}`;
	assetUrl.search = "";
	return env.ASSETS.fetch(new Request(assetUrl, { method: "GET" }));
}

async function bundled(request: Request, env: Env, path: string): Promise<Response> {
	const response = await asset(request, env, path);
	if (response.status === 404) return json({ error: "not_found", path: `/${path}` }, 404);
	if (!response.ok) return json({ error: "unavailable", status: response.status }, 503);
	const headers = new Headers(response.headers);
	headers.set("Content-Type", "application/json; charset=utf-8");
	for (const [name, value] of Object.entries(CORS)) headers.set(name, value);
	return new Response(response.body, { status: response.status, headers });
}

async function fromBundle(
	request: Request,
	env: Env,
	assetPath: string,
	id: string,
): Promise<{ status: number; record?: unknown }> {
	const response = await asset(request, env, assetPath);
	if (response.status === 404) return { status: 404 };
	if (!response.ok) return { status: 503 };
	const records = (await response.json()) as Record<string, unknown>;
	return Object.hasOwn(records, id) ? { status: 200, record: records[id] } : { status: 404 };
}

function prefix(id: string): string {
	return id.replaceAll("-", "").padEnd(3, "_").slice(0, 3);
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
		if (request.method !== "GET" && request.method !== "HEAD") {
			return json({ error: "method_not_allowed" }, 405);
		}

		const auth = request.headers.get("x-radioindex-internal") || request.headers.get("authorization");
		if (!auth) {
			return json({ error: "forbidden", message: "Private slice: strictly limited to internal access only." }, 403);
		}

		const path = new URL(request.url).pathname.replace(/^\/+/, "").replace(/\/+$/, "");
		if (path === "manifest.json") return maybeHead(request, await bundled(request, env, "manifest.json"));
		if (path === "health") return maybeHead(request, json({ ok: true, slice: SLICE }, 200));

		const match = new RegExp(`^${SLICE}/([a-z]+)/([A-Za-z0-9._-]+)\\.json$`).exec(path);
		if (match) {
			const [, type, rawId] = match;
			const id = rawId.toLowerCase();
			const found = await fromBundle(request, env, `bundles/${type}/${prefix(id)}.json`, id);
			if (found.status === 503) return json({ error: "unavailable", status: 503 }, 503);
			if (found.status === 200) return maybeHead(request, json(found.record, 200, true));
			return json({ error: "not_found", id }, 404);
		}

		return json({ error: "not_found", path: `/${path}` }, 404);
	},
};
