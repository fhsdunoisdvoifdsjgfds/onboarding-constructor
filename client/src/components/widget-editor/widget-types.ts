export type WidgetType = "text" | "image" | "button" | "spacer" | "icon" | "container" | "lottie" | "divider" | "video" | "stack";

export interface BaseWidget {
  id: string;
  type: WidgetType;
  order: number;
  name?: string;
  visible?: boolean;
  locked?: boolean;
  zIndex?: number;
  opacity?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
}

export interface ShadowStyle {
  enabled?: boolean;
  x?: number;
  y?: number;
  blur?: number;
  spread?: number;
  color?: string;
}

export interface BorderStyle {
  enabled?: boolean;
  width?: number;
  color?: string;
  style?: "solid" | "dashed" | "dotted";
  radius?: number;
  radiusTopLeft?: number;
  radiusTopRight?: number;
  radiusBottomLeft?: number;
  radiusBottomRight?: number;
}

export interface GradientStop {
  color: string;
  position: number;
}

export interface GradientStyle {
  enabled?: boolean;
  type?: "linear" | "radial";
  angle?: number;
  stops?: GradientStop[];
}

export interface TextWidget extends BaseWidget {
  type: "text";
  content: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
  fontStyle?: "normal" | "italic";
  color?: string;
  textAlign?: "left" | "center" | "right" | "justify";
  lineHeight?: number;
  letterSpacing?: number;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  textDecoration?: "none" | "underline" | "line-through";
  textShadow?: ShadowStyle;
  backgroundColor?: string;
  backgroundGradient?: GradientStyle;
}

export interface ImageWidget extends BaseWidget {
  type: "image";
  url: string;
  width?: string;
  height?: string;
  borderRadius?: number;
  objectFit?: "cover" | "contain" | "fill" | "none";
  objectPosition?: string;
  backgroundColor?: string;
  shadow?: ShadowStyle;
  border?: BorderStyle;
  filter?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    blur?: number;
    grayscale?: number;
  };
}

export interface ButtonWidget extends BaseWidget {
  type: "button";
  label: string;
  action?: "next" | "skip" | "url" | "custom" | "close" | "purchase";
  actionValue?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "custom";
  fullWidth?: boolean;
  borderRadius?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: "400" | "500" | "600" | "700";
  textColor?: string;
  backgroundColor?: string;
  backgroundGradient?: GradientStyle;
  border?: BorderStyle;
  shadow?: ShadowStyle;
  iconName?: string;
  iconPosition?: "left" | "right";
  height?: number;
}

export interface SpacerWidget extends BaseWidget {
  type: "spacer";
  height: number;
}

export interface IconWidget extends BaseWidget {
  type: "icon";
  iconName: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  backgroundRadius?: number;
  shadow?: ShadowStyle;
}

export interface LottieWidget extends BaseWidget {
  type: "lottie";
  url: string;
  width?: string;
  height?: string;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
}

export interface ContainerWidget extends BaseWidget {
  type: "container";
  backgroundColor?: string;
  backgroundGradient?: GradientStyle;
  padding?: number;
  borderRadius?: number;
  border?: BorderStyle;
  shadow?: ShadowStyle;
  children?: Widget[];
  flexDirection?: "column" | "row";
  justifyContent?: "start" | "center" | "end" | "space-between" | "space-around";
  alignItems?: "start" | "center" | "end" | "stretch";
  gap?: number;
}

export interface DividerWidget extends BaseWidget {
  type: "divider";
  color?: string;
  thickness?: number;
  style?: "solid" | "dashed" | "dotted";
  width?: string;
}

export interface VideoWidget extends BaseWidget {
  type: "video";
  url: string;
  width?: string;
  height?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  poster?: string;
  borderRadius?: number;
}

export interface StackWidget extends BaseWidget {
  type: "stack";
  direction: "horizontal" | "vertical";
  gap?: number;
  justifyContent?: "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly";
  alignItems?: "start" | "center" | "end" | "stretch" | "baseline";
  wrap?: boolean;
  padding?: number;
  backgroundColor?: string;
  backgroundGradient?: GradientStyle;
  borderRadius?: number;
  border?: BorderStyle;
  shadow?: ShadowStyle;
  children?: Widget[];
}

