import { Metadata } from 'next';
import { APP_URL } from '~/lib/constants';
import { getFrameEmbedMetadata } from '~/lib/utils';

// Helper to build the OG image URL for the meta tag
function getOgImageUrl(subname: string, pfp: string) {
  return `${APP_URL}/api/og/share/subname?subname=${encodeURIComponent(subname)}&pfp=${encodeURIComponent(pfp)}`;
}

// Server-side metadata for Farcaster frame embed
export async function generateMetadata({ 
  searchParams 
}: { 
  searchParams: Promise<{ subname?: string, pfp?: string }> 
}): Promise<Metadata> {
  const params = await searchParams;
  const subname = params?.subname || 'username';
  const pfp = params?.pfp || 'https://i.imgur.com/7ffGYrq.jpg';
  
  const imageUrl = getOgImageUrl(subname, pfp);

  // Farcaster frame metadata
  const frameMeta = getFrameEmbedMetadata(imageUrl);

  return {
    title: `${subname}.deptofagri.eth claimed!`,
    description: `Check out this new deptofagri.eth subname claim from the Tap Day Leaderboard!`,
    openGraph: {
      title: `${subname}.deptofagri.eth claimed!`,
      description: `Check out this new deptofagri.eth subname claim from the Tap Day Leaderboard!`,
      images: [imageUrl],
    },
    other: {
      'fc:frame': JSON.stringify(frameMeta),
    },
  };
}

export default function SubnameSharePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-cream text-forest p-4">
      <div className="max-w-md mx-auto text-center">
        <div className="w-24 h-24 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">🌾</span>
        </div>
        <h1 className="text-2xl font-futura-bold mb-4">Subname Claimed!</h1>
        <p className="text-base text-forest/70 mb-6">
          Someone just claimed their deptofagri.eth subname from the Tap Day Leaderboard!
        </p>
        <p className="text-sm text-forest/50">
          To see this frame, share it on Farcaster.
        </p>
      </div>
    </main>
  );
}
