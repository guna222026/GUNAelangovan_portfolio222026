import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FieldInput, type FieldDef } from "./field-inputs";
import { deleteRow, insertRow, listRows, updateRow, type Row } from "@/lib/admin-db";

export type CollectionConfig = {
  table: string;
  title: string;
  description: string;
  fields: FieldDef[];
  defaults: Record<string, unknown>;
  primaryLabel: (row: Row) => string;
  secondaryLabel?: (row: Row) => string;
  orderColumn?: string;
};

export function CollectionManager({ config }: { config: CollectionConfig }) {
  const queryClient = useQueryClient();
  const orderColumn = config.orderColumn ?? "sort_order";
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, unknown>>(config.defaults);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", config.table],
    queryFn: () => listRows(config.table, orderColumn),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", config.table] });
    void queryClient.invalidateQueries();
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload = Object.fromEntries(
        config.fields.map((field) => [field.name, draft[field.name] ?? config.defaults[field.name]]),
      );
      if (editingId) await updateRow(config.table, editingId, payload);
      else await insertRow(config.table, payload);
    },
    onSuccess: () => {
      toast.success(editingId ? "Changes saved" : "Entry created");
      setOpen(false);
      setEditingId(null);
      setDraft(config.defaults);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteRow(config.table, id),
    onSuccess: () => {
      toast.success("Entry deleted");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const startCreate = () => {
    setEditingId(null);
    setDraft(config.defaults);
    setOpen(true);
  };

  const startEdit = (row: Row) => {
    setEditingId(row.id);
    setDraft({ ...config.defaults, ...row });
    setOpen(true);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold">{config.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{config.description}</p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) setEditingId(null);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={startCreate}>
              <Plus className="size-4" /> New entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingId ? `Edit ${config.title.toLowerCase()}` : `New ${config.title.toLowerCase()}`}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-5 py-2 sm:grid-cols-2">
              {config.fields.map((field) => (
                <div
                  key={field.name}
                  className={
                    field.full || field.type === "textarea" || field.type === "list"
                      ? "sm:col-span-2"
                      : ""
                  }
                >
                  <FieldInput
                    field={field}
                    value={draft[field.name]}
                    onChange={(next) => setDraft((prev) => ({ ...prev, [field.name]: next }))}
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => save.mutate()} disabled={save.isPending}>
                {save.isPending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="surface-card p-10 text-center text-sm text-muted-foreground">
          Nothing here yet. Create the first entry.
        </div>
      ) : (
        <div className="grid gap-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="surface-card flex flex-wrap items-center justify-between gap-4 p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-semibold">
                  {config.primaryLabel(row)}
                </p>
                {config.secondaryLabel && (
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {config.secondaryLabel(row)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {"published" in row && (
                  <Badge variant={row["published"] ? "secondary" : "outline"} className="font-mono text-[10px]">
                    {row["published"] ? "Published" : "Hidden"}
                  </Badge>
                )}
                <Button variant="outline" size="icon" aria-label="Edit" onClick={() => startEdit(row)}>
                  <Pencil className="size-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Delete">
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This permanently removes “{config.primaryLabel(row)}” from the site.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => remove.mutate(row.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
