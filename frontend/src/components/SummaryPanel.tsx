"use client";

import { Summary } from "@/types";
import { cn, getAlertLevelColor, getAlertDotColor, formatTimestamp } from "@/lib/utils";
import { AlertTriangle, Shield, Target, Server, TrendingUp } from "lucide-react";

interface SummaryPanelProps {
  summary: Summary | null;
  loading: boolean;
  error: string | null;
}

export function SummaryPanel({ summary, loading, error }: SummaryPanelProps) {
  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6">
        <div className="flex items-center gap-3 text-red-500">
          <AlertTriangle className="w-5 h-5" />
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          </div>
          <div className="p-4 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/30 animate-pulse">
                <div className="h-4 w-24 bg-muted rounded mb-2" />
                <div className="h-3 w-full bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="h-6 w-40 bg-muted rounded animate-pulse mb-3" />
          <div className="h-20 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Defensive null coalescing for all numeric values
  const attackCount = summary.metrics?.attack_count ?? 0;
  const highRiskCount = summary.metrics?.high_risk_count ?? 0;
  const suspiciousCount = summary.metrics?.suspicious_count ?? 0;
  const cleanCount = summary.metrics?.clean_count ?? 0;
  const attackPercentage = summary.metrics?.attack_percentage ?? 0;
  const totalNodes = summary.metrics?.total_nodes ?? 0;
  const criticalCount = summary.critical_alerts?.count ?? 0;
  const criticalAlertsList = summary.critical_alerts?.alerts ?? [];
  const nodesUnderAttack = summary.nodes_under_attack ?? [];

  // Calculate total alerts safely
  const totalAlerts = attackCount + highRiskCount + suspiciousCount + cleanCount;

  return (
    <div className="space-y-4">
      {/* Critical Alerts */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-foreground">Critical Alerts</h3>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 text-sm font-medium">
            {criticalCount} active
          </span>
        </div>

        <div className="divide-y divide-border max-h-80 overflow-y-auto">
          {criticalAlertsList.length === 0 ? (
            <div className="p-6 text-center">
              <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-muted-foreground">No critical alerts</p>
            </div>
          ) : (
            criticalAlertsList.map((alert) => (
              <div
                key={alert.log_id}
                className="p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          getAlertDotColor(alert.alert_level),
                          alert.alert_level === "ATTACK" && "animate-pulse"
                        )}
                      />
                      <span className="font-medium text-foreground">
                        {alert.node_id}
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-xs font-medium shrink-0",
                          getAlertLevelColor(alert.alert_level)
                        )}
                      >
                        {alert.alert_level}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {alert.primary_reason}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-foreground">
                      {alert.severity_score}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(alert.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Nodes Under Attack */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-foreground">Nodes Under Attack</h3>
          </div>
          <span className="text-sm text-muted-foreground">
            {nodesUnderAttack.length} nodes
          </span>
        </div>

        <div className="p-4">
          {nodesUnderAttack.length === 0 ? (
            <div className="text-center py-4">
              <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">All nodes secure</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {nodesUnderAttack.map((node) => (
                <span
                  key={node}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium"
                >
                  {node}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Threat Distribution */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-muted-foreground">
            Threat Distribution
          </h3>
        </div>

        {totalAlerts > 0 ? (
          <>
            <div className="flex h-4 rounded-full overflow-hidden bg-muted">
              {attackCount > 0 && (
                <div
                  className="bg-red-500 transition-all"
                  style={{
                    width: `${(attackCount / totalAlerts) * 100}%`,
                  }}
                />
              )}
              {highRiskCount > 0 && (
                <div
                  className="bg-orange-500 transition-all"
                  style={{
                    width: `${(highRiskCount / totalAlerts) * 100}%`,
                  }}
                />
              )}
              {suspiciousCount > 0 && (
                <div
                  className="bg-yellow-500 transition-all"
                  style={{
                    width: `${(suspiciousCount / totalAlerts) * 100}%`,
                  }}
                />
              )}
              {cleanCount > 0 && (
                <div
                  className="bg-green-500 transition-all"
                  style={{
                    width: `${(cleanCount / totalAlerts) * 100}%`,
                  }}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>Attack: {attackCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span>High Risk: {highRiskCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span>Suspicious: {suspiciousCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span>Clean: {cleanCount}</span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-4">
            No data available
          </p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {attackPercentage.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Attack Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {totalNodes}
            </p>
            <p className="text-xs text-muted-foreground">Total Nodes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
