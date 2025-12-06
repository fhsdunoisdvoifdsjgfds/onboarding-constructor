import { type Widget, type ScreenLayout, type GradientStyle, type ShadowStyle, type BorderStyle } from "./widget-types";
import { Star, Heart, Check, X, ArrowRight, ChevronRight, Sparkles, Zap, Bell, Settings, User, Home, Mail, Phone, Camera, MapPin, Calendar, Clock, Search, Shield, Award, Gift, Rocket, Target, Lightbulb, Crown, Flame, ThumbsUp, MessageCircle, Send, Download, Upload } from "lucide-react";

interface WidgetRendererProps {
  widget: Widget;
  isPreview?: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Star, Heart, Check, X, ArrowRight, ChevronRight, Sparkles, Zap, Bell, Settings, User, Home, Mail, Phone, Camera, MapPin, Calendar, Clock, Search, Shield, Award, Gift, Rocket, Target, Lightbulb, Crown, Flame, ThumbsUp, MessageCircle, Send, Download, Upload,
};

function buildGradientCSS(gradient?: GradientStyle): string | undefined {
  if (!gradient?.enabled || !gradient.stops?.length) return undefined;
  const stops = [...gradient.stops].sort((a, b) => a.position - b.position);
  const colorStops = stops.map(s => `${s.color} ${s.position}%`).join(", ");
  if (gradient.type === "radial") {
    return `radial-gradient(circle, ${colorStops})`;
  }
  return `linear-gradient(${gradient.angle || 180}deg, ${colorStops})`;
}

function buildShadowCSS(shadow?: ShadowStyle): string | undefined {
  if (!shadow?.enabled) return undefined;
  const x = shadow.x ?? 0;
  const y = shadow.y ?? 4;
  const blur = shadow.blur ?? 8;
  const spread = shadow.spread ?? 0;
  const color = shadow.color ?? "rgba(0,0,0,0.25)";
  return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
}

function buildBorderCSS(border?: BorderStyle): React.CSSProperties {
  if (!border?.enabled) return {};
  return {
    borderWidth: border.width ?? 1,
    borderStyle: border.style ?? "solid",
    borderColor: border.color ?? "#e5e5e5",
    borderRadius: border.radius ?? 0,
  };
}

