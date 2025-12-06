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
import { GripVertical, Type, Image, MousePointer2, MoveVertical, Star, Play, Square, Minus, Video, Layers, Eye, EyeOff, Lock, Unlock, Copy, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Widget, WidgetType } from "./widget-types";
import { duplicateWidget } from "./widget-types";

const widgetIcons: Record<WidgetType, React.ComponentType<{ className?: string }>> = {
  text: Type,
  image: Image,
  button: MousePointer2,
  spacer: MoveVertical,
  icon: Star,
  container: Square,
  lottie: Play,
  divider: Minus,
  video: Video,
  stack: Layers,
};

const widgetLabels: Record<WidgetType, string> = {
  text: "Text",
  image: "Image",
  button: "Button",
  spacer: "Spacer",
  icon: "Icon",
  container: "Container",
  lottie: "Animation",
  divider: "Divider",
  video: "Video",
  stack: "Stack",
};

interface SortableWidgetItemProps {
  widget: Widget;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

function SortableWidgetItem({ 
  widget, 
  isSelected, 
  onSelect, 
  onToggleVisibility, 
  onToggleLock, 
  onDuplicate, 
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: SortableWidgetItemProps) {
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
  const isVisible = widget.visible !== false;
  const isLocked = widget.locked === true;

  const getWidgetPreview = () => {
    switch (widget.type) {
      case "text":
        return widget.content.substring(0, 20) + (widget.content.length > 20 ? "..." : "");
      case "image":
        return widget.url ? "Image" : "Empty";
      case "button":
        return widget.label;
      case "spacer":
        return `${widget.height}px`;
      case "icon":
        return widget.iconName;
      case "container":
        return `${widget.children?.length || 0} items`;
      case "lottie":
        return widget.url ? "Animation" : "Empty";
      case "divider":
        return `${widget.thickness || 1}px`;
      case "video":
        return widget.url ? "Video" : "Empty";
      case "stack":
        return `${widget.direction} · ${widget.children?.length || 0}`;
      default:
        return "";
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-1 p-2 cursor-pointer transition-colors",
        isSelected ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50",
        !isVisible && "opacity-50"
      )}
      onClick={onSelect}
      data-testid={`widget-item-${widget.id}`}
    >
      <button
        {...attributes}
        {...listeners}
        className={cn(
          "p-1 rounded cursor-grab active:cursor-grabbing",
          isLocked && "opacity-30 cursor-not-allowed"
        )}
        onClick={(e) => e.stopPropagation()}
        disabled={isLocked}
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </button>
      
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{widget.name || widgetLabels[widget.type]}</p>
        <p className="text-[10px] text-muted-foreground truncate">{getWidgetPreview()}</p>
      </div>

      <div className="flex items-center gap-0.5 invisible group-hover:visible">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
          disabled={isFirst}
          data-testid={`button-move-up-${widget.id}`}
        >
          <ChevronUp className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
          disabled={isLast}
          data-testid={`button-move-down-${widget.id}`}
        >
          <ChevronDown className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
          data-testid={`button-visibility-${widget.id}`}
        >
          {isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => { e.stopPropagation(); onToggleLock(); }}
          data-testid={`button-lock-${widget.id}`}
        >
          {isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
          data-testid={`button-duplicate-${widget.id}`}
        >
          <Copy className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          data-testid={`button-delete-${widget.id}`}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </Card>
  );
}

interface SortableWidgetListProps {
  widgets: Widget[];
  selectedWidgetId: string | null;
  onSelect: (widgetId: string) => void;
  onReorder: (widgets: Widget[]) => void;
  onWidgetChange: (widget: Widget) => void;
  onWidgetDelete: (widgetId: string) => void;
  onWidgetDuplicate: (widget: Widget) => void;
}

export function SortableWidgetList({ 
  widgets, 
  selectedWidgetId, 
  onSelect, 
  onReorder,
  onWidgetChange,
  onWidgetDelete,
  onWidgetDuplicate,
}: SortableWidgetListProps) {
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

  const handleToggleVisibility = (widget: Widget) => {
    onWidgetChange({ ...widget, visible: widget.visible === false ? true : false });
  };

  const handleToggleLock = (widget: Widget) => {
    onWidgetChange({ ...widget, locked: !widget.locked });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newWidgets = [...sortedWidgets];
    [newWidgets[index - 1], newWidgets[index]] = [newWidgets[index], newWidgets[index - 1]];
    onReorder(newWidgets.map((w, i) => ({ ...w, order: i })));
  };

  const handleMoveDown = (index: number) => {
    if (index === sortedWidgets.length - 1) return;
    const newWidgets = [...sortedWidgets];
    [newWidgets[index], newWidgets[index + 1]] = [newWidgets[index + 1], newWidgets[index]];
    onReorder(newWidgets.map((w, i) => ({ ...w, order: i })));
  };

  if (widgets.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        Add a widget from the palette
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
        <div className="space-y-1">
          {sortedWidgets.map((widget, index) => (
            <SortableWidgetItem
              key={widget.id}
              widget={widget}
              isSelected={widget.id === selectedWidgetId}
              onSelect={() => onSelect(widget.id)}
              onToggleVisibility={() => handleToggleVisibility(widget)}
              onToggleLock={() => handleToggleLock(widget)}
              onDuplicate={() => onWidgetDuplicate(duplicateWidget(widget))}
              onDelete={() => onWidgetDelete(widget.id)}
              onMoveUp={() => handleMoveUp(index)}
              onMoveDown={() => handleMoveDown(index)}
              isFirst={index === 0}
              isLast={index === sortedWidgets.length - 1}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
