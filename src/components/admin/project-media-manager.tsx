import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/admin-db";
import { resolveMedia, type ProjectMedia } from "@/lib/portfolio";
import { acceptAttribute, processImage, validateMediaFile } from "@/lib/media";

type Kind = "screenshot" | "video";

function useSignedUrl(value: string) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let cancelled = false;
    void resolveMedia(value).then((next) => {
      if (!cancelled) setUrl(next);
    });
    return () => {
      cancelled = true;
    };
  }, [value]);
  return url;
}

function MediaRow({
  item,
  onDelete,
  onCaption,
}: {
  item: ProjectMedia;
  onDelete: () => void;
  onCaption: (caption: string) => void;
}) {
  const url = useSignedUrl(item.url);
  const [caption, setCaption] = useState(item.caption);

  return (
    <div className="surface-card flex flex-wrap items-center gap-4 p-4">
      <div className="h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2">
        {item.kind === "video" ? (
          url ? (
            <video src={url} className="h-full w-full object-cover" muted playsInline />
          ) : null
        ) : url ? (
          <img src={url} alt={item.caption} className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="min-w-[12rem] flex-1">
        <p className="mb-2 font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
          {item.kind}
        </p>
        <Input
          value={caption}
          placeholder="Caption"
          onChange={(event) => setCaption(event.target.value)}
          onBlur={() => {
            if (caption !== item.caption) onCaption(caption);
          }}
        />
      </div>
      <Button variant="ghost" size="icon" aria-label="Delete media" onClick={onDelete}>
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </div>
  );
}

export function ProjectMediaManager() {
  const queryClient = useQueryClient();
  const [projectId, setProjectId] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data: projects = [] } = useQuery({
    queryKey: ["admin", "projects", "options"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id,title")
        .order("sort_order");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const activeId = useMemo(
    () => projectId || projects[0]?.id || "",
    [projectId, projects],
  );

  const { data: media = [], isLoading } = useQuery({
    queryKey: ["admin", "project_media", activeId],
    enabled: Boolean(activeId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_media")
        .select("*")
        .eq("project_id", activeId)
        .order("sort_order");
      if (error) throw new Error(error.message);
      return (data ?? []) as ProjectMedia[];
    },
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "project_media", activeId] });
    void queryClient.invalidateQueries({ queryKey: ["project"] });
  };

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("project_media").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Media removed");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const setCaption = useMutation({
    mutationFn: async ({ id, caption }: { id: string; caption: string }) => {
      const { error } = await supabase.from("project_media").update({ caption }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Caption saved");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleUpload = async (file: File, kind: Kind) => {
    if (!activeId) {
      toast.error("Create a project first.");
      return;
    }
    setUploading(true);
    try {
      validateMediaFile(file, kind === "video" ? "video" : "image");
      let payload: File | Blob = file;
      let extension: string | undefined;
      if (kind === "screenshot") {
        const processed = await processImage(file, { maxDim: 1600 });
        payload = processed.blob;
        extension = processed.extension;
      }
      const path = await uploadMedia(payload, `project-${kind}`, extension);
      const { error } = await supabase.from("project_media").insert({
        project_id: activeId,
        url: path,
        kind,
        caption: "",
        sort_order: media.length,
      });
      if (error) throw new Error(error.message);
      toast.success(kind === "video" ? "Video uploaded" : "Image uploaded");
      invalidate();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-lg font-semibold">Project media</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload screenshots and demo videos shown in the project case study gallery.
        </p>
      </div>

      <div className="surface-card grid gap-4 p-5">
        <div className="grid gap-2">
          <Label>Project</Label>
          <Select value={activeId} onValueChange={setProjectId}>
            <SelectTrigger className="sm:max-w-md">
              <SelectValue placeholder="Choose a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
            <label className="cursor-pointer">
              <Upload className="size-4" /> {uploading ? "Uploading…" : "Upload image"}
              <input
                type="file"
                className="hidden"
                accept={acceptAttribute("image")}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void handleUpload(file, "screenshot");
                }}
              />
            </label>
          </Button>
          <Button type="button" size="sm" disabled={uploading} asChild>
            <label className="cursor-pointer">
              <Upload className="size-4" /> {uploading ? "Uploading…" : "Upload video"}
              <input
                type="file"
                className="hidden"
                accept={acceptAttribute("video")}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void handleUpload(file, "video");
                }}
              />
            </label>
          </Button>
          <span className="text-xs text-muted-foreground">
            Images up to 10 MB · MP4/WebM/MOV videos up to 50 MB
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : media.length === 0 ? (
          <div className="surface-card p-10 text-center text-sm text-muted-foreground">
            No media yet for this project.
          </div>
        ) : (
          media.map((item) => (
            <MediaRow
              key={item.id}
              item={item}
              onDelete={() => remove.mutate(item.id)}
              onCaption={(caption) => setCaption.mutate({ id: item.id, caption })}
            />
          ))
        )}
      </div>
    </div>
  );
}
