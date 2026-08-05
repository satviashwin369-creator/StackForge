"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TimeSeriesPoint } from "@/lib/types/models";
import { ChartContainer } from "@/components/dashboard/chart-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: "oklch(0.16 0.006 260)",
    border: "1px solid oklch(0.25 0.01 260)",
    borderRadius: "8px",
    fontSize: "12px",
  },
  labelStyle: { color: "oklch(0.60 0.01 260)" },
};

const CHART_HEIGHT = 228;

interface CpuChartProps {
  data: TimeSeriesPoint[];
  title?: string;
}

export function CpuUsageChart({
  data,
  title = "CPU utilization",
}: CpuChartProps) {
  const gradId = useId().replace(/:/g, "");
  const gradId2 = `${gradId}-b`;

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <ChartContainer height={CHART_HEIGHT}>
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id={gradId2} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 260)" />
              <XAxis
                dataKey="time"
                tick={{ fill: "oklch(0.55 0.01 260)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "oklch(0.55 0.01 260)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                unit="%"
              />
              <Tooltip {...chartTooltipStyle} />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                formatter={(value) => (
                  <span className="text-muted-foreground">{value}</span>
                )}
              />
              <Area
                type="monotone"
                dataKey="value"
                name="Cluster A"
                stroke="var(--chart-1)"
                fill={`url(#${gradId})`}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="value2"
                name="Cluster B"
                stroke="var(--chart-2)"
                fill={`url(#${gradId2})`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

interface DeploymentSuccessChartProps {
  data: TimeSeriesPoint[];
}

export function DeploymentSuccessChart({ data }: DeploymentSuccessChartProps) {
  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Deployment success rate
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <ChartContainer height={CHART_HEIGHT}>
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 260)" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fill: "oklch(0.55 0.01 260)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "oklch(0.55 0.01 260)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip {...chartTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Bar
                dataKey="value"
                name="Successful"
                fill="var(--chart-3)"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="value2"
                name="Failed"
                fill="var(--chart-5)"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

interface MemoryChartProps {
  data: TimeSeriesPoint[];
  compact?: boolean;
}

export function DiskUsageChart({ data }: { data: TimeSeriesPoint[] }) {
  const gradId = useId().replace(/:/g, "");
  const height = CHART_HEIGHT;

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Disk utilization</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <ChartContainer height={height}>
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-5)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--chart-5)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 260)" />
              <XAxis
                dataKey="time"
                tick={{ fill: "oklch(0.55 0.01 260)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "oklch(0.55 0.01 260)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                unit="%"
              />
              <Tooltip {...chartTooltipStyle} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--chart-5)"
                fill={`url(#${gradId})`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function MemoryUsageChart({ data, compact }: MemoryChartProps) {
  const height = compact ? 168 : CHART_HEIGHT;
  const gradId = useId().replace(/:/g, "");

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Memory usage</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <ChartContainer height={height}>
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 260)" />
              <XAxis
                dataKey="time"
                tick={{ fill: "oklch(0.55 0.01 260)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "oklch(0.55 0.01 260)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                unit="%"
              />
              <Tooltip {...chartTooltipStyle} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--chart-4)"
                fill={`url(#${gradId})`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
