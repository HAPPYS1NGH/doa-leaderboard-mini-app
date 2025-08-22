import { NextRequest, NextResponse } from 'next/server';

// Function to fetch Farcaster username (fname) from Neynar API
async function fetchFarcasterUsernameFromFid(fid: number): Promise<string | null> {
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
        console.warn('Neynar API key not configured, skipping Farcaster username fetch');
        return null;
    }

    try {
        const response = await fetch(
            `https://hub-api.neynar.com/v1/userNameProofsByFid?fid=${fid}`,
            {
                headers: {
                    'x-api-key': apiKey,
                },
            }
        );

        if (!response.ok) {
            console.warn(`Failed to fetch username proofs for FID ${fid}: ${response.status}`);
            return null;
        }

        const data = await response.json();
        
        // Look for Farcaster username (fname) in the proofs
        if (data.proofs && Array.isArray(data.proofs)) {
            for (const proof of data.proofs) {
                if (proof.type === 'USERNAME_TYPE_FNAME' && proof.name) {
                    return proof.name;
                }
            }
        }

        return null;
    } catch (error) {
        console.error('Error fetching Farcaster username from Neynar:', error);
        return null;
    }
}

// Define the request body type
interface FetchUsernameRequest {
    fid: number;
    fallbackUsername?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: FetchUsernameRequest = await request.json();

        // Validate required fields
        if (!body.fid) {
            return NextResponse.json({
                error: 'Missing required field: fid is required'
            }, { status: 400 });
        }

        // Try to get Farcaster username from FID
        const farcasterUsername = await fetchFarcasterUsernameFromFid(body.fid);
        
        if (farcasterUsername) {
            console.log(`Using Farcaster username "${farcasterUsername}" for FID ${body.fid}`);
            return NextResponse.json({
                success: true,
                fetchedUsername: farcasterUsername,
                message: 'Farcaster username fetched successfully'
            });
        } else {
            console.log(`No Farcaster username found for FID ${body.fid}, using fallback`);
            return NextResponse.json({
                success: true,
                fetchedUsername: body.fallbackUsername || null,
                message: 'No Farcaster username found, using fallback'
            });
        }

    } catch (error) {
        console.error('Error fetching username:', error);

        return NextResponse.json({
            error: 'Failed to fetch username',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
