import type { Platform } from "../components/SocialLinks";

export type SocialEntry = {
  platform: Platform;
  href: string;
  label?: string;
  color?: string;
};

export const SOCIALS: SocialEntry[] = [
  { platform: "steam", href: "https://steamcommunity.com/id/serenov7", color: "#171a21" },
  { platform: "twitch", href: "https://twitch.tv/serenov7", color: "#9146ff" },
  { platform: "youtube", href: "https://youtube.com/@serenov7", color: "#ff0000" },
  { platform: "discord", href: "https://discord.gg/eCeKMTqGkf", color: "#5865f2" },
  { platform: "x", href: "https://x.com/serenov7", color: "#1da1f2" },
  { platform: "instagram", href: "https://instagram.com/3d.serenov7", color: "#e1306c" },
  { platform: "github", href: "https://github.com/serenov7", color: "#000000" },
  { platform: "email", href: "mailto:contact@serenov7.com", color: "#fd1d1d" },
];