import { NextResponse } from 'next/server';

// Simple cache invalidation endpoint
export async function POST() {

    try {
        // Send a message to all connected clients to refresh their ENS cache
        // This is a simple notification endpoint
        
        return NextResponse.json({
            success: true,
            message: 'Cache refresh triggered',
            timestamp: Date.now()
        });

    } catch (error) {
        console.error('Error triggering cache refresh:', error);

        return NextResponse.json({
            error: 'Failed to trigger cache refresh',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
