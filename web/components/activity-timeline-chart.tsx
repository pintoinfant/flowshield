"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Shield,
  Clock,
  Eye,
  EyeOff
} from "lucide-react";
import { UserAnalytics } from "@/lib/analytics-evm";

interface ActivityTimelineChartProps {
  analytics: UserAnalytics;
  privacyMode: boolean;
}

interface TimelineEvent {
  date: string;
  type: 'deposit' | 'withdraw' | 'milestone';
  amount?: number;
  description: string;
  isPrivate?: boolean;
}

export function ActivityTimelineChart({ analytics, privacyMode }: ActivityTimelineChartProps) {
  const { privacyStats, walletStats } = analytics;

  // Generate mock timeline events based on analytics data
  const generateTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    const now = new Date();
    
    // Add FlowShield milestones
    if (privacyStats.totalDeposits > 0) {
      events.push({
        date: new Date(now.getTime() - privacyStats.daysSinceLastActivity * 24 * 60 * 60 * 1000).toISOString(),
        type: 'deposit',
        amount: privacyStats.totalMixed / privacyStats.totalDeposits,
        description: 'Latest FlowShield deposit',
        isPrivate: false
      });
    }

    // Add privacy milestones
    if (privacyStats.totalDeposits >= 5) {
      events.push({
        date: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'milestone',
        description: 'Achieved privacy score above 50',
        isPrivate: false
      });
    }

    if (privacyStats.totalDeposits >= 10) {
      events.push({
        date: new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'milestone',
        description: 'Power user milestone - 10+ deposits',
        isPrivate: false
      });
    }

    // Add some mock regular activity if not in privacy mode
    if (!privacyMode && walletStats.totalTransactions > privacyStats.totalDeposits) {
      for (let i = 0; i < Math.min(5, walletStats.totalTransactions - privacyStats.totalDeposits); i++) {
        events.push({
          date: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          type: Math.random() > 0.5 ? 'deposit' : 'withdraw',
          amount: Math.random() * 5,
          description: 'Regular transaction',
          isPrivate: true
        });
      }
    }

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const timelineEvents = generateTimelineEvents();

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'deposit':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'withdraw':
        return <TrendingDown className="w-4 h-4 text-blue-600" />;
      case 'milestone':
        return <Shield className="w-4 h-4 text-primary" />;
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'deposit':
        return 'border-green-200 bg-green-50';
      case 'withdraw':
        return 'border-blue-200 bg-blue-50';
      case 'milestone':
        return 'border-primary/20 bg-primary/5';
      default:
        return 'border-secondary bg-secondary/50';
    }
  };

  const formatAmount = (amount: number | undefined, isPrivate: boolean = false) => {
    if (!amount) return '';
    if (isPrivate && privacyMode) return '••••';
    return `${amount.toFixed(2)} USDC`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays <= 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

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
                  Timeline shows FlowShield milestones only. Regular transaction activity is hidden.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Activity Timeline
            {privacyMode && <EyeOff className="w-4 h-4 text-muted-foreground" />}
          </CardTitle>
          <CardDescription>
            {privacyMode 
              ? "Your FlowShield privacy milestones and achievements"
              : "Recent account activity and FlowShield usage"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {timelineEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm">Start using FlowShield to see your activity timeline</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>
              
              <div className="space-y-6">
                {timelineEvents.map((event, index) => (
                  <div key={index} className="relative flex items-start gap-4">
                    {/* Timeline dot */}
                    <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${getEventColor(event.type)}`}>
                      {getEventIcon(event.type)}
                    </div>
                    
                    {/* Event content */}
                    <div className="flex-1 min-w-0 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {event.type === 'milestone' ? 'Achievement' : event.type}
                          </Badge>
                          {event.type !== 'milestone' && event.amount && (
                            <span className="text-sm font-medium">
                              {formatAmount(event.amount, event.isPrivate)}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(event.date)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-foreground">
                        {event.description}
                      </p>
                      
                      {event.isPrivate && privacyMode && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Eye className="w-3 h-3" />
                          Details hidden for privacy
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timelineEvents.filter(event => {
                const eventDate = new Date(event.date);
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return eventDate > weekAgo;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Recent activities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {privacyStats.depositsThisMonth}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              FlowShield deposits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {privacyMode ? privacyStats.totalDeposits : timelineEvents.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {privacyMode ? "FlowShield only" : "All activities"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Avg Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(walletStats.transactionFrequency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Transactions per week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Patterns</CardTitle>
          <CardDescription>
            Analysis of your FlowShield activity patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Activity distribution */}
            <div>
              <h4 className="font-medium mb-4">Activity Distribution</h4>
              <div className="space-y-3">
                {privacyStats.poolUsage.map((pool, index) => (
                  <div key={pool.denomination} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                      ></div>
                      <span className="text-sm">{pool.denomination} USDC Pool</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${pool.percentage}%`,
                            backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-10 text-right">
                        {pool.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy metrics */}
            <div>
              <h4 className="font-medium mb-4">Privacy Metrics</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Privacy Score</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${privacyStats.privacyScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {privacyStats.privacyScore}/100
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Anonymity Set</span>
                  <span className="text-sm font-medium">
                    {privacyStats.averageAnonymitySet} users
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pool Diversity</span>
                  <span className="text-sm font-medium">
                    {privacyStats.poolUsage.length} types
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Mixed</span>
                  <span className="text-sm font-medium">
                    {privacyStats.totalMixed.toFixed(2)} USDC
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
