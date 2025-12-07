"use client";

import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { ArrowDown, Settings, RefreshCw } from "lucide-react";
import { fetchAllQuotes } from "../utils/jupiter";

const TOKENS = [
    { symbol: "SOL", name: "Solana", mint: "So11111111111111111111111111111111111111112" },
    { symbol: "USDC", name: "USD Coin", mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" },
    { symbol: "USDT", name: "Tether", mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB" },
];

export const SwapCard = () => {
    const { connection } = useConnection();
    const { publicKey, signTransaction } = useWallet();
    const [inputToken, setInputToken] = useState(TOKENS[0]);
    const [outputToken, setOutputToken] = useState(TOKENS[1]);
    const [amount, setAmount] = useState("");
    const [slippage, setSlippage] = useState(0.5);
    const [quotes, setQuotes] = useState<any[]>([]);
    const [bestQuote, setBestQuote] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Fetch real quotes
    useEffect(() => {
        if (!amount || isNaN(Number(amount))) {
            setQuotes([]);
            setBestQuote(null);
            return;
        }

        const fetchQuotes = async () => {
            setLoading(true);
            try {
                const inputAmount = Number(amount);
                const newQuotes = await fetchAllQuotes(inputToken.mint, outputToken.mint, inputAmount);

                setQuotes(newQuotes);
                if (newQuotes.length > 0) {
                    setBestQuote(newQuotes.reduce((prev, current) => (prev.outAmount > current.outAmount ? prev : current)));
                } else {
                    setBestQuote(null);
                }
            } catch (error) {
                console.error("Failed to fetch quotes:", error);
                setQuotes([]);
                setBestQuote(null);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchQuotes, 500);
        return () => clearTimeout(debounce);
    }, [amount, inputToken, outputToken]);

    const handleSwap = async () => {
        if (!publicKey || !signTransaction) return;

        try {
            setLoading(true);
            const { Program, AnchorProvider, BN, web3 } = await import("@coral-xyz/anchor");
            const { PublicKey } = await import("@solana/web3.js");
            const idl = await import("../utils/dex.json");

            const provider = new AnchorProvider(
                connection,
                { publicKey, signTransaction, signAllTransactions: async (txs: any[]) => txs },
                { commitment: "processed" }
            );

            const programId = new PublicKey("2ePEtYQZ68aNbYY8trRKuJLCd74JUyaSxsuqUCzhUs3u");
            const program = new Program(idl as any, provider);

            const amountIn = new BN(Number(amount) * LAMPORTS_PER_SOL);
            const minAmountOut = new BN((bestQuote?.outAmount || 0) * LAMPORTS_PER_SOL * (1 - slippage / 100));

            // Mock token accounts (using system program/token program IDs for simulation if needed, 
            // but for this mock instruction we just need valid Pubkeys. 
            // In a real app, these would be the user's ATA addresses).
            // For the mock instruction, we can pass the mints or random keys as "token accounts" 
            // since the contract doesn't actually check token ownership yet, just emits an event.
            const tokenIn = new PublicKey(inputToken.mint);
            const tokenOut = new PublicKey(outputToken.mint);

            const tx = await program.methods
                .swap(amountIn, minAmountOut)
                .accounts({
                    user: publicKey,
                    tokenIn: tokenIn,
                    tokenOut: tokenOut,
                })
                .rpc();

            console.log("Swap transaction:", tx);
            alert(`Swap successful! TX: ${tx}`);
            setAmount("");
        } catch (error) {
            console.error("Swap failed:", error);
            alert("Swap failed! See console for details.");
        } finally {
            setLoading(false);
        }
    };

    const switchTokens = () => {
        const temp = inputToken;
        setInputToken(outputToken);
        setOutputToken(temp);
    };

    return (
        <div className="w-full max-w-md mx-auto bg-card border border-border rounded-2xl p-6 shadow-xl">
            <div className="flex justify-center items-center mb-6">
                <h2 className="text-xl font-semibold">Swap</h2>
                {/* <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                    <Settings size={20} />
                </button> */}
            </div>

            <div className="bg-muted/50 rounded-xl p-4 border border-transparent focus-within:border-primary transition-colors">
                <div className="flex justify-between items-center mb-2">
                    <select
                        value={inputToken.symbol}
                        onChange={(e) => setInputToken(TOKENS.find(t => t.symbol === e.target.value) || TOKENS[0])}
                        className="bg-secondary text-foreground px-3 py-1 rounded-full font-medium outline-none cursor-pointer"
                    >
                        {TOKENS.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
                    </select>
                    <input
                        type="number"
                        placeholder="0.0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-transparent text-right text-2xl font-semibold outline-none w-full ml-4"
                    />
                </div>
                <div className="text-right text-sm text-muted-foreground">Balance: 0.00</div>
            </div>

            <div className="relative h-8 flex items-center justify-center my-4 z-10">
                <div
                    className="bg-card border-4 border-background rounded-full p-2 text-primary shadow-lg cursor-pointer hover:scale-110 transition-transform"
                    onClick={switchTokens}
                >
                    <ArrowDown size={20} />
                </div>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 border border-transparent transition-colors">
                <div className="flex justify-between items-center mb-2">
                    <select
                        value={outputToken.symbol}
                        onChange={(e) => setOutputToken(TOKENS.find(t => t.symbol === e.target.value) || TOKENS[1])}
                        className="bg-secondary text-foreground px-3 py-1 rounded-full font-medium outline-none cursor-pointer"
                    >
                        {TOKENS.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
                    </select>
                    <input
                        type="text"
                        placeholder="0.0"
                        value={bestQuote ? bestQuote.outAmount.toFixed(4) : ""}
                        readOnly
                        className="bg-transparent text-right text-2xl font-semibold outline-none w-full ml-4"
                    />
                </div>
                <div className="text-right text-sm text-muted-foreground">Balance: 0.00</div>
            </div>

            {bestQuote && (
                <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-xl flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Best Route:</span>
                        <span className={`font-bold ${bestQuote.color}`}>{bestQuote.dex}</span>
                    </div>
                    <div className="text-muted-foreground">
                        1 {inputToken.symbol} ≈ {bestQuote.rate.toFixed(2)} {outputToken.symbol}
                    </div>
                </div>
            )}

            <button
                className="w-full mt-6 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                onClick={handleSwap}
                disabled={!publicKey || !amount || loading}
            >
                {loading ? <RefreshCw className="animate-spin" /> : !publicKey ? "Connect Wallet" : "Swap"}
            </button>
        </div>
    );
};
