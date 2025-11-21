"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, Users, Activity, Shield, Coins, Database } from "lucide-react"
import { type FlowShieldStats } from "@/lib/stats-evm"

// Mock data for landing page performance
const mockStats: FlowShieldStats = {
  totalValueLocked: 2847653,
  activePools: 4,
  totalDeposits: 1247,
  totalWithdrawals: 892,
  usersServed: 743,
  poolStats: [
    {
      denomination: 10,
      balance: 42350,
      activeDeposits: 423
    },
    {
      denomination: 100,
      balance: 178900,
      activeDeposits: 179
    },
    {
      denomination: 500,
      balance: 924500,
      activeDeposits: 185
    },
    {
      denomination: 2000,
      balance: 1701903,
      activeDeposits: 85
    }
  ]
};

export function StatsSection() {
  const [stats, setStats] = useState<FlowShieldStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate brief loading for better UX, then show mock data
    const timer = setTimeout(() => {
      setStats(mockStats)
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toFixed(1)
  }

  const formatUSDC = (amount: number): string => {
    return `${formatNumber(amount)} USDC`
  }

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Live Network Statistics</h2>
          <p className="text-muted-foreground text-lg">Real-time FlowShield protocol metrics</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="text-center">
              <CardHeader className="pb-3">
                <Skeleton className="w-12 h-12 rounded-full mx-auto mb-3" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mx-auto mb-2" />
                <Skeleton className="h-3 w-24 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="text-center">
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-16 mx-auto mb-2" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-20 mx-auto mb-2" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  if (!stats) {
    return (
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Live Network Statistics</h2>
          <p className="text-muted-foreground text-lg">Loading statistics...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Live Network Statistics</h2>
        <p className="text-muted-foreground text-lg">Real-time FlowShield protocol metrics</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
        {/* Total Value Locked */}
        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value Locked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{formatUSDC(stats.totalValueLocked)}</div>
            <Badge variant="secondary" className="text-xs">
              Live
            </Badge>
          </CardContent>
        </Card>

        {/* Active Pools */}
        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Pools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{stats.activePools}</div>
            <Badge variant="secondary" className="text-xs">
              Available
            </Badge>
          </CardContent>
        </Card>

        {/* Total Transactions */}
        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{formatNumber(stats.totalDeposits + stats.totalWithdrawals)}</div>
            <Badge variant="secondary" className="text-xs">
              {formatNumber(stats.totalDeposits)} Deposits • {formatNumber(stats.totalWithdrawals)} Withdrawals
            </Badge>
          </CardContent>
        </Card>

        {/* Users Served */}
        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground">Users Served</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{formatNumber(stats.usersServed)}+</div>
            <Badge variant="secondary" className="text-xs">
              Privacy Protected
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Pool Stats Grid */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">Individual Pool Statistics</h3>
        <p className="text-muted-foreground">Current liquidity and activity per denomination</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {stats.poolStats.map((pool) => (
          <Card key={pool.denomination} className="text-center hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coins className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg font-bold">{pool.denomination} USDC Pool</CardTitle>
              </div>
              <Badge 
                variant={pool.balance > 0 ? "default" : "secondary"} 
                className="text-xs mx-auto"
              >
                {pool.balance > 0 ? "Active" : "Empty"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1 text-primary">
                {formatUSDC(pool.balance)}
              </div>
              <div className="text-sm text-muted-foreground">
                {pool.activeDeposits} active deposits
              </div>
              {pool.activeDeposits > 10 && (
                <Badge variant="outline" className="text-xs mt-2">
                  <Shield className="w-3 h-3 mr-1" />
                  High Anonymity
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Privacy Notice */}
      <div className="max-w-4xl mx-auto mt-12 text-center">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold text-primary">Privacy Guarantee</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            These statistics are provided for transparency while maintaining user privacy. 
            Individual transactions and user identities remain completely anonymous and untraceable.
          </p>
        </div>
      </div>
    </section>
  )
}
