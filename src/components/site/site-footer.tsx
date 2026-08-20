import { Link } from "@tanstack/react-router";
import { Github, Linkedin, Mail } from "lucide-react";
import type { Profile } from "@/lib/portfolio";

export function SiteFooter({ profile }: { profile: Profile | null }) {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-6 px-5 sm:flex-row sm:px-8">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {profile?.full_name || "Guna E"}. All rights reserved.
        </p>
        <div className="flex items-center gap-2">
          {profile?.linkedin_url && (
            <a
              href={profile.linkedin_url}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="rounded-md border border-border p-2 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              <Linkedin className="size-4" />
            </a>
          )}
          {profile?.github_url && (
            <a
              href={profile.github_url}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="rounded-md border border-border p-2 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              <Github className="size-4" />
            </a>
          )}
          {profile?.email && (
            <a
              href={`mailto:${profile.email}`}
              aria-label="Email"
              className="rounded-md border border-border p-2 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              <Mail className="size-4" />
            </a>
          )}
        </div>
        <Link to="/admin" className="text-xs text-muted-foreground/70 hover:text-foreground">
          Admin
        </Link>
      </div>
    </footer>
  );
}