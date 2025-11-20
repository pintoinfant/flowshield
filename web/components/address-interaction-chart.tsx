"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  TrendingUp,
  Activity,
  Clock,
  Coins
} from "lucide-react";
import { UserAnalytics, AddressInteraction } from "@/lib/analytics-evm";
import { config } from "@/lib/config";

interface AddressInteractionChartProps {
  analytics: UserAnalytics;
  privacyMode: boolean;
}

export function AddressInteractionChart({ analytics, privacyMode }: AddressInteractionChartProps) {
  const { walletStats } = analytics;

  const formatAddress = (address: string) => {
    if (privacyMode && address !== config.contractAddress && address !== config.tokenAddress) {
      return "••••••••••••";
    }
    if (address.length > 20) {
      return `${address.slice(0, 8)}...${address.slice(-6)}`;
    }
    return address;
  };

  const formatValue = (value: number) => {
    if (privacyMode) {
      return "••••";
    }
    return value.toFixed(2);
  };

  const getAddressLabel = (address: string) => {
    if (address === config.contractAddress) return "FlowShield Contract";
    if (address === config.tokenAddress) return `${config.tokenSymbol} Token`;
    return "Contract";
  };

  const openInExplorer = (address: string) => {
    if (privacyMode) return;
    
    const explorerUrl = `https://sepolia-optimism.etherscan.io/address/${address}`;
    window.open(explorerUrl, '_blank');
  };

  // Use mock interactions from analytics
  const mockInteractions: AddressInteraction[] = walletStats.topInteractions;

  return (
    <div className="space-y-6">
      {/* Privacy Notice */}
      {privacyMode && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <EyeOff className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-primary">Privacy Mode Active</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Address interactions are anonymized. Only FlowShield and USDC contract interactions are shown.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Interactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Address Interactions
            {privacyMode && <EyeOff className="w-4 h-4 text-muted-foreground" />}
          </CardTitle>
          <CardDescription>
            {privacyMode 
              ? "FlowShield and USDC contract interactions only"
              : "Addresses you interact with most frequently"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockInteractions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No interactions found</p>
                <p className="text-sm">Start using FlowShield to see your interaction patterns</p>
              </div>
            ) : (
              mockInteractions.map((interaction, index) => (
                <div 
                  key={interaction.address}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                      <span className="text-sm font-bold text-primary">
                        #{index + 1}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {interaction.label || getAddressLabel(interaction.address)}
                        </Badge>
                        {interaction.address === config.contractAddress && (
                          <Badge variant="default" className="text-xs bg-primary">
                            FlowShield
                          </Badge>
                        )}
                        {interaction.address === config.tokenAddress && (
                          <Badge variant="secondary" className="text-xs">
                            {config.tokenSymbol}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="font-mono text-sm text-muted-foreground truncate">
                        {formatAddress(interaction.address)}
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          {interaction.transactionCount} transactions
                        </div>
                        <div className="flex items-center gap-1">
                          <Coins className="w-3 h-3" />
                          {formatValue(interaction.totalValue)} USDC
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(interaction.lastInteraction).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Interaction strength indicator */}
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-sm font-semibold">
                        {interaction.transactionCount}
                      </div>
                      <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ 
                            width: `${Math.min(100, (interaction.transactionCount / Math.max(...mockInteractions.map(i => i.transactionCount))) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>

                    {!privacyMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openInExplorer(interaction.address)}
                        className="h-8 w-8 p-0"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interaction Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {privacyMode ? "••" : walletStats.uniqueAddresses}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique addresses interacted with
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Most Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono truncate">
              {mockInteractions.length > 0 
                ? formatAddress(mockInteractions[0].address)
                : "No data"
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Highest transaction count
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">FlowShield Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {analytics.privacyStats.totalDeposits}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Privacy transactions made
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Interaction Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Interaction Patterns
          </CardTitle>
          <CardDescription>
            Analysis of your transaction behavior (privacy-safe metrics)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Privacy vs Public transactions */}
            <div>
              <h4 className="font-medium mb-3">Transaction Type Distribution</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-sm">FlowShield (Private)</span>
                  </div>
                  <div className="text-sm font-medium">
                    {analytics.privacyStats.totalDeposits} transactions
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-secondary rounded-full"></div>
                    <span className="text-sm">Regular Transactions</span>
                  </div>
                  <div className="text-sm font-medium">
                    {privacyMode ? "••" : Math.max(0, walletStats.totalTransactions - analytics.privacyStats.totalDeposits)} transactions
                  </div>
                </div>
              </div>
            </div>

            {/* Activity level */}
            <div>
              <h4 className="font-medium mb-3">Activity Level</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Privacy Score</span>
                  <Badge variant="outline" className="text-primary border-primary/20">
                    {analytics.privacyStats.privacyScore}/100
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Activity</span>
                  <span className="text-sm text-muted-foreground">
                    {analytics.privacyStats.daysSinceLastActivity} days ago
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Transaction Value</span>
                  <span className="text-sm text-muted-foreground">
                    {privacyMode ? "••••" : formatValue(walletStats.averageTransactionValue)} USDC
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
