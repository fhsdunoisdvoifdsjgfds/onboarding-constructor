import { Button } from "@/components/ui/button";
import { Type, Image, MousePointer2, MoveVertical, Star, Play, Square } from "lucide-react";
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
};

const widgetTypes: WidgetType[] = ["text", "image", "button", "spacer", "icon", "container", "lottie"];

export function WidgetPalette({ onAddWidget }: WidgetPaletteProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Добавить виджет</h3>
      <div className="grid grid-cols-3 gap-2">
        {widgetTypes.map((type) => {
          const Icon = widgetIcons[type];
          return (
            <Button
              key={type}
              variant="outline"
              className="flex flex-col items-center gap-1 h-auto py-3"
              onClick={() => onAddWidget(type)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{widgetTypeLabels[type]}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
