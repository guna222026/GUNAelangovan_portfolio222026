import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/portfolio";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to="/projects/$slug"
      params={{ slug: project.slug }}
      className="surface-card group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
    >
      <div className="relative aspect-16/10 overflow-hidden bg-surface-2">
        {project.cover_url ? (
          <img
            src={project.cover_url}
            alt={project.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center bg-linear-to-br from-primary/12 to-transparent">
            <span className="font-mono text-xs text-muted-foreground">{project.category}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-base leading-snug font-semibold">{project.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {project.summary}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <Badge variant="secondary" className="font-mono text-[11px]">
            {project.category}
          </Badge>
          <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
        </div>
      </div>
    </Link>
  );
}