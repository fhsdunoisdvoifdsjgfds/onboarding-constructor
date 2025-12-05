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
import { GripVertical, Type, Image, MousePointer2, MoveVertical, Star, Play, Square } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Widget, WidgetType } from "./widget-types";

const widgetIcons: Record<WidgetType, React.ComponentType<{ className?: string }>> = {
  text: Type,
  image: Image,
  button: MousePointer2,
  spacer: MoveVertical,
  icon: Star,
  container: Square,
  lottie: Play,
};

const widgetLabels: Record<WidgetType, string> = {
  text: "Текст",
  image: "Изображение",
  button: "Кнопка",
  spacer: "Отступ",
  icon: "Иконка",
  container: "Контейнер",
  lottie: "Анимация",
};

interface SortableWidgetItemProps {
  widget: Widget;
  isSelected: boolean;
  onSelect: () => void;
}

function SortableWidgetItem({ widget, isSelected, onSelect }: SortableWidgetItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = widgetIcons[widget.type];

  const getWidgetPreview = () => {
    switch (widget.type) {
      case "text":
        return widget.content.substring(0, 30) + (widget.content.length > 30 ? "..." : "");
      case "image":
        return widget.url ? "Изображение загружено" : "Нет изображения";
      case "button":
        return widget.label;
      case "spacer":
        return `${widget.height}px`;
      case "icon":
        return widget.name;
      case "container":
        return `${widget.children?.length || 0} элементов`;
      case "lottie":
        return widget.url ? "Анимация загружена" : "Нет анимации";
      default:
        return "";
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 p-2 cursor-pointer transition-colors",
        isSelected ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
      )}
      onClick={onSelect}
    >
      <button
        {...attributes}
        {...listeners}
        className="p-1 rounded hover:bg-muted cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{widgetLabels[widget.type]}</p>
        <p className="text-xs text-muted-foreground truncate">{getWidgetPreview()}</p>
      </div>
    </Card>
  );
}

interface SortableWidgetListProps {
  widgets: Widget[];
  selectedWidgetId: string | null;
  onSelect: (widgetId: string) => void;
  onReorder: (widgets: Widget[]) => void;
}

export function SortableWidgetList({ widgets, selectedWidgetId, onSelect, onReorder }: SortableWidgetListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedWidgets = [...widgets].sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedWidgets.findIndex((w) => w.id === active.id);
      const newIndex = sortedWidgets.findIndex((w) => w.id === over.id);

      const newWidgets = arrayMove(sortedWidgets, oldIndex, newIndex).map((w, i) => ({
        ...w,
        order: i,
      }));

      onReorder(newWidgets);
    }
  };

  if (widgets.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Нет виджетов. Добавьте виджет из палитры.
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedWidgets.map((w) => w.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {sortedWidgets.map((widget) => (
            <SortableWidgetItem
              key={widget.id}
              widget={widget}
              isSelected={widget.id === selectedWidgetId}
              onSelect={() => onSelect(widget.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
