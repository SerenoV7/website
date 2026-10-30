import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

/** Shared wrapper for every page except Home. Each page renders its own <main>. */
export default function Layout() {
  const { pathname } = useLocation();

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return <Outlet />;
}
