import { useEffect, useState } from "react";
import {
	getActivityImageUrl,
	getApplicationIconUrl,
	getDiscordActivities,
	type DiscordActivity as Activity,
} from "@/lib/utils";

const POLL_MS = 15_000;
const KIND: Record<number, string> = {
	0: "Playing",
	1: "Streaming",
	2: "Listening to",
	3: "Watching",
	5: "Competing in",
};

const pad = (n: number) => String(n).padStart(2, "0");
function formatElapsed(ms: number) {
	const s = Math.max(0, Math.floor(ms / 1000));
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`;
}

function ActivityCard({ activity }: { activity: Activity }) {
	const start = activity.timestamps?.start;
	const showElapsed = !!start && activity.type !== 2; // Spotify's start/end describe the song, not a session
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		if (!showElapsed) return;
		const id = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(id);
	}, [showElapsed]);

	const assetArt = getActivityImageUrl(activity); // Rich Presence artwork (Spotify, custom games)
	const [iconArt, setIconArt] = useState<string | null>(null); // fallback: the game's app icon

	useEffect(() => {
		if (assetArt || !activity.application_id) return;
		let cancelled = false;
		getApplicationIconUrl(activity.application_id).then((url) => {
			if (!cancelled) setIconArt(url);
		});
		return () => {
			cancelled = true;
		};
	}, [assetArt, activity.application_id]);

	const art = assetArt ?? iconArt;

	return (
		<li className="activity">
			{art ?
				<img
					className="activity-art"
					src={art}
					alt={activity.assets?.large_text ?? ""}
				/>
			:	<div
					className="activity-art"
					aria-hidden="true"
				/>
			}
			<div className="activity-text">
				<p className="activity-kind">{KIND[activity.type] ?? "Activity"}</p>
				<p className="activity-name">{activity.name}</p>
				{activity.details && (
					<p className="activity-line">{activity.details}</p>
				)}
				{activity.state && <p className="activity-line">{activity.state}</p>}
				{showElapsed && (
					<p className="activity-line">{formatElapsed(now - start!)} elapsed</p>
				)}
			</div>
		</li>
	);
}

export default function DiscordActivity({ userId }: { userId: string }) {
	const [activities, setActivities] = useState<Activity[]>([]);

	useEffect(() => {
		let cancelled = false;

		const load = async () => {
			if (document.hidden) return; // don't poll from background tabs
			const result = await getDiscordActivities(userId);
			if (!cancelled && result) setActivities(result); // null = request failed, keep previous state
		};

		load();
		const id = setInterval(load, POLL_MS);
		return () => {
			cancelled = true;
			clearInterval(id);
		};
	}, [userId]);

	if (activities.length === 0) return null; // nothing going on → widget hidden

	return (
		<ul
			className="activities"
			aria-label="Current Discord activity">
			{activities.map((a) => (
				<ActivityCard
					key={a.id}
					activity={a}
				/>
			))}
		</ul>
	);
}
