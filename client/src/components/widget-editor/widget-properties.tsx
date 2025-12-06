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
  // Navigation & Arrows
  "ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "ChevronRight", "ChevronLeft", 
  "ChevronUp", "ChevronDown", "ChevronsRight", "ChevronsLeft", "ArrowBigRight",
  "CornerDownRight", "CornerUpRight", "MoveRight", "ExternalLink", "Undo", "Redo",
  
  // Actions
  "Check", "CheckCircle", "CheckCircle2", "CheckSquare", "X", "XCircle", "Plus", 
  "PlusCircle", "Minus", "MinusCircle", "Edit", "Pencil", "Trash2", "Copy", "Save",
  "Download", "Upload", "Share", "Share2", "Send", "Forward", "Reply", "Refresh",
  
  // Communication
  "Mail", "MessageCircle", "MessageSquare", "Phone", "PhoneCall", "Video", "Mic",
  "MicOff", "Volume2", "VolumeX", "Bell", "BellRing", "BellOff", "AtSign", "Hash",
  
  // Media
  "Image", "Camera", "Film", "Play", "Pause", "PlayCircle", "StopCircle", "SkipForward",
  "SkipBack", "Music", "Radio", "Tv", "Monitor", "Smartphone", "Tablet", "Laptop",
  
  // Social & People
  "User", "UserPlus", "UserMinus", "UserCheck", "Users", "UserCircle", "Contact",
  "Heart", "HeartHandshake", "ThumbsUp", "ThumbsDown", "Smile", "Frown", "Meh",
  
  // Objects & Symbols
  "Star", "Sparkles", "Zap", "Sun", "Moon", "Cloud", "CloudRain", "Snowflake",
  "Flame", "Droplet", "Wind", "Umbrella", "Rainbow", "Leaf", "Trees", "Flower2",
  
  // Business & Finance  
  "Briefcase", "Building", "Building2", "Store", "Wallet", "CreditCard", "DollarSign",
  "Euro", "Percent", "Receipt", "Tag", "Tags", "ShoppingCart", "ShoppingBag", "Package",
  
  // Security & Privacy
  "Shield", "ShieldCheck", "ShieldAlert", "Lock", "LockOpen", "Unlock", "Key", "KeyRound",
  "Eye", "EyeOff", "Fingerprint", "ScanFace", "UserX", "ShieldOff",
  
  // Files & Documents
  "File", "FileText", "FileImage", "FileVideo", "FileAudio", "FilePlus", "FileCheck",
  "Folder", "FolderOpen", "FolderPlus", "Archive", "Clipboard", "ClipboardCheck",
  
  // UI Elements
  "Menu", "MoreHorizontal", "MoreVertical", "Grid", "List", "LayoutGrid", "LayoutList",
  "Sidebar", "PanelLeft", "PanelRight", "Maximize", "Minimize", "Expand", "Shrink",
  
  // Time & Calendar
  "Clock", "Clock1", "Clock12", "Timer", "TimerOff", "Hourglass", "Calendar",
  "CalendarDays", "CalendarCheck", "CalendarPlus", "CalendarX", "History", "Watch",
  
  // Location & Maps
  "MapPin", "Map", "Compass", "Navigation", "Globe", "Globe2", "Locate", "LocateFixed",
  "Milestone", "Route", "Signpost", "Train", "Car", "Bus", "Plane", "Ship",
  
  // Technology
  "Wifi", "WifiOff", "Bluetooth", "BluetoothOff", "Battery", "BatteryCharging",
  "Cpu", "HardDrive", "Server", "Database", "Cloud", "CloudUpload", "CloudDownload",
  
  // Tools & Settings
  "Settings", "Cog", "Wrench", "Hammer", "Screwdriver", "Tool", "Filter", "Search",
  "SearchX", "ZoomIn", "ZoomOut", "Scan", "QrCode", "Barcode", "Code", "Terminal",
  
  // Awards & Achievements
  "Award", "Medal", "Trophy", "Crown", "Gem", "Diamond", "Target", "Goal", "Flag",
  "Bookmark", "BookmarkPlus", "PartyPopper", "Confetti", "Gift", "GiftBox",
  
  // Education & Learning
  "BookOpen", "Book", "GraduationCap", "Library", "School", "PenTool", "Highlighter",
  "Lightbulb", "BrainCircuit", "Brain", "Puzzle", "Gamepad2", "Dice1", "Dice5",
  
  // Health & Wellness
  "Activity", "HeartPulse", "Stethoscope", "Pill", "Syringe", "Thermometer", "Apple",
  "Carrot", "Coffee", "Wine", "Utensils", "ChefHat", "Cake", "IceCream",
  
  // Nature & Environment
  "Mountain", "Waves", "Sunrise", "Sunset", "CloudSun", "Palmtree", "Flower",
  "Bug", "Bird", "Fish", "Cat", "Dog", "Rabbit", "Squirrel", "Turtle",
  
  // Social Media Style
  "AtSign", "Verified", "BadgeCheck", "BadgePlus", "BadgeX", "CircleDot", "Circle",
  "Square", "Triangle", "Hexagon", "Octagon", "Pentagon", "Shapes",
  
  // Misc Popular
  "Rocket", "Sparkle", "Wand2", "Magic", "Infinity", "Power", "PowerOff",
  "ToggleLeft", "ToggleRight", "Link", "Link2", "Unlink", "Anchor", "Feather",
  "Crosshair", "Focus", "Aperture", "Box", "Boxes", "Layers", "Stack",
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
        Shadow
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
          <Label className="text-xs">Blur: {shadow?.blur ?? 8}</Label>
          <Slider
            value={[shadow?.blur ?? 8]}
            min={0}
            max={50}
            step={1}
            onValueChange={([v]) => onChange({ ...shadow, blur: v })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Spread: {shadow?.spread ?? 0}</Label>
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
          label="Shadow Color"
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
        Border
        <Switch
          checked={border?.enabled ?? false}
          onCheckedChange={(v) => onChange({ ...border, enabled: v })}
          onClick={(e) => e.stopPropagation()}
          className="ml-auto"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 pt-2">
        <div className="space-y-1">
          <Label className="text-xs">Width: {border?.width ?? 1}px</Label>
          <Slider
            value={[border?.width ?? 1]}
            min={0}
            max={10}
            step={1}
            onValueChange={([v]) => onChange({ ...border, width: v })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Radius: {border?.radius ?? 0}px</Label>
          <Slider
            value={[border?.radius ?? 0]}
            min={0}
            max={50}
            step={1}
            onValueChange={([v]) => onChange({ ...border, radius: v })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Style</Label>
          <Select 
            value={border?.style || "solid"} 
            onValueChange={(v) => onChange({ ...border, style: v as "solid" | "dashed" | "dotted" })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solid</SelectItem>
              <SelectItem value="dashed">Dashed</SelectItem>
              <SelectItem value="dotted">Dotted</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ColorInput 
          value={border?.color ?? "#e5e5e5"} 
          onChange={(v) => onChange({ ...border, color: v })}
          label="Color"
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
        Gradient
        <Switch
          checked={gradient?.enabled ?? false}
          onCheckedChange={(v) => onChange({ ...gradient, enabled: v })}
          onClick={(e) => e.stopPropagation()}
          className="ml-auto"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 pt-2">
        <div className="space-y-1">
          <Label className="text-xs">Type</Label>
          <Select 
            value={gradient?.type || "linear"} 
            onValueChange={(v) => onChange({ ...gradient, type: v as "linear" | "radial" })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="linear">Linear</SelectItem>
              <SelectItem value="radial">Radial</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {gradient?.type !== "radial" && (
          <div className="space-y-1">
            <Label className="text-xs">Angle: {gradient?.angle ?? 180}</Label>
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
            <Label className="text-xs">Colors</Label>
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
      <Label className="text-xs">Font</Label>
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
        Spacing
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 pt-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Top: {widget.marginTop ?? 0}</Label>
            <Slider
              value={[widget.marginTop ?? 0]}
              min={0}
              max={48}
              step={2}
              onValueChange={([v]) => onChange("marginTop", v)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Bottom: {widget.marginBottom ?? 0}</Label>
            <Slider
              value={[widget.marginBottom ?? 0]}
              min={0}
              max={48}
              step={2}
              onValueChange={([v]) => onChange("marginBottom", v)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Left: {widget.marginLeft ?? 0}</Label>
            <Slider
              value={[widget.marginLeft ?? 0]}
              min={0}
              max={48}
              step={2}
              onValueChange={([v]) => onChange("marginLeft", v)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Right: {widget.marginRight ?? 0}</Label>
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
          placeholder="Widget name"
          className="h-8 text-sm font-medium"
          data-testid="input-widget-name"
        />
        <Button variant="ghost" size="icon" onClick={onDelete} data-testid="button-delete-widget">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="w-full grid grid-cols-3 h-8">
          <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
          <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
          <TabsTrigger value="layout" className="text-xs">Layout</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-3 pt-2">
          {widget.type === "text" && (
            <>
              <div className="space-y-1">
                <Label className="text-xs">Text</Label>
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
                  <Label className="text-xs">Size: {widget.fontSize || 16}</Label>
                  <Slider
                    value={[widget.fontSize || 16]}
                    min={10}
                    max={72}
                    step={1}
                    onValueChange={([v]) => updateWidget("fontSize", v)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Line Height</Label>
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
                  <Label className="text-xs">Weight</Label>
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
                  <Label className="text-xs">Alignment</Label>
                  <Select 
                    value={widget.textAlign || "center"} 
                    onValueChange={(v) => updateWidget("textAlign", v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                      <SelectItem value="justify">Justify</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Case</Label>
                  <Select 
                    value={widget.textTransform || "none"} 
                    onValueChange={(v) => updateWidget("textTransform", v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="uppercase">UPPERCASE</SelectItem>
                      <SelectItem value="lowercase">lowercase</SelectItem>
                      <SelectItem value="capitalize">Capitalize</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Decoration</Label>
                  <Select 
                    value={widget.textDecoration || "none"} 
                    onValueChange={(v) => updateWidget("textDecoration", v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="underline">Underline</SelectItem>
                      <SelectItem value="line-through">Strikethrough</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Letter Spacing: {widget.letterSpacing ?? 0}px</Label>
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
                label="Text Color"
              />
            </>
          )}

          {widget.type === "image" && (
            <>
              <div className="space-y-1">
                <Label className="text-xs">Image URL</Label>
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
                  <Label className="text-xs">Width</Label>
                  <Input
                    value={widget.width || "100%"}
                    onChange={(e) => updateWidget("width", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Height</Label>
                  <Input
                    value={widget.height || "auto"}
                    onChange={(e) => updateWidget("height", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Object Fit</Label>
                <Select 
                  value={widget.objectFit || "contain"} 
                  onValueChange={(v) => updateWidget("objectFit", v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contain">Contain</SelectItem>
                    <SelectItem value="cover">Cover</SelectItem>
                    <SelectItem value="fill">Fill</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Border Radius: {widget.borderRadius || 0}px</Label>
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
                <Label className="text-xs">Button Text</Label>
                <Input
                  value={widget.label}
                  onChange={(e) => updateWidget("label", e.target.value)}
                  className="h-8 text-xs"
                  data-testid="input-button-label"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Style</Label>
                  <Select 
                    value={widget.variant || "primary"} 
                    onValueChange={(v) => updateWidget("variant", v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                      <SelectItem value="outline">Outline</SelectItem>
                      <SelectItem value="ghost">Ghost</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Action</Label>
                  <Select 
                    value={widget.action || "next"} 
                    onValueChange={(v) => updateWidget("action", v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="next">Next</SelectItem>
                      <SelectItem value="skip">Skip</SelectItem>
                      <SelectItem value="close">Close</SelectItem>
                      <SelectItem value="purchase">Purchase</SelectItem>
                      <SelectItem value="url">URL</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {(widget.action === "url" || widget.action === "custom") && (
                <div className="space-y-1">
                  <Label className="text-xs">{widget.action === "url" ? "URL" : "Action ID"}</Label>
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
                <Label className="text-xs">Full Width</Label>
              </div>
              <FontFamilySelect
                value={widget.fontFamily}
                onChange={(v) => updateWidget("fontFamily", v)}
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Size: {widget.fontSize || 16}</Label>
                  <Slider
                    value={[widget.fontSize || 16]}
                    min={12}
                    max={24}
                    step={1}
                    onValueChange={([v]) => updateWidget("fontSize", v)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Height: {widget.height || 48}</Label>
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
                <Label className="text-xs">Border Radius: {widget.borderRadius || 12}</Label>
                <Slider
                  value={[widget.borderRadius || 12]}
                  min={0}
                  max={50}
                  step={1}
                  onValueChange={([v]) => updateWidget("borderRadius", v)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Button Icon</Label>
                <Select 
                  value={widget.iconName || ""} 
                  onValueChange={(v) => updateWidget("iconName", v === "none" ? "" : v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="No icon" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="none">No icon</SelectItem>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {widget.iconName && (
                <div className="space-y-1">
                  <Label className="text-xs">Icon Position</Label>
                  <Select 
                    value={widget.iconPosition || "left"} 
                    onValueChange={(v) => updateWidget("iconPosition", v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2 pt-2">
                <Label className="text-xs">Quick Colors</Label>
                <div className="flex flex-wrap gap-1">
                  {[
                    { bg: "#6366f1", text: "#ffffff", label: "Indigo" },
                    { bg: "#10b981", text: "#ffffff", label: "Green" },
                    { bg: "#f59e0b", text: "#ffffff", label: "Amber" },
                    { bg: "#ef4444", text: "#ffffff", label: "Red" },
                    { bg: "#3b82f6", text: "#ffffff", label: "Blue" },
                    { bg: "#8b5cf6", text: "#ffffff", label: "Purple" },
                    { bg: "#ec4899", text: "#ffffff", label: "Pink" },
                    { bg: "#14b8a6", text: "#ffffff", label: "Teal" },
                    { bg: "#000000", text: "#ffffff", label: "Black" },
                    { bg: "#ffffff", text: "#000000", label: "White" },
                  ].map((color) => (
                    <button
                      key={color.label}
                      type="button"
                      onClick={() => {
                        updateWidget("variant", "custom");
                        updateWidget("backgroundColor", color.bg);
                        updateWidget("textColor", color.text);
                      }}
                      className="w-6 h-6 rounded-md border border-border"
                      style={{ backgroundColor: color.bg }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {widget.type === "spacer" && (
            <div className="space-y-1">
              <Label className="text-xs">Height: {widget.height}px</Label>
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
                <Label className="text-xs">Icon</Label>
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
                <Label className="text-xs">Size: {widget.size || 48}px</Label>
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
                label="Color"
              />
              <ColorInput 
                value={widget.backgroundColor || ""} 
                onChange={(v) => updateWidget("backgroundColor", v)}
                label="Background"
              />
              {widget.backgroundColor && (
                <div className="space-y-1">
                  <Label className="text-xs">Background Radius: {widget.backgroundRadius || 0}</Label>
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
                <Label className="text-xs">Thickness: {widget.thickness || 1}px</Label>
                <Slider
                  value={[widget.thickness || 1]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={([v]) => updateWidget("thickness", v)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Width</Label>
                <Input
                  value={widget.width || "100%"}
                  onChange={(e) => updateWidget("width", e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Style</Label>
                <Select 
                  value={widget.style || "solid"} 
                  onValueChange={(v) => updateWidget("style", v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="dashed">Dashed</SelectItem>
                    <SelectItem value="dotted">Dotted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ColorInput 
                value={widget.color || "#e5e5e5"} 
                onChange={(v) => updateWidget("color", v)}
                label="Color"
              />
            </>
          )}

          {widget.type === "video" && (
            <>
              <div className="space-y-1">
                <Label className="text-xs">Video URL</Label>
                <Input
                  value={widget.url}
                  onChange={(e) => updateWidget("url", e.target.value)}
                  placeholder="https://..."
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Poster (thumbnail)</Label>
                <Input
                  value={widget.poster || ""}
                  onChange={(e) => updateWidget("poster", e.target.value)}
                  placeholder="https://..."
                  className="h-8 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Width</Label>
                  <Input
                    value={widget.width || "100%"}
                    onChange={(e) => updateWidget("width", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Height</Label>
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
                  <Label className="text-xs">Autoplay</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={widget.loop ?? false}
                    onCheckedChange={(v) => updateWidget("loop", v)}
                  />
                  <Label className="text-xs">Loop</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={widget.muted ?? true}
                    onCheckedChange={(v) => updateWidget("muted", v)}
                  />
                  <Label className="text-xs">Muted</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={widget.controls ?? true}
                    onCheckedChange={(v) => updateWidget("controls", v)}
                  />
                  <Label className="text-xs">Controls</Label>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Border Radius: {widget.borderRadius || 0}</Label>
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
                <Label className="text-xs">Animation URL (JSON)</Label>
                <Input
                  value={widget.url}
                  onChange={(e) => updateWidget("url", e.target.value)}
                  placeholder="https://assets.lottiefiles.com/..."
                  className="h-8 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Width</Label>
                  <Input
                    value={widget.width || "200px"}
                    onChange={(e) => updateWidget("width", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Height</Label>
                  <Input
                    value={widget.height || "200px"}
                    onChange={(e) => updateWidget("height", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Speed: {widget.speed ?? 1}x</Label>
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
                  <Label className="text-xs">Loop</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={widget.autoplay ?? true}
                    onCheckedChange={(v) => updateWidget("autoplay", v)}
                  />
                  <Label className="text-xs">Autoplay</Label>
                </div>
              </div>
            </>
          )}

          {widget.type === "container" && (
            <>
              <ColorInput 
                value={widget.backgroundColor || "#f5f5f5"} 
                onChange={(v) => updateWidget("backgroundColor", v)}
                label="Background Color"
              />
              <div className="space-y-1">
                <Label className="text-xs">Padding: {widget.padding || 16}px</Label>
                <Slider
                  value={[widget.padding || 16]}
                  min={0}
                  max={48}
                  step={4}
                  onValueChange={([v]) => updateWidget("padding", v)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Border Radius: {widget.borderRadius || 8}</Label>
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
                  <Label className="text-xs">Direction</Label>
                  <Select 
                    value={widget.flexDirection || "column"} 
                    onValueChange={(v) => updateWidget("flexDirection", v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="column">Vertical</SelectItem>
                      <SelectItem value="row">Horizontal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Gap: {widget.gap || 8}px</Label>
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
            <Label className="text-xs">Opacity: {Math.round((widget.opacity ?? 1) * 100)}%</Label>
            <Slider
              value={[widget.opacity ?? 1]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={([v]) => updateWidget("opacity", v)}
            />
          </div>
          
          {widget.type === "button" && (
            <>
              <ColorInput 
                value={widget.textColor || "#ffffff"} 
                onChange={(v) => {
                  updateWidget("variant", "custom");
                  updateWidget("textColor", v);
                }}
                label="Text Color"
              />
              <ColorInput 
                value={widget.backgroundColor || "#6366f1"} 
                onChange={(v) => {
                  updateWidget("variant", "custom");
                  updateWidget("backgroundColor", v);
                }}
                label="Background Color"
              />
              <GradientEditor
                gradient={widget.backgroundGradient}
                onChange={(g) => {
                  updateWidget("variant", "custom");
                  updateWidget("backgroundGradient", g);
                }}
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
                label="Background Color"
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
                  Filters
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 pt-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Brightness: {widget.filter?.brightness ?? 100}%</Label>
                    <Slider
                      value={[widget.filter?.brightness ?? 100]}
                      min={0}
                      max={200}
                      step={5}
                      onValueChange={([v]) => updateWidget("filter", { ...widget.filter, brightness: v })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Contrast: {widget.filter?.contrast ?? 100}%</Label>
                    <Slider
                      value={[widget.filter?.contrast ?? 100]}
                      min={0}
                      max={200}
                      step={5}
                      onValueChange={([v]) => updateWidget("filter", { ...widget.filter, contrast: v })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Saturation: {widget.filter?.saturation ?? 100}%</Label>
                    <Slider
                      value={[widget.filter?.saturation ?? 100]}
                      min={0}
                      max={200}
                      step={5}
                      onValueChange={([v]) => updateWidget("filter", { ...widget.filter, saturation: v })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Blur: {widget.filter?.blur ?? 0}px</Label>
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
            <Label className="text-xs">Z-Index (layer): {widget.zIndex ?? widget.order}</Label>
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
      <h4 className="font-medium text-sm">Screen Settings</h4>
      
      <ColorInput 
        value={layout.backgroundColor || "#ffffff"} 
        onChange={(v) => updateLayout("backgroundColor", v)}
        label="Background Color"
      />

      <GradientEditor
        gradient={layout.backgroundGradient}
        onChange={(g) => updateLayout("backgroundGradient", g)}
      />

      <div className="space-y-1">
        <Label className="text-xs">Background Image</Label>
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
            label="Overlay (darken)"
          />
          <div className="space-y-1">
            <Label className="text-xs">Background Blur: {layout.backgroundBlur || 0}px</Label>
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
        <Label className="text-xs">Padding</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Top: {layout.paddingTop ?? layout.padding ?? 16}</Label>
            <Slider
              value={[layout.paddingTop ?? layout.padding ?? 16]}
              min={0}
              max={64}
              step={4}
              onValueChange={([v]) => updateLayout("paddingTop", v)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Bottom: {layout.paddingBottom ?? layout.padding ?? 16}</Label>
            <Slider
              value={[layout.paddingBottom ?? layout.padding ?? 16]}
              min={0}
              max={64}
              step={4}
              onValueChange={([v]) => updateLayout("paddingBottom", v)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Left: {layout.paddingLeft ?? layout.padding ?? 16}</Label>
            <Slider
              value={[layout.paddingLeft ?? layout.padding ?? 16]}
              min={0}
              max={48}
              step={4}
              onValueChange={([v]) => updateLayout("paddingLeft", v)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Right: {layout.paddingRight ?? layout.padding ?? 16}</Label>
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
        <Label className="text-xs">Vertical Alignment</Label>
        <Select 
          value={layout.verticalAlignment || "start"} 
          onValueChange={(v) => updateLayout("verticalAlignment", v as ScreenLayout["verticalAlignment"])}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="start">Top</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="end">Bottom</SelectItem>
            <SelectItem value="space-between">Space Between</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Switch
            checked={layout.safeAreaTop ?? true}
            onCheckedChange={(v) => updateLayout("safeAreaTop", v)}
          />
          <Label className="text-xs">Safe Area Top (notch)</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={layout.safeAreaBottom ?? true}
            onCheckedChange={(v) => updateLayout("safeAreaBottom", v)}
          />
          <Label className="text-xs">Safe Area Bottom</Label>
        </div>
      </div>
    </div>
  );
}
