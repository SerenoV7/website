import { useEffect, useState } from "react";
import SocialLinks from "../components/SocialLinks";
import DiscordActivity from "../components/DiscordActivity";
import YouTubeFeeds from "../components/YouTubeFeeds";
import { cn, getDiscordAvatarUrl } from "@/lib/utils";
import Backdrop from "@/components/Backdrop";

import type { CSSProperties } from "react";
import { useDiscordStatus } from "@/hooks/useDiscordStatus";
import { DISCORD_STATUS_COLORS } from "@/lib/utils";

// TODO: replace with your real details
const NAME = "Sereno";
const TAGLINE = "";
const AVATAR = "/profile.jpg"; // drop your picture in /public/profile.jpg
const DISCORD_ID = "372345796726882305";

export default function Home() {
	const [avatar, setAvatar] = useState<string | null>(null);

	useEffect(() => {
		getDiscordAvatarUrl(DISCORD_ID).then(setAvatar);
		document.title = NAME;
	}, []);

	const status = useDiscordStatus(DISCORD_ID);
	const avatarStyle =
		status ?
			({ "--status-color": DISCORD_STATUS_COLORS[status] } as CSSProperties)
		:	undefined;

	return (
		<div className="home">
			{/* Layer 0 – background */}
			<Backdrop />
			{/* Layer 2 – content */}
			<main className="layer-content">
				{avatar ?
					<img
						className="avatar"
						src={avatar}
						alt={`${NAME} profile picture`}
						style={avatarStyle}
					/>
				:	<div
						className="avatar avatar-fallback"
						aria-hidden="true"
						style={avatarStyle}>
						{NAME[0].toUpperCase()}
						
					</div>
				}

				<h1 className="name">{NAME}</h1>
				{TAGLINE && <p className="tagline">{TAGLINE}</p>}

				<DiscordActivity userId={DISCORD_ID} />
				<SocialLinks />
				<YouTubeFeeds />
			</main>
		</div>
	);
}
