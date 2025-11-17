"use client";

import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider, http } from 'wagmi';
import { optimismSepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactNode } from "react";

const config = getDefaultConfig({
  appName: 'FlowShield',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'flowshield-demo-project-id',
  chains: [optimismSepolia],
  transports: {
    [optimismSepolia.id]: http('https://sepolia.optimism.io'),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: 'hsl(var(--primary))',
            accentColorForeground: 'hsl(var(--primary-foreground))',
            borderRadius: 'medium',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
