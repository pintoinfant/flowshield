"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Users, 
  Target, 
  TrendingUp, 
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle
} from "lucide-react";
import { UserAnalytics } from "@/lib/analytics-evm";

interface PrivacyMetricsCardProps {
  analytics: UserAnalytics;
}

export function PrivacyMetricsCard({ analytics }: PrivacyMetricsCardProps) {
  const { privacyStats } = analytics;

  const getPrivacyScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getPrivacyScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getPrivacyLevel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  const getAnonymitySetLevel = (size: number) => {
    if (size >= 50) return { level: "High", color: "text-green-600", description: "Strong privacy protection" };
    if (size >= 20) return { level: "Medium", color: "text-yellow-600", description: "Moderate privacy protection" };
    if (size >= 10) return { level: "Low", color: "text-orange-600", description: "Basic privacy protection" };
    return { level: "Very Low", color: "text-red-600", description: "Limited privacy protection" };
  };

  const anonymityInfo = getAnonymitySetLevel(privacyStats.averageAnonymitySet);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Privacy Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy Score
          </CardTitle>
          <CardDescription>
            Overall privacy protection level based on your FlowShield usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getPrivacyScoreIcon(privacyStats.privacyScore)}
                <div>
                  <div className={`text-3xl font-bold ${getPrivacyScoreColor(privacyStats.privacyScore)}`}>
                    {privacyStats.privacyScore}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getPrivacyLevel(privacyStats.privacyScore)}
                  </div>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={`${getPrivacyScoreColor(privacyStats.privacyScore)} border-current`}
              >
                {privacyStats.privacyScore}/100
              </Badge>
            </div>
            
            <Progress 
              value={privacyStats.privacyScore} 
              className="h-2"
            />

            <div className="text-xs text-muted-foreground">
              Privacy score is calculated based on your mixing frequency, anonymity set sizes, and pool diversification.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anonymity Set Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Anonymity Set
          </CardTitle>
          <CardDescription>
            Average number of users in your transaction pools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-3xl font-bold ${anonymityInfo.color}`}>
                  {privacyStats.averageAnonymitySet}
                </div>
                <div className="text-sm text-muted-foreground">
                  {anonymityInfo.level} Privacy
                </div>
              </div>
              <Badge 
                variant="outline"
                className={`${anonymityInfo.color} border-current`}
              >
                {anonymityInfo.level}
              </Badge>
            </div>

            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-xs text-muted-foreground">
                {anonymityInfo.description}. Larger anonymity sets provide stronger privacy by making it harder to link deposits and withdrawals.
              </div>
            </div>

            {/* Visual representation */}
            <div className="grid grid-cols-10 gap-1 mt-4">
              {Array.from({ length: 100 }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < privacyStats.averageAnonymitySet 
                      ? anonymityInfo.color.includes('green') 
                        ? 'bg-green-400' 
                        : anonymityInfo.color.includes('yellow')
                        ? 'bg-yellow-400'
                        : anonymityInfo.color.includes('orange')
                        ? 'bg-orange-400'
                        : 'bg-red-400'
                      : 'bg-secondary'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Improvements Card */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Privacy Improvement Suggestions
          </CardTitle>
          <CardDescription>
            Tips to enhance your transaction privacy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Suggestions based on current usage */}
            {privacyStats.totalDeposits < 5 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-blue-900">Increase Mixing Frequency</div>
                  <div className="text-sm text-blue-700 mt-1">
                    Make more deposits to improve your privacy score and transaction unlinkability.
                  </div>
                </div>
              </div>
            )}

            {privacyStats.poolUsage.length < 3 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-green-900">Diversify Pool Usage</div>
                  <div className="text-sm text-green-700 mt-1">
                    Use different pool denominations to increase anonymity and avoid pattern recognition.
                  </div>
                </div>
              </div>
            )}

            {privacyStats.averageAnonymitySet < 20 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Users className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-yellow-900">Wait for Larger Pools</div>
                  <div className="text-sm text-yellow-700 mt-1">
                    Consider waiting for pools with more participants before withdrawing for better anonymity.
                  </div>
                </div>
              </div>
            )}

            {privacyStats.daysSinceLastActivity > 30 && (
              <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <Target className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-purple-900">Stay Active</div>
                  <div className="text-sm text-purple-700 mt-1">
                    Regular FlowShield usage helps maintain privacy patterns and keeps your skills sharp.
                  </div>
                </div>
              </div>
            )}

            {/* Default general tips if no specific suggestions */}
            {privacyStats.totalDeposits >= 5 && privacyStats.poolUsage.length >= 3 && (
              <>
                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-blue-900">Excellent Privacy Practices!</div>
                    <div className="text-sm text-blue-700 mt-1">
                      You're using FlowShield effectively. Keep diversifying your transactions.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-green-900">Advanced Tip</div>
                    <div className="text-sm text-green-700 mt-1">
                      Consider using time delays between deposits and withdrawals for enhanced privacy.
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Privacy Usage Statistics</CardTitle>
          <CardDescription>
            Detailed breakdown of your FlowShield privacy metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {privacyStats.totalDeposits}
              </div>
              <div className="text-sm text-muted-foreground">Total Deposits</div>
              <div className="text-xs text-muted-foreground mt-1">
                Lifetime FlowShield usage
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {privacyStats.totalMixed.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">USDC Mixed</div>
              <div className="text-xs text-muted-foreground mt-1">
                Total value processed
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {privacyStats.poolUsage.length}
              </div>
              <div className="text-sm text-muted-foreground">Pool Types</div>
              <div className="text-xs text-muted-foreground mt-1">
                Denomination diversity
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {privacyStats.depositsThisMonth}
              </div>
              <div className="text-sm text-muted-foreground">This Month</div>
              <div className="text-xs text-muted-foreground mt-1">
                Recent activity level
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
