import { Card, CardContent } from "@/components/ui/card";
import { format, subDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

type ChartData = {
  date: string;
  leads: number;
  views: number;
  clicks: number;
  conversions: number;
}

type MetricType = 'leads' | 'views' | 'clicks' | 'conversions';

export function PerformanceChart() {
  const [activeMetric, setActiveMetric] = useState<MetricType>('leads');
  
  // Fetch campaign metrics data - in a real app, we'd filter by date range
  const { data: allMetrics, isLoading } = useQuery({
    queryKey: ['/api/metrics'],
  });
  
  const transformedData: ChartData[] = [];
  
  // Process and aggregate metric data by date
  if (allMetrics) {
    // Group metrics by date
    const metricsByDate = allMetrics.reduce((acc: Record<string, any>, metric: any) => {
      const date = format(new Date(metric.date), 'MMM d');
      if (!acc[date]) {
        acc[date] = { date, leads: 0, views: 0, clicks: 0, conversions: 0 };
      }
      acc[date].leads += metric.leads;
      acc[date].views += metric.views;
      acc[date].clicks += metric.clicks;
      acc[date].conversions += metric.conversions;
      return acc;
    }, {});
    
    // Convert to array and sort by date
    const sortedDates = Object.values(metricsByDate).sort((a: any, b: any) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    // Take the last 8 dates for the chart
    transformedData.push(...(sortedDates as ChartData[]).slice(-8));
  }
  
  const metricColors = {
    leads: "hsl(217 91% 60%)",
    views: "hsl(0 0% 60%)",
    clicks: "hsl(20 91% 60%)",
    conversions: "hsl(142 71% 45%)"
  };
  
  const metricOptions = [
    { key: 'leads', label: 'Leads' },
    { key: 'views', label: 'Views' },
    { key: 'clicks', label: 'CTR' },
    { key: 'conversions', label: 'Conversions' }
  ];

  return (
    <Card className="border border-gray-100 mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h2 className="font-semibold text-gray-900">Campaign Performance</h2>
          <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
            {metricOptions.map(option => (
              <button
                key={option.key}
                className={`px-2 py-1 text-xs font-medium rounded ${
                  activeMetric === option.key
                    ? "text-primary bg-primary/10"
                    : "text-gray-500 bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => setActiveMetric(option.key as MetricType)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-64 w-full">
          {isLoading ? (
            <div className="h-full w-full bg-gray-50 animate-pulse flex items-center justify-center">
              <p className="text-gray-400">Loading chart data...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transformedData} margin={{ top: 5, right: 20, bottom: 25, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  width={40}
                  tickFormatter={(value) => {
                    return value >= 1000 ? `${(value / 1000)}k` : value;
                  }}
                />
                <Tooltip
                  formatter={(value) => [value, activeMetric.charAt(0).toUpperCase() + activeMetric.slice(1)]}
                />
                <Bar 
                  dataKey={activeMetric}
                  fill={metricColors[activeMetric]}
                  fillOpacity={0.8}
                  barSize={20}
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        
        <div className="flex justify-end mt-2">
          <a href="/reports" className="text-sm text-primary font-medium hover:underline">
            View detailed report
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
