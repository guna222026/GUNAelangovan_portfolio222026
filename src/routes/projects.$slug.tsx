import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import { formatRange, projectQuery } from "@/lib/portfolio";

export const Route = createFileRoute("/projects/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Project by Guna E` },
      {
        name: "description",
        content: "Project case study: problem, architecture, implementation and outcome.",
      },
      { property: "og:title", content: `Project case study — Guna E` },
      {
        property: "og:description",
        content: "Problem, architecture, implementation and outcome of this build.",
      },
    ],
  }),
  component: ProjectDetail,
});

function Block({ title, body }: { title: string; body: string }) {
  if (!body) return null;
  return (
    <div className="surface-card p-6 sm:p-8">
      <p className="eyebrow mb-3">{title}</p>
      <p className="text-base leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function ProjectDetail() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useQuery(projectQuery(slug));

  if (isLoading) {
    return <div className="mx-auto max-w-4xl px-5 pt-40 pb-24 text-sm text-muted-foreground">Loading…</div>;
  }

  if (!data?.project) {
    return (
      <div className="mx-auto max-w-4xl px-5 pt-40 pb-24 text-center">
        <h1 className="text-2xl font-semibold">Project not found</h1>
        <Button asChild className="mt-6">
          <Link to="/projects">Back to projects</Link>
        </Button>
      </div>
    );
  }

  const { project, media } = data;

  return (
    <article className="mx-auto w-full max-w-4xl px-5 pt-32 pb-24 sm:px-8">
      <Link
        to="/projects"
        className="eyebrow inline-flex items-center gap-1.5 hover:text-foreground"
      >
        <ArrowLeft className="size-3" /> All projects
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="font-mono text-[11px]">{project.category}</Badge>
        <span className="eyebrow">{formatRange(project.start_date, project.end_date)}</span>
      </div>

      <h1 className="mt-4 text-4xl leading-tight font-semibold sm:text-5xl">{project.title}</h1>
      {project.subtitle && (
        <p className="mt-3 text-lg text-muted-foreground">{project.subtitle}</p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {project.github_url && (
          <Button asChild variant="outline" size="sm">
            <a href={project.github_url} target="_blank" rel="noreferrer">
              <Github className="size-4" /> Source
            </a>
          </Button>
        )}
        {project.demo_url && (
          <Button asChild size="sm">
            <a href={project.demo_url} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" /> Live demo
            </a>
          </Button>
        )}
      </div>

      {project.cover_url && (
        <img
          src={project.cover_url}
          alt={project.title}
          className="surface-card mt-10 w-full object-cover"
        />
      )}

      {project.tech_stack?.length ? (
        <div className="mt-10 flex flex-wrap gap-2">
          {project.tech_stack.map((tech) => (
            <span
              key={tech}
              className="rounded-md border border-border bg-surface-2 px-2.5 py-1 font-mono text-[11px] text-muted-foreground"
            >
              {tech}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-12 grid gap-6">
        <Block title="Problem" body={project.problem} />
        <Block title="Solution" body={project.solution} />
        <Block title="Implementation" body={project.implementation} />

        {project.architecture_steps?.length ? (
          <Reveal>
            <div className="surface-card p-6 sm:p-8">
              <p className="eyebrow mb-5">System architecture</p>
              <ol className="grid gap-3">
                {project.architecture_steps.map((step, index) => (
                  <li key={step} className="flex items-start gap-3 rounded-lg border border-border bg-surface-2 p-4">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/15 font-mono text-[11px] text-primary">
                      {index + 1}
                    </span>
                    <span className="text-sm text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        ) : null}

        {project.features?.length ? (
          <div className="surface-card p-6 sm:p-8">
            <p className="eyebrow mb-4">Key features</p>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {project.features.map((feature) => (
                <li key={feature} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <Block title="Outcome" body={project.outcome} />
      </div>

      {media.length > 0 && (
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {media.map((item) => (
            <figure key={item.id} className="surface-card overflow-hidden">
              <img src={item.url} alt={item.caption || project.title} loading="lazy" className="w-full object-cover" />
              {item.caption && (
                <figcaption className="p-4 text-xs text-muted-foreground">{item.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </article>
  );
}