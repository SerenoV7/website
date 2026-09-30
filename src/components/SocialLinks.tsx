import type { IconType } from "react-icons";
import {
	FaBluesky,
	FaDiscord,
	FaEnvelope,
	FaFacebook,
	FaGithub,
	FaGitlab,
	FaGlobe,
	FaInstagram,
	FaLinkedin,
	FaMastodon,
	FaReddit,
	FaSpotify,
	FaStackOverflow,
	FaSteam,
	FaTelegram,
	FaTiktok,
	FaTwitch,
	FaXTwitter,
	FaYoutube,
} from "react-icons/fa6";
import { SOCIALS } from "../config/socials";
import type { CSSProperties } from "react";

/** Platform key -> logo + default name. To add one, import any icon and add a line here. */
const PLATFORMS = {
	github: { icon: FaGithub, name: "GitHub" },
	gitlab: { icon: FaGitlab, name: "GitLab" },
	linkedin: { icon: FaLinkedin, name: "LinkedIn" },
	x: { icon: FaXTwitter, name: "X" },
	instagram: { icon: FaInstagram, name: "Instagram" },
	youtube: { icon: FaYoutube, name: "YouTube" },
	twitch: { icon: FaTwitch, name: "Twitch" },
	tiktok: { icon: FaTiktok, name: "TikTok" },
	discord: { icon: FaDiscord, name: "Discord" },
	telegram: { icon: FaTelegram, name: "Telegram" },
	bluesky: { icon: FaBluesky, name: "Bluesky" },
	mastodon: { icon: FaMastodon, name: "Mastodon" },
	reddit: { icon: FaReddit, name: "Reddit" },
	facebook: { icon: FaFacebook, name: "Facebook" },
	spotify: { icon: FaSpotify, name: "Spotify" },
	steam: { icon: FaSteam, name: "Steam" },
	stackoverflow: { icon: FaStackOverflow, name: "Stack Overflow" },
	email: { icon: FaEnvelope, name: "Email" },
	website: { icon: FaGlobe, name: "Website" },
} satisfies Record<string, { icon: IconType; name: string }>;

export type Platform = keyof typeof PLATFORMS;

export default function SocialLinks() {
	return (
		<ul
			className="socials"
			aria-label="Social links">
			{SOCIALS.map(({ platform, href, label, color }) => {
				const { icon: Icon, name } = PLATFORMS[platform];
				const text = label ?? name;
				const external = !href.startsWith("mailto:");
				return (
					<li key={`${platform}-${href}`}>
						<a
							href={href}
							aria-label={text}
							title={text}
							style={
								color ?
									({ "--social-color": color } as CSSProperties)
								:	undefined
							}
							{...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
							<Icon aria-hidden="true" />
							<span className="social-name">{text}</span>
						</a>
					</li>
				);
			})}
		</ul>
	);
}
