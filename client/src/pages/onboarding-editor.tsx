import { useState, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuthenticatedFetch } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import type { Onboarding, Screen } from "@shared/schema";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, GripVertical, Save, Send, ImageIcon, Loader2, Settings, Layers } from "lucide-react";
import { WidgetPalette, SortableWidgetList, WidgetProperties, LayoutProperties, ScreenPreview, createDefaultWidget, normalizeWidgetOrder } from "@/components/widget-editor";
import type { Widget, WidgetType, ScreenLayout } from "@/components/widget-editor/widget-types";

interface OnboardingWithScreens extends Onboarding {
  screens: Screen[];
}

interface SortableScreenCardProps {
  screen: Screen;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (screenId: string) => void;
  isDeleting: boolean;
}

function SortableScreenCard({ screen, isSelected, onSelect, onDelete, isDeleting }: SortableScreenCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: screen.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasWidgets = (screen.widgets as Widget[] || []).length > 0;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`group cursor-pointer transition-colors ${isSelected ? "ring-2 ring-primary" : ""}`}
      onClick={onSelect}
      data-testid={`card-screen-${screen.id}`}
    >
      <CardHeader className="flex flex-row items-start gap-2 space-y-0 p-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 p-1 rounded hover:bg-muted cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
          data-testid={`handle-screen-${screen.id}`}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs shrink-0">
              {screen.order + 1}
            </Badge>
            {hasWidgets && (
              <Badge variant="secondary" className="text-xs shrink-0">
                <Layers className="h-3 w-3 mr-1" />
                {(screen.widgets as Widget[]).length}
              </Badge>
            )}
          </div>
          <CardTitle className="text-sm font-medium truncate">
            {screen.title || "Без названия"}
          </CardTitle>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(screen.id);
          }}
          disabled={isDeleting}
          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
          data-testid={`button-delete-screen-${screen.id}`}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </CardHeader>
    </Card>
  );
}

