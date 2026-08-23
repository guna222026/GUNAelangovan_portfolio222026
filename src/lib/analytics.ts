import { supabase } from "@/integrations/supabase/client";

const VISITOR_KEY = "ge-portfolio-visitor";

function visitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

const LABELS: Array<[RegExp, string]> = [
  [/^\/$/, "Home"],
  [/^\/projects$/, "Projects"],
  [/^\/projects\//, "Project detail"],
];

export function pageLabel(path: string): string {
  return LABELS.find(([pattern]) => pattern.test(path))?.[1] ?? path;
}

/** Records one anonymous page view. Never throws — analytics must not break the site. */
export function trackPageView(path: string) {
  if (typeof window === "undefined") return;
  if (path.startsWith("/admin")) return;
  if (navigator.webdriver) return;

  const width = window.innerWidth;
  const device = width < 768 ? "mobile" : width < 1024 ? "tablet" : "desktop";
  let referrer = "";
  try {
    referrer = document.referrer ? new URL(document.referrer).hostname : "";
  } catch {
    referrer = "";
  }

  void supabase
    .from("page_views")
    .insert({
      path: path.slice(0, 300),
      label: pageLabel(path).slice(0, 120),
      referrer: referrer.slice(0, 300),
      visitor_id: visitorId(),
      device,
    })
    .then(() => undefined);
}
