import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { WidgetPalette } from "./widget-palette";
import { SortableWidgetList } from "./sortable-widget-list";
import { WidgetProperties, LayoutProperties } from "./widget-properties";
import { ScreenPreview } from "./widget-renderer";
import type { Widget, WidgetType, ScreenLayout } from "./widget-types";
import { createDefaultWidget } from "./widget-types";

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

  const handleReorder = (reorderedWidgets: Widget[]) => {
    onWidgetsChange(reorderedWidgets);
  };

  return (
    <div className="flex h-full">
      <div className="w-80 border-r flex flex-col">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "widgets" | "layout")} className="flex-1 flex flex-col">
          <div className="border-b px-4 pt-4">
            <TabsList className="w-full">
              <TabsTrigger value="widgets" className="flex-1">Виджеты</TabsTrigger>
              <TabsTrigger value="layout" className="flex-1">Экран</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="widgets" className="flex-1 mt-0 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                <WidgetPalette onAddWidget={handleAddWidget} />
                <Separator />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Список виджетов</h3>
                  <SortableWidgetList
                    widgets={widgets}
                    selectedWidgetId={selectedWidgetId}
                    onSelect={setSelectedWidgetId}
                    onReorder={handleReorder}
                  />
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="layout" className="flex-1 mt-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4">
                <LayoutProperties layout={layout} onChange={onLayoutChange} />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex-1 flex">
        <div className="flex-1 bg-muted/30 p-6 flex items-center justify-center">
          <div className="w-[280px]">
            <div className="relative bg-gray-900 dark:bg-gray-800 rounded-[2.5rem] p-3 shadow-xl">
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full" />
              <div className="bg-background rounded-[2rem] overflow-hidden aspect-[9/19.5]">
                <ScreenPreview
                  widgets={widgets}
                  layout={layout}
                  title={title}
                  description={description}
                  imageUrl={imageUrl}
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
      </div>
    </div>
  );
}

export { WidgetPalette } from "./widget-palette";
export { WidgetProperties, LayoutProperties } from "./widget-properties";
export { WidgetRenderer, ScreenPreview } from "./widget-renderer";
export { SortableWidgetList } from "./sortable-widget-list";
export { createDefaultWidget, normalizeWidgetOrder } from "./widget-types";
export type { Widget, WidgetType, ScreenLayout, TextWidget, ImageWidget, ButtonWidget, SpacerWidget, IconWidget, ContainerWidget, LottieWidget } from "./widget-types";
