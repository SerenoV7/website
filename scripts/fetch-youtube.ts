/**
 * Fetches the latest videos, channel name and avatar for every channel in
 * src/config/youtube.ts and writes them to public/youtube.json.
 *
 * Runs at build time (browsers cannot call YouTube directly because of CORS).
 * It never fails the build: if a channel cannot be fetched, the previously
 * saved data for that channel is kept.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { VIDEOS_PER_CHANNEL, YOUTUBE_CHANNELS } from "../src/config/youtube";

const OUTPUT = "public/youtube.json";
const HEADERS = {
	"User-Agent":
		"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36",
	"Accept-Language": "en-US,en;q=0.9",
	Cookie: "SOCS=CAI", // skips the cookie-consent page
};

type Video = { id: string; title: string; published: string };
type Channel = { id: string; name: string; avatar: string | null; videos: Video[] };

const decode = (s: string) =>
	s
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;|&apos;/g, "'");

const pick = (xml: string, tag: string) =>
	xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))?.[1] ?? "";

export function parseFeed(xml: string, limit: number): Pick<Channel, "name" | "videos"> {
	const entries = xml.split("<entry>").slice(1);
	const head = xml.split("<entry>")[0];
	const name = decode(pick(pick(head, "author"), "name"));
	const videos = entries.slice(0, limit).map((entry) => ({
		id: pick(entry, "yt:videoId"),
		title: decode(pick(entry, "title")),
		published: pick(entry, "published"),
	}));
	return { name, videos: videos.filter((v) => v.id) };
}

export function parseAvatar(html: string): string | null {
	const match = html.match(/<meta property="og:image" content="([^"]+)"/);
	if (!match) return null;
	// Request a small square version instead of the full-size image.
	return decode(match[1]).replace(/=s\d+.*$/, "=s176-c-k-c0x00ffffff-no-rj");
}

async function getText(url: string) {
	const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(15_000) });
	if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
	return res.text();
}

async function loadChannel(id: string, previous?: Channel): Promise<Channel | null> {
	try {
		const feed = parseFeed(
			await getText(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`),
			VIDEOS_PER_CHANNEL,
		);
		if (!feed.name) throw new Error("feed has no channel name");

		// The avatar is not in the feed, so read it from the channel page.
		let avatar = previous?.avatar ?? null;
		try {
			avatar = parseAvatar(await getText(`https://www.youtube.com/channel/${id}`)) ?? avatar;
		} catch (error) {
			console.warn(`[youtube] ${id}: avatar not updated (${error})`);
		}
		return { id, ...feed, avatar };
	} catch (error) {
		console.warn(`[youtube] ${id}: ${error}`);
		return previous ?? null;
	}
}

async function main() {
	let saved: Channel[] = [];
	if (existsSync(OUTPUT)) {
		try {
			saved = JSON.parse(readFileSync(OUTPUT, "utf8")).channels ?? [];
		} catch {
			// ignore a corrupt file and start fresh
		}
	}

	const results = await Promise.all(
		YOUTUBE_CHANNELS.map((id) => loadChannel(id, saved.find((c) => c.id === id))),
	);
	const channels = results.filter((c): c is Channel => c !== null);

	mkdirSync(dirname(OUTPUT), { recursive: true });
	writeFileSync(
		OUTPUT,
		JSON.stringify({ updated: new Date().toISOString(), channels }, null, 2),
	);
	console.log(`[youtube] saved ${channels.length}/${YOUTUBE_CHANNELS.length} channels`);
}

if (import.meta.main) await main();
