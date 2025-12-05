import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Widget, ScreenLayout } from "./widget-types";

interface WidgetPropertiesProps {
  widget: Widget;
  onChange: (widget: Widget) => void;
  onDelete: () => void;
}

const iconOptions = [
  "Star", "Heart", "Check", "X", "ArrowRight", "ChevronRight", 
  "Sparkles", "Zap", "Bell", "Settings", "User", "Home", 
  "Mail", "Phone", "Camera", "MapPin", "Calendar", "Clock", "Search"
];

export function WidgetProperties({ widget, onChange, onDelete }: WidgetPropertiesProps) {
  const updateWidget = (key: string, value: unknown) => {
    onChange({ ...widget, [key]: value } as Widget);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium capitalize">{widget.type}</h4>
        <Button variant="ghost" size="icon" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      {widget.type === "text" && (
        <>
          <div className="space-y-2">
            <Label>Текст</Label>
            <Textarea
              value={widget.content}
              onChange={(e) => updateWidget("content", e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Размер шрифта: {widget.fontSize || 16}px</Label>
            <Slider
              value={[widget.fontSize || 16]}
              min={10}
              max={48}
              step={1}
              onValueChange={([v]) => updateWidget("fontSize", v)}
            />
          </div>
          <div className="space-y-2">
            <Label>Вес шрифта</Label>
            <Select 
              value={widget.fontWeight || "normal"} 
              onValueChange={(v) => updateWidget("fontWeight", v as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Обычный</SelectItem>
                <SelectItem value="medium">Средний</SelectItem>
                <SelectItem value="semibold">Полужирный</SelectItem>
                <SelectItem value="bold">Жирный</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Выравнивание</Label>
            <Select 
              value={widget.textAlign || "center"} 
              onValueChange={(v) => updateWidget("textAlign", v as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Слева</SelectItem>
                <SelectItem value="center">По центру</SelectItem>
                <SelectItem value="right">Справа</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Цвет текста</Label>
            <Input
              type="color"
              value={widget.color || "#000000"}
              onChange={(e) => updateWidget("color", e.target.value)}
              className="h-10 w-full"
            />
          </div>
        </>
      )}

      {widget.type === "image" && (
        <>
          <div className="space-y-2">
            <Label>URL изображения</Label>
            <Input
              value={widget.url}
              onChange={(e) => updateWidget("url", e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label>Ширина</Label>
            <Input
              value={widget.width || "100%"}
              onChange={(e) => updateWidget("width", e.target.value)}
              placeholder="100% или 200px"
            />
          </div>
          <div className="space-y-2">
            <Label>Высота</Label>
            <Input
              value={widget.height || "auto"}
              onChange={(e) => updateWidget("height", e.target.value)}
              placeholder="auto или 200px"
            />
          </div>
          <div className="space-y-2">
            <Label>Заполнение</Label>
            <Select 
              value={widget.objectFit || "contain"} 
              onValueChange={(v) => updateWidget("objectFit", v as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contain">Вписать</SelectItem>
                <SelectItem value="cover">Заполнить</SelectItem>
                <SelectItem value="fill">Растянуть</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Скругление: {widget.borderRadius || 0}px</Label>
            <Slider
              value={[widget.borderRadius || 0]}
              min={0}
              max={32}
              step={1}
              onValueChange={([v]) => updateWidget("borderRadius", v)}
            />
          </div>
        </>
      )}

      {widget.type === "button" && (
        <>
          <div className="space-y-2">
            <Label>Текст кнопки</Label>
            <Input
              value={widget.label}
              onChange={(e) => updateWidget("label", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Стиль</Label>
            <Select 
              value={widget.variant || "primary"} 
              onValueChange={(v) => updateWidget("variant", v as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Основной</SelectItem>
                <SelectItem value="secondary">Вторичный</SelectItem>
                <SelectItem value="outline">Контурный</SelectItem>
                <SelectItem value="ghost">Прозрачный</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Действие</Label>
            <Select 
              value={widget.action || "next"} 
              onValueChange={(v) => updateWidget("action", v as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="next">Следующий экран</SelectItem>
                <SelectItem value="skip">Пропустить</SelectItem>
                <SelectItem value="url">Открыть URL</SelectItem>
                <SelectItem value="custom">Кастомное</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(widget.action === "url" || widget.action === "custom") && (
            <div className="space-y-2">
              <Label>{widget.action === "url" ? "URL" : "ID действия"}</Label>
              <Input
                value={widget.actionValue || ""}
                onChange={(e) => updateWidget("actionValue", e.target.value)}
                placeholder={widget.action === "url" ? "https://..." : "action_id"}
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <Switch
              checked={widget.fullWidth ?? true}
              onCheckedChange={(v) => updateWidget("fullWidth", v)}
            />
            <Label>На всю ширину</Label>
          </div>
        </>
      )}

      {widget.type === "spacer" && (
        <div className="space-y-2">
          <Label>Высота отступа: {widget.height}px</Label>
          <Slider
            value={[widget.height]}
            min={8}
            max={120}
            step={4}
            onValueChange={([v]) => updateWidget("height", v)}
          />
        </div>
      )}

      {widget.type === "icon" && (
        <>
          <div className="space-y-2">
            <Label>Иконка</Label>
            <Select 
              value={widget.name} 
              onValueChange={(v) => updateWidget("name", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map((icon) => (
                  <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Размер: {widget.size || 48}px</Label>
            <Slider
              value={[widget.size || 48]}
              min={16}
              max={128}
              step={4}
              onValueChange={([v]) => updateWidget("size", v)}
            />
          </div>
          <div className="space-y-2">
            <Label>Цвет</Label>
            <Input
              type="color"
              value={widget.color || "#6366f1"}
              onChange={(e) => updateWidget("color", e.target.value)}
              className="h-10 w-full"
            />
          </div>
        </>
      )}

      {widget.type === "lottie" && (
        <>
          <div className="space-y-2">
            <Label>URL анимации (JSON)</Label>
            <Input
              value={widget.url}
              onChange={(e) => updateWidget("url", e.target.value)}
              placeholder="https://assets.lottiefiles.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label>Ширина</Label>
            <Input
              value={widget.width || "200px"}
              onChange={(e) => updateWidget("width", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Высота</Label>
            <Input
              value={widget.height || "200px"}
              onChange={(e) => updateWidget("height", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={widget.loop ?? true}
              onCheckedChange={(v) => updateWidget("loop", v)}
            />
            <Label>Зацикливать</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={widget.autoplay ?? true}
              onCheckedChange={(v) => updateWidget("autoplay", v)}
            />
            <Label>Автозапуск</Label>
          </div>
        </>
      )}

      {widget.type === "container" && (
        <>
          <div className="space-y-2">
            <Label>Цвет фона</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={widget.backgroundColor || "#f5f5f5"}
                onChange={(e) => updateWidget("backgroundColor", e.target.value)}
                className="h-10 w-20"
              />
              <Input
                value={widget.backgroundColor || ""}
                onChange={(e) => updateWidget("backgroundColor", e.target.value)}
                placeholder="#f5f5f5"
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Отступы: {widget.padding || 16}px</Label>
            <Slider
              value={[widget.padding || 16]}
              min={0}
              max={48}
              step={4}
              onValueChange={([v]) => updateWidget("padding", v)}
            />
          </div>
          <div className="space-y-2">
            <Label>Скругление: {widget.borderRadius || 0}px</Label>
            <Slider
              value={[widget.borderRadius || 0]}
              min={0}
              max={32}
              step={1}
              onValueChange={([v]) => updateWidget("borderRadius", v)}
            />
          </div>
        </>
      )}
    </div>
  );
}

interface LayoutPropertiesProps {
  layout: ScreenLayout;
  onChange: (layout: ScreenLayout) => void;
}

export function LayoutProperties({ layout, onChange }: LayoutPropertiesProps) {
  const updateLayout = <K extends keyof ScreenLayout>(key: K, value: ScreenLayout[K]) => {
    onChange({ ...layout, [key]: value });
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Настройки экрана</h4>
      
      <div className="space-y-2">
        <Label>Цвет фона</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={layout.backgroundColor || "#ffffff"}
            onChange={(e) => updateLayout("backgroundColor", e.target.value)}
            className="h-10 w-20"
          />
          <Input
            value={layout.backgroundColor || ""}
            onChange={(e) => updateLayout("backgroundColor", e.target.value)}
            placeholder="#ffffff"
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Фоновое изображение</Label>
        <Input
          value={layout.backgroundImage || ""}
          onChange={(e) => updateLayout("backgroundImage", e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <Label>Отступы: {layout.padding || 16}px</Label>
        <Slider
          value={[layout.padding || 16]}
          min={0}
          max={48}
          step={4}
          onValueChange={([v]) => updateLayout("padding", v)}
        />
      </div>

      <div className="space-y-2">
        <Label>Вертикальное выравнивание</Label>
        <Select 
          value={layout.verticalAlignment || "start"} 
          onValueChange={(v) => updateLayout("verticalAlignment", v as any)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="start">Сверху</SelectItem>
            <SelectItem value="center">По центру</SelectItem>
            <SelectItem value="end">Снизу</SelectItem>
            <SelectItem value="space-between">Распределить</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