export default function OnboardingEditorPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const authFetch = useAuthenticatedFetch();
  const { toast } = useToast();
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"basic" | "widgets" | "layout">("widgets");
  const [localScreenData, setLocalScreenData] = useState<{
    title: string;
    description: string;
    imageUrl: string;
    widgets: Widget[];
    layout: ScreenLayout;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: onboarding, isLoading } = useQuery<OnboardingWithScreens>({
    queryKey: ["/api/onboardings", id],
    queryFn: async () => {
      const res = await authFetch(`/api/onboardings/${id}`);
      if (!res.ok) throw new Error("Failed to fetch onboarding");
      return res.json();
    },
    enabled: !!id,
  });

  const selectedScreen = onboarding?.screens.find((s) => s.id === selectedScreenId) || null;

  const addScreenMutation = useMutation({
    mutationFn: async () => {
      const res = await authFetch(`/api/onboardings/${id}/screens`, {
        method: "POST",
        body: JSON.stringify({
          title: "Новый экран",
          description: "",
          imageUrl: "",
        }),
      });
      if (!res.ok) throw new Error("Failed to add screen");
      return res.json();
    },
    onSuccess: (newScreen) => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboardings", id] });
      setSelectedScreenId(newScreen.id);
      toast({ title: "Экран добавлен" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message,
      });
    },
  });

  const updateScreenMutation = useMutation({
    mutationFn: async ({ screenId, data }: { screenId: string; data: Partial<Screen> }) => {
      const res = await authFetch(`/api/screens/${screenId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update screen");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboardings", id] });
      toast({ title: "Экран сохранён" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message,
      });
    },
  });

  const deleteScreenMutation = useMutation({
    mutationFn: async (screenId: string) => {
      const res = await authFetch(`/api/screens/${screenId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete screen");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboardings", id] });
      setSelectedScreenId(null);
      setLocalScreenData(null);
      toast({ title: "Экран удалён" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message,
      });
    },
  });

  const reorderScreensMutation = useMutation({
    mutationFn: async (screenIds: string[]) => {
      const res = await authFetch(`/api/onboardings/${id}/reorder`, {
        method: "PATCH",
        body: JSON.stringify({ screenIds }),
      });
      if (!res.ok) throw new Error("Failed to reorder screens");
      return res.json();
    },
    onError: (error) => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboardings", id] });
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message,
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const res = await authFetch(`/api/onboardings/${id}/publish`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to publish onboarding");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboardings", id] });
      toast({ title: "Онбординг опубликован!" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message,
      });
    },
  });

  const handleSelectScreen = useCallback((screen: Screen) => {
    setSelectedScreenId(screen.id);
    setSelectedWidgetId(null);
    setLocalScreenData({
      title: screen.title,
      description: screen.description,
      imageUrl: screen.imageUrl,
      widgets: (screen.widgets as Widget[]) || [],
      layout: (screen.layout as ScreenLayout) || {},
    });
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id && onboarding?.screens) {
        const oldIndex = onboarding.screens.findIndex((s) => s.id === active.id);
        const newIndex = onboarding.screens.findIndex((s) => s.id === over.id);

        const newScreens = arrayMove(onboarding.screens, oldIndex, newIndex);
        const screenIds = newScreens.map((s) => s.id);

        queryClient.setQueryData(["/api/onboardings", id], {
          ...onboarding,
          screens: newScreens.map((s, i) => ({ ...s, order: i })),
        });

        reorderScreensMutation.mutate(screenIds);
      }
    },
    [onboarding, id, reorderScreensMutation]
  );

  const handleSaveScreen = () => {
    if (selectedScreenId && localScreenData) {
      updateScreenMutation.mutate({
        screenId: selectedScreenId,
        data: {
          title: localScreenData.title,
          description: localScreenData.description,
          imageUrl: localScreenData.imageUrl,
          widgets: localScreenData.widgets,
          layout: localScreenData.layout,
        },
      });
    }
  };

  const handleAddWidget = (type: WidgetType) => {
    if (!localScreenData) return;
    const newWidget = createDefaultWidget(type, localScreenData.widgets.length);
    setLocalScreenData({
      ...localScreenData,
      widgets: [...localScreenData.widgets, newWidget],
    });
    setSelectedWidgetId(newWidget.id);
  };

  const handleWidgetChange = (updatedWidget: Widget) => {
    if (!localScreenData) return;
    setLocalScreenData({
      ...localScreenData,
      widgets: localScreenData.widgets.map((w) =>
        w.id === updatedWidget.id ? updatedWidget : w
      ),
    });
  };

  const handleDeleteWidget = (widgetId: string) => {
    if (!localScreenData) return;
    const filteredWidgets = localScreenData.widgets.filter((w) => w.id !== widgetId);
    setLocalScreenData({
      ...localScreenData,
      widgets: normalizeWidgetOrder(filteredWidgets),
    });
    if (selectedWidgetId === widgetId) {
      setSelectedWidgetId(null);
    }
  };

  const handleReorderWidgets = (reorderedWidgets: Widget[]) => {
    if (!localScreenData) return;
    setLocalScreenData({
      ...localScreenData,
      widgets: normalizeWidgetOrder(reorderedWidgets),
    });
  };

  if (isLoading) {
    return (
      <div className="h-full flex">
        <div className="w-64 border-r p-4">
          <Skeleton className="h-8 w-full mb-4" />
          <Skeleton className="h-20 w-full mb-2" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-[500px] w-full" />
        </div>
      </div>
    );
  }

  if (!onboarding) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-lg font-medium mb-2">Онбординг не найден</h2>
        <Button onClick={() => setLocation("/projects")} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          К проектам
        </Button>
      </div>
    );
  }

  const sortedScreens = [...(onboarding.screens || [])].sort((a, b) => a.order - b.order);
  const selectedWidget = localScreenData?.widgets.find((w) => w.id === selectedWidgetId) || null;

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation(`/projects/${onboarding.projectId}`)}
              data-testid="button-back-to-project"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{onboarding.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge
                  variant={onboarding.status === "published" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {onboarding.status === "published" ? "Опубликован" : "Черновик"}
                </Badge>
                <span>Версия {onboarding.version}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {localScreenData && (
              <Button
                variant="outline"
                onClick={handleSaveScreen}
                disabled={updateScreenMutation.isPending}
              >
                {updateScreenMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Сохранить
              </Button>
            )}
            <Button
              variant="default"
              onClick={() => publishMutation.mutate()}
              disabled={publishMutation.isPending}
              data-testid="button-publish"
            >
              {publishMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Опубликовать
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium">Экраны</h2>
              <Button
                size="sm"
                onClick={() => addScreenMutation.mutate()}
                disabled={addScreenMutation.isPending}
                data-testid="button-add-screen"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {sortedScreens.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sortedScreens.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {sortedScreens.map((screen) => (
                      <SortableScreenCard
                        key={screen.id}
                        screen={screen}
                        isSelected={screen.id === selectedScreenId}
                        onSelect={() => handleSelectScreen(screen)}
                        onDelete={(screenId) => deleteScreenMutation.mutate(screenId)}
                        isDeleting={deleteScreenMutation.isPending}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Нет экранов</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addScreenMutation.mutate()}
                    className="mt-2 text-primary"
                  >
                    Добавить первый
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {selectedScreenId && localScreenData ? (
          <>
            <div className="w-80 border-r flex flex-col">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "basic" | "widgets" | "layout")} className="flex-1 flex flex-col">
                <div className="border-b px-4 pt-4">
                  <TabsList className="w-full">
                    <TabsTrigger value="basic" className="flex-1 text-xs">Основное</TabsTrigger>
                    <TabsTrigger value="widgets" className="flex-1 text-xs">Виджеты</TabsTrigger>
                    <TabsTrigger value="layout" className="flex-1 text-xs">Экран</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="basic" className="flex-1 mt-0 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-4">
                      <div className="space-y-2">
                        <Label>Название экрана</Label>
                        <Input
                          value={localScreenData.title}
                          onChange={(e) => setLocalScreenData({ ...localScreenData, title: e.target.value })}
                          placeholder="Введите название"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Описание (для простого режима)</Label>
                        <Textarea
                          value={localScreenData.description}
                          onChange={(e) => setLocalScreenData({ ...localScreenData, description: e.target.value })}
                          placeholder="Описание экрана"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>URL изображения (для простого режима)</Label>
                        <Input
                          value={localScreenData.imageUrl}
                          onChange={(e) => setLocalScreenData({ ...localScreenData, imageUrl: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                      <Separator />
                      <p className="text-xs text-muted-foreground">
                        Поля "Описание" и "URL изображения" используются только если нет виджетов. 
                        Для расширенной кастомизации используйте вкладку "Виджеты".
                      </p>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="widgets" className="flex-1 mt-0 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-4">
                      <WidgetPalette onAddWidget={handleAddWidget} />
                      <Separator />
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Список виджетов</h3>
                        <SortableWidgetList
                          widgets={localScreenData.widgets}
                          selectedWidgetId={selectedWidgetId}
                          onSelect={setSelectedWidgetId}
                          onReorder={handleReorderWidgets}
                        />
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="layout" className="flex-1 mt-0 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-4">
                      <LayoutProperties
                        layout={localScreenData.layout}
                        onChange={(layout) => setLocalScreenData({ ...localScreenData, layout })}
                      />
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex-1 bg-muted/30 flex items-center justify-center">
              <div className="w-[280px]">
                <div className="relative bg-gray-900 dark:bg-gray-800 rounded-[2.5rem] p-3 shadow-xl">
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full" />
                  <div className="bg-background rounded-[2rem] overflow-hidden aspect-[9/19.5]">
                    <ScreenPreview
                      widgets={localScreenData.widgets}
                      layout={localScreenData.layout}
                      title={localScreenData.title}
                      description={localScreenData.description}
                      imageUrl={localScreenData.imageUrl}
                    />
                  </div>
                </div>
              </div>
            </div>

            {selectedWidget && (
              <div className="w-80 border-l">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <WidgetProperties
                      widget={selectedWidget}
                      onChange={handleWidgetChange}
                      onDelete={() => handleDeleteWidget(selectedWidget.id)}
                    />
                  </div>
                </ScrollArea>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Выберите экран для редактирования</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
