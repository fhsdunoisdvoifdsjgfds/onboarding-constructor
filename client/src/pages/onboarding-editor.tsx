import { useState, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuthenticatedFetch } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import type { Onboarding, Screen } from "@shared/schema";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, GripVertical, Save, Send, ImageIcon, Loader2 } from "lucide-react";

interface OnboardingWithScreens extends Onboarding {
  screens: Screen[];
}

interface SortableScreenCardProps {
  screen: Screen;
  onEdit: (screen: Screen) => void;
  onDelete: (screenId: string) => void;
  isDeleting: boolean;
}

function SortableScreenCard({ screen, onEdit, onDelete, isDeleting }: SortableScreenCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: screen.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="group cursor-pointer"
      data-testid={`card-screen-${screen.id}`}
    >
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-4">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 p-1 rounded hover:bg-muted cursor-grab active:cursor-grabbing"
          data-testid={`handle-screen-${screen.id}`}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <div
          className="flex-1 min-w-0"
          onClick={() => onEdit(screen)}
        >
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs shrink-0">
              Screen {screen.order + 1}
            </Badge>
          </div>
          <CardTitle className="text-sm font-medium truncate mb-1">
            {screen.title || "Untitled Screen"}
          </CardTitle>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {screen.description || "No description"}
          </p>
        </div>
        <div className="flex items-start gap-2 shrink-0">
          {screen.imageUrl && (
            <div className="w-12 h-20 rounded-md bg-muted overflow-hidden">
              <img
                src={screen.imageUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(screen.id);
            }}
            disabled={isDeleting}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            data-testid={`button-delete-screen-${screen.id}`}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}

function MobilePreview({ screen }: { screen: Screen | null }) {
  return (
    <div className="w-[280px] mx-auto">
      <div className="relative bg-gray-900 dark:bg-gray-800 rounded-[2.5rem] p-3 shadow-xl">
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full" />
        <div className="bg-background rounded-[2rem] overflow-hidden aspect-[9/19.5] flex flex-col">
          {screen ? (
            <>
              <div className="flex-1 flex items-center justify-center p-4 bg-muted/50">
                {screen.imageUrl ? (
                  <img
                    src={screen.imageUrl}
                    alt=""
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mb-2" />
                    <span className="text-xs">No image</span>
                  </div>
                )}
              </div>
              <div className="p-6 space-y-2 text-center">
                <h3 className="font-semibold text-lg">
                  {screen.title || "Screen Title"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {screen.description || "Screen description goes here"}
                </p>
              </div>
              <div className="p-4 pt-0">
                <div className="w-full h-10 bg-primary rounded-full" />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p className="text-sm">Select a screen to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OnboardingEditorPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const authFetch = useAuthenticatedFetch();
  const { toast } = useToast();
  const [editingScreen, setEditingScreen] = useState<Screen | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: onboarding, isLoading } = useQuery<OnboardingWithScreens>({
    queryKey: ["/api/onboardings", id],
    queryFn: async () => {
      const res = await authFetch(`/api/onboardings/${id}`);
      if (!res.ok) throw new Error("Failed to fetch onboarding");
      return res.json();
    },
    enabled: !!id,
  });

  const addScreenMutation = useMutation({
    mutationFn: async () => {
      const res = await authFetch(`/api/onboardings/${id}/screens`, {
        method: "POST",
        body: JSON.stringify({
          title: "New Screen",
          description: "",
          imageUrl: "",
        }),
      });
      if (!res.ok) throw new Error("Failed to add screen");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboardings", id] });
      toast({ title: "Screen added" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const updateScreenMutation = useMutation({
    mutationFn: async ({ screenId, data }: { screenId: string; data: Partial<Screen> }) => {
      const res = await authFetch(`/api/screens/${screenId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update screen");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboardings", id] });
      setIsSheetOpen(false);
      toast({ title: "Screen updated" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const deleteScreenMutation = useMutation({
    mutationFn: async (screenId: string) => {
      const res = await authFetch(`/api/screens/${screenId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete screen");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboardings", id] });
      toast({ title: "Screen deleted" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const reorderScreensMutation = useMutation({
    mutationFn: async (screenIds: string[]) => {
      const res = await authFetch(`/api/onboardings/${id}/reorder`, {
        method: "PATCH",
        body: JSON.stringify({ screenIds }),
      });
      if (!res.ok) throw new Error("Failed to reorder screens");
      return res.json();
    },
    onError: (error) => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboardings", id] });
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const res = await authFetch(`/api/onboardings/${id}/publish`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to publish onboarding");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboardings", id] });
      toast({ title: "Onboarding published!" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id && onboarding?.screens) {
        const oldIndex = onboarding.screens.findIndex((s) => s.id === active.id);
        const newIndex = onboarding.screens.findIndex((s) => s.id === over.id);

        const newScreens = arrayMove(onboarding.screens, oldIndex, newIndex);
        const screenIds = newScreens.map((s) => s.id);

        queryClient.setQueryData(["/api/onboardings", id], {
          ...onboarding,
          screens: newScreens.map((s, i) => ({ ...s, order: i })),
        });

        reorderScreensMutation.mutate(screenIds);
      }
    },
    [onboarding, id, reorderScreensMutation]
  );

  const handleEditScreen = (screen: Screen) => {
    setEditingScreen(screen);
    setFormData({
      title: screen.title,
      description: screen.description,
      imageUrl: screen.imageUrl,
    });
    setIsSheetOpen(true);
  };

  const handleSaveScreen = () => {
    if (editingScreen) {
      updateScreenMutation.mutate({
        screenId: editingScreen.id,
        data: formData,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex">
        <div className="flex-1 p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
        <div className="w-96 border-l p-6">
          <Skeleton className="h-[500px] w-full" />
        </div>
      </div>
    );
  }

  if (!onboarding) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-lg font-medium mb-2">Onboarding not found</h2>
        <Button onClick={() => setLocation("/projects")} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>
    );
  }

  const sortedScreens = [...(onboarding.screens || [])].sort((a, b) => a.order - b.order);

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation(`/projects/${onboarding.projectId}`)}
              data-testid="button-back-to-project"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{onboarding.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge
                  variant={onboarding.status === "published" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {onboarding.status}
                </Badge>
                <span>Version {onboarding.version}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              onClick={() => publishMutation.mutate()}
              disabled={publishMutation.isPending}
              data-testid="button-publish"
            >
              {publishMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Publish
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">Screens</h2>
              <Button
                onClick={() => addScreenMutation.mutate()}
                disabled={addScreenMutation.isPending}
                data-testid="button-add-screen"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Screen
              </Button>
            </div>

            {sortedScreens.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sortedScreens.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {sortedScreens.map((screen) => (
                      <SortableScreenCard
                        key={screen.id}
                        screen={screen}
                        onEdit={handleEditScreen}
                        onDelete={(screenId) => deleteScreenMutation.mutate(screenId)}
                        isDeleting={deleteScreenMutation.isPending}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-3 rounded-full bg-muted mb-4">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No screens yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add your first screen to start building the onboarding
                  </p>
                  <Button
                    onClick={() => addScreenMutation.mutate()}
                    disabled={addScreenMutation.isPending}
                    data-testid="button-add-first-screen"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Screen
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="w-96 border-l bg-muted/30 p-6 hidden lg:flex flex-col">
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">Preview</h3>
          <MobilePreview screen={editingScreen || sortedScreens[0] || null} />
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Edit Screen</SheetTitle>
            <SheetDescription>
              Update the content for this screen
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter screen title"
                data-testid="input-screen-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter screen description"
                rows={3}
                data-testid="input-screen-description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.png"
                data-testid="input-screen-image-url"
              />
              {formData.imageUrl && (
                <div className="mt-2 rounded-md overflow-hidden bg-muted aspect-video">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "";
                    }}
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsSheetOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveScreen}
                disabled={updateScreenMutation.isPending}
                className="flex-1"
                data-testid="button-save-screen"
              >
                {updateScreenMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
