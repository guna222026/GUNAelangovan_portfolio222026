import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/site/project-card";
import { Reveal } from "@/components/site/reveal";
import { projectsQuery } from "@/lib/portfolio";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — Guna E" },
      {
        name: "description",
        content:
          "Blockchain, AI/ML and full-stack project case studies built by Guna E, with problem, architecture and outcome.",
      },
      { property: "og:title", content: "Projects — Guna E" },
      {
        property: "og:description",
        content: "Blockchain, AI/ML and full-stack project case studies by Guna E.",
      },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { data: projects = [], isLoading } = useQuery(projectsQuery);
  const [filter, setFilter] = useState("All");

  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))];
  const visible = filter === "All" ? projects : projects.filter((p) => p.category === filter);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-32 pb-24 sm:px-8">
      <p className="eyebrow mb-3">Portfolio</p>
      <h1 className="text-4xl font-semibold sm:text-5xl">Projects</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
        Case studies covering blockchain verification, AI assistants, search systems and web
        applications.
      </p>

      <div className="mt-10 flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            size="sm"
            variant={filter === category ? "default" : "outline"}
            onClick={() => setFilter(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((project, index) => (
          <Reveal key={project.id} delay={index * 60}>
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>

      {!isLoading && visible.length === 0 && (
        <p className="mt-16 text-center text-sm text-muted-foreground">No projects to show yet.</p>
      )}
    </div>
  );
}