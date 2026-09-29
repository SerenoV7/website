import { useEffect, useState } from "react";
import { getDiscordStatus, type DiscordStatus } from "@/lib/utils";

export function useDiscordStatus(userId: string, pollMs = 15_000) {
  const [status, setStatus] = useState<DiscordStatus | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (document.hidden) return;
      const result = await getDiscordStatus(userId);
      if (!cancelled && result) setStatus(result); // on failure, keep the previous value
    };

    load();
    const id = setInterval(load, pollMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [userId, pollMs]);

  return status;
}