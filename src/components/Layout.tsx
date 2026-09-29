import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const links = [
  { to: "/", label: "Home", end: true },
];

export default function Layout() {
  const { pathname } = useLocation();

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <main>
        <Outlet />
      </main>
    </>
  );
}
