import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getDiscordAvatarUrl(userId: string, size = 256): Promise<string> {
  const fallback = `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(userId) >> 22n) % 6n)}.png`;

  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`, { cache: "no-store" });
    if (!res.ok) return fallback;

    const json = await res.json();
    const hash: string | null | undefined = json?.success ? json.data?.discord_user?.avatar : null;
    if (!hash) return fallback;

    const ext = hash.startsWith("a_") ? "gif" : "png"; // "a_" prefix = animated avatar
    return `https://cdn.discordapp.com/avatars/${userId}/${hash}.${ext}?size=${size}`;
  } catch {
    return fallback;
  }
}

const appIconCache = new Map<string, Promise<string | null>>();

export type DiscordActivity = {
  id: string;
  name: string;
  /** 0 Playing, 1 Streaming, 2 Listening, 3 Watching, 4 Custom status, 5 Competing */
  type: number;
  details?: string;
  state?: string;
  application_id?: string;
  timestamps?: { start?: number; end?: number };
  assets?: { large_image?: string; large_text?: string; small_image?: string; small_text?: string };
};

export async function getDiscordActivities(userId: string): Promise<DiscordActivity[] | null> {
  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.success) return null;
    return (json.data.activities as DiscordActivity[]).filter((a) => a.type !== 4);
  } catch {
    return null;
  }
}

export function getActivityImageUrl(
  activity: DiscordActivity,
  which: "large_image" | "small_image" = "large_image",
): string | null {
  const asset = activity.assets?.[which];
  if (!asset) return null;
  if (asset.startsWith("mp:")) return `https://media.discordapp.net/${asset.slice(3)}`; // external images
  if (asset.startsWith("spotify:")) return `https://i.scdn.co/image/${asset.slice(8)}`; // album art
  if (asset.includes(":")) return null; // youtube:, twitch:, etc. aren't directly linkable
  return activity.application_id
    ? `https://cdn.discordapp.com/app-assets/${activity.application_id}/${asset}.png`
    : null;
}

export function getApplicationIconUrl(applicationId: string, size = 256): Promise<string | null> {
  let request = appIconCache.get(applicationId);
  if (!request) {
    request = fetch(`https://discord.com/api/v10/applications/${applicationId}/rpc`)
      .then((res) => (res.ok ? res.json() : null))
      .then((app) =>
        app?.icon
          ? `https://cdn.discordapp.com/app-icons/${applicationId}/${app.icon}.png?size=${size}`
          : null,
      )
      .catch(() => null)
      .then((url) => {
        if (!url) appIconCache.delete(applicationId);
        return url;
      });
    appIconCache.set(applicationId, request);
  }
  return request;
}

export type DiscordStatus = "online" | "idle" | "dnd" | "offline";

export const DISCORD_STATUS_COLORS: Record<DiscordStatus, string> = {
  online: "#23a55a",  // green
  idle: "#f0b232",    // yellow
  dnd: "#f23f43",     // red
  offline: "#80848e", // gray (also shown for invisible)
};

/** Current Discord status, or null if the request failed. */
export async function getDiscordStatus(userId: string): Promise<DiscordStatus | null> {
  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.success ? (json.data.discord_status as DiscordStatus) : null;
  } catch {
    return null;
  }
}