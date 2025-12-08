import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const jupiterUrl = `https://quote-api.jup.ag/v6/quote?${searchParams.toString()}`;

    try {
        const response = await fetch(jupiterUrl);
        const data = await response.json();

        return NextResponse.json(data, {
            status: response.status,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
        });
    } catch (error) {
        console.error("Error fetching from Jupiter API:", error);
        return NextResponse.json(
            { error: "Failed to fetch quote" },
            { status: 500 }
        );
    }
}
