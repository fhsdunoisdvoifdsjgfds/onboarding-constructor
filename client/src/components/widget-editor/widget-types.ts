export type WidgetType = "text" | "image" | "button" | "spacer" | "icon" | "container" | "lottie";

export interface BaseWidget {
  id: string;
  type: WidgetType;
  order: number;
}

export interface TextWidget extends BaseWidget {
  type: "text";
  content: string;
  fontSize?: number;
  fontWeight?: "normal" | "medium" | "semibold" | "bold";
  color?: string;
  textAlign?: "left" | "center" | "right";
  marginTop?: number;
  marginBottom?: number;
}

export interface ImageWidget extends BaseWidget {
  type: "image";
  url: string;
  width?: string;
  height?: string;
  borderRadius?: number;
  objectFit?: "cover" | "contain" | "fill";
}

export interface ButtonWidget extends BaseWidget {
  type: "button";
  label: string;
  action?: "next" | "skip" | "url" | "custom";
  actionValue?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  fullWidth?: boolean;
  borderRadius?: number;
}

export interface SpacerWidget extends BaseWidget {
  type: "spacer";
  height: number;
}

export interface IconWidget extends BaseWidget {
  type: "icon";
  name: string;
  size?: number;
  color?: string;
}

export interface LottieWidget extends BaseWidget {
  type: "lottie";
  url: string;
  width?: string;
  height?: string;
  loop?: boolean;
  autoplay?: boolean;
}

export interface ContainerWidget extends BaseWidget {
  type: "container";
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
  children?: Widget[];
}

export type Widget = TextWidget | ImageWidget | ButtonWidget | SpacerWidget | IconWidget | ContainerWidget | LottieWidget;

export interface ScreenLayout {
  backgroundColor?: string;
  backgroundImage?: string;
  padding?: number;
  verticalAlignment?: "start" | "center" | "end" | "space-between";
}

export const widgetTypeLabels: Record<WidgetType, string> = {
  text: "Текст",
  image: "Изображение",
  button: "Кнопка",
  spacer: "Отступ",
  icon: "Иконка",
  container: "Контейнер",
  lottie: "Анимация",
};

export const widgetTypeIcons: Record<WidgetType, string> = {
  text: "Type",
  image: "Image",
  button: "MousePointer2",
  spacer: "MoveVertical",
  icon: "Star",
  container: "Square",
  lottie: "Play",
};

export function createDefaultWidget(type: WidgetType, order: number): Widget {
  const id = crypto.randomUUID();
  
  switch (type) {
    case "text":
      return { id, type: "text", order, content: "Введите текст", fontSize: 16, textAlign: "center" };
    case "image":
      return { id, type: "image", order, url: "", width: "100%", height: "200px", objectFit: "contain" };
    case "button":
      return { id, type: "button", order, label: "Далее", variant: "primary", fullWidth: true, action: "next" };
    case "spacer":
      return { id, type: "spacer", order, height: 24 };
    case "icon":
      return { id, type: "icon", order, name: "Star", size: 48, color: "#6366f1" };
    case "container":
      return { id, type: "container", order, backgroundColor: "#f5f5f5", padding: 16, borderRadius: 8 };
    case "lottie":
      return { id, type: "lottie", order, url: "", width: "200px", height: "200px", loop: true, autoplay: true };
  }
}

export function normalizeWidgetOrder(widgets: Widget[]): Widget[] {
  return widgets.map((widget, index) => ({ ...widget, order: index }));
}
