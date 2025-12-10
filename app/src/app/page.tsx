import { Navbar } from "@/components/Navbar";
import { SwapCard } from "@/components/SwapCard";
import { WalletContextProvider } from "@/components/WalletContextProvider";

export default function Home() {
  return (
    <WalletContextProvider>
      <main className="min-h-screen text-foreground">
        <Navbar />
        <div className="container mx-auto pt-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
              Trade at the Best Rates
            </h1>
            <p className="text-xl text-muted-foreground">
              Aggregating liquidity from Raydium, Orca, and Serum
            </p>
          </div>
          <SwapCard />
        </div>
      </main>
    </WalletContextProvider>
  );
}
