import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldInput, type FieldDef } from "./field-inputs";
import { insertRow, listRows, updateRow, type Row } from "@/lib/admin-db";

const FIELDS: FieldDef[] = [
  { name: "full_name", label: "Full name", type: "text" },
  { name: "title", label: "Professional title", type: "text" },
  { name: "tagline", label: "Tagline (hero badge)", type: "text", full: true },
  { name: "headline", label: "Headline (hero mono line)", type: "text", full: true },
  { name: "summary", label: "Summary", type: "textarea", rows: 4 },
  { name: "about", label: "About section intro", type: "textarea", rows: 4 },
  { name: "email", label: "Email", type: "text" },
  { name: "phone", label: "Phone", type: "text" },
  { name: "location", label: "Location", type: "text" },
  { name: "linkedin_url", label: "LinkedIn URL", type: "text" },
  { name: "github_url", label: "GitHub URL", type: "text" },
  { name: "avatar_url", label: "Profile photo", type: "media", accept: "image", aspect: 1 },
  { name: "resume_url", label: "Resume file", type: "media", accept: "pdf" },
  { name: "languages", label: "Languages", type: "list" },
  { name: "interests", label: "Focus areas", type: "list" },
  { name: "available", label: "Available for opportunities", type: "switch" },
];

const EMPTY: Record<string, unknown> = {
  full_name: "",
  title: "",
  tagline: "",
  headline: "",
  summary: "",
  about: "",
  email: "",
  phone: "",
  location: "",
  linkedin_url: "",
  github_url: "",
  avatar_url: "",
  resume_url: "",
  languages: [],
  interests: [],
  available: true,
};

export function ProfileEditor() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Record<string, unknown>>(EMPTY);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", "profile"],
    queryFn: () => listRows("profile", "created_at"),
  });
  const existing = rows[0] as Row | undefined;

  useEffect(() => {
    if (existing) setDraft({ ...EMPTY, ...existing });
  }, [existing]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = Object.fromEntries(FIELDS.map((f) => [f.name, draft[f.name] ?? EMPTY[f.name]]));
      if (existing) await updateRow("profile", existing.id, payload);
      else await insertRow("profile", payload);
    },
    onSuccess: () => {
      toast.success("Profile updated");
      void queryClient.invalidateQueries();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div>
      <h2 className="font-display text-lg font-semibold">Profile</h2>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Identity, contact details, photo and resume shown across the site.
      </p>

      <div className="surface-card grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
        {FIELDS.map((field) => (
          <div
            key={field.name}
            className={
              field.full || field.type === "textarea" || field.type === "list" ? "sm:col-span-2" : ""
            }
          >
            <FieldInput
              field={field}
              value={draft[field.name]}
              onChange={(next) => setDraft((prev) => ({ ...prev, [field.name]: next }))}
            />
          </div>
        ))}
        <div className="sm:col-span-2">
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}
