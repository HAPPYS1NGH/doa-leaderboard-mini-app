"use client";

import dynamic from "next/dynamic";

import Navigation from "~/components/ui/Navigation";

// note: dynamic import is required for components that use the Frame SDK
const Leaderboard = dynamic(() => import("~/components/Leaderboard"), {
  ssr: false,
});

export default function App() {
  return (
    <>
      <Navigation />
      <Leaderboard />
    </>
  );
}
