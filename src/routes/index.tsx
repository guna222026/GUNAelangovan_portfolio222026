import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import * as Icons from "lucide-react";
import { ArrowRight, Award, GraduationCap, Mail, MapPin, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/site/hero";
import { Section } from "@/components/site/section";
import { Reveal } from "@/components/site/reveal";
import { ProjectCard } from "@/components/site/project-card";
import { ContactForm } from "@/components/site/contact-form";
import {
  achievementsQuery,
  educationQuery,
  experiencesQuery,
  formatRange,
  profileQuery,
  projectsQuery,
  skillsQuery,
  statsQuery,
} from "@/lib/portfolio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Guna E — Software Engineer, AI & Blockchain Developer" },
      {
        name: "description",
        content:
          "Portfolio of Guna E: M.Tech Software Engineering at VIT. Blockchain verification systems, AI assistants and full-stack products.",
      },
      { property: "og:title", content: "Guna E — Software Engineer, AI & Blockchain Developer" },
      {
        property: "og:description",
        content: "Blockchain verification systems, AI assistants and full-stack products.",
      },
    ],
  }),
  component: Index,
});

function CategoryIcon({ name }: { name: string }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.Code2;
  return <Icon className="size-4 text-primary" />;
}

function Index() {
  const { data: profile } = useQuery(profileQuery);
  const { data: stats = [] } = useQuery(statsQuery);
  const { data: categories = [] } = useQuery(skillsQuery);
  const { data: projects = [] } = useQuery(projectsQuery);
  const { data: experiences = [] } = useQuery(experiencesQuery);
  const { data: education = [] } = useQuery(educationQuery);
  const { data: achievements = [] } = useQuery(achievementsQuery);

  const featured = projects.filter((p) => p.featured).slice(0, 4);
  const shown = featured.length ? featured : projects.slice(0, 4);

  return (
    <>
      <Hero profile={profile ?? null} stats={stats} />

      <Section
        id="about"
        eyebrow="01 — About"
        title="Engineering that ships, not just demos"
        description={profile?.about || undefined}
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <div className="surface-card h-full p-6 sm:p-8">
              <p className="text-base leading-relaxed text-muted-foreground">
                {profile?.summary}
              </p>
              {profile?.interests?.length ? (
                <div className="mt-8">
                  <p className="eyebrow mb-3">Focus areas</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((item) => (
                      <Badge key={item} variant="secondary" className="font-mono text-[11px]">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="surface-card grid h-full gap-4 p-6 text-sm sm:p-8">
              {profile?.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 text-primary" />
                  <span className="text-muted-foreground">{profile.location}</span>
                </div>
              )}
              {profile?.email && (
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-4 text-primary" />
                  <a href={`mailto:${profile.email}`} className="break-all text-muted-foreground hover:text-foreground">
                    {profile.email}
                  </a>
                </div>
              )}
              {profile?.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-4 text-primary" />
                  <span className="text-muted-foreground">{profile.phone}</span>
                </div>
              )}
              {profile?.languages?.length ? (
                <div className="border-t border-border pt-4">
                  <p className="eyebrow mb-2">Languages</p>
                  <p className="text-muted-foreground">{profile.languages.join(" · ")}</p>
                </div>
              ) : null}
            </div>
          </Reveal>
        </div>
      </Section>

      <Section
        id="skills"
        eyebrow="02 — Capabilities"
        title="Technical skill set"
        description="Tools and technologies used across blockchain, AI/ML and full-stack delivery."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <Reveal key={category.id} delay={index * 60}>
              <div className="surface-card h-full p-6">
                <div className="mb-4 flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-md bg-primary/12">
                    <CategoryIcon name={category.icon} />
                  </span>
                  <h3 className="font-display text-sm font-semibold">{category.name}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="rounded-md border border-border bg-surface-2 px-2.5 py-1 font-mono text-[11px] text-muted-foreground"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section
        id="projects"
        eyebrow="03 — Selected work"
        title="Projects & case studies"
        description="Deep dives into the problem, architecture and outcome behind each build."
        action={
          <Button asChild variant="outline">
            <Link to="/projects">
              All projects <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      >
        <div className="grid gap-6 sm:grid-cols-2">
          {shown.map((project, index) => (
            <Reveal key={project.id} delay={index * 80}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </Section>

      <Section
        id="experience"
        eyebrow="04 — Experience"
        title="Roles & activities"
        description="Practical engineering, leadership and community work."
      >
        <div className="relative border-l border-border pl-6 sm:pl-8">
          {experiences.map((item, index) => (
            <Reveal key={item.id} delay={index * 70}>
              <div className="relative pb-10 last:pb-0">
                <span className="absolute -left-[31px] top-1.5 size-2.5 rounded-full bg-primary ring-4 ring-background sm:-left-[39px]" />
                <p className="eyebrow">{formatRange(item.start_date, item.end_date)}</p>
                <h3 className="mt-2 font-display text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-primary">
                  {item.organization}
                  {item.location ? ` · ${item.location}` : ""}
                </p>
                {item.description && (
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                )}
                {item.bullets?.length ? (
                  <ul className="mt-3 grid max-w-2xl gap-2">
                    {item.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section id="education" eyebrow="05 — Education" title="Academic background">
        <div className="grid gap-5 lg:grid-cols-2">
          {education.map((item, index) => (
            <Reveal key={item.id} delay={index * 70}>
              <div className="surface-card h-full p-6">
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/12">
                    <GraduationCap className="size-4 text-primary" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold">
                      {item.degree}
                      {item.field ? ` · ${item.field}` : ""}
                    </h3>
                    <p className="mt-1 text-sm text-primary">{item.institution}</p>
                    <p className="eyebrow mt-2">
                      {formatRange(item.start_date, item.end_date)}
                      {item.location ? ` · ${item.location}` : ""}
                    </p>
                    {item.description && (
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {achievements.length > 0 && (
          <div className="mt-14">
            <p className="eyebrow mb-5">Certifications & achievements</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map((item, index) => (
                <Reveal key={item.id} delay={index * 60}>
                  <div className="surface-card h-full p-5">
                    <Award className="mb-3 size-4 text-primary" />
                    <h4 className="font-display text-sm font-semibold">{item.title}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">{item.issuer}</p>
                    {item.description && (
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </Section>

      <Section
        id="contact"
        eyebrow="06 — Contact"
        title="Let's build something"
        description="Open to software engineering roles, internships and collaborations. Messages land straight in the private dashboard."
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <div className="surface-card h-full p-6 sm:p-8">
              <p className="eyebrow mb-4">Direct</p>
              <div className="grid gap-4 text-sm">
                {profile?.email && (
                  <a href={`mailto:${profile.email}`} className="flex items-center gap-3 text-muted-foreground hover:text-foreground">
                    <Mail className="size-4 text-primary" /> <span className="break-all">{profile.email}</span>
                  </a>
                )}
                {profile?.phone && (
                  <span className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="size-4 text-primary" /> {profile.phone}
                  </span>
                )}
                {profile?.location && (
                  <span className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="size-4 text-primary" /> {profile.location}
                  </span>
                )}
              </div>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <ContactForm />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
