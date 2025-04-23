import { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const notificationItemVariants = cva(
  "flex items-start p-4 border-b hover:bg-gray-50 transition-colors cursor-pointer",
  {
    variants: {
      variant: {
        default: "",
        unread: "bg-gray-50",
      },
      type: {
        default: "",
        success: "",
        info: "",
        warning: "",
        error: "",
      },
    },
    defaultVariants: {
      variant: "default",
      type: "default",
    },
  }
);

interface NotificationItemProps
  extends VariantProps<typeof notificationItemVariants> {
  title: string;
  message: string;
  timestamp: Date | string;
  className?: string;
  onClick?: () => void;
}

export function NotificationItem({
  title,
  message,
  timestamp,
  variant,
  type,
  className,
  onClick,
}: NotificationItemProps) {
  const getIcon = (): ReactNode => {
    switch (type) {
      case "success":
        return (
          <div className="rounded-full bg-green-100 p-1 text-green-500">
            <CheckCircle className="h-4 w-4" />
          </div>
        );
      case "warning":
        return (
          <div className="rounded-full bg-yellow-100 p-1 text-yellow-500">
            <AlertTriangle className="h-4 w-4" />
          </div>
        );
      case "error":
        return (
          <div className="rounded-full bg-red-100 p-1 text-red-500">
            <AlertCircle className="h-4 w-4" />
          </div>
        );
      case "info":
      default:
        return (
          <div className="rounded-full bg-blue-100 p-1 text-blue-500">
            <Info className="h-4 w-4" />
          </div>
        );
    }
  };

  const formatDate = (date: Date | string): string => {
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={cn(notificationItemVariants({ variant, type, className }))}
      onClick={onClick}
    >
      <div className="mr-3">{getIcon()}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{title}</p>
        <p className="text-xs text-gray-500">{message}</p>
        <p className="text-xs text-gray-400 mt-1">{formatDate(timestamp)}</p>
      </div>
    </div>
  );
}
