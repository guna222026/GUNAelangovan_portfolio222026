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

export const MEDIA_BUCKET = "media";

/**
 * Media is kept in a private bucket. Values may be either an absolute URL
 * (entered by the admin) or a storage path uploaded through the dashboard —
 * storage paths get resolved to a short-lived signed URL.
 */
export async function resolveMedia(value: string | null | undefined): Promise<string> {
  if (!value) return "";
  if (/^(https?:|data:|\/)/.test(value)) return value;
  const { data } = await supabase.storage.from(MEDIA_BUCKET).createSignedUrl(value, 60 * 60);
  return data?.signedUrl ?? "";
}

export const profileQuery = queryOptions({
  queryKey: ["profile"],
  queryFn: async () => {
    const profile = unwrap(
      await supabase.from("profile").select("*").limit(1).maybeSingle(),
    ) as Profile | null;
    if (!profile) return null;
    const [avatar_url, resume_url] = await Promise.all([
      resolveMedia(profile.avatar_url),
      resolveMedia(profile.resume_url),
    ]);
    return { ...profile, avatar_url, resume_url };
  },
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
  queryFn: async () => {
    const projects = unwrap(
      await supabase.from("projects").select("*").order("sort_order"),
    ) as Project[];
    return Promise.all(
      projects.map(async (project) => ({
        ...project,
        cover_url: await resolveMedia(project.cover_url),
      })),
    );
  },
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
      return {
        project: { ...project, cover_url: await resolveMedia(project.cover_url) },
        media: await Promise.all(
          media.map(async (item) => ({ ...item, url: await resolveMedia(item.url) })),
        ),
      };
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
