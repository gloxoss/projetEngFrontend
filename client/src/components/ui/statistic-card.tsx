import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const statisticCardVariants = cva(
  "w-full h-full p-6 flex flex-col",
  {
    variants: {
      variant: {
        default: "bg-white",
        primary: "bg-primary/10",
        success: "bg-green-50",
        warning: "bg-yellow-50",
        danger: "bg-red-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface StatisticCardProps extends VariantProps<typeof statisticCardVariants> {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
    direction: "up" | "down" | "neutral";
  };
  className?: string;
  isLoading?: boolean;
}

export function StatisticCard({
  title,
  value,
  icon,
  trend,
  variant,
  className,
  isLoading = false,
}: StatisticCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className={cn(statisticCardVariants({ variant }), "p-6")}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-700">{title}</h3>
          {icon && <div className="text-primary">{icon}</div>}
        </div>
        
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-24 mt-2" />
            {trend && <Skeleton className="h-4 w-32 mt-2" />}
          </>
        ) : (
          <>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {trend && (
              <div className="flex items-center mt-2">
                <span
                  className={cn(
                    "text-sm font-medium flex items-center",
                    trend.direction === "up"
                      ? "text-green-500"
                      : trend.direction === "down"
                      ? "text-red-500"
                      : "text-gray-500"
                  )}
                >
                  {trend.direction === "up" ? (
                    <svg
                      className="mr-1 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    </svg>
                  ) : trend.direction === "down" ? (
                    <svg
                      className="mr-1 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="mr-1 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 12h14"
                      />
                    </svg>
                  )}
                  {trend.value}
                </span>
                <span className="text-gray-500 text-sm ml-1">{trend.label}</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
