"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const WalletMultiButton = dynamic(
    async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
    { ssr: false }
);

export const Navbar = () => {
    return (
        <nav className="flex items-center justify-between p-4 bg-background/60 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-gradient-to-br from-purple-600 to-cyan-600 p-2 rounded-xl group-hover:scale-105 transition-transform">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
                        dex.sol
                    </span>
                </Link>
                <div className="flex gap-4">
                    <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !rounded-xl !font-bold !px-6 !py-3 !h-auto transition-all hover:scale-105" />
                </div>
            </div>
        </nav>
    );
};