export function WidgetRenderer({ widget, isPreview = false }: WidgetRendererProps) {
  if (widget.visible === false && isPreview) return null;

  const baseStyle: React.CSSProperties = {
    opacity: widget.opacity ?? 1,
    marginTop: widget.marginTop,
    marginBottom: widget.marginBottom,
    marginLeft: widget.marginLeft,
    marginRight: widget.marginRight,
    zIndex: widget.zIndex,
  };

  switch (widget.type) {
    case "text": {
      const gradient = buildGradientCSS(widget.backgroundGradient);
      const textShadow = widget.textShadow?.enabled 
        ? `${widget.textShadow.x ?? 0}px ${widget.textShadow.y ?? 2}px ${widget.textShadow.blur ?? 4}px ${widget.textShadow.color ?? "rgba(0,0,0,0.3)"}`
        : undefined;
      
      return (
        <p
          style={{
            ...baseStyle,
            fontSize: widget.fontSize || 16,
            fontFamily: widget.fontFamily ? `"${widget.fontFamily}", sans-serif` : undefined,
            fontWeight: widget.fontWeight || "400",
            fontStyle: widget.fontStyle,
            color: widget.color,
            textAlign: widget.textAlign || "center",
            lineHeight: widget.lineHeight ?? 1.5,
            letterSpacing: widget.letterSpacing,
            textTransform: widget.textTransform,
            textDecoration: widget.textDecoration,
            backgroundColor: gradient ? undefined : widget.backgroundColor,
            backgroundImage: gradient,
            textShadow,
            padding: widget.backgroundColor || gradient ? "4px 8px" : undefined,
            borderRadius: widget.backgroundColor || gradient ? 4 : undefined,
          }}
          className="whitespace-pre-wrap"
        >
          {widget.content}
        </p>
      );
    }

    case "image": {
      const shadow = buildShadowCSS(widget.shadow);
      const borderStyles = buildBorderCSS(widget.border);
      const filterParts: string[] = [];
      if (widget.filter?.brightness != null && widget.filter.brightness !== 100) {
        filterParts.push(`brightness(${widget.filter.brightness}%)`);
      }
      if (widget.filter?.contrast != null && widget.filter.contrast !== 100) {
        filterParts.push(`contrast(${widget.filter.contrast}%)`);
      }
      if (widget.filter?.saturation != null && widget.filter.saturation !== 100) {
        filterParts.push(`saturate(${widget.filter.saturation}%)`);
      }
      if (widget.filter?.blur) {
        filterParts.push(`blur(${widget.filter.blur}px)`);
      }
      if (widget.filter?.grayscale) {
        filterParts.push(`grayscale(${widget.filter.grayscale}%)`);
      }

      return (
        <div
          style={{
            ...baseStyle,
            width: widget.width || "100%",
            height: widget.height || "auto",
            borderRadius: widget.borderRadius,
            boxShadow: shadow,
            ...borderStyles,
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
                objectPosition: widget.objectPosition,
                filter: filterParts.length > 0 ? filterParts.join(" ") : undefined,
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              Нет изображения
            </div>
          )}
        </div>
      );
    }

    case "button": {
      const isCustom = widget.variant === "custom";
      const gradient = isCustom ? buildGradientCSS(widget.backgroundGradient) : undefined;
      const shadow = isCustom ? buildShadowCSS(widget.shadow) : undefined;
      const borderStyles = isCustom ? buildBorderCSS(widget.border) : {};
      
      const getButtonClass = () => {
        const base = "font-medium transition-colors text-center flex items-center justify-center gap-2";
        const variants: Record<string, string> = {
          primary: "bg-primary text-primary-foreground",
          secondary: "bg-secondary text-secondary-foreground",
          outline: "border-2 border-primary text-primary",
          ghost: "text-primary",
          custom: "",
        };
        return `${base} ${variants[widget.variant || "primary"]} ${widget.fullWidth ? "w-full" : ""}`;
      };
      
      const IconComponent = widget.iconName ? iconMap[widget.iconName] : null;
      
      return (
        <button
          className={getButtonClass()}
          style={{
            ...baseStyle,
            borderRadius: widget.borderRadius ?? 12,
            fontSize: widget.fontSize ?? 16,
            fontWeight: widget.fontWeight ?? "600",
            fontFamily: widget.fontFamily ? `"${widget.fontFamily}", sans-serif` : undefined,
            height: widget.height ?? 48,
            paddingLeft: 24,
            paddingRight: 24,
            ...(isCustom ? {
              color: widget.textColor,
              backgroundColor: gradient ? undefined : widget.backgroundColor,
              backgroundImage: gradient,
              boxShadow: shadow,
              ...borderStyles,
            } : {}),
          }}
        >
          {IconComponent && widget.iconPosition !== "right" && <IconComponent className="w-5 h-5" />}
          {widget.label}
          {IconComponent && widget.iconPosition === "right" && <IconComponent className="w-5 h-5" />}
        </button>
      );
    }

    case "spacer":
      return (
        <div 
          style={{ ...baseStyle, height: widget.height }} 
          className={isPreview ? "" : "bg-muted/30 border border-dashed border-muted-foreground/30 rounded"}
        />
      );

    case "icon": {
      const IconComponent = iconMap[widget.iconName] || Star;
      const shadow = buildShadowCSS(widget.shadow);
      
      return (
        <div 
          className="flex justify-center" 
          style={{
            ...baseStyle,
            color: widget.color || "#6366f1",
          }}
        >
          <div 
            style={{ 
              width: widget.size || 48, 
              height: widget.size || 48,
              backgroundColor: widget.backgroundColor,
              borderRadius: widget.backgroundRadius,
              padding: widget.backgroundColor ? 8 : 0,
              boxShadow: shadow,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconComponent className="w-full h-full" style={{ color: widget.color || "#6366f1" }} />
          </div>
        </div>
      );
    }

    case "divider":
      return (
        <div 
          style={{
            ...baseStyle,
            width: widget.width || "100%",
            height: widget.thickness || 1,
            backgroundColor: widget.color || "#e5e5e5",
            borderStyle: widget.style === "dashed" ? "dashed" : widget.style === "dotted" ? "dotted" : undefined,
            borderWidth: widget.style !== "solid" ? widget.thickness || 1 : undefined,
            borderColor: widget.style !== "solid" ? widget.color || "#e5e5e5" : undefined,
          }}
          className="mx-auto"
        />
      );

    case "video":
      return (
        <div
          style={{
            ...baseStyle,
            width: widget.width || "100%",
            height: widget.height || "200px",
            borderRadius: widget.borderRadius,
          }}
          className="mx-auto overflow-hidden bg-muted"
        >
          {widget.url ? (
            <video
              src={widget.url}
              poster={widget.poster}
              autoPlay={widget.autoplay}
              loop={widget.loop}
              muted={widget.muted}
              controls={widget.controls}
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              Нет видео
            </div>
          )}
        </div>
      );

    case "lottie":
      return (
        <div
          style={{
            ...baseStyle,
            width: widget.width || "200px",
            height: widget.height || "200px",
          }}
          className="mx-auto bg-muted/50 rounded-lg flex items-center justify-center"
        >
          {widget.url ? (
            <div className="text-xs text-muted-foreground text-center p-2">
              Lottie
              <br />
              <span className="text-[10px] text-primary">URL загружен</span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Нет URL</span>
          )}
        </div>
      );

    case "container": {
      const gradient = buildGradientCSS(widget.backgroundGradient);
      const shadow = buildShadowCSS(widget.shadow);
      const borderStyles = buildBorderCSS(widget.border);
      
      return (
        <div
          style={{
            ...baseStyle,
            backgroundColor: gradient ? undefined : widget.backgroundColor,
            backgroundImage: gradient,
            padding: widget.padding || 16,
            borderRadius: widget.borderRadius || 8,
            boxShadow: shadow,
            ...borderStyles,
            display: "flex",
            flexDirection: widget.flexDirection || "column",
            justifyContent: widget.justifyContent || "start",
            alignItems: widget.alignItems || "stretch",
            gap: widget.gap || 8,
          }}
        >
          {widget.children && widget.children.length > 0 ? (
            widget.children.map((child) => (
              <WidgetRenderer key={child.id} widget={child} isPreview={isPreview} />
            ))
          ) : (
            <div className="text-xs text-muted-foreground text-center py-4">
              Контейнер пуст
            </div>
          )}
        </div>
      );
    }

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
  const visibleWidgets = sortedWidgets.filter(w => w.visible !== false);
  const hasWidgets = visibleWidgets.length > 0;
  
  const alignmentStyles: Record<string, string> = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    "space-between": "justify-between",
  };

  const gradient = buildGradientCSS(layout.backgroundGradient);
  const paddingTop = layout.paddingTop ?? layout.padding ?? 16;
  const paddingBottom = layout.paddingBottom ?? layout.padding ?? 16;
  const paddingLeft = layout.paddingLeft ?? layout.padding ?? 16;
  const paddingRight = layout.paddingRight ?? layout.padding ?? 16;

  return (
    <div
      className={`h-full flex flex-col ${alignmentStyles[layout.verticalAlignment || "start"]} relative overflow-hidden`}
      style={{
        backgroundColor: layout.backgroundColor,
        backgroundImage: gradient || (layout.backgroundImage ? `url(${layout.backgroundImage})` : undefined),
        backgroundSize: "cover",
        backgroundPosition: "center",
        paddingTop: (layout.safeAreaTop !== false ? 44 : 0) + paddingTop,
        paddingBottom: (layout.safeAreaBottom !== false ? 34 : 0) + paddingBottom,
        paddingLeft,
        paddingRight,
      }}
    >
      {layout.backgroundImage && layout.backgroundOverlay && (
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundColor: layout.backgroundOverlay,
            backdropFilter: layout.backgroundBlur ? `blur(${layout.backgroundBlur}px)` : undefined,
          }} 
        />
      )}
      <div className="relative z-10 flex flex-col gap-2 w-full flex-1" style={{ justifyContent: layout.verticalAlignment === "space-between" ? "space-between" : undefined }}>
        {hasWidgets ? (
          visibleWidgets.map((widget) => (
            <WidgetRenderer key={widget.id} widget={widget} isPreview />
          ))
        ) : (
          <>
            <div className="flex-1 flex items-center justify-center bg-muted/30 rounded-lg mb-3">
              {imageUrl ? (
                <img src={imageUrl} alt="" className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-[10px] text-muted-foreground">Добавьте виджеты</span>
              )}
            </div>
            <div className="text-center space-y-1 mb-3">
              <h3 className="font-semibold text-sm">{title || "Заголовок"}</h3>
              <p className="text-xs text-muted-foreground">{description || "Описание"}</p>
            </div>
            <div className="w-full h-10 bg-primary rounded-xl" />
          </>
        )}
      </div>
    </div>
  );
}
