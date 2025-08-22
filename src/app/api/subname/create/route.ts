import { NextRequest, NextResponse } from 'next/server';
import { ChainName } from "@thenamespace/offchain-manager";
import client from "~/lib/namespace";

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
interface CreateSubnameRequest {
    label: string;
    address: string;
            farcasterData?: {
            fid: number;
            username: string;
            displayName: string;
            pfpUrl: string;
            walletAddress: string;
            context: Record<string, unknown>;
        };
}

export async function POST(request: NextRequest) {

    console.log("CALLED CREATE");
    try {
        const body: CreateSubnameRequest = await request.json();

        // Validate required fields
        if (!body.label || !body.address) {
            return NextResponse.json({
                error: 'Missing required fields: label and address are required'
            }, { status: 400 });
        }
        console.log("BODY", body);

        // Try to get Farcaster username from FID if available
        let finalLabel = body.label.toLowerCase().trim();
        let fetchedUsername = null;
        if (body.farcasterData?.fid) {
            const farcasterUsername = await fetchFarcasterUsernameFromFid(body.farcasterData.fid);
            if (farcasterUsername) {
                finalLabel = farcasterUsername.toLowerCase().trim();
                fetchedUsername = farcasterUsername;
                console.log(`Using Farcaster username "${farcasterUsername}" for FID ${body.farcasterData.fid}`);
            } else {
                console.log(`No Farcaster username found for FID ${body.farcasterData.fid}, using username "${body.label}"`);
            }
        }

        const normalizedAddress = body.address.toLowerCase().trim();
        const fullSubname = `${finalLabel}.deptofagri.eth`;

        // Prevent creating subnames for the zero address
        if (normalizedAddress === "0x0000000000000000000000000000000000000000") {
            return NextResponse.json({
                error: 'Cannot create subname for zero address'
            }, { status: 400 });
        }

        // Validate label format
        if (!/^[a-z0-9]{3,63}$/.test(finalLabel)) {
            return NextResponse.json({
                error: 'Label must be 3-63 characters long and contain only lowercase letters and numbers'
            }, { status: 400 });
        }

        // Check if the exact subname already exists using direct availability check
        try {
            const isAvailable = await client.isSubnameAvailable(fullSubname);
            if (!isAvailable) {
                return NextResponse.json({
                    error: 'Subname with this label already exists',
                    existing: fullSubname
                }, { status: 409 });
            }
        } catch (availabilityError) {
            console.error('Error checking subname availability:', availabilityError);
            return NextResponse.json({
                error: 'Failed to check subname availability',
                details: availabilityError instanceof Error ? availabilityError.message : 'Unknown error'
            }, { status: 500 });
        }

        // Check if this address already has a subname using metadata search
        const existingAddressCheck = await client.getFilteredSubnames({
            parentName: "deptofagri.eth",
            metadata: { "sender": normalizedAddress },
            size: 1
        });

        if (existingAddressCheck?.items && existingAddressCheck.items.length > 0) {
            const existingSubname = existingAddressCheck.items[0];
            if (existingSubname?.fullName) {
                return NextResponse.json({
                    error: 'Address already has a subname',
                    existing: existingSubname.fullName
                }, { status: 409 });
            }
        }

        // Prepare text records and metadata from Farcaster data
        const texts: { key: string; value: string }[] = [];
        const metadata: { key: string; value: string }[] = [
            { key: "sender", value: normalizedAddress }, 
        ];

        // Add Farcaster data if available
        if (body.farcasterData) {
            const { fid, username, displayName, pfpUrl, walletAddress } = body.farcasterData;
            
            // Add text records for Farcaster data
            texts.push(
                { key: "avatar", value: pfpUrl },
                { key: "name", value: displayName || username },
                { key: "fid", value: fid.toString() },
                { key: "url", value: `https://farcaster.xyz/${username}` },
                { key: "xyz.farcaster", value: username }
            );

            // Add metadata for Farcaster data
            metadata.push(
                { key: "fid", value: fid.toString() },
                { key: "username", value: username },
                { key: "displayName", value: displayName || username },
                { key: "pfpUrl", value: pfpUrl },
                { key: "walletAddress", value: walletAddress },
                { key: "platform", value: "farcaster" },
                { key: "createdAt", value: new Date().toISOString() }
            );
        }

        // Create the subname using normalized values with comprehensive data
        const result = await client.createSubname({
            label: finalLabel,
            parentName: "deptofagri.eth",
            addresses: [{ chain: ChainName.Base, value: normalizedAddress } , { chain: ChainName.Ethereum, value: normalizedAddress }],
            texts: texts,
            metadata: metadata,
            owner: normalizedAddress
        });

        // Trigger cache refresh for leaderboard
        try {
            await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/subname/refresh-cache`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        } catch (refreshError) {
            console.log('Note: Could not trigger cache refresh:', refreshError);
            // Don't fail the creation if refresh fails
        }

        return NextResponse.json({
            success: true,
            data: result,
            message: 'Subname created successfully',
            refreshSignal: true, // Signal frontend to refresh ENS cache
            fetchedUsername: fetchedUsername
        });

    } catch (error) {
        console.error('Error creating subname:', error);

        return NextResponse.json({
            error: 'Failed to create subname',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}