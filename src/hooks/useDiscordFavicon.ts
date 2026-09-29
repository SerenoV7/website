import { useEffect } from "react";
import { getDiscordAvatarUrl } from "@/lib/utils";

export function useDiscordFavicon(userId: string) {
  useEffect(() => {
    let cancelled = false;

    getDiscordAvatarUrl(userId, 64).then((url) => {
      // On failure the util returns Discord's default avatar; keep your normal favicon instead.
      if (cancelled || url.includes("/embed/avatars/")) return;

      let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.type = "image/png";
      link.href = url.replace(".gif", ".png"); // favicons should be still images
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);
}