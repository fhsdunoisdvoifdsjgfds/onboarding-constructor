import { Button } from "@/components/ui/button";
import { Type, Image, MousePointer2, MoveVertical, Star, Play, Square, Minus, Video, Layers } from "lucide-react";
import { type WidgetType, widgetTypeLabels } from "./widget-types";

interface WidgetPaletteProps {
  onAddWidget: (type: WidgetType) => void;
}

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

const widgetTypes: WidgetType[] = ["text", "image", "button", "spacer", "icon", "divider", "container", "stack", "lottie", "video"];

export function WidgetPalette({ onAddWidget }: WidgetPaletteProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Add Widget</h3>
      <div className="grid grid-cols-3 gap-1.5">
        {widgetTypes.map((type) => {
          const Icon = widgetIcons[type];
          return (
            <Button
              key={type}
              variant="outline"
              className="flex flex-col items-center gap-1 h-auto py-2 px-1"
              onClick={() => onAddWidget(type)}
              data-testid={`button-add-widget-${type}`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[10px]">{widgetTypeLabels[type]}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