export type Widget = TextWidget | ImageWidget | ButtonWidget | SpacerWidget | IconWidget | ContainerWidget | LottieWidget | DividerWidget | VideoWidget | StackWidget;

export interface ScreenLayout {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundGradient?: GradientStyle;
  backgroundOverlay?: string;
  backgroundBlur?: number;
  padding?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  verticalAlignment?: "start" | "center" | "end" | "space-between";
  safeAreaTop?: boolean;
  safeAreaBottom?: boolean;
}

export const widgetTypeLabels: Record<WidgetType, string> = {
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

export const widgetTypeIcons: Record<WidgetType, string> = {
  text: "Type",
  image: "Image",
  button: "MousePointer2",
  spacer: "MoveVertical",
  icon: "Star",
  container: "Square",
  lottie: "Play",
  divider: "Minus",
  video: "Video",
  stack: "Layers",
};

export const googleFonts = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Raleway",
  "Nunito",
  "Playfair Display",
  "Merriweather",
  "Source Sans Pro",
  "Ubuntu",
  "Oswald",
  "Rubik",
  "Work Sans",
  "Manrope",
  "DM Sans",
  "Space Grotesk",
  "Plus Jakarta Sans",
  "Outfit",
  "Lexend",
  "Sora",
  "Be Vietnam Pro",
  "Mulish",
  "Quicksand",
];

export function createDefaultWidget(type: WidgetType, order: number): Widget {
  const id = crypto.randomUUID();
  const base = { id, order, visible: true, locked: false, zIndex: order };
  
  switch (type) {
    case "text":
      return { 
        ...base, 
        type: "text", 
        name: `Text ${order + 1}`,
        content: "Enter text", 
        fontSize: 16, 
        fontFamily: "Inter",
        fontWeight: "400",
        textAlign: "center",
        lineHeight: 1.5,
        letterSpacing: 0,
      };
    case "image":
      return { 
        ...base, 
        type: "image", 
        name: `Image ${order + 1}`,
        url: "", 
        width: "100%", 
        height: "200px", 
        objectFit: "contain",
      };
    case "button":
      return { 
        ...base, 
        type: "button", 
        name: `Button ${order + 1}`,
        label: "Continue", 
        variant: "primary", 
        fullWidth: true, 
        action: "next",
        fontSize: 16,
        fontWeight: "600",
        borderRadius: 12,
        height: 48,
      };
    case "spacer":
      return { ...base, type: "spacer", name: `Spacer ${order + 1}`, height: 24 };
    case "icon":
      return { 
        ...base, 
        type: "icon", 
        name: `Icon ${order + 1}`,
        iconName: "Star", 
        size: 48, 
        color: "#6366f1",
      };
    case "container":
      return { 
        ...base, 
        type: "container", 
        name: `Container ${order + 1}`,
        backgroundColor: "#f5f5f5", 
        padding: 16, 
        borderRadius: 8,
        flexDirection: "column",
        gap: 8,
      };
    case "lottie":
      return { 
        ...base, 
        type: "lottie", 
        name: `Animation ${order + 1}`,
        url: "", 
        width: "200px", 
        height: "200px", 
        loop: true, 
        autoplay: true,
        speed: 1,
      };
    case "divider":
      return {
        ...base,
        type: "divider",
        name: `Divider ${order + 1}`,
        color: "#e5e5e5",
        thickness: 1,
        style: "solid",
        width: "100%",
      };
    case "video":
      return {
        ...base,
        type: "video",
        name: `Video ${order + 1}`,
        url: "",
        width: "100%",
        height: "200px",
        autoplay: false,
        loop: false,
        muted: true,
        controls: true,
      };
    case "stack":
      return {
        ...base,
        type: "stack",
        name: `Stack ${order + 1}`,
        direction: "vertical",
        gap: 8,
        justifyContent: "start",
        alignItems: "stretch",
        wrap: false,
        padding: 0,
      };
  }
}

export function normalizeWidgetOrder(widgets: Widget[]): Widget[] {
  return widgets.map((widget, index) => ({ ...widget, order: index, zIndex: widget.zIndex ?? index }));
}

export function duplicateWidget(widget: Widget): Widget {
  const newWidget = {
    ...widget,
    id: crypto.randomUUID(),
  };
  if (widget.name) {
    (newWidget as Widget).name = `${widget.name} (copy)`;
  }
  return newWidget as Widget;
}
