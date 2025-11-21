"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { DepositView } from "@/components/deposit-view"
import { WithdrawView } from "@/components/withdraw-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function FlowShieldApp() {
  const [activeTab, setActiveTab] = useState("deposit")

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-balance">FlowShield</h1>
          <p className="text-muted-foreground text-lg">Privacy-preserving transactions on Ethereum blockchain</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-card border border-border">
            <TabsTrigger
              value="deposit"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Deposit
            </TabsTrigger>
            <TabsTrigger
              value="withdraw"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Withdraw
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deposit" className="mt-6">
            <DepositView />
          </TabsContent>

          <TabsContent value="withdraw" className="mt-6">
            <WithdrawView />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
