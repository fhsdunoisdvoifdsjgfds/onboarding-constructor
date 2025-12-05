import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuthenticatedFetch } from "@/lib/auth";
import type { Project, Onboarding, OnboardingAnalytics } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, TrendingDown, BarChart3 } from "lucide-react";
import { useState } from "react";

interface OnboardingWithScreens extends Onboarding {
  screenCount?: number;
}

interface ProjectWithOnboardings extends Project {
  onboardings: OnboardingWithScreens[];
}

export default function AnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const authFetch = useAuthenticatedFetch();
  const [selectedOnboarding, setSelectedOnboarding] = useState<string | null>(null);

  const { data: project, isLoading: isLoadingProject } = useQuery<ProjectWithOnboardings>({
    queryKey: ["/api/projects", id],
    queryFn: async () => {
      const res = await authFetch(`/api/projects/${id}`);
      if (!res.ok) throw new Error("Failed to fetch project");
      return res.json();
    },
    enabled: !!id,
  });

  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery<OnboardingAnalytics>({
    queryKey: ["/api/onboardings", selectedOnboarding, "analytics"],
    queryFn: async () => {
      const res = await authFetch(`/api/onboardings/${selectedOnboarding}/analytics`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    enabled: !!selectedOnboarding,
  });

  const isLoading = isLoadingProject;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-lg font-medium mb-2">Project not found</h2>
        <Button onClick={() => setLocation("/projects")} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>
    );
  }

  const publishedOnboardings = project.onboardings?.filter(o => o.status === "published") || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/projects")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{project.name}</h1>
            <p className="text-sm text-muted-foreground">Analytics Dashboard</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Select Onboarding</CardTitle>
          <CardDescription>
            Choose an onboarding to view its analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {publishedOnboardings.length > 0 ? (
            <Select
              value={selectedOnboarding || undefined}
              onValueChange={setSelectedOnboarding}
            >
              <SelectTrigger className="w-full md:w-[300px]" data-testid="select-onboarding">
                <SelectValue placeholder="Select an onboarding" />
              </SelectTrigger>
              <SelectContent>
                {publishedOnboardings.map((onboarding) => (
                  <SelectItem key={onboarding.id} value={onboarding.id}>
                    <div className="flex items-center gap-2">
                      <span>{onboarding.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        v{onboarding.version}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-muted-foreground">
              No published onboardings yet. Publish an onboarding to see analytics.
            </p>
          )}
        </CardContent>
      </Card>

      {selectedOnboarding && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Views
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoadingAnalytics ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold" data-testid="text-total-views">
                    {analytics?.totalViews || 0}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Screens Tracked
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoadingAnalytics ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold" data-testid="text-screens-tracked">
                    {analytics?.screenViews?.length || 0}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  First Screen Views
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoadingAnalytics ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold" data-testid="text-first-screen-views">
                    {analytics?.screenViews?.find(s => s.screenIndex === 0)?.views || 0}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Last Screen Views
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoadingAnalytics ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold" data-testid="text-last-screen-views">
                    {analytics?.screenViews?.length 
                      ? analytics.screenViews[analytics.screenViews.length - 1]?.views || 0
                      : 0}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Screen Funnel</CardTitle>
              <CardDescription>
                View count for each screen in the onboarding flow
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : analytics?.screenViews && analytics.screenViews.length > 0 ? (
                <div className="space-y-3">
                  {analytics.screenViews
                    .sort((a, b) => a.screenIndex - b.screenIndex)
                    .map((screen, index) => {
                      const firstScreenViews = analytics.screenViews.find(s => s.screenIndex === 0)?.views || 1;
                      const percentage = Math.round((screen.views / firstScreenViews) * 100);
                      const prevViews = index > 0 ? analytics.screenViews[index - 1]?.views || 0 : screen.views;
                      const dropOff = prevViews > 0 ? Math.round(((prevViews - screen.views) / prevViews) * 100) : 0;
                      
                      return (
                        <div key={screen.screenIndex} className="relative" data-testid={`screen-funnel-${screen.screenIndex}`}>
                          <div className="flex items-center justify-between gap-4 p-3 bg-muted rounded-md">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="shrink-0">
                                Screen {screen.screenIndex + 1}
                              </Badge>
                              <span className="text-sm font-medium">
                                {screen.views} views
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-sm text-muted-foreground">
                                {percentage}% of total
                              </div>
                              {index > 0 && dropOff > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  -{dropOff}% drop-off
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div 
                            className="absolute bottom-0 left-0 h-1 bg-primary rounded-b-md transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="p-3 rounded-full bg-muted mb-4">
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-medium mb-1">No analytics data yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Analytics will appear here when users view your onboarding
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!selectedOnboarding && publishedOnboardings.length > 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-3 rounded-full bg-muted mb-4">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">Select an onboarding</h3>
            <p className="text-sm text-muted-foreground">
              Choose an onboarding from the dropdown above to view its analytics
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
