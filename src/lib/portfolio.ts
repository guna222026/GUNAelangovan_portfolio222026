import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type T = Database["public"]["Tables"];
export type Profile = T["profile"]["Row"];
export type Stat = T["stats"]["Row"];
export type SkillCategory = T["skill_categories"]["Row"];
export type Skill = T["skills"]["Row"];
export type Project = T["projects"]["Row"];
export type ProjectMedia = T["project_media"]["Row"];
export type Education = T["education"]["Row"];
export type Experience = T["experiences"]["Row"];
export type Achievement = T["achievements"]["Row"];
export type Message = T["messages"]["Row"];

function unwrap<D>(res: { data: D | null; error: { message: string } | null }): D {
  if (res.error) throw new Error(res.error.message);
  return res.data as D;
}

export const profileQuery = queryOptions({
  queryKey: ["profile"],
  queryFn: async () =>
    unwrap(await supabase.from("profile").select("*").limit(1).maybeSingle()) as Profile | null,
});

export const statsQuery = queryOptions({
  queryKey: ["stats"],
  queryFn: async () =>
    unwrap(await supabase.from("stats").select("*").order("sort_order")) as Stat[],
});

export const skillsQuery = queryOptions({
  queryKey: ["skills"],
  queryFn: async () => {
    const categories = unwrap(
      await supabase.from("skill_categories").select("*").order("sort_order"),
    ) as SkillCategory[];
    const skills = unwrap(await supabase.from("skills").select("*").order("sort_order")) as Skill[];
    return categories.map((category) => ({
      ...category,
      skills: skills.filter((s) => s.category_id === category.id),
    }));
  },
});

export const projectsQuery = queryOptions({
  queryKey: ["projects"],
  queryFn: async () =>
    unwrap(
      await supabase.from("projects").select("*").order("sort_order"),
    ) as Project[],
});

export const educationQuery = queryOptions({
  queryKey: ["education"],
  queryFn: async () =>
    unwrap(await supabase.from("education").select("*").order("sort_order")) as Education[],
});

export const experiencesQuery = queryOptions({
  queryKey: ["experiences"],
  queryFn: async () =>
    unwrap(await supabase.from("experiences").select("*").order("sort_order")) as Experience[],
});

export const achievementsQuery = queryOptions({
  queryKey: ["achievements"],
  queryFn: async () =>
    unwrap(await supabase.from("achievements").select("*").order("sort_order")) as Achievement[],
});

export const messagesQuery = queryOptions({
  queryKey: ["messages"],
  queryFn: async () =>
    unwrap(
      await supabase.from("messages").select("*").order("created_at", { ascending: false }),
    ) as Message[],
});

export function projectQuery(slug: string) {
  return queryOptions({
    queryKey: ["project", slug],
    queryFn: async () => {
      const project = unwrap(
        await supabase.from("projects").select("*").eq("slug", slug).maybeSingle(),
      ) as Project | null;
      if (!project) return null;
      const media = unwrap(
        await supabase
          .from("project_media")
          .select("*")
          .eq("project_id", project.id)
          .order("sort_order"),
      ) as ProjectMedia[];
      return { project, media };
    },
  });
}

export function formatRange(start: string | null, end: string | null) {
  const fmt = (value: string | null) =>
    value
      ? new Date(value).toLocaleDateString("en-US", { month: "short", year: "numeric" })
      : "Present";
  if (!start && !end) return "";
  return `${fmt(start)} — ${fmt(end)}`;
}
