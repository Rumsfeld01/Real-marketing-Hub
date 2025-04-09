import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";
import { ReactNode } from "react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgClass: string;
  changePercentage?: number;
  changeText?: string;
}

export function MetricsCard({
  title,
  value,
  icon,
  iconBgClass,
  changePercentage,
  changeText = "vs previous month"
}: MetricsCardProps) {
  const isPositiveChange = changePercentage && changePercentage > 0;
  
  return (
    <Card className="p-4 border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-semibold mt-1">{value}</h3>
        </div>
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", iconBgClass)}>
          {icon}
        </div>
      </div>
      
      {changePercentage !== undefined && (
        <div className="flex items-center mt-3">
          <Badge 
            variant={isPositiveChange ? "success" : "error"} 
            className="flex items-center"
          >
            {isPositiveChange ? (
              <ArrowUp className="mr-1 h-3 w-3" />
            ) : (
              <ArrowDown className="mr-1 h-3 w-3" />
            )}
            {Math.abs(changePercentage)}%
          </Badge>
          <span className="text-xs text-gray-500 ml-2">{changeText}</span>
        </div>
      )}
    </Card>
  );
}
