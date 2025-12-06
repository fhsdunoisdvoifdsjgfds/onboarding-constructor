import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Trash2, ChevronDown, ChevronRight, Plus, X } from "lucide-react";
import type { Widget, ScreenLayout, ShadowStyle, BorderStyle, GradientStyle, GradientStop } from "./widget-types";
import { googleFonts } from "./widget-types";

interface WidgetPropertiesProps {
  widget: Widget;
  onChange: (widget: Widget) => void;
  onDelete: () => void;
}

const iconOptions = [
  "Star", "Heart", "Check", "X", "ArrowRight", "ChevronRight", 
  "Sparkles", "Zap", "Bell", "Settings", "User", "Home", 
  "Mail", "Phone", "Camera", "MapPin", "Calendar", "Clock", "Search",
  "Shield", "Award", "Gift", "Rocket", "Target", "Lightbulb", "Crown",
  "Flame", "ThumbsUp", "MessageCircle", "Send", "Download", "Upload",
];

function ColorInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <div className="space-y-1">
      {label && <Label className="text-xs">{label}</Label>}
      <div className="flex gap-2">
        <Input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-12 p-1"
        />
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 h-8 text-xs"
        />
      </div>
    </div>
  );
}

function ShadowEditor({ shadow, onChange }: { shadow?: ShadowStyle; onChange: (s: ShadowStyle) => void }) {
  const [isOpen, setIsOpen] = useState(shadow?.enabled ?? false);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full text-sm font-medium py-1">
        {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        Тень
        <Switch
          checked={shadow?.enabled ?? false}
          onCheckedChange={(v) => onChange({ ...shadow, enabled: v })}
          onClick={(e) => e.stopPropagation()}
          className="ml-auto"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 pt-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">X: {shadow?.x ?? 0}</Label>
            <Slider
              value={[shadow?.x ?? 0]}
              min={-20}
              max={20}
              step={1}
              onValueChange={([v]) => onChange({ ...shadow, x: v })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Y: {shadow?.y ?? 4}</Label>
            <Slider
              value={[shadow?.y ?? 4]}
              min={-20}
              max={20}
              step={1}
              onValueChange={([v]) => onChange({ ...shadow, y: v })}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Размытие: {shadow?.blur ?? 8}</Label>
          <Slider
            value={[shadow?.blur ?? 8]}
            min={0}
            max={50}
            step={1}
            onValueChange={([v]) => onChange({ ...shadow, blur: v })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Распростр.: {shadow?.spread ?? 0}</Label>
          <Slider
            value={[shadow?.spread ?? 0]}
            min={-10}
            max={20}
            step={1}
            onValueChange={([v]) => onChange({ ...shadow, spread: v })}
          />
        </div>
        <ColorInput 
          value={shadow?.color ?? "rgba(0,0,0,0.25)"} 
          onChange={(v) => onChange({ ...shadow, color: v })}
          label="Цвет тени"
        />
      </CollapsibleContent>
    </Collapsible>
  );
}

function BorderEditor({ border, onChange }: { border?: BorderStyle; onChange: (b: BorderStyle) => void }) {
  const [isOpen, setIsOpen] = useState(border?.enabled ?? false);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full text-sm font-medium py-1">
        {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        Граница
        <Switch
          checked={border?.enabled ?? false}
          onCheckedChange={(v) => onChange({ ...border, enabled: v })}
          onClick={(e) => e.stopPropagation()}
          className="ml-auto"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 pt-2">
        <div className="space-y-1">
          <Label className="text-xs">Толщина: {border?.width ?? 1}px</Label>
          <Slider
            value={[border?.width ?? 1]}
            min={0}
            max={10}
            step={1}
            onValueChange={([v]) => onChange({ ...border, width: v })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Скругление: {border?.radius ?? 0}px</Label>
          <Slider
            value={[border?.radius ?? 0]}
            min={0}
            max={50}
            step={1}
            onValueChange={([v]) => onChange({ ...border, radius: v })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Стиль</Label>
          <Select 
            value={border?.style || "solid"} 
            onValueChange={(v) => onChange({ ...border, style: v as "solid" | "dashed" | "dotted" })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Сплошная</SelectItem>
              <SelectItem value="dashed">Пунктир</SelectItem>
              <SelectItem value="dotted">Точки</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ColorInput 
          value={border?.color ?? "#e5e5e5"} 
          onChange={(v) => onChange({ ...border, color: v })}
          label="Цвет"
        />
      </CollapsibleContent>
    </Collapsible>
  );
}

function GradientEditor({ gradient, onChange }: { gradient?: GradientStyle; onChange: (g: GradientStyle) => void }) {
  const [isOpen, setIsOpen] = useState(gradient?.enabled ?? false);
  const stops = gradient?.stops ?? [
    { color: "#6366f1", position: 0 },
    { color: "#8b5cf6", position: 100 },
  ];
  
  const addStop = () => {
    onChange({ ...gradient, stops: [...stops, { color: "#ffffff", position: 50 }] });
  };
  
  const removeStop = (index: number) => {
    const newStops = stops.filter((_, i) => i !== index);
    onChange({ ...gradient, stops: newStops });
  };
  
  const updateStop = (index: number, stop: GradientStop) => {
    const newStops = [...stops];
    newStops[index] = stop;
    onChange({ ...gradient, stops: newStops });
  };
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full text-sm font-medium py-1">
        {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        Градиент
        <Switch
          checked={gradient?.enabled ?? false}
          onCheckedChange={(v) => onChange({ ...gradient, enabled: v })}
          onClick={(e) => e.stopPropagation()}
          className="ml-auto"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 pt-2">
        <div className="space-y-1">
          <Label className="text-xs">Тип</Label>
          <Select 
            value={gradient?.type || "linear"} 
            onValueChange={(v) => onChange({ ...gradient, type: v as "linear" | "radial" })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="linear">Линейный</SelectItem>
              <SelectItem value="radial">Радиальный</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {gradient?.type !== "radial" && (
          <div className="space-y-1">
            <Label className="text-xs">Угол: {gradient?.angle ?? 180}</Label>
            <Slider
              value={[gradient?.angle ?? 180]}
              min={0}
              max={360}
              step={15}
              onValueChange={([v]) => onChange({ ...gradient, angle: v })}
            />
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Цвета</Label>
            <Button variant="ghost" size="sm" className="h-6 px-2" onClick={addStop}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          {stops.map((stop, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                type="color"
                value={stop.color}
                onChange={(e) => updateStop(i, { ...stop, color: e.target.value })}
                className="h-7 w-10 p-0.5"
              />
              <div className="flex-1">
                <Slider
                  value={[stop.position]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([v]) => updateStop(i, { ...stop, position: v })}
                />
              </div>
              <span className="text-xs w-8">{stop.position}%</span>
              {stops.length > 2 && (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeStop(i)}>
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function FontFamilySelect({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">Шрифт</Label>
      <Select value={value || "Inter"} onValueChange={onChange}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {googleFonts.map((font) => (
            <SelectItem key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function SpacingEditor({ 
  widget, 
  onChange 
}: { 
  widget: Widget; 
  onChange: (key: string, value: number) => void 
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full text-sm font-medium py-1">
        {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        Отступы
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 pt-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Сверху: {widget.marginTop ?? 0}</Label>
            <Slider
              value={[widget.marginTop ?? 0]}
              min={0}
              max={48}
              step={2}
              onValueChange={([v]) => onChange("marginTop", v)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Снизу: {widget.marginBottom ?? 0}</Label>
            <Slider
              value={[widget.marginBottom ?? 0]}
              min={0}
              max={48}
              step={2}
              onValueChange={([v]) => onChange("marginBottom", v)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Слева: {widget.marginLeft ?? 0}</Label>
            <Slider
              value={[widget.marginLeft ?? 0]}
              min={0}
              max={48}
              step={2}
              onValueChange={([v]) => onChange("marginLeft", v)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Справа: {widget.marginRight ?? 0}</Label>
            <Slider
              value={[widget.marginRight ?? 0]}
              min={0}
              max={48}
              step={2}
              onValueChange={([v]) => onChange("marginRight", v)}
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function WidgetProperties({ widget, onChange, onDelete }: WidgetPropertiesProps) {
  const updateWidget = (key: string, value: unknown) => {
    onChange({ ...widget, [key]: value } as Widget);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Input
          value={widget.name || ""}
          onChange={(e) => updateWidget("name", e.target.value)}
          placeholder="Название виджета"
          className="h-8 text-sm font-medium"
          data-testid="input-widget-name"
        />
        <Button variant="ghost" size="icon" onClick={onDelete} data-testid="button-delete-widget">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="w-full grid grid-cols-3 h-8">
          <TabsTrigger value="content" className="text-xs">Контент</TabsTrigger>
          <TabsTrigger value="style" className="text-xs">Стиль</TabsTrigger>
          <TabsTrigger value="layout" className="text-xs">Отступы</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-3 pt-2">
          {widget.type === "text" && (
            <>
              <div className="space-y-1">
                <Label className="text-xs">Текст</Label>
                <Textarea
                  value={widget.content}
                  onChange={(e) => updateWidget("content", e.target.value)}
                  rows={3}
                  className="text-sm"
                  data-testid="textarea-widget-content"
                />
              </div>
              <FontFamilySelect
                value={widget.fontFamily}
                onChange={(v) => updateWidget("fontFamily", v)}
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Размер: {widget.fontSize || 16}</Label>
                  <Slider
                    value={[widget.fontSize || 16]}
                    min={10}
                    max={72}
                    step={1}
                    onValueChange={([v]) => updateWidget("fontSize", v)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Межстрочный</Label>
                  <Slider
                    value={[widget.lineHeight ?? 1.5]}
                    min={1}
                    max={3}
                    step={0.1}
                    onValueChange={([v]) => updateWidget("lineHeight", v)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Вес</Label>
                  <Select 
                    value={widget.fontWeight || "400"} 
                    onValueChange={(v) => updateWidget("fontWeight", v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">Thin</SelectItem>
                      <SelectItem value="200">Extra Light</SelectItem>
                      <SelectItem value="300">Light</SelectItem>
                      <SelectItem value="400">Regular</SelectItem>
                      <SelectItem value="500">Medium</SelectItem>
                      <SelectItem value="600">Semi Bold</SelectItem>
                      <SelectItem value="700">Bold</SelectItem>
                      <SelectItem value="800">Extra Bold</SelectItem>
                      <SelectItem value="900">Black</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Выравнивание</Label>
                  <Select 
                    value={widget.textAlign || "center"} 
                    onValueChange={(v) => updateWidget("textAlign", v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Слева</SelectItem>
                      <SelectItem value="center">Центр</SelectItem>
                      <SelectItem value="right">Справа</SelectItem>
                      <SelectItem value="justify">По ширине</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Регистр</Label>
                  <Select 
                    value={widget.textTransform || "none"} 
                    onValueChange={(v) => updateWidget("textTransform", v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Нет</SelectItem>
                      <SelectItem value="uppercase">ВЕРХНИЙ</SelectItem>
                      <SelectItem value="lowercase">нижний</SelectItem>
                      <SelectItem value="capitalize">Заглавные</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Декор</Label>
                  <Select 
                    value={widget.textDecoration || "none"} 
                    onValueChange={(v) => updateWidget("textDecoration", v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Нет</SelectItem>
                      <SelectItem value="underline">Подчеркнутый</SelectItem>
                      <SelectItem value="line-through">Зачеркнутый</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Межбуквенный: {widget.letterSpacing ?? 0}px</Label>
                <Slider
                  value={[widget.letterSpacing ?? 0]}
                  min={-2}
                  max={10}
                  step={0.5}
                  onValueChange={([v]) => updateWidget("letterSpacing", v)}
                />
              </div>
              <ColorInput 
                value={widget.color || "#000000"} 
                onChange={(v) => updateWidget("color", v)}
                label="Цвет текста"
              />
            </>
          )}

          {widget.type === "image" && (
            <>
              <div className="space-y-1">
                <Label className="text-xs">URL изображения</Label>
                <Input
                  value={widget.url}
                  onChange={(e) => updateWidget("url", e.target.value)}
                  placeholder="https://..."
                  className="h-8 text-xs"
                  data-testid="input-image-url"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Ширина</Label>
                  <Input
                    value={widget.width || "100%"}
                    onChange={(e) => updateWidget("width", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Высота</Label>
                  <Input
                    value={widget.height || "auto"}
                    onChange={(e) => updateWidget("height", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Заполнение</Label>
                <Select 
                  value={widget.objectFit || "contain"} 
                  onValueChange={(v) => updateWidget("objectFit", v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contain">Вписать</SelectItem>
                    <SelectItem value="cover">Заполнить</SelectItem>
                    <SelectItem value="fill">Растянуть</SelectItem>
                    <SelectItem value="none">Оригинал</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Скругление: {widget.borderRadius || 0}px</Label>
                <Slider
                  value={[widget.borderRadius || 0]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([v]) => updateWidget("borderRadius", v)}
                />
              </div>
            </>
          )}

          {widget.type === "button" && (
            <>
              <div className="space-y-1">
                <Label className="text-xs">Текст кнопки</Label>
                <Input
                  value={widget.label}
                  onChange={(e) => updateWidget("label", e.target.value)}
                  className="h-8 text-xs"
                  data-testid="input-button-label"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Стиль</Label>
                  <Select 
                    value={widget.variant || "primary"} 
                    onValueChange={(v) => updateWidget("variant", v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Основной</SelectItem>
                      <SelectItem value="secondary">Вторичный</SelectItem>
                      <SelectItem value="outline">Контурный</SelectItem>
                      <SelectItem value="ghost">Прозрачный</SelectItem>
                      <SelectItem value="custom">Кастомный</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Действие</Label>
                  <Select 
                    value={widget.action || "next"} 
                    onValueChange={(v) => updateWidget("action", v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="next">Далее</SelectItem>
                      <SelectItem value="skip">Пропустить</SelectItem>
                      <SelectItem value="close">Закрыть</SelectItem>
                      <SelectItem value="purchase">Покупка</SelectItem>
                      <SelectItem value="url">URL</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {(widget.action === "url" || widget.action === "custom") && (
                <div className="space-y-1">
                  <Label className="text-xs">{widget.action === "url" ? "URL" : "ID действия"}</Label>
                  <Input
                    value={widget.actionValue || ""}
                    onChange={(e) => updateWidget("actionValue", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <Switch
                  checked={widget.fullWidth ?? true}
                  onCheckedChange={(v) => updateWidget("fullWidth", v)}
                />
                <Label className="text-xs">На всю ширину</Label>
              </div>
              <FontFamilySelect
                value={widget.fontFamily}
                onChange={(v) => updateWidget("fontFamily", v)}
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Размер: {widget.fontSize || 16}</Label>
                  <Slider
                    value={[widget.fontSize || 16]}
                    min={12}
                    max={24}
                    step={1}
                    onValueChange={([v]) => updateWidget("fontSize", v)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Высота: {widget.height || 48}</Label>
                  <Slider
                    value={[widget.height || 48]}
                    min={32}
                    max={72}
                    step={2}
                    onValueChange={([v]) => updateWidget("height", v)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Скругление: {widget.borderRadius || 12}</Label>
                <Slider
                  value={[widget.borderRadius || 12]}
                  min={0}
                  max={50}
                  step={1}
                  onValueChange={([v]) => updateWidget("borderRadius", v)}
                />
              </div>
            </>
          )}

          {widget.type === "spacer" && (
            <div className="space-y-1">
              <Label className="text-xs">Высота: {widget.height}px</Label>
              <Slider
                value={[widget.height]}
                min={4}
                max={200}
                step={4}
                onValueChange={([v]) => updateWidget("height", v)}
              />
            </div>
          )}

          {widget.type === "icon" && (
            <>
              <div className="space-y-1">
                <Label className="text-xs">Иконка</Label>
                <Select 
                  value={widget.iconName} 
                  onValueChange={(v) => updateWidget("iconName", v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Размер: {widget.size || 48}px</Label>
                <Slider
                  value={[widget.size || 48]}
                  min={16}
                  max={200}
                  step={4}
                  onValueChange={([v]) => updateWidget("size", v)}
                />
              </div>
              <ColorInput 
                value={widget.color || "#6366f1"} 
                onChange={(v) => updateWidget("color", v)}
                label="Цвет"
              />
              <ColorInput 
                value={widget.backgroundColor || ""} 
                onChange={(v) => updateWidget("backgroundColor", v)}
                label="Фон"
              />
              {widget.backgroundColor && (
                <div className="space-y-1">
                  <Label className="text-xs">Скругление фона: {widget.backgroundRadius || 0}</Label>
                  <Slider
                    value={[widget.backgroundRadius || 0]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([v]) => updateWidget("backgroundRadius", v)}
                  />
                </div>
              )}
            </>
          )}

          {widget.type === "divider" && (
            <>
              <div className="space-y-1">
                <Label className="text-xs">Толщина: {widget.thickness || 1}px</Label>
                <Slider
                  value={[widget.thickness || 1]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={([v]) => updateWidget("thickness", v)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Ширина</Label>
                <Input
                  value={widget.width || "100%"}
                  onChange={(e) => updateWidget("width", e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Стиль</Label>
                <Select 
                  value={widget.style || "solid"} 
                  onValueChange={(v) => updateWidget("style", v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Сплошная</SelectItem>
                    <SelectItem value="dashed">Пунктир</SelectItem>
                    <SelectItem value="dotted">Точки</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ColorInput 
                value={widget.color || "#e5e5e5"} 
                onChange={(v) => updateWidget("color", v)}
                label="Цвет"
              />
            </>
          )}

          {widget.type === "video" && (
            <>
              <div className="space-y-1">
                <Label className="text-xs">URL видео</Label>
                <Input
                  value={widget.url}
                  onChange={(e) => updateWidget("url", e.target.value)}
                  placeholder="https://..."
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Постер (превью)</Label>
                <Input
                  value={widget.poster || ""}
                  onChange={(e) => updateWidget("poster", e.target.value)}
                  placeholder="https://..."
                  className="h-8 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Ширина</Label>
                  <Input
                    value={widget.width || "100%"}
                    onChange={(e) => updateWidget("width", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Высота</Label>
                  <Input
                    value={widget.height || "200px"}
                    onChange={(e) => updateWidget("height", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={widget.autoplay ?? false}
                    onCheckedChange={(v) => updateWidget("autoplay", v)}
                  />
                  <Label className="text-xs">Автозапуск</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={widget.loop ?? false}
                    onCheckedChange={(v) => updateWidget("loop", v)}
                  />
                  <Label className="text-xs">Зацикливать</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={widget.muted ?? true}
                    onCheckedChange={(v) => updateWidget("muted", v)}
                  />
                  <Label className="text-xs">Без звука</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={widget.controls ?? true}
                    onCheckedChange={(v) => updateWidget("controls", v)}
                  />
                  <Label className="text-xs">Контролы</Label>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Скругление: {widget.borderRadius || 0}</Label>
                <Slider
                  value={[widget.borderRadius || 0]}
                  min={0}
                  max={50}
                  step={1}
                  onValueChange={([v]) => updateWidget("borderRadius", v)}
                />
              </div>
            </>
          )}

          {widget.type === "lottie" && (
            <>
              <div className="space-y-1">
                <Label className="text-xs">URL анимации (JSON)</Label>
                <Input
                  value={widget.url}
                  onChange={(e) => updateWidget("url", e.target.value)}
                  placeholder="https://assets.lottiefiles.com/..."
                  className="h-8 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Ширина</Label>
                  <Input
                    value={widget.width || "200px"}
                    onChange={(e) => updateWidget("width", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Высота</Label>
                  <Input
                    value={widget.height || "200px"}
                    onChange={(e) => updateWidget("height", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Скорость: {widget.speed ?? 1}x</Label>
                <Slider
                  value={[widget.speed ?? 1]}
                  min={0.1}
                  max={3}
                  step={0.1}
                  onValueChange={([v]) => updateWidget("speed", v)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={widget.loop ?? true}
                    onCheckedChange={(v) => updateWidget("loop", v)}
                  />
                  <Label className="text-xs">Зацикливать</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={widget.autoplay ?? true}
                    onCheckedChange={(v) => updateWidget("autoplay", v)}
                  />
                  <Label className="text-xs">Автозапуск</Label>
                </div>
              </div>
            </>
          )}

          {widget.type === "container" && (
            <>
              <ColorInput 
                value={widget.backgroundColor || "#f5f5f5"} 
                onChange={(v) => updateWidget("backgroundColor", v)}
                label="Цвет фона"
              />
              <div className="space-y-1">
                <Label className="text-xs">Отступы: {widget.padding || 16}px</Label>
                <Slider
                  value={[widget.padding || 16]}
                  min={0}
                  max={48}
                  step={4}
                  onValueChange={([v]) => updateWidget("padding", v)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Скругление: {widget.borderRadius || 8}</Label>
                <Slider
                  value={[widget.borderRadius || 8]}
                  min={0}
                  max={50}
                  step={1}
                  onValueChange={([v]) => updateWidget("borderRadius", v)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Направление</Label>
                  <Select 
                    value={widget.flexDirection || "column"} 
                    onValueChange={(v) => updateWidget("flexDirection", v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="column">Вертикально</SelectItem>
                      <SelectItem value="row">Горизонтально</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Зазор: {widget.gap || 8}px</Label>
                  <Slider
                    value={[widget.gap || 8]}
                    min={0}
                    max={32}
                    step={2}
                    onValueChange={([v]) => updateWidget("gap", v)}
                  />
                </div>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="style" className="space-y-3 pt-2">
          <div className="space-y-1">
            <Label className="text-xs">Прозрачность: {Math.round((widget.opacity ?? 1) * 100)}%</Label>
            <Slider
              value={[widget.opacity ?? 1]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={([v]) => updateWidget("opacity", v)}
            />
          </div>
          
          {(widget.type === "button" && widget.variant === "custom") && (
            <>
              <ColorInput 
                value={widget.textColor || "#ffffff"} 
                onChange={(v) => updateWidget("textColor", v)}
                label="Цвет текста"
              />
              <ColorInput 
                value={widget.backgroundColor || "#6366f1"} 
                onChange={(v) => updateWidget("backgroundColor", v)}
                label="Цвет фона"
              />
              <GradientEditor
                gradient={widget.backgroundGradient}
                onChange={(g) => updateWidget("backgroundGradient", g)}
              />
              <BorderEditor
                border={widget.border}
                onChange={(b) => updateWidget("border", b)}
              />
              <ShadowEditor
                shadow={widget.shadow}
                onChange={(s) => updateWidget("shadow", s)}
              />
            </>
          )}

          {widget.type === "text" && (
            <>
              <ColorInput 
                value={widget.backgroundColor || ""} 
                onChange={(v) => updateWidget("backgroundColor", v)}
                label="Цвет фона"
              />
              <GradientEditor
                gradient={widget.backgroundGradient}
                onChange={(g) => updateWidget("backgroundGradient", g)}
              />
              <ShadowEditor
                shadow={widget.textShadow}
                onChange={(s) => updateWidget("textShadow", s)}
              />
            </>
          )}

          {widget.type === "image" && (
            <>
              <BorderEditor
                border={widget.border}
                onChange={(b) => updateWidget("border", b)}
              />
              <ShadowEditor
                shadow={widget.shadow}
                onChange={(s) => updateWidget("shadow", s)}
              />
              <Collapsible>
                <CollapsibleTrigger className="flex items-center gap-2 w-full text-sm font-medium py-1">
                  <ChevronRight className="h-3 w-3" />
                  Фильтры
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 pt-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Яркость: {widget.filter?.brightness ?? 100}%</Label>
                    <Slider
                      value={[widget.filter?.brightness ?? 100]}
                      min={0}
                      max={200}
                      step={5}
                      onValueChange={([v]) => updateWidget("filter", { ...widget.filter, brightness: v })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Контраст: {widget.filter?.contrast ?? 100}%</Label>
                    <Slider
                      value={[widget.filter?.contrast ?? 100]}
                      min={0}
                      max={200}
                      step={5}
                      onValueChange={([v]) => updateWidget("filter", { ...widget.filter, contrast: v })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Насыщенность: {widget.filter?.saturation ?? 100}%</Label>
                    <Slider
                      value={[widget.filter?.saturation ?? 100]}
                      min={0}
                      max={200}
                      step={5}
                      onValueChange={([v]) => updateWidget("filter", { ...widget.filter, saturation: v })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Размытие: {widget.filter?.blur ?? 0}px</Label>
                    <Slider
                      value={[widget.filter?.blur ?? 0]}
                      min={0}
                      max={20}
                      step={1}
                      onValueChange={([v]) => updateWidget("filter", { ...widget.filter, blur: v })}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </>
          )}

          {widget.type === "container" && (
            <>
              <GradientEditor
                gradient={widget.backgroundGradient}
                onChange={(g) => updateWidget("backgroundGradient", g)}
              />
              <BorderEditor
                border={widget.border}
                onChange={(b) => updateWidget("border", b)}
              />
              <ShadowEditor
                shadow={widget.shadow}
                onChange={(s) => updateWidget("shadow", s)}
              />
            </>
          )}

          {widget.type === "icon" && (
            <ShadowEditor
              shadow={widget.shadow}
              onChange={(s) => updateWidget("shadow", s)}
            />
          )}
        </TabsContent>

        <TabsContent value="layout" className="space-y-3 pt-2">
          <SpacingEditor 
            widget={widget} 
            onChange={(key, value) => updateWidget(key, value)} 
          />
          <div className="space-y-1">
            <Label className="text-xs">Z-Index (слой): {widget.zIndex ?? widget.order}</Label>
            <Slider
              value={[widget.zIndex ?? widget.order]}
              min={0}
              max={100}
              step={1}
              onValueChange={([v]) => updateWidget("zIndex", v)}
            />
          </div>
        </TabsContent>
      </Tabs>
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
      <h4 className="font-medium text-sm">Настройки экрана</h4>
      
      <ColorInput 
        value={layout.backgroundColor || "#ffffff"} 
        onChange={(v) => updateLayout("backgroundColor", v)}
        label="Цвет фона"
      />

      <GradientEditor
        gradient={layout.backgroundGradient}
        onChange={(g) => updateLayout("backgroundGradient", g)}
      />

      <div className="space-y-1">
        <Label className="text-xs">Фоновое изображение</Label>
        <Input
          value={layout.backgroundImage || ""}
          onChange={(e) => updateLayout("backgroundImage", e.target.value)}
          placeholder="https://..."
          className="h-8 text-xs"
        />
      </div>

      {layout.backgroundImage && (
        <>
          <ColorInput 
            value={layout.backgroundOverlay || ""} 
            onChange={(v) => updateLayout("backgroundOverlay", v)}
            label="Оверлей (затемнение)"
          />
          <div className="space-y-1">
            <Label className="text-xs">Размытие фона: {layout.backgroundBlur || 0}px</Label>
            <Slider
              value={[layout.backgroundBlur || 0]}
              min={0}
              max={20}
              step={1}
              onValueChange={([v]) => updateLayout("backgroundBlur", v)}
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label className="text-xs">Отступы</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Сверху: {layout.paddingTop ?? layout.padding ?? 16}</Label>
            <Slider
              value={[layout.paddingTop ?? layout.padding ?? 16]}
              min={0}
              max={64}
              step={4}
              onValueChange={([v]) => updateLayout("paddingTop", v)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Снизу: {layout.paddingBottom ?? layout.padding ?? 16}</Label>
            <Slider
              value={[layout.paddingBottom ?? layout.padding ?? 16]}
              min={0}
              max={64}
              step={4}
              onValueChange={([v]) => updateLayout("paddingBottom", v)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Слева: {layout.paddingLeft ?? layout.padding ?? 16}</Label>
            <Slider
              value={[layout.paddingLeft ?? layout.padding ?? 16]}
              min={0}
              max={48}
              step={4}
              onValueChange={([v]) => updateLayout("paddingLeft", v)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Справа: {layout.paddingRight ?? layout.padding ?? 16}</Label>
            <Slider
              value={[layout.paddingRight ?? layout.padding ?? 16]}
              min={0}
              max={48}
              step={4}
              onValueChange={([v]) => updateLayout("paddingRight", v)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Вертикальное выравнивание</Label>
        <Select 
          value={layout.verticalAlignment || "start"} 
          onValueChange={(v) => updateLayout("verticalAlignment", v as ScreenLayout["verticalAlignment"])}
        >
          <SelectTrigger className="h-8 text-xs">
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

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Switch
            checked={layout.safeAreaTop ?? true}
            onCheckedChange={(v) => updateLayout("safeAreaTop", v)}
          />
          <Label className="text-xs">Safe Area сверху (notch)</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={layout.safeAreaBottom ?? true}
            onCheckedChange={(v) => updateLayout("safeAreaBottom", v)}
          />
          <Label className="text-xs">Safe Area снизу</Label>
        </div>
      </div>
    </div>
  );
}
