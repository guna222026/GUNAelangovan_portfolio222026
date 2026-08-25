import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldInput, type FieldDef } from "./field-inputs";
import { insertRow, listRows, updateRow, type Row } from "@/lib/admin-db";

const FIELDS: FieldDef[] = [
  { name: "contact_eyebrow", label: "Section label (eyebrow)", type: "text" },
  { name: "contact_heading", label: "Section heading", type: "text" },
  { name: "contact_description", label: "Short description", type: "textarea", rows: 3 },
  { name: "contact_card_title", label: "Direct contact card title", type: "text" },
  { name: "contact_availability_text", label: "Availability / status text", type: "text" },
  { name: "email", label: "Email", type: "text" },
  { name: "phone", label: "Phone", type: "text" },
  { name: "location", label: "Location", type: "text" },
  { name: "linkedin_url", label: "LinkedIn URL", type: "text" },
  { name: "github_url", label: "GitHub URL", type: "text" },
  {
    name: "contact_links",
    label: "Other links (format: Label | https://url)",
    type: "list",
    placeholder: "Twitter | https://x.com/…",
  },
  { name: "contact_form_title", label: "Contact form title", type: "text" },
  { name: "contact_form_description", label: "Contact form description", type: "textarea", rows: 2 },
  { name: "contact_button_text", label: "Submit button text", type: "text" },
  { name: "available", label: "Available for opportunities", type: "switch" },
];

const EMPTY: Record<string, unknown> = {
  contact_eyebrow: "06 — Contact",
  contact_heading: "Let's build something",
  contact_description: "",
  contact_card_title: "Direct",
  contact_availability_text: "",
  email: "",
  phone: "",
  location: "",
  linkedin_url: "",
  github_url: "",
  contact_links: [],
  contact_form_title: "Send a message",
  contact_form_description: "",
  contact_button_text: "Send message",
  available: true,
};

export function ContactEditor() {
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
      const payload = Object.fromEntries(
        FIELDS.map((f) => [f.name, draft[f.name] ?? EMPTY[f.name]]),
      );
      if (existing) await updateRow("profile", existing.id, payload);
      else await insertRow("profile", payload);
    },
    onSuccess: () => {
      toast.success("Contact details updated");
      void queryClient.invalidateQueries();
    },
    onError: (error: Error) => toast.error(error.message || "Could not save contact details"),
  });

  const cancel = () => {
    setDraft(existing ? { ...EMPTY, ...existing } : EMPTY);
    toast("Changes discarded");
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div>
      <h2 className="font-display text-lg font-semibold">Contact</h2>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Everything shown in the public Contact section — headings, direct details, links and form
        copy.
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
        <div className="flex items-center gap-2 sm:col-span-2">
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save contact"}
          </Button>
          <Button variant="ghost" onClick={cancel} disabled={save.isPending}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
