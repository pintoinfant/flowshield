"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Activity, 
  Shield, 
  TrendingUp, 
  Users, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Eye,
  EyeOff,
  Download
} from "lucide-react";
import { Header } from "@/components/header";
import { TransactionHistoryTable } from "@/components/transaction-history-table";
import { PrivacyMetricsCard } from "@/components/privacy-metrics-card";
import { AddressInteractionChart } from "@/components/address-interaction-chart";
import { ActivityTimelineChart } from "@/components/activity-timeline-chart";
import { fetchUserAnalytics, UserAnalytics } from "@/lib/analytics-evm";

export default function AnalyticsPage() {
  const { address, isConnected } = useAccount();
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      loadAnalytics();
    }
  }, [isConnected, address]);

  const loadAnalytics = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const data = await fetchUserAnalytics(address);
      setAnalytics(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!analytics) return;

    const exportData = {
      address: address,
      exportDate: new Date().toISOString(),
      privacyStats: analytics.privacyStats,
      walletStats: privacyMode ? "Hidden for privacy" : analytics.walletStats,
      note: "FlowShield Analytics Export - Private data may be hidden"
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowshield-analytics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container max-w-6xl mx-auto px-4 py-24">
          <Card className="max-w-md mx-auto text-center">
            <CardHeader>
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Activity className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>
                Connect your wallet to view your personal analytics and transaction insights.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (loading || !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <Header />
        <div className="container max-w-6xl mx-auto px-4 py-24">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Header />
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Your FlowShield usage insights and wallet analytics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPrivacyMode(!privacyMode)}
              className="gap-2"
            >
              {privacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {privacyMode ? "Privacy Mode" : "Full View"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Privacy Notice */}
        {privacyMode && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-primary">Privacy Mode Active</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sensitive transaction details are hidden. Only FlowShield usage stats and anonymized data are shown.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">FlowShield Deposits</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.privacyStats.totalDeposits}</div>
              <p className="text-xs text-muted-foreground">
                +{analytics.privacyStats.depositsThisMonth} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">USDC Mixed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.privacyStats.totalMixed.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Total USDC through FlowShield
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Privacy Score</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.privacyStats.privacyScore}/100</div>
              <p className="text-xs text-muted-foreground">
                Overall privacy rating
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.privacyStats.daysSinceLastActivity}d</div>
              <p className="text-xs text-muted-foreground">
                Days since last FlowShield use
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="privacy" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="privacy">Privacy Metrics</TabsTrigger>
            <TabsTrigger value="transactions">Transaction History</TabsTrigger>
            <TabsTrigger value="interactions">Address Interactions</TabsTrigger>
            <TabsTrigger value="timeline">Activity Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="privacy" className="space-y-6">
            <PrivacyMetricsCard analytics={analytics} />
            
            <Card>
              <CardHeader>
                <CardTitle>Pool Usage Distribution</CardTitle>
                <CardDescription>
                  Your preferred FlowShield pool denominations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.privacyStats.poolUsage.map((pool) => (
                    <div key={pool.denomination} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{pool.denomination} USDC</Badge>
                        <span className="text-sm text-muted-foreground">
                          {pool.count} deposits
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${pool.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {pool.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionHistoryTable 
              address={address || ""} 
              privacyMode={privacyMode}
            />
          </TabsContent>

          <TabsContent value="interactions">
            <AddressInteractionChart 
              analytics={analytics}
              privacyMode={privacyMode}
            />
          </TabsContent>

          <TabsContent value="timeline">
            <ActivityTimelineChart 
              analytics={analytics}
              privacyMode={privacyMode}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
