import { type Widget, type ScreenLayout } from "./widget-types";
import { Star, Heart, Check, X, ArrowRight, ChevronRight, Sparkles, Zap, Bell, Settings, User, Home, Mail, Phone, Camera, MapPin, Calendar, Clock, Search } from "lucide-react";

interface WidgetRendererProps {
  widget: Widget;
  isPreview?: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Star, Heart, Check, X, ArrowRight, ChevronRight, Sparkles, Zap, Bell, Settings, User, Home, Mail, Phone, Camera, MapPin, Calendar, Clock, Search,
};

export function WidgetRenderer({ widget, isPreview = false }: WidgetRendererProps) {
  switch (widget.type) {
    case "text":
      return (
        <p
          style={{
            fontSize: widget.fontSize || 16,
            fontWeight: widget.fontWeight || "normal",
            color: widget.color,
            textAlign: widget.textAlign || "center",
            marginTop: widget.marginTop,
            marginBottom: widget.marginBottom,
          }}
          className="whitespace-pre-wrap"
        >
          {widget.content}
        </p>
      );

    case "image":
      return (
        <div
          style={{
            width: widget.width || "100%",
            height: widget.height || "auto",
            borderRadius: widget.borderRadius,
          }}
          className="mx-auto overflow-hidden bg-muted"
        >
          {widget.url ? (
            <img
              src={widget.url}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: widget.objectFit || "contain",
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              Нет изображения
            </div>
          )}
        </div>
      );

    case "button":
      const getButtonStyles = () => {
        const base = "px-6 py-3 font-medium rounded-full transition-colors text-center";
        const variants: Record<string, string> = {
          primary: "bg-primary text-primary-foreground hover:bg-primary/90",
          secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
          outline: "border-2 border-primary text-primary hover:bg-primary/10",
          ghost: "text-primary hover:bg-primary/10",
        };
        return `${base} ${variants[widget.variant || "primary"]} ${widget.fullWidth ? "w-full" : ""}`;
      };
      
      return (
        <button
          className={getButtonStyles()}
          style={{ borderRadius: widget.borderRadius }}
        >
          {widget.label}
        </button>
      );

    case "spacer":
      return (
        <div 
          style={{ height: widget.height }} 
          className={isPreview ? "" : "bg-muted/30 border border-dashed border-muted-foreground/30 rounded"}
        />
      );

    case "icon":
      const IconComponent = iconMap[widget.name] || Star;
      return (
        <div 
          className="flex justify-center" 
          style={{ color: widget.color || "#6366f1" }}
        >
          <div style={{ width: widget.size || 48, height: widget.size || 48 }}>
            <IconComponent className="w-full h-full" />
          </div>
        </div>
      );

    case "lottie":
      return (
        <div
          style={{
            width: widget.width || "200px",
            height: widget.height || "200px",
          }}
          className="mx-auto bg-muted/50 rounded-lg flex items-center justify-center"
        >
          {widget.url ? (
            <div className="text-xs text-muted-foreground text-center p-2">
              Lottie анимация
              <br />
              <span className="text-[10px] break-all">{widget.url}</span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Нет URL анимации</span>
          )}
        </div>
      );

    case "container":
      return (
        <div
          style={{
            backgroundColor: widget.backgroundColor,
            padding: widget.padding || 16,
            borderRadius: widget.borderRadius || 0,
          }}
          className="rounded-lg"
        >
          {widget.children && widget.children.length > 0 ? (
            <div className="flex flex-col gap-2">
              {widget.children.map((child) => (
                <WidgetRenderer key={child.id} widget={child} isPreview={isPreview} />
              ))}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground text-center py-4">
              Контейнер пуст
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}

interface ScreenPreviewProps {
  widgets: Widget[];
  layout: ScreenLayout;
  title?: string;
  description?: string;
  imageUrl?: string;
}

export function ScreenPreview({ widgets, layout, title, description, imageUrl }: ScreenPreviewProps) {
  const sortedWidgets = [...widgets].sort((a, b) => a.order - b.order);
  const hasWidgets = widgets.length > 0;
  
  const alignmentStyles: Record<string, string> = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    "space-between": "justify-between",
  };

  return (
    <div
      className={`h-full flex flex-col ${alignmentStyles[layout.verticalAlignment || "start"]}`}
      style={{
        backgroundColor: layout.backgroundColor,
        backgroundImage: layout.backgroundImage ? `url(${layout.backgroundImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: layout.padding || 16,
      }}
    >
      {hasWidgets ? (
        <div className="flex flex-col gap-3 w-full">
          {sortedWidgets.map((widget) => (
            <WidgetRenderer key={widget.id} widget={widget} isPreview />
          ))}
        </div>
      ) : (
        <>
          <div className="flex-1 flex items-center justify-center bg-muted/30 rounded-lg mb-4">
            {imageUrl ? (
              <img src={imageUrl} alt="" className="max-w-full max-h-full object-contain" />
            ) : (
              <span className="text-xs text-muted-foreground">Нет изображения</span>
            )}
          </div>
          <div className="text-center space-y-2 mb-4">
            <h3 className="font-semibold">{title || "Заголовок"}</h3>
            <p className="text-sm text-muted-foreground">{description || "Описание экрана"}</p>
          </div>
          <div className="w-full h-10 bg-primary rounded-full" />
        </>
      )}
    </div>
  );
}
