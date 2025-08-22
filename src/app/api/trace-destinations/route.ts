import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Configuration
const API_URL = "https://api.basescan.org/api";
const API_KEY = process.env.BASESCAN_API_KEY;
const USDC_CONTRACT = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // USDC contract on Base

/**
 * Traces all addresses that a given address has sent USDC to
 * @param {string} address - The address to trace
 * @returns {Promise<Array<string>>} Array of destination addresses
 */
async function traceUsdcDestinations(address: string): Promise<string[]> {
  const params = {
    module: "account",
    action: "tokentx",
    contractaddress: USDC_CONTRACT,
    address: address,
    startblock: 0,
    endblock: 99999999,
    sort: "desc",
    apikey: API_KEY,
  };

  try {
    console.log(`Tracing USDC destinations for address: ${address}`);
    
    const response = await axios.get(API_URL, { params, timeout: 30000 });
    const data = response.data;

    if (data.status === "1" && Array.isArray(data.result)) {
      // Filter for transfers where this address was the sender
      const sentTransfers = data.result.filter(
        (tx: { from: string; to: string }) => tx.from.toLowerCase() === address.toLowerCase()
      );

      // Extract unique destination addresses
      const destinations = new Set<string>();
      for (const transfer of sentTransfers) {
        destinations.add(transfer.to);
      }

      const destinationArray = Array.from(destinations);
      console.log(`Found ${destinationArray.length} unique destinations`);
      
      return destinationArray;
    } else {
      console.log(`Failed to fetch transfers: ${data.message || "Unknown error"}`);
      return [];
    }
  } catch (error: unknown) {
    console.error(`Error tracing destinations: ${error instanceof Error ? error.message : "Unknown error"}`);
    return [];
  }
}

export async function POST(request: NextRequest) {
  const { address } = await request.json();

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  // Validate address format
  if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
    return NextResponse.json({ error: "Invalid Ethereum address format" }, { status: 400 });
  }

  try {
    const destinations = await traceUsdcDestinations(address);
    
    return NextResponse.json({
      success: true,
      address: address.toLowerCase(),
      destinations: destinations.map(addr => addr.toLowerCase()),
      count: destinations.length
    });
  } catch (error: unknown) {
    console.error("Error in trace-destinations API:", error);
    return NextResponse.json({ 
      error: "Failed to trace USDC destinations",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

