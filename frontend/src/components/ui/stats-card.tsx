import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
  };
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  icon: Icon,
  description,
  variant = 'default'
}: StatsCardProps) {
  const getTrendIcon = () => {
    if (!change) return null;
    if (change.value > 0) return <TrendingUp className="h-3 w-3" />;
    if (change.value < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (!change) return 'text-muted-foreground';
    if (change.value > 0) return 'text-green-600';
    if (change.value < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  const getCardStyle = () => {
    switch (variant) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'destructive':
        return 'border-red-200 bg-red-50';
      default:
        return '';
    }
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${getCardStyle()}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">{value}</div>
        {change && (
          <div className={`flex items-center text-xs ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="ml-1">
              {Math.abs(change.value)}% {change.period}
            </span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}