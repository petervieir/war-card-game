"use client";

import { useEffect, useState } from "react";

import { Connect } from "@stacks/connect-react";

import ConnectWallet, { userSession } from "../components/ConnectWallet";
import ContractCallVote from "../components/ContractCallVote";
import { WarGame } from "@/features/war/WarGame";

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const origin = globalThis.location?.origin ?? "";

  return (
    <Connect
      authOptions={{
        appDetails: {
          name: "War Card Game",
          icon: origin + "/next.svg",
        },
        redirectTo: "/",
        onFinish: () => {
          globalThis.location?.reload();
        },
        userSession,
      }}
    >
      <main>
        <WarGame />

        <details style={{ maxWidth: 560, margin: "0 auto 24px", padding: "0 16px" }}>
          <summary style={{ cursor: "pointer", padding: "12px 0" }}>
            Wallet (optional)
          </summary>
          <div style={{ paddingBottom: 12 }}>
            <ConnectWallet />
            <ContractCallVote />
          </div>
        </details>
      </main>
    </Connect>
  );
}
