import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuthenticatedFetch } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Send, Loader2, CheckCircle2 } from "lucide-react";
import type { Widget, ScreenLayout } from "@/components/widget-editor/widget-types";

export interface GeneratedScreen {
  title: string;
  description: string;
  widgets: Widget[];
  layout: ScreenLayout;
}

interface AIAgentProps {
  onScreensGenerated: (screens: GeneratedScreen[]) => void;
}

export function AIAgent({ onScreensGenerated }: AIAgentProps) {
  const [prompt, setPrompt] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const authFetch = useAuthenticatedFetch();

  const generateMutation = useMutation({
    mutationFn: async (userPrompt: string) => {
      const res = await authFetch("/api/ai/generate-screens", {
        method: "POST",
        body: JSON.stringify({ prompt: userPrompt }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to generate screens");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.screens && Array.isArray(data.screens)) {
        onScreensGenerated(data.screens);
        setPrompt("");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    },
  });

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    generateMutation.mutate(prompt.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Screen Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          placeholder="Describe the screens you want, e.g., 'Create a welcome screen for a fitness app with motivational text and a get started button'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          disabled={generateMutation.isPending}
          className="text-sm resize-none"
          data-testid="input-ai-prompt"
        />
        
        {generateMutation.isError && (
          <p className="text-xs text-destructive" data-testid="text-ai-error">
            {generateMutation.error.message}
          </p>
        )}

        {showSuccess && (
          <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400" data-testid="text-ai-success">
            <CheckCircle2 className="h-3 w-3" />
            Screens generated successfully!
          </div>
        )}

        <Button
          size="sm"
          className="w-full"
          onClick={handleSubmit}
          disabled={!prompt.trim() || generateMutation.isPending}
          data-testid="button-generate-screens"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Generate Screens
            </>
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground">
          Tip: Be specific about colors, text, and layout preferences.
        </p>
      </CardContent>
    </Card>
  );
}
