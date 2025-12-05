import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuthenticatedFetch } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import type { Project, Onboarding } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, MoreVertical, Pencil, Trash2, ArrowLeft, Play, FileEdit, Layers, Send } from "lucide-react";

interface OnboardingWithScreens extends Onboarding {
  screenCount?: number;
}

interface ProjectWithOnboardings extends Project {
  onboardings: OnboardingWithScreens[];
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const authFetch = useAuthenticatedFetch();
  const { toast } = useToast();
  const [newOnboardingName, setNewOnboardingName] = useState("");
  const [editingOnboarding, setEditingOnboarding] = useState<Onboarding | null>(null);
  const [editedName, setEditedName] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [onboardingToDelete, setOnboardingToDelete] = useState<Onboarding | null>(null);

  const { data: project, isLoading } = useQuery<ProjectWithOnboardings>({
    queryKey: ["/api/projects", id],
    queryFn: async () => {
      const res = await authFetch(`/api/projects/${id}`);
      if (!res.ok) throw new Error("Failed to fetch project");
      return res.json();
    },
    enabled: !!id,
  });

  const createOnboardingMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await authFetch(`/api/projects/${id}/onboardings`, {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create onboarding");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", id] });
      setNewOnboardingName("");
      setIsCreateOpen(false);
      toast({ title: "Onboarding created successfully" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const updateOnboardingMutation = useMutation({
    mutationFn: async ({ onboardingId, name }: { onboardingId: string; name: string }) => {
      const res = await authFetch(`/api/onboardings/${onboardingId}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to update onboarding");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", id] });
      setEditingOnboarding(null);
      setIsEditOpen(false);
      toast({ title: "Onboarding updated successfully" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const deleteOnboardingMutation = useMutation({
    mutationFn: async (onboardingId: string) => {
      const res = await authFetch(`/api/onboardings/${onboardingId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete onboarding");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", id] });
      setOnboardingToDelete(null);
      setIsDeleteOpen(false);
      toast({ title: "Onboarding deleted successfully" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const publishOnboardingMutation = useMutation({
    mutationFn: async (onboardingId: string) => {
      const res = await authFetch(`/api/onboardings/${onboardingId}/publish`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to publish onboarding");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", id] });
      toast({ title: "Onboarding published successfully" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const handleEditOnboarding = (onboarding: Onboarding) => {
    setEditingOnboarding(onboarding);
    setEditedName(onboarding.name);
    setIsEditOpen(true);
  };

  const handleDeleteOnboarding = (onboarding: Onboarding) => {
    setOnboardingToDelete(onboarding);
    setIsDeleteOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-lg font-medium mb-2">Project not found</h2>
        <p className="text-sm text-muted-foreground mb-4">
          The project you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button onClick={() => setLocation("/projects")} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/projects")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{project.name}</h1>
            <p className="text-sm text-muted-foreground">
              {project.onboardings?.length || 0} onboardings
            </p>
          </div>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-onboarding">
              <Plus className="h-4 w-4 mr-2" />
              New Onboarding
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create new onboarding</DialogTitle>
              <DialogDescription>
                Enter a name for your new onboarding
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Onboarding name"
              value={newOnboardingName}
              onChange={(e) => setNewOnboardingName(e.target.value)}
              data-testid="input-onboarding-name"
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => createOnboardingMutation.mutate(newOnboardingName)}
                disabled={!newOnboardingName.trim() || createOnboardingMutation.isPending}
                data-testid="button-confirm-create-onboarding"
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {project.onboardings && project.onboardings.length > 0 ? (
        <div className="space-y-3">
          {project.onboardings.map((onboarding) => (
            <Card key={onboarding.id} data-testid={`card-onboarding-${onboarding.id}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 py-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-2 rounded-md bg-muted">
                    <Layers className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base font-medium truncate">
                      {onboarding.name}
                    </CardTitle>
                    <CardDescription className="text-xs flex items-center gap-2 flex-wrap">
                      <span>Version {onboarding.version}</span>
                      <span className="text-muted-foreground/50">|</span>
                      <span>{onboarding.screenCount ?? 0} screens</span>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={onboarding.status === "published" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {onboarding.status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation(`/editor/${onboarding.id}`)}
                    data-testid={`button-edit-onboarding-${onboarding.id}`}
                  >
                    <FileEdit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => publishOnboardingMutation.mutate(onboarding.id)}
                    disabled={publishOnboardingMutation.isPending}
                    data-testid={`button-publish-onboarding-${onboarding.id}`}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Publish
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-testid={`button-onboarding-menu-${onboarding.id}`}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleEditOnboarding(onboarding)}
                        data-testid={`menu-rename-${onboarding.id}`}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteOnboarding(onboarding)}
                        className="text-destructive focus:text-destructive"
                        data-testid={`menu-delete-${onboarding.id}`}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-3 rounded-full bg-muted mb-4">
              <Layers className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No onboardings yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first onboarding to start building screens
            </p>
            <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-first-onboarding">
              <Plus className="h-4 w-4 mr-2" />
              Create Onboarding
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename onboarding</DialogTitle>
            <DialogDescription>
              Enter a new name for your onboarding
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Onboarding name"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            data-testid="input-edit-onboarding-name"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => editingOnboarding && updateOnboardingMutation.mutate({ onboardingId: editingOnboarding.id, name: editedName })}
              disabled={!editedName.trim() || updateOnboardingMutation.isPending}
              data-testid="button-confirm-edit-onboarding"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete onboarding</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{onboardingToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => onboardingToDelete && deleteOnboardingMutation.mutate(onboardingToDelete.id)}
              disabled={deleteOnboardingMutation.isPending}
              data-testid="button-confirm-delete-onboarding"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
