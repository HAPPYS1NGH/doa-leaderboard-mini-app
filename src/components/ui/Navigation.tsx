import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navigation: React.FC = () => {
  const pathname = usePathname();
  return (
    <nav className="bg-white backdrop-blur-sm shadow-sm border-b border-forest/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-lg font-futura-bold text-forest">
              🏆 Tap Day
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-futura-bold transition-colors ${
                pathname === "/"
                  ? "bg-forest text-cream"
                  : "text-forest hover:text-forest/80"
              }`}
            >
              Leaderboard
            </Link>
            <Link
              href="/claim"
              className={`px-3 py-2 rounded-md text-sm font-futura-bold transition-colors ${
                pathname === "/claim"
                  ? "bg-forest text-cream"
                  : "text-forest hover:text-forest/80"
              }`}
            >
              Claim
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
