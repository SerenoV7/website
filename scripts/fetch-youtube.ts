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
	// The name is usually in the feed's header, but not always: fall back to
	// the author of the first video.
	const authorName = (part: string) => decode(pick(pick(part, "author"), "name")).trim();
	const name = authorName(head) || authorName(entries[0] ?? "");
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

export function parseChannelName(html: string): string {
	const match = html.match(/<meta property="og:title" content="([^"]+)"/);
	return match ? decode(match[1]).trim() : "";
}

async function getText(url: string) {
	const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(15_000) });
	if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
	return res.text();
}

/**
 * YouTube keeps a hidden playlist per channel that holds only regular videos:
 * "UULF" + the channel ID without its "UC" prefix. Unlike the channel's main
 * feed, it leaves out live streams, scheduled streams, premieres and Shorts.
 */
const videosPlaylistId = (channelId: string) => `UULF${channelId.slice(2)}`;

async function getFeed(url: string) {
	const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(15_000) });
	if (res.status === 404) return null; // playlist does not exist: the channel has no regular videos
	if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
	return res.text();
}

async function loadChannel(id: string, previous?: Channel): Promise<Channel | null> {
	try {
		const xml = await getFeed(
			`https://www.youtube.com/feeds/videos.xml?playlist_id=${videosPlaylistId(id)}`,
		);
		const feed = xml ? parseFeed(xml, VIDEOS_PER_CHANNEL) : { name: "", videos: [] };
		if (xml && feed.videos.length === 0) {
			// 200 response but nothing we recognise (an error or consent page, say).
			console.warn(`[youtube] ${id}: unexpected feed, starts with: ${xml.slice(0, 200).replace(/\s+/g, " ")}`);
		}

		// The channel page gives us the avatar, and the name if the feed had none.
		let avatar = previous?.avatar ?? null;
		let name = feed.name;
		try {
			const page = await getText(`https://www.youtube.com/channel/${id}`);
			avatar = parseAvatar(page) ?? avatar;
			name ||= parseChannelName(page);
		} catch (error) {
			console.warn(`[youtube] ${id}: channel page not read (${error})`);
		}
		// Last resort for the name: the main feed, which always has it in the header.
		if (!name) {
			const main = await getFeed(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`);
			name = main ? parseFeed(main, 0).name : "";
		}
		name ||= previous?.name ?? "";
		if (!name) throw new Error("could not find the channel name in the feed or on the channel page");

		return { id, name, videos: feed.videos, avatar };
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
