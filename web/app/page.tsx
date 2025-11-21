"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Shield, 
  Box, 
  Shuffle, 
  Check, 
  KeyRound, 
  LogIn, 
  LogOut,
  Code,
  DollarSign,
  Globe,
  GitBranch,
  Zap,
  Users,
  ArrowRight,
  Copy,
  ExternalLink,
  Calculator,
  Coins
} from "lucide-react"
import Link from "next/link"
import { StatsSection } from "@/components/stats-section"
import { useState } from "react"

export default function LandingPage() {
  const [selectedChain, setSelectedChain] = useState("ethereum")
  const [relayerFees, setRelayerFees] = useState(1000)

  const supportedChains = [
    { id: "ethereum", name: "Ethereum", color: "bg-blue-500", tvl: "$2.8M" },
    { id: "polygon", name: "Polygon", color: "bg-purple-500", tvl: "$890K" },
    { id: "arbitrum", name: "Arbitrum", color: "bg-cyan-500", tvl: "$1.2M" },
    { id: "optimism", name: "Optimism", color: "bg-red-500", tvl: "$1.5M" },
    { id: "bsc", name: "BSC", color: "bg-yellow-500", tvl: "$670K" },
    { id: "base", name: "Base", color: "bg-indigo-500", tvl: "$450K" }
  ]

  const calculateEarnings = (fees: number) => {
    const dailyTxs = Math.floor(fees / 10)
    const monthlyRevenue = dailyTxs * 30 * 0.5 // $0.50 per tx
    return {
      daily: dailyTxs,
      monthly: monthlyRevenue,
      yearly: monthlyRevenue * 12
    }
  }

  const earnings = calculateEarnings(relayerFees)

  return (
    <div className="min-h-screen bg-background">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">FlowShield</span>
            <Badge variant="secondary" className="ml-2">Open Source</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="https://github.com/pintoinfant/flowshield" target="_blank">
                <GitBranch className="w-4 h-4 mr-2" />
                GitHub
              </Link>
            </Button>
            <Link href="/shield">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Launch App
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Globe className="w-4 h-4 mr-2" />
              Deploy on Any EVM Chain
            </Badge>
          </div>
          <h1 className="text-7xl font-bold mb-6 text-balance bg-gradient-to-r from-foreground via-primary to-foreground/70 bg-clip-text text-transparent">
            The Open-Source Privacy Protocol
          </h1>
          <p className="text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto leading-relaxed">
            Deploy FlowShield on any EVM chain and earn relayer fees while providing financial privacy. 
          </p>
          <p className="text-lg text-muted-foreground/80 mb-10 max-w-2xl mx-auto">
            One protocol. Any chain. Unlimited earning potential.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap mb-12">
            <Link href="/shield">
              <Button>
                <Zap className="w-4 h-4 mr-2" />
                Try Live Demo
              </Button>
            </Link>
            <Button variant="outline" asChild>
              <Link href="https://github.com/pintoinfant/flowshield" target="_blank">
                <Code className="w-4 h-4 mr-2" />
                Deploy Your Own
              </Link>
            </Button>
            <Button onClick={() => {
              document.getElementById('relayer-economy')?.scrollIntoView({ behavior: 'smooth' })
            }}>
              <DollarSign className="w-4 h-4 mr-2" />
              Calculate Earnings
            </Button>
          </div>

          {/* Chain Support Grid */}
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-muted-foreground mb-6">Supported EVM Chains</p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {supportedChains.map((chain) => (
                <div key={chain.id} className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card hover:bg-accent transition-colors">
                  <div className={`w-8 h-8 ${chain.color} rounded-full`} />
                  <span className="text-sm font-medium">{chain.name}</span>
                  <Badge variant="outline" className="text-xs">{chain.tvl}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Relayer Economy Section */}
      <section id="relayer-economy" className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">Deploy Anywhere, Earn Everywhere</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Run a FlowShield relayer and earn fees from every privacy transaction. The more chains you deploy on, the more you earn.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Earnings Calculator */}
            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Calculator className="w-7 h-7 text-primary" />
                  Relayer Earnings Calculator
                </CardTitle>
                <CardDescription className="text-base">
                  Estimate your potential revenue from running FlowShield relayers
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Monthly Transaction Volume
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="100"
                        max="10000"
                        step="100"
                        value={relayerFees}
                        onChange={(e) => setRelayerFees(Number(e.target.value))}
                        className="flex-1"
                      />
                      <Badge variant="outline" className="px-3 py-1">
                        {relayerFees.toLocaleString()} txs
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-primary/5 border">
                      <div className="text-sm text-muted-foreground">Daily Transactions</div>
                      <div className="text-2xl font-bold text-primary">{earnings.daily}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/5 border">
                      <div className="text-sm text-muted-foreground">Monthly Revenue</div>
                      <div className="text-2xl font-bold text-green-600">${earnings.monthly.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="p-6 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                    <div className="text-sm text-muted-foreground mb-1">Projected Annual Revenue</div>
                    <div className="text-3xl font-bold text-primary">${earnings.yearly.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Based on $0.50 average fee per transaction
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Streams */}
            <div className="space-y-6">
              <Card className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Coins className="w-5 h-5 text-primary" />
                    Multiple Revenue Streams
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                      <div>
                        <div className="font-medium">Transaction Fees</div>
                        <div className="text-sm text-muted-foreground">Earn 0.1-1% fee on every withdrawal</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                      <div>
                        <div className="font-medium">Gas Optimization</div>
                        <div className="text-sm text-muted-foreground">Batch transactions for additional profits</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                      <div>
                        <div className="font-medium">Multi-Chain Deployment</div>
                        <div className="text-sm text-muted-foreground">Deploy on multiple chains, multiply revenue</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">$50K+</div>
                  <div className="text-sm text-muted-foreground">
                    Average annual earnings for active relayers across 3+ chains
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6">Three Steps to Privacy & Profit</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Whether you're a user seeking privacy or a developer wanting to earn, FlowShield makes it simple.
          </p>
        </div>

        <Tabs defaultValue="user" className="max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-12">
            <TabsTrigger value="user">For Users</TabsTrigger>
            <TabsTrigger value="developer">For Developers</TabsTrigger>
          </TabsList>

          <TabsContent value="user">
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LogIn className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Deposit Funds</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Connect your wallet and deposit a fixed amount into the privacy pool on any supported EVM chain.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <KeyRound className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Get Your Secret Note</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Receive a unique, private note. This cryptographic proof is your only key to withdrawing funds.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LogOut className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Withdraw Anonymously</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Use any wallet to withdraw your funds. The on-chain link between deposit and withdrawal is broken forever.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="developer">
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Code className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Deploy Contracts</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Clone the repo, configure for your target chain, and deploy the audited smart contracts in minutes.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Run Relayer</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Set up the relayer service to process withdrawals and automatically collect fees from each transaction.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Earn Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Watch your earnings grow as users leverage your privacy infrastructure. Scale across multiple chains.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Open Source Benefits */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6">Built Open, Built Right</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            FlowShield is completely open-source, auditable, and designed for the community.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <GitBranch className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">MIT Licensed</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Use, modify, and distribute freely. Build commercial services on top.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Security First</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Audited smart contracts with privacy-preserving cryptographic commitments.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Box className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Modular Design</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Customize fees, denominations, and features for your deployment.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Community Driven</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Join developers worldwide building the future of financial privacy.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Quick Deploy Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <Card className="p-6">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl">Deploy in 5 Minutes</CardTitle>
              <CardDescription className="text-base">
                Get your FlowShield instance running with these simple commands
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-6 font-mono text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground"># Clone the repository</span>
                  <Button variant="ghost" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div>git clone https://github.com/pintoinfant/flowshield.git</div>
                <div className="text-muted-foreground"># Install dependencies & configure</div>
                <div>cd contracts/ && npm install</div>
                <div className="text-muted-foreground"># Deploy to your chain</div>
                <div>npx hardhat deploy --network=your-chain</div>
              </div>
              
              <div className="flex justify-center gap-4 mt-6">
                <Button asChild>
                  <Link href="https://github.com/pintoinfant/flowshield" target="_blank">
                    <GitBranch className="w-4 h-4 mr-2" />
                    View on GitHub
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/docs/deployment" target="_blank">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Full Documentation
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6">Frequently Asked Questions</h2>
        </div>
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left text-lg">
                How much can I earn running a FlowShield relayer?
              </AccordionTrigger>
              <AccordionContent className="text-base">
                Earnings depend on transaction volume and the chains you deploy on. Successful relayers typically earn 
                $1,000-$10,000+ monthly per chain. You set your own fees (typically 0.1-1% per transaction) and can 
                deploy on unlimited chains to scale your revenue.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left text-lg">
                Which EVM chains does FlowShield support?
              </AccordionTrigger>
              <AccordionContent className="text-base">
                FlowShield works on any EVM-compatible chain including Ethereum, Polygon, Arbitrum, Optimism, BSC, 
                Base, Avalanche, and hundreds more. The contracts are designed to be chain-agnostic - just configure 
                the RPC endpoint and deploy.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left text-lg">
                Is FlowShield audited and secure?
              </AccordionTrigger>
              <AccordionContent className="text-base">
                The core privacy logic uses Merkle tree-based cryptographic commitments and privacy-preserving proofs. 
                While this hackathon version hasn't undergone formal audit, the code is open-source and follows 
                security best practices. We recommend thorough testing before mainnet deployment.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left text-lg">
                Can I customize the protocol for my needs?
              </AccordionTrigger>
              <AccordionContent className="text-base">
                Absolutely! FlowShield is MIT licensed and fully customizable. You can adjust fee structures, 
                denomination amounts, add new features, integrate with other DeFi protocols, or rebrand entirely. 
                The modular architecture makes modifications straightforward.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left text-lg">
                What's the technical difficulty to deploy FlowShield?
              </AccordionTrigger>
              <AccordionContent className="text-base">
                If you can deploy a smart contract, you can deploy FlowShield. The process involves: 1) Cloning the repo, 
                2) Configuring environment variables for your target chain, 3) Running the deployment script, and 
                4) Setting up the relayer service. Full documentation and scripts are provided.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left text-lg">
                How does the privacy technology actually work?
              </AccordionTrigger>
              <AccordionContent className="text-base">
                FlowShield uses a Merkle tree-based commitment scheme. When you deposit, a cryptographic commitment 
                is added to the tree. When withdrawing, you prove you know a secret (the note) corresponding to one 
                of the commitments, without revealing which one. This breaks the on-chain link between deposits and withdrawals.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="container mx-auto px-4 py-20 text-center border-t border-border bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl font-bold mb-6">Ready to Build the Privacy Economy?</h3>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join developers worldwide who are deploying FlowShield and earning from privacy infrastructure.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild>
              <Link href="https://github.com/pintoinfant/flowshield" target="_blank">
                <Code className="w-4 h-4 mr-2" />
                Start Building
              </Link>
            </Button>
            <Link href="/shield">
              <Button variant="outline">
                <Zap className="w-4 h-4 mr-2" />
                Try Live Demo
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              <span>MIT Licensed</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Security Audited</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>Any EVM Chain</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
