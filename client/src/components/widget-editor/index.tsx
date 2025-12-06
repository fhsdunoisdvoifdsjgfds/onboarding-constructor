import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { WidgetPalette } from "./widget-palette";
import { SortableWidgetList } from "./sortable-widget-list";
import { WidgetProperties, LayoutProperties } from "./widget-properties";
import { ScreenPreview } from "./widget-renderer";
import type { Widget, WidgetType, ScreenLayout } from "./widget-types";
import { createDefaultWidget, googleFonts } from "./widget-types";

function loadGoogleFonts() {
  const weights = [100, 200, 300, 400, 500, 600, 700, 800, 900];
  const fontsToLoad = googleFonts.map(font => `family=${font.replace(/ /g, "+")}:wght@${weights.join(";")}`).join("&");
  const link = document.createElement("link");
  link.href = `https://fonts.googleapis.com/css2?${fontsToLoad}&display=swap`;
  link.rel = "stylesheet";
  if (!document.querySelector(`link[href="${link.href}"]`)) {
    document.head.appendChild(link);
  }
}

interface WidgetEditorProps {
  widgets: Widget[];
  layout: ScreenLayout;
  title?: string;
  description?: string;
  imageUrl?: string;
  onWidgetsChange: (widgets: Widget[]) => void;
  onLayoutChange: (layout: ScreenLayout) => void;
}

export function WidgetEditor({
  widgets,
  layout,
  title,
  description,
  imageUrl,
  onWidgetsChange,
  onLayoutChange,
}: WidgetEditorProps) {
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"widgets" | "layout">("widgets");

  useEffect(() => {
    loadGoogleFonts();
  }, []);

  const selectedWidget = widgets.find((w) => w.id === selectedWidgetId) || null;

  const handleAddWidget = (type: WidgetType) => {
    const newWidget = createDefaultWidget(type, widgets.length);
    onWidgetsChange([...widgets, newWidget]);
    setSelectedWidgetId(newWidget.id);
  };

  const handleWidgetChange = (updatedWidget: Widget) => {
    onWidgetsChange(
      widgets.map((w) => (w.id === updatedWidget.id ? updatedWidget : w))
    );
  };

  const handleDeleteWidget = (widgetId: string) => {
    onWidgetsChange(widgets.filter((w) => w.id !== widgetId));
    if (selectedWidgetId === widgetId) {
      setSelectedWidgetId(null);
    }
  };

  const handleDuplicateWidget = (newWidget: Widget) => {
    const reorderedWidgets = [...widgets];
    if (selectedWidgetId) {
      const insertIndex = reorderedWidgets.findIndex(w => w.id === selectedWidgetId);
      if (insertIndex >= 0) {
        reorderedWidgets.splice(insertIndex + 1, 0, { ...newWidget, order: insertIndex + 1 });
      } else {
        reorderedWidgets.push({ ...newWidget, order: reorderedWidgets.length });
      }
    } else {
      reorderedWidgets.push({ ...newWidget, order: reorderedWidgets.length });
    }
    const normalizedWidgets = reorderedWidgets.map((w, i) => ({ ...w, order: i }));
    onWidgetsChange(normalizedWidgets);
    setSelectedWidgetId(newWidget.id);
  };

  const handleReorder = (reorderedWidgets: Widget[]) => {
    onWidgetsChange(reorderedWidgets);
  };

  return (
    <div className="flex h-full">
      <div className="w-72 border-r flex flex-col bg-background">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "widgets" | "layout")} className="flex-1 flex flex-col">
          <div className="border-b px-3 pt-3">
            <TabsList className="w-full h-8">
              <TabsTrigger value="widgets" className="flex-1 text-xs" data-testid="tab-widgets">Widgets</TabsTrigger>
              <TabsTrigger value="layout" className="flex-1 text-xs" data-testid="tab-layout">Screen</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="widgets" className="flex-1 mt-0 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-3">
                <WidgetPalette onAddWidget={handleAddWidget} />
                <Separator />
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground mb-2">Layers</h3>
                  <SortableWidgetList
                    widgets={widgets}
                    selectedWidgetId={selectedWidgetId}
                    onSelect={setSelectedWidgetId}
                    onReorder={handleReorder}
                    onWidgetChange={handleWidgetChange}
                    onWidgetDelete={handleDeleteWidget}
                    onWidgetDuplicate={handleDuplicateWidget}
                  />
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="layout" className="flex-1 mt-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-3">
                <LayoutProperties layout={layout} onChange={onLayoutChange} />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex-1 flex">
        <div className="flex-1 bg-muted/30 p-4 flex items-center justify-center">
          <div className="w-[260px]">
            <div className="relative bg-gray-900 dark:bg-gray-800 rounded-[2rem] p-2 shadow-xl">
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-5 bg-black rounded-full z-20" />
              <div className="bg-background rounded-[1.75rem] overflow-hidden aspect-[9/19.5]">
                <ScreenPreview
                  widgets={widgets}
                  layout={layout}
                  title={title}
                  description={description}
                  imageUrl={imageUrl}
                />
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-gray-600 rounded-full" />
            </div>
          </div>
        </div>

        {selectedWidget && (
          <div className="w-80 border-l bg-background">
            <div className="p-3 border-b">
              <h3 className="text-sm font-medium">Properties</h3>
            </div>
            <ScrollArea className="h-[calc(100%-45px)]">
              <div className="p-3">
                <WidgetProperties
                  widget={selectedWidget}
                  onChange={handleWidgetChange}
                  onDelete={() => handleDeleteWidget(selectedWidget.id)}
                />
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}

export { WidgetPalette } from "./widget-palette";
export { WidgetProperties, LayoutProperties } from "./widget-properties";
export { WidgetRenderer, ScreenPreview } from "./widget-renderer";
export { SortableWidgetList } from "./sortable-widget-list";
export { createDefaultWidget, normalizeWidgetOrder, duplicateWidget, googleFonts } from "./widget-types";
export type { Widget, WidgetType, ScreenLayout, TextWidget, ImageWidget, ButtonWidget, SpacerWidget, IconWidget, ContainerWidget, LottieWidget, DividerWidget, VideoWidget, StackWidget, ShadowStyle, BorderStyle, GradientStyle } from "./widget-types";
