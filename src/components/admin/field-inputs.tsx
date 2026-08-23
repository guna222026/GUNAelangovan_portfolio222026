import { useEffect, useState } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { uploadMedia } from "@/lib/admin-db";
import { resolveMedia } from "@/lib/portfolio";
import {
  acceptAttribute,
  processImage,
  validateMediaFile,
  type MediaKind,
} from "@/lib/media";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "switch"
  | "date"
  | "list"
  | "media";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  rows?: number;
  full?: boolean;
  /** media fields: what file kind is allowed (defaults to "image") */
  accept?: MediaKind;
  /** media fields: center-crop images to this width/height ratio before upload */
  aspect?: number;
};

export function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  const [draft, setDraft] = useState("");
  const [uploading, setUploading] = useState(false);

  if (field.type === "switch") {
    return (
      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <Label htmlFor={field.name}>{field.label}</Label>
        <Switch
          id={field.name}
          checked={Boolean(value)}
          onCheckedChange={(checked) => onChange(checked)}
        />
      </div>
    );
  }

  if (field.type === "list") {
    const items = Array.isArray(value) ? (value as string[]) : [];
    return (
      <div className="grid gap-2">
        <Label>{field.label}</Label>
        <div className="flex gap-2">
          <Input
            value={draft}
            placeholder={field.placeholder ?? "Add an item and press Add"}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                if (draft.trim()) {
                  onChange([...items, draft.trim()]);
                  setDraft("");
                }
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (!draft.trim()) return;
              onChange([...items, draft.trim()]);
              setDraft("");
            }}
          >
            Add
          </Button>
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {items.map((item, index) => (
              <Badge key={`${item}-${index}`} variant="secondary" className="gap-1.5 py-1">
                <span className="max-w-[22rem] truncate">{item}</span>
                <button
                  type="button"
                  aria-label={`Remove ${item}`}
                  onClick={() => onChange(items.filter((_, i) => i !== index))}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (field.type === "media") {
    return (
      <div className="grid gap-2">
        <Label htmlFor={field.name}>{field.label}</Label>
        <Input
          id={field.name}
          value={String(value ?? "")}
          placeholder={field.placeholder ?? "Upload a file or paste a URL"}
          onChange={(event) => onChange(event.target.value)}
        />
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
            <label className="cursor-pointer">
              <Upload className="size-4" /> {uploading ? "Uploading…" : "Upload"}
              <input
                type="file"
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  try {
                    const path = await uploadMedia(file, field.name);
                    onChange(path);
                    toast.success("File uploaded");
                  } catch (error) {
                    toast.error((error as Error).message);
                  } finally {
                    setUploading(false);
                    event.target.value = "";
                  }
                }}
              />
            </label>
          </Button>
          {value ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
              Clear
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="grid gap-2">
        <Label htmlFor={field.name}>{field.label}</Label>
        <Textarea
          id={field.name}
          rows={field.rows ?? 4}
          value={String(value ?? "")}
          placeholder={field.placeholder ?? ""}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={field.name}>{field.label}</Label>
      <Input
        id={field.name}
        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
        value={String(value ?? "")}
        placeholder={field.placeholder ?? ""}
        onChange={(event) =>
          onChange(
            field.type === "number"
              ? Number(event.target.value)
              : event.target.value === "" && field.type === "date"
                ? null
                : event.target.value,
          )
        }
      />
    </div>
  );
}