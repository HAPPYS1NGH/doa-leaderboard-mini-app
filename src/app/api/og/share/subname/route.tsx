import React from 'react';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const subname = searchParams.get('subname') || 'anon';
  const pfp =
    searchParams.get('pfp') || 'https://i.imgur.com/7ffGYrq.jpg';

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          backgroundImage: `url(${process.env.NEXT_PUBLIC_URL || ''}/images/farm-bg.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay for readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))',
          }}
        />

        {/* Wooden signboard */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '25px 60px',
            minWidth: 750,
            borderRadius: 15,
            background: 'linear-gradient(135deg, #8B5A2B, #A0522D, #CD853F)', // wood tones
            boxShadow: 'inset 0 0 8px rgba(0,0,0,0.4), 0 6px 40px rgba(0,0,0,0.4)',
            border: '4px solid #5C4033',
            gap: 30,
          }}
        >
          {/* PFP */}
          <img
            src={pfp}
            width={100}
            height={100}
            style={{
              borderRadius: '50%',
              objectFit: 'cover',
              border: '6px solid #F5DEB3', // wheat color border
            }}
          />

          {/* Username */}
          <span
            style={{
              fontFamily: 'serif',
              fontSize: 58,
              color: '#FFF8DC', // cornsilk
              fontWeight: 900,
              textShadow: '2px 2px 6px rgba(0,0,0,0.6)',
            }}
          >
            {subname}.deptofagri.eth
          </span>
        </div>
    
        {/* Tagline */}
        <div
          style={{
            marginTop: 50,
            position: 'relative',
            fontSize: 40,
            fontFamily: 'serif',
            color: '#0D2E16',
            backgroundColor: '#F6F4E0',
            fontWeight: 700,
            textShadow: '3px 3px 10px rgba(0,0,0,0.7)',
            padding: '20px 20px',
            borderRadius: 15,
          }}
        >
          🌾 My hat has an identity
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
