import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

export function StatsCard({
    title,
    value,
    description,
    icon,
    trend,
    className
}: StatsCardProps) {
    return (
        <div className={cn(
            "bg-card text-card-foreground rounded-lg border p-6 shadow-sm",
            className
        )}>
            <div className="flex items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium tracking-tight">{title}</h3>
                {icon && (
                    <div className="text-muted-foreground">
                        {icon}
                    </div>
                )}
            </div>
            <div>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground">
                        {description}
                    </p>
                )}
                {trend && (
                    <div className={cn(
                        "text-xs flex items-center pt-1",
                        trend.isPositive ? "text-green-600" : "text-red-600"
                    )}>
                        <span className={cn(
                            "inline-block w-0 h-0 mr-1",
                            trend.isPositive
                                ? "border-l-2 border-r-2 border-b-2 border-l-transparent border-r-transparent border-b-green-600"
                                : "border-l-2 border-r-2 border-t-2 border-l-transparent border-r-transparent border-t-red-600"
                        )} />
                        {trend.isPositive ? '+' : ''}{trend.value}%
                    </div>
                )}
            </div>
        </div>
    );
}
