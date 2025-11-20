"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Shield, 
  ExternalLink,
  Search,
  Filter,
  ChevronDown,
  Eye,
  EyeOff
} from "lucide-react";
import { TransactionData, fetchTransactionHistory } from "@/lib/analytics-evm";

interface TransactionHistoryTableProps {
  address: string;
  privacyMode: boolean;
}

export function TransactionHistoryTable({ address, privacyMode }: TransactionHistoryTableProps) {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, [address]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, typeFilter, privacyMode]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const txns = await fetchTransactionHistory(address, showMore ? 100 : 20);
      setTransactions(txns);
    } catch (error) {
      console.error("Failed to load transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    // Apply privacy mode filtering
    if (privacyMode) {
      // In privacy mode, show FlowShield transactions but hide sensitive details
      filtered = filtered.map(tx => ({
        ...tx,
        counterparty: tx.isFlowShield ? "Hidden for privacy" : tx.counterparty,
        hash: tx.isFlowShield ? tx.hash : `${tx.hash.slice(0, 8)}...`
      }));
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (typeFilter !== "all") {
      if (typeFilter === "flowshield") {
        filtered = filtered.filter(tx => tx.isFlowShield);
      } else {
        filtered = filtered.filter(tx => tx.type === typeFilter);
      }
    }

    setFilteredTransactions(filtered);
  };

  const getTransactionIcon = (tx: TransactionData) => {
    if (tx.isFlowShield) {
      return <Shield className="w-4 h-4 text-primary" />;
    }
    
    switch (tx.type) {
      case 'deposit':
        return <ArrowDownRight className="w-4 h-4 text-green-500" />;
      case 'withdraw':
        return <ArrowUpRight className="w-4 h-4 text-blue-500" />;
      case 'transfer':
        return <ArrowUpRight className="w-4 h-4 text-orange-500" />;
      default:
        return <ArrowUpRight className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTransactionBadge = (tx: TransactionData) => {
    if (tx.isFlowShield) {
      return (
        <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
          FlowShield
        </Badge>
      );
    }

    const colors = {
      deposit: "bg-green-100 text-green-800 border-green-200",
      withdraw: "bg-blue-100 text-blue-800 border-blue-200", 
      transfer: "bg-orange-100 text-orange-800 border-orange-200",
      other: "bg-gray-100 text-gray-800 border-gray-200"
    };

    return (
      <Badge variant="outline" className={colors[tx.type] || colors.other}>
        {tx.type}
      </Badge>
    );
  };

  const formatAmount = (amount: number, isPrivate: boolean = false) => {
    if (isPrivate && privacyMode) {
      return "••••";
    }
    return amount > 0 ? `${amount.toFixed(2)} USDC` : "-";
  };

  const formatAddress = (address: string | undefined) => {
    if (!address || address === "Hidden" || address === "Hidden for privacy") {
      return address || "-";
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const openInExplorer = (hash: string) => {
    if (hash.includes("...") || hash === "Hidden for privacy") return;
    
    const explorerUrl = `https://sepolia-optimism.etherscan.io/tx/${hash}`;
    window.open(explorerUrl, '_blank');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Loading your recent transactions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Transaction History
          {privacyMode && <EyeOff className="w-4 h-4 text-muted-foreground" />}
        </CardTitle>
        <CardDescription>
          {privacyMode 
            ? "Your recent transactions with privacy protections enabled"
            : "Your complete transaction history"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="flowshield">FlowShield Only</SelectItem>
              <SelectItem value="deposit">Deposits</SelectItem>
              <SelectItem value="withdraw">Withdrawals</SelectItem>
              <SelectItem value="transfer">Transfers</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Privacy Notice */}
        {privacyMode && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-primary">
              <Eye className="w-4 h-4" />
              Privacy mode is active - sensitive transaction details are hidden
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Counterparty</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No transactions found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.slice(0, showMore ? 100 : 10).map((tx) => (
                  <TableRow key={tx.hash} className="hover:bg-muted/50">
                    <TableCell>
                      {getTransactionIcon(tx)}
                    </TableCell>
                    <TableCell>
                      {getTransactionBadge(tx)}
                    </TableCell>
                    <TableCell className="font-mono">
                      {formatAmount(tx.amount, !tx.isFlowShield)}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {formatAddress(tx.counterparty)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(tx.timestamp).toLocaleDateString()} {new Date(tx.timestamp).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={tx.success ? "default" : "destructive"}>
                        {tx.success ? "Success" : "Failed"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openInExplorer(tx.hash)}
                        className="h-8 w-8 p-0"
                        disabled={tx.hash.includes("...") || privacyMode}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Load More Button */}
        {filteredTransactions.length > 10 && (
          <div className="flex justify-center mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowMore(!showMore);
                if (!showMore) {
                  loadTransactions();
                }
              }}
              className="gap-2"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${showMore ? 'rotate-180' : ''}`} />
              {showMore ? 'Show Less' : 'Load More Transactions'}
            </Button>
          </div>
        )}

        {/* Summary */}
        <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {filteredTransactions.filter(tx => tx.isFlowShield).length}
              </div>
              <div className="text-sm text-muted-foreground">FlowShield</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {filteredTransactions.filter(tx => tx.type === 'deposit').length}
              </div>
              <div className="text-sm text-muted-foreground">Deposits</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {filteredTransactions.filter(tx => tx.type === 'withdraw').length}
              </div>
              <div className="text-sm text-muted-foreground">Withdrawals</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {filteredTransactions.filter(tx => tx.success).length}
              </div>
              <div className="text-sm text-muted-foreground">Successful</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
