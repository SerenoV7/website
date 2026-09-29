import { cn } from "@/lib/utils";

type Props = {
  /** Slowly drift and pulse the gradient. Off by default. */
  animated?: boolean;
  className?: string;
};

export default function GradientBackground({ animated = false, className }: Props) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_var(--gx,50%)_100%,#252525_0%,#000_var(--gs,100%))]",
        animated && "animate-[gradient-drift_12s_ease-in-out_infinite_alternate] motion-reduce:animate-none",
        className,
      )}
    />
  );
}