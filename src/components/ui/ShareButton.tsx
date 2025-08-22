'use client';

import { useState } from 'react';
import { APP_URL } from '~/lib/constants';
import { sdk } from "@farcaster/frame-sdk";

interface ShareButtonProps {
  subname: string;
  pfpUrl?: string;
  className?: string;
  disabled?: boolean;
}

export default function ShareButton({ 
  subname, 
  pfpUrl, 
  className = '',
  disabled = false 
}: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);

    const shareToFeed = async () => {
    if (!sdk || disabled) return;

    setIsSharing(true);
    
    try {
      // Extract just the label from the subname (e.g., "alice" from "alice.deptofagri.eth")
      const subnameLabel = subname.replace('.deptofagri.eth', '');
      
      // Create the share URL
      const shareUrl = `${APP_URL}/share/subname?subname=${encodeURIComponent(subnameLabel)}&pfp=${encodeURIComponent(pfpUrl || '')}`;
      
      // Create cast text
      const castText = `🌾 Just claimed my deptofagri.eth subname: ${subnameLabel}.deptofagri.eth!\n\n` +
        `From the Tap Day Leaderboard - Farming is fun! 🎉\n\n` +
        `Claim your own subname: ${shareUrl}`;

      await sdk.actions.composeCast({
        text: castText,
        embeds: [shareUrl],
      });

      // Optionally send notifications to followers or specific users
      // This could be expanded to notify people who sent USDC to this user
      try {
        // You could add notification logic here if needed
        // For example, notify people who sent USDC to this user
        console.log('Subname shared successfully:', subname);
      } catch (notificationError) {
        console.warn('Failed to send notifications:', notificationError);
      }

    } catch (error) {
      console.error("Error sharing subname:", error);
      // Fallback: copy to clipboard
      try {
        const subnameLabel = subname.replace('.deptofagri.eth', '');
        const shareUrl = `${APP_URL}/share/subname?subname=${encodeURIComponent(subnameLabel)}&pfp=${encodeURIComponent(pfpUrl || '')}`;
        await navigator.clipboard.writeText(shareUrl);
        alert("Share URL copied to clipboard!");
      } catch (clipboardError) {
        console.error("Failed to copy to clipboard:", clipboardError);
        alert("Failed to share. Please try again.");
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <button
      onClick={shareToFeed}
      disabled={disabled || isSharing}
      className={`bg-forest hover:bg-forest/90 disabled:bg-forest/50 text-cream font-futura-bold py-3 px-6 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
    >
      {isSharing ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cream"></div>
          Sharing...
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          Share Subname
        </>
      )}
    </button>
  );
}
