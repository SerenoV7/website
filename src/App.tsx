import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import { useDiscordFavicon } from "@/hooks/useDiscordFavicon";

export default function App() {
  const DISCORD_ID = "372345796726882305";
  useDiscordFavicon(DISCORD_ID);

  return (
    <Routes>
      {/* Home is full-screen and has its own layout */}
      <Route index element={<Home />} />
      <Route element={<Layout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
