import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, Users, Eye, MousePointer, ArrowRight, Target, BarChart3, Clock, Percent } from "lucide-react";

interface ScreenAnalytics {
  screenIndex: number;
  screenName?: string;
  views: number;
  dropOff: number;
  avgTimeSeconds: number;
  clickThrough: number;
}

interface ABTestVariant {
  id: string;
  name: string;
  traffic: number;
  conversions: number;
  conversionRate: number;
  isWinner?: boolean;
  isControl?: boolean;
}

interface ABAnalyticsProps {
  totalViews: number;
  uniqueUsers: number;
  completionRate: number;
  avgSessionDuration: number;
  screens: ScreenAnalytics[];
  variants?: ABTestVariant[];
  dateRange?: string;
}

function StatCard({ 
  title, 
  value, 
  subValue, 
  icon: Icon, 
  trend,
  trendValue 
}: { 
  title: string; 
  value: string | number; 
  subValue?: string;
  icon: React.ElementType; 
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}) {
  return (
    <div className="p-3 rounded-lg border bg-card">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{title}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-lg font-semibold">{value}</span>
        {trend && trendValue && (
          <span className={`text-xs flex items-center gap-0.5 ${
            trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"
          }`}>
            {trend === "up" ? <TrendingUp className="h-3 w-3" /> : trend === "down" ? <TrendingDown className="h-3 w-3" /> : null}
            {trendValue}
          </span>
        )}
      </div>
      {subValue && <span className="text-[10px] text-muted-foreground">{subValue}</span>}
    </div>
  );
}

function FunnelStep({ 
  step, 
  name, 
  views, 
  dropOff, 
  avgTime, 
  isLast,
  maxViews 
}: { 
  step: number; 
  name: string; 
  views: number; 
  dropOff: number; 
  avgTime: number;
  isLast: boolean;
  maxViews: number;
}) {
  const percentage = maxViews > 0 ? (views / maxViews) * 100 : 0;
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-medium">
            {step}
          </span>
          <span className="font-medium truncate max-w-[120px]">{name}</span>
        </div>
        <span className="text-muted-foreground">{views.toLocaleString()}</span>
      </div>
      <Progress value={percentage} className="h-1.5" />
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-2.5 w-2.5" />
          {avgTime.toFixed(1)}s
        </span>
        {!isLast && dropOff > 0 && (
          <span className="text-red-500">-{dropOff.toFixed(1)}% drop</span>
        )}
      </div>
      {!isLast && (
        <div className="flex justify-center py-1">
          <ArrowRight className="h-3 w-3 text-muted-foreground/50 rotate-90" />
        </div>
      )}
    </div>
  );
}

function VariantComparison({ variants }: { variants: ABTestVariant[] }) {
  const maxConversionRate = Math.max(...variants.map(v => v.conversionRate));
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">A/B Test Variants</h4>
        <Badge variant="outline" className="text-[10px]">Active</Badge>
      </div>
      <div className="space-y-2">
        {variants.map((variant) => (
          <div 
            key={variant.id} 
            className={`p-2 rounded-md border ${variant.isWinner ? "border-green-500/50 bg-green-500/5" : ""}`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{variant.name}</span>
                {variant.isControl && (
                  <Badge variant="secondary" className="text-[9px] px-1 py-0">Control</Badge>
                )}
                {variant.isWinner && (
                  <Badge className="text-[9px] px-1 py-0 bg-green-500">Winner</Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{variant.traffic}% traffic</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">Conversion Rate</span>
                <span className="font-medium">{variant.conversionRate.toFixed(2)}%</span>
              </div>
              <Progress 
                value={(variant.conversionRate / maxConversionRate) * 100} 
                className={`h-1 ${variant.isWinner ? "[&>div]:bg-green-500" : ""}`} 
              />
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{variant.conversions.toLocaleString()} conversions</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ABAnalytics({ 
  totalViews, 
  uniqueUsers, 
  completionRate, 
  avgSessionDuration, 
  screens,
  variants,
  dateRange = "Last 7 days"
}: ABAnalyticsProps) {
  const maxViews = screens.length > 0 ? Math.max(...screens.map(s => s.views)) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Analytics
        </h3>
        <Badge variant="outline" className="text-[10px]">{dateRange}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatCard 
          title="Total Views" 
          value={totalViews.toLocaleString()} 
          icon={Eye}
          trend="up"
          trendValue="+12%"
        />
        <StatCard 
          title="Unique Users" 
          value={uniqueUsers.toLocaleString()} 
          icon={Users}
          trend="up"
          trendValue="+8%"
        />
        <StatCard 
          title="Completion" 
          value={`${completionRate.toFixed(1)}%`} 
          icon={Target}
          trend={completionRate > 50 ? "up" : "down"}
          trendValue={completionRate > 50 ? "+5%" : "-3%"}
        />
        <StatCard 
          title="Avg. Duration" 
          value={`${avgSessionDuration.toFixed(0)}s`} 
          icon={Clock}
        />
      </div>

      <Separator />

      <div className="space-y-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <MousePointer className="h-3.5 w-3.5" />
          Screen Funnel
        </h4>
        {screens.length > 0 ? (
          <div className="space-y-1">
            {screens.map((screen, index) => (
              <FunnelStep
                key={screen.screenIndex}
                step={index + 1}
                name={screen.screenName || `Screen ${index + 1}`}
                views={screen.views}
                dropOff={screen.dropOff}
                avgTime={screen.avgTimeSeconds}
                isLast={index === screens.length - 1}
                maxViews={maxViews}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-xs text-muted-foreground">
            No analytics data yet
          </div>
        )}
      </div>

      {variants && variants.length > 0 && (
        <>
          <Separator />
          <VariantComparison variants={variants} />
        </>
      )}
    </div>
  );
}

export function ABAnalyticsEmpty() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4" />
        <h3 className="text-sm font-medium">Analytics</h3>
      </div>
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-6 text-center">
          <div className="p-2 rounded-full bg-muted mb-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mb-1">No analytics data</p>
          <p className="text-[10px] text-muted-foreground">
            Publish your onboarding to start collecting data
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function ABAnalyticsMock() {
  const mockData: ABAnalyticsProps = {
    totalViews: 12847,
    uniqueUsers: 8234,
    completionRate: 67.3,
    avgSessionDuration: 42,
    screens: [
      { screenIndex: 0, screenName: "Welcome", views: 12847, dropOff: 0, avgTimeSeconds: 8.2, clickThrough: 92.3 },
      { screenIndex: 1, screenName: "Features", views: 11850, dropOff: 7.8, avgTimeSeconds: 12.4, clickThrough: 88.1 },
      { screenIndex: 2, screenName: "Benefits", views: 10442, dropOff: 11.9, avgTimeSeconds: 10.1, clickThrough: 85.2 },
      { screenIndex: 3, screenName: "Get Started", views: 8648, dropOff: 17.2, avgTimeSeconds: 6.3, clickThrough: 78.4 },
    ],
    variants: [
      { id: "a", name: "Variant A", traffic: 50, conversions: 1247, conversionRate: 15.2, isControl: true },
      { id: "b", name: "Variant B", traffic: 50, conversions: 1589, conversionRate: 19.3, isWinner: true },
    ],
  };

  return <ABAnalytics {...mockData} />;
}
