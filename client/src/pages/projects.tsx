import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuthenticatedFetch } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import type { Project, Onboarding } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, MoreVertical, FolderOpen, Pencil, Trash2, Key, Copy, Check, BarChart3 } from "lucide-react";

interface ProjectWithOnboardings extends Project {
  onboardings: Onboarding[];
}

export default function ProjectsPage() {
  const [, setLocation] = useLocation();
  const authFetch = useAuthenticatedFetch();
  const { toast } = useToast();
  const [newProjectName, setNewProjectName] = useState("");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editedName, setEditedName] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { data: projects, isLoading } = useQuery<ProjectWithOnboardings[]>({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const res = await authFetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await authFetch("/api/projects", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setNewProjectName("");
      setIsCreateOpen(false);
      toast({ title: "Project created successfully" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const res = await authFetch(`/api/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to update project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setEditingProject(null);
      setIsEditOpen(false);
      toast({ title: "Project updated successfully" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch(`/api/projects/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete project");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setProjectToDelete(null);
      setIsDeleteOpen(false);
      toast({ title: "Project deleted successfully" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const handleCopyApiKey = async (apiKey: string) => {
    await navigator.clipboard.writeText(apiKey);
    setCopiedKey(apiKey);
    setTimeout(() => setCopiedKey(null), 2000);
    toast({ title: "API key copied to clipboard" });
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setEditedName(project.name);
    setIsEditOpen(true);
  };

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Manage your onboarding projects
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-project">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create new project</DialogTitle>
              <DialogDescription>
                Enter a name for your new project
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              data-testid="input-project-name"
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                data-testid="button-cancel-create"
              >
                Cancel
              </Button>
              <Button
                onClick={() => createProjectMutation.mutate(newProjectName)}
                disabled={!newProjectName.trim() || createProjectMutation.isPending}
                data-testid="button-confirm-create"
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="group" data-testid={`card-project-${project.id}`}>
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div className="space-y-1 min-w-0">
                  <CardTitle className="text-base font-medium truncate">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      data-testid={`button-project-menu-${project.id}`}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setLocation(`/projects/${project.id}`)}
                      data-testid={`menu-open-${project.id}`}
                    >
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Open
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setLocation(`/projects/${project.id}/analytics`)}
                      data-testid={`menu-analytics-${project.id}`}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleCopyApiKey(project.publicApiKey)}
                      data-testid={`menu-copy-key-${project.id}`}
                    >
                      {copiedKey === project.publicApiKey ? (
                        <Check className="h-4 w-4 mr-2" />
                      ) : (
                        <Key className="h-4 w-4 mr-2" />
                      )}
                      Copy API Key
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleEditProject(project)}
                      data-testid={`menu-edit-${project.id}`}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteProject(project)}
                      className="text-destructive focus:text-destructive"
                      data-testid={`menu-delete-${project.id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">
                    {project.onboardings?.length || 0} onboardings
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-muted px-2 py-1 rounded font-mono truncate">
                    {project.publicApiKey}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyApiKey(project.publicApiKey)}
                    data-testid={`button-copy-key-${project.id}`}
                  >
                    {copiedKey === project.publicApiKey ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setLocation(`/projects/${project.id}`)}
                  data-testid={`button-open-project-${project.id}`}
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Open Project
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-3 rounded-full bg-muted mb-4">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No projects yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first project to get started with onboarding screens
            </p>
            <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-first-project">
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription>
              Enter a new name for your project
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Project name"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            data-testid="input-edit-project-name"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => editingProject && updateProjectMutation.mutate({ id: editingProject.id, name: editedName })}
              disabled={!editedName.trim() || updateProjectMutation.isPending}
              data-testid="button-confirm-edit"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{projectToDelete?.name}"? This action cannot be undone and will delete all associated onboardings.
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
              onClick={() => projectToDelete && deleteProjectMutation.mutate(projectToDelete.id)}
              disabled={deleteProjectMutation.isPending}
              data-testid="button-confirm-delete"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
