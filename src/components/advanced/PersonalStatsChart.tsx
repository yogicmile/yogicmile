import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PersonalStatsChartProps {
  data: Array<{
    date: string;
    steps: number;
    distance: number;
    calories: number;
  }>;
  goalLine?: number;
}

export const PersonalStatsChart = ({ data, goalLine }: PersonalStatsChartProps) => {
  const [viewMode, setViewMode] = useState<"daily" | "weekly" | "monthly">("daily");
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [metric, setMetric] = useState<"steps" | "distance" | "calories">("steps");

  // Calculate trend
  const calculateTrend = () => {
    if (data.length < 2) return 0;
    const recent = data.slice(-7).reduce((acc, d) => acc + d[metric], 0) / 7;
    const previous = data.slice(-14, -7).reduce((acc, d) => acc + d[metric], 0) / 7;
    return ((recent - previous) / previous) * 100;
  };

  const trend = calculateTrend();

  const metricLabels = {
    steps: "Steps",
    distance: "Distance (km)",
    calories: "Calories"
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardContent className="p-6">
        {/* Header Controls */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">Your Progress</h3>
            <div className="flex items-center gap-2">
              {trend > 0 ? (
                <TrendingUp className="w-5 h-5 text-success" />
              ) : trend < 0 ? (
                <TrendingDown className="w-5 h-5 text-destructive" />
              ) : (
                <Minus className="w-5 h-5 text-muted-foreground" />
              )}
              <span className={`text-sm font-semibold ${
                trend > 0 ? 'text-success' : trend < 0 ? 'text-destructive' : 'text-muted-foreground'
              }`}>
                {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* View Mode Selector */}
          <div className="flex gap-2">
            {(["daily", "weekly", "monthly"] as const).map((mode) => (
              <Button
                key={mode}
                size="sm"
                variant={viewMode === mode ? "default" : "outline"}
                onClick={() => setViewMode(mode)}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
            ))}
          </div>

          {/* Metric Selector */}
          <div className="flex gap-2">
            {(["steps", "distance", "calories"] as const).map((m) => (
              <Button
                key={m}
                size="sm"
                variant={metric === m ? "default" : "outline"}
                onClick={() => setMetric(m)}
              >
                {metricLabels[m]}
              </Button>
            ))}
          </div>

          {/* Chart Type Toggle */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={chartType === "line" ? "default" : "outline"}
              onClick={() => setChartType("line")}
            >
              Line
            </Button>
            <Button
              size="sm"
              variant={chartType === "bar" ? "default" : "outline"}
              onClick={() => setChartType("bar")}
            >
              Bar
            </Button>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey={metric} 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                  activeDot={{ r: 6 }}
                />
                {goalLine && (
                  <Line 
                    type="monotone" 
                    dataKey={() => goalLine} 
                    stroke="hsl(var(--warning))" 
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={false}
                    name="Goal"
                  />
                )}
              </LineChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey={metric} 
                  fill="hsl(var(--primary))" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {Math.round(data.reduce((acc, d) => acc + d[metric], 0) / data.length).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Avg {metricLabels[metric]}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {Math.max(...data.map(d => d[metric])).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Best Day</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {data.reduce((acc, d) => acc + d[metric], 0).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
