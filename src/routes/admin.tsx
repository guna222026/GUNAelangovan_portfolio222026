import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSession } from "@/hooks/use-admin";
import { CollectionManager } from "@/components/admin/collection-manager";
import {
  achievementsCollection,
  educationCollection,
  experiencesCollection,
  projectsCollection,
  statsCollection,
} from "@/components/admin/collections";
import { ProfileEditor } from "@/components/admin/profile-editor";
import { SkillsManager } from "@/components/admin/skills-manager";
import { MessagesPanel } from "@/components/admin/messages-panel";
import { AnalyticsPanel } from "@/components/admin/analytics-panel";
import { messagesQuery } from "@/lib/portfolio";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin — Portfolio content manager" },
      { name: "description", content: "Private dashboard to manage portfolio content." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Admin — Portfolio content manager" },
      { property: "og:description", content: "Private dashboard to manage portfolio content." },
    ],
  }),
  component: AdminPage,
});

function LoginCard() {
  const [pending, setPending] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email"));
    const password = String(data.get("password"));
    setPending(true);
    const { error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/admin` },
          });
    setPending(false);
    if (error) toast.error(error.message);
    else if (mode === "signup") toast.success("Account created — you're signed in.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <Link to="/" className="eyebrow mb-6 inline-flex items-center gap-1.5 hover:text-foreground">
          <ArrowLeft className="size-3" /> Back to site
        </Link>
        <form onSubmit={onSubmit} className="surface-card grid gap-5 p-7">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <h1 className="font-display text-lg font-semibold">
              {mode === "signin" ? "Admin sign in" : "Create admin account"}
            </h1>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin"
              ? "First time? Create your admin account"
              : "Already have an account? Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

const TABS = [
  { value: "profile", label: "Profile" },
  { value: "projects", label: "Projects" },
  { value: "skills", label: "Skills" },
  { value: "experience", label: "Experience" },
  { value: "education", label: "Education" },
  { value: "achievements", label: "Achievements" },
  { value: "stats", label: "Stats" },
  { value: "messages", label: "Messages" },
  { value: "analytics", label: "Analytics" },
];

function AdminPage() {
  const { session, isAdmin, loading } = useAdminSession();
  const { data: messages = [] } = useQuery({ ...messagesQuery, enabled: isAdmin });
  const unread = messages.filter((message) => !message.is_read).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Checking access…
      </div>
    );
  }

  if (!session) return <LoginCard />;

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
        <h1 className="font-display text-xl font-semibold">Not authorized</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          This account does not have admin access to the portfolio dashboard.
        </p>
        <Button variant="outline" onClick={() => void supabase.auth.signOut()}>
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Content manager</p>
          <h1 className="mt-2 font-display text-2xl font-semibold">Portfolio dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {session.user.email}
            {unread > 0 ? ` · ${unread} unread message${unread > 1 ? "s" : ""}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/">View site</Link>
          </Button>
          <Button variant="ghost" onClick={() => void supabase.auth.signOut()}>
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </header>

      <Tabs defaultValue="profile">
        <TabsList className="mb-8 flex h-auto w-full flex-wrap justify-start gap-1">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
              {tab.value === "messages" && unread > 0 ? ` (${unread})` : ""}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile">
          <ProfileEditor />
        </TabsContent>
        <TabsContent value="projects">
          <CollectionManager config={projectsCollection} />
        </TabsContent>
        <TabsContent value="skills">
          <SkillsManager />
        </TabsContent>
        <TabsContent value="experience">
          <CollectionManager config={experiencesCollection} />
        </TabsContent>
        <TabsContent value="education">
          <CollectionManager config={educationCollection} />
        </TabsContent>
        <TabsContent value="achievements">
          <CollectionManager config={achievementsCollection} />
        </TabsContent>
        <TabsContent value="stats">
          <CollectionManager config={statsCollection} />
        </TabsContent>
        <TabsContent value="messages">
          <MessagesPanel />
        </TabsContent>
        <TabsContent value="analytics">
          <AnalyticsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
