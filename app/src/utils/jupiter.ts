import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export interface Quote {
    dex: string;
    rate: number;
    outAmount: number;
    color: string;
}

const JUPITER_API = "/api/jupiter";

// Map our display names to Jupiter DEX labels
const DEX_MAP: Record<string, string[]> = {
    "Raydium": ["Raydium", "Raydium CLMM"],
    "Orca": ["Orca V2", "Whirlpool"], // Whirlpool is Orca V3
    "Serum": ["OpenBook V2"], // Using OpenBook V2 as Serum replacement
};

const DEX_COLORS: Record<string, string> = {
    "Raydium": "text-cyan-400",
    "Orca": "text-yellow-400",
    "Serum": "text-green-400",
};

async function fetchQuoteForDex(
    inputMint: string,
    outputMint: string,
    amount: number, // in UI units (e.g., 1 SOL)
    dexName: string
): Promise<Quote | null> {
    try {
        // Convert amount to atomic units (assuming 9 decimals for SOL/USDC/USDT for simplicity in this demo context, 
        // but ideally we should use token decimals. For now, we'll assume standard 9 or 6. 
        // However, the SwapCard passes raw input. Let's assume input is SOL (9 decimals) for now as per the mock.
        // Wait, the mock used `amount * LAMPORTS_PER_SOL`. 
        // We should probably pass the atomic amount or decimals.
        // Let's stick to the mock's assumption of SOL input for now or handle decimals better.
        // The SwapCard uses `TOKENS` which doesn't have decimals. 
        // Let's assume 9 decimals for SOL and 6 for USDC/USDT to be safe, or just 9 for SOL.
        // Actually, let's just use a safe default of 9 for SOL and 6 for others if we can, 
        // but for this specific task, let's just use the input amount * 10^decimals.

        // Quick fix: Hardcode decimals based on mint for the demo tokens
        let decimals = 9;
        if (inputMint === "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" || // USDC
            inputMint === "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB") { // USDT
            decimals = 6;
        }

        const atomicAmount = Math.floor(amount * Math.pow(10, decimals));

        const dexes = DEX_MAP[dexName].join(",");

        const url = `${JUPITER_API}?inputMint=${inputMint}&outputMint=${outputMint}&amount=${atomicAmount}&dexes=${dexes}&slippageBps=50`;

        const response = await fetch(url);
        if (!response.ok) return null;

        const data = await response.json();
        if (!data.outAmount) return null;

        // Determine output decimals
        let outDecimals = 9;
        if (outputMint === "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" || // USDC
            outputMint === "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB") { // USDT
            outDecimals = 6;
        }

        const outAmountUi = Number(data.outAmount) / Math.pow(10, outDecimals);
        const rate = outAmountUi / amount;

        return {
            dex: dexName,
            rate: rate,
            outAmount: outAmountUi,
            color: DEX_COLORS[dexName],
        };
    } catch (error) {
        console.error(`Error fetching quote for ${dexName}:`, error);
        return null;
    }
}

export async function fetchAllQuotes(
    inputMint: string,
    outputMint: string,
    amount: number
): Promise<Quote[]> {
    const dexes = ["Raydium", "Orca", "Serum"];
    const promises = dexes.map(dex => fetchQuoteForDex(inputMint, outputMint, amount, dex));

    const results = await Promise.all(promises);
    return results.filter((quote): quote is Quote => quote !== null);
}
