import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CollectionManager } from "./collection-manager";
import { skillCategoriesCollection } from "./collections";
import { deleteRow, insertRow, listRows } from "@/lib/admin-db";

export function SkillsManager() {
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const { data: categories = [] } = useQuery({
    queryKey: ["admin", "skill_categories"],
    queryFn: () => listRows("skill_categories"),
  });
  const { data: skills = [] } = useQuery({
    queryKey: ["admin", "skills"],
    queryFn: () => listRows("skills"),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "skills"] });
    void queryClient.invalidateQueries({ queryKey: ["skills"] });
  };

  const addSkill = useMutation({
    mutationFn: ({ categoryId, name }: { categoryId: string; name: string }) =>
      insertRow("skills", { category_id: categoryId, name, sort_order: skills.length }),
    onSuccess: () => {
      toast.success("Skill added");
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removeSkill = useMutation({
    mutationFn: (id: string) => deleteRow("skills", id),
    onSuccess: refresh,
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="grid gap-12">
      <CollectionManager config={skillCategoriesCollection} />

      <div>
        <h2 className="font-display text-lg font-semibold">Skills</h2>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
          Add individual technologies to each category.
        </p>
        <div className="grid gap-4">
          {categories.map((category) => {
            const categoryId = category.id;
            const items = skills.filter((skill) => skill["category_id"] === categoryId);
            return (
              <div key={categoryId} className="surface-card p-5">
                <p className="font-display text-sm font-semibold">{String(category["name"])}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {items.map((skill) => (
                    <span
                      key={skill.id}
                      className="flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2.5 py-1 font-mono text-[11px]"
                    >
                      {String(skill["name"])}
                      <button
                        aria-label={`Remove ${String(skill["name"])}`}
                        onClick={() => removeSkill.mutate(skill.id)}
                      >
                        <X className="size-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <Input
                    value={drafts[categoryId] ?? ""}
                    placeholder="Add a skill"
                    onChange={(event) =>
                      setDrafts((prev) => ({ ...prev, [categoryId]: event.target.value }))
                    }
                    onKeyDown={(event) => {
                      const value = (drafts[categoryId] ?? "").trim();
                      if (event.key === "Enter" && value) {
                        event.preventDefault();
                        addSkill.mutate({ categoryId, name: value });
                        setDrafts((prev) => ({ ...prev, [categoryId]: "" }));
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      const value = (drafts[categoryId] ?? "").trim();
                      if (!value) return;
                      addSkill.mutate({ categoryId, name: value });
                      setDrafts((prev) => ({ ...prev, [categoryId]: "" }));
                    }}
                  >
                    <Plus className="size-4" /> Add
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
