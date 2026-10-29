import { useEffect, useState } from "react";
import { FaYoutube } from "react-icons/fa6";

type Video = { id: string; title: string; published: string };
type Channel = { id: string; name: string; avatar: string | null; videos: Video[] };

const dateFormat = new Intl.DateTimeFormat(undefined, {
	day: "numeric",
	month: "short",
	year: "numeric",
});

function ChannelFeed({ channel }: { channel: Channel }) {
	const channelUrl = `https://www.youtube.com/channel/${channel.id}`;

	return (
		<section
			className="yt-feed"
			aria-label={`${channel.name} on YouTube`}>
			<header className="yt-header">
				{channel.avatar ?
					<img
						className="yt-avatar"
						src={channel.avatar}
						alt=""
						loading="lazy"
						referrerPolicy="no-referrer"
					/>
				:	<div
						className="yt-avatar yt-avatar-fallback"
						aria-hidden="true">
						{channel.name[0]?.toUpperCase()}
					</div>
				}
				<a
					className="yt-name"
					href={channelUrl}
					target="_blank"
					rel="noreferrer">
					{channel.name}
				</a>
				{/* sub_confirmation=1 opens YouTube's subscribe prompt for this channel */}
				<a
					className="yt-subscribe"
					href={`${channelUrl}?sub_confirmation=1`}
					target="_blank"
					rel="noreferrer">
					<FaYoutube aria-hidden="true" />
					Subscribe
				</a>
			</header>

			<ul className="yt-videos">
				{channel.videos.map((video) => (
					<li key={video.id}>
						<a
							className="yt-video"
							href={`https://www.youtube.com/watch?v=${video.id}`}
							target="_blank"
							rel="noreferrer">
							<img
								className="yt-thumb"
								src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`}
								alt=""
								loading="lazy"
							/>
							<span className="yt-video-text">
								<span className="yt-video-title">{video.title}</span>
								<time
									className="yt-video-date"
									dateTime={video.published}>
									{dateFormat.format(new Date(video.published))}
								</time>
							</span>
						</a>
					</li>
				))}
			</ul>
		</section>
	);
}

export default function YouTubeFeeds() {
	const [channels, setChannels] = useState<Channel[]>([]);

	useEffect(() => {
		let cancelled = false;
		fetch("/youtube.json")
			.then((res) => (res.ok ? res.json() : null))
			.then((data) => {
				if (!cancelled && Array.isArray(data?.channels)) setChannels(data.channels);
			})
			.catch(() => {}); // no data yet: the section simply stays hidden
		return () => {
			cancelled = true;
		};
	}, []);

	if (channels.length === 0) return null;

	return (
		<div
			className="yt-feeds"
			aria-label="Latest YouTube videos">
			{channels.map((channel) => (
				<ChannelFeed
					key={channel.id}
					channel={channel}
				/>
			))}
		</div>
	);
}
