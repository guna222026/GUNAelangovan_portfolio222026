import { Download, Github, Linkedin, Mail, ArrowUpRight } from "lucide-react";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Profile, Stat } from "@/lib/portfolio";
import { Reveal } from "./reveal";

function StatIcon({ name }: { name: string }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.Sparkles;
  return <Icon className="size-4 text-primary" />;
}

export function Hero({ profile, stats }: { profile: Profile | null; stats: Stat[] }) {
  const initials = (profile?.full_name || "Guna E")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section id="home" className="relative scroll-mt-24 overflow-hidden pt-28 pb-16 sm:pt-36">
      <div className="pointer-events-none absolute inset-0 aurora opacity-70" aria-hidden />
      <div className="pointer-events-none absolute inset-0 grid-backdrop" aria-hidden />

      <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal>
            <Badge
              variant="outline"
              className="mb-6 border-primary/30 bg-primary/10 font-mono text-[11px] tracking-wide text-accent-foreground"
            >
              {profile?.tagline || "Software Engineer | AI Enthusiast | Builder"}
            </Badge>

            <h1 className="text-5xl leading-[0.95] font-semibold sm:text-7xl">
              {(profile?.full_name || "Guna E").split(" ")[0]}{" "}
              <span className="text-gradient">
                {(profile?.full_name || "Guna E").split(" ").slice(1).join(" ")}
              </span>
            </h1>

            <p className="mt-5 font-mono text-sm text-muted-foreground">
              {profile?.headline || "Software Engineering • AI & ML • Blockchain • Web Development"}
            </p>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              {profile?.summary}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              {profile?.resume_url ? (
                <Button asChild size="lg">
                  <a href={profile.resume_url} target="_blank" rel="noreferrer">
                    <Download className="size-4" /> Download Resume
                  </a>
                </Button>
              ) : null}
              <Button
                size="lg"
                variant="outline"
                onClick={() =>
                  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <Mail className="size-4" /> Contact me
              </Button>
            </div>

            <div className="mt-8 flex items-center gap-2">
              {profile?.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn profile"
                  className="rounded-md border border-border p-2.5 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  <Linkedin className="size-4" />
                </a>
              )}
              {profile?.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub profile"
                  className="rounded-md border border-border p-2.5 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  <Github className="size-4" />
                </a>
              )}
              {profile?.email && (
                <a
                  href={`mailto:${profile.email}`}
                  aria-label="Send an email"
                  className="rounded-md border border-border p-2.5 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  <Mail className="size-4" />
                </a>
              )}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="relative mx-auto w-full max-w-sm">
              <div className="absolute -inset-6 rounded-full bg-primary/15 blur-3xl" aria-hidden />
              <div className="surface-card relative overflow-hidden rounded-2xl p-1.5">
                <div className="relative aspect-4/5 overflow-hidden rounded-xl bg-surface-2">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={`${profile.full_name} portrait`}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full flex-col items-center justify-center gap-4">
                      <span className="font-display text-6xl font-semibold text-muted-foreground/40">
                        {initials}
                      </span>
                      <span className="eyebrow">Profile photo via admin</span>
                    </div>
                  )}
                </div>
              </div>
              {profile?.available && (
                <div className="surface-card absolute -bottom-4 left-4 flex items-center gap-2 px-3 py-2 text-xs">
                  <span className="size-2 rounded-full bg-emerald-400" />
                  Open to Software Developer roles
                </div>
              )}
            </div>
          </Reveal>
        </div>

        {stats.length > 0 && (
          <Reveal delay={200}>
            <div className="surface-card mt-20 grid grid-cols-2 divide-border sm:grid-cols-3 lg:grid-cols-6 lg:divide-x">
              {stats.map((stat) => (
                <div key={stat.id} className="px-5 py-6 text-center">
                  <div className="mb-2 flex justify-center">
                    <StatIcon name={stat.icon} />
                  </div>
                  <p className="font-display text-2xl font-semibold">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        <div className="mt-10 flex justify-center">
          <button
            onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
            className="eyebrow flex items-center gap-1 hover:text-foreground"
          >
            Scroll <ArrowUpRight className="size-3 rotate-45" />
          </button>
        </div>
      </div>
    </section>
  );
}