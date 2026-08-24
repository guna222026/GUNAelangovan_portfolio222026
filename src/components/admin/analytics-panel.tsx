import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Eye, Users, Monitor, Smartphone, Tablet, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { messagesQuery } from "@/lib/portfolio";

type PageView = {
  path: string;
  label: string | null;
  referrer: string | null;
  visitor_id: string | null;
  device: string | null;
  created_at: string;
};

const RANGE_DAYS = 30;

export function AnalyticsPanel() {
  const since = useMemo(() => subDays(new Date(), RANGE_DAYS).toISOString(), []);

  const { data: views = [], isLoading } = useQuery({
    queryKey: ["admin", "page_views", since],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_views")
        .select("path, label, referrer, visitor_id, device, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: true })
        .limit(10000);
      if (error) throw new Error(error.message);
      return (data ?? []) as PageView[];
    },
  });

  const { data: messages = [] } = useQuery({
    ...messagesQuery,
    queryKey: ["admin", "messages"],
  });

  const stats = useMemo(() => {
    const uniqueVisitors = new Set(views.map((v) => v.visitor_id).filter(Boolean)).size;

    const byDay = new Map<string, number>();
    for (let i = RANGE_DAYS - 1; i >= 0; i--) {
      byDay.set(format(subDays(new Date(), i), "MMM d"), 0);
    }
    for (const view of views) {
      const day = format(new Date(view.created_at), "MMM d");
      if (byDay.has(day)) byDay.set(day, (byDay.get(day) ?? 0) + 1);
    }

    const count = (key: (v: PageView) => string) => {
      const map = new Map<string, number>();
      for (const view of views) {
        const k = key(view);
        if (k) map.set(k, (map.get(k) ?? 0) + 1);
      }
      return [...map.entries()].sort((a, b) => b[1] - a[1]);
    };

    return {
      total: views.length,
      uniqueVisitors,
      daily: [...byDay.entries()].map(([day, count]) => ({ day, views: count })),
      pages: count((v) => v.label || v.path).slice(0, 6),
      devices: count((v) => v.device ?? ""),
      referrers: count((v) => v.referrer ?? "").slice(0, 6),
    };
  }, [views]);

  const unread = messages.filter((m) => !m.is_read).length;

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div>
      <h2 className="font-display text-lg font-semibold">Analytics</h2>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Anonymous traffic for the last {RANGE_DAYS} days, plus your contact inbox.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Eye} label="Page views" value={stats.total} />
        <StatCard icon={Users} label="Unique visitors" value={stats.uniqueVisitors} />
        <StatCard
          icon={Globe}
          label="Contact messages"
          value={messages.length}
          hint={unread > 0 ? `${unread} unread` : undefined}
        />
        <StatCard
          icon={Monitor}
          label="Top device"
          value={stats.devices[0]?.[0] ?? "—"}
          hint={
            stats.devices[0]
              ? `${stats.devices[0][1]} views`
              : undefined
          }
        />
      </div>

      <div className="surface-card mt-6 p-5 sm:p-6">
        <h3 className="font-display text-sm font-semibold">Views per day</h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.daily} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
              <defs>
                <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#viewsFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <RankCard
          title="Top pages"
          rows={stats.pages}
          empty="No page views recorded yet."
        />
        <div className="surface-card p-5 sm:p-6">
          <h3 className="font-display text-sm font-semibold">Devices</h3>
          <ul className="mt-4 grid gap-3">
            {stats.devices.length === 0 && (
              <li className="text-sm text-muted-foreground">No data yet.</li>
            )}
            {stats.devices.map(([device, count]) => (
              <li key={device} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 capitalize">
                  {device === "mobile" ? (
                    <Smartphone className="size-4 text-muted-foreground" />
                  ) : device === "tablet" ? (
                    <Tablet className="size-4 text-muted-foreground" />
                  ) : (
                    <Monitor className="size-4 text-muted-foreground" />
                  )}
                  {device}
                </span>
                <span className="font-mono text-muted-foreground">{count}</span>
              </li>
            ))}
          </ul>
        </div>
        <RankCard
          title="Top referrers"
          rows={stats.referrers}
          empty="No external referrers yet."
        />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Eye;
  label: string;
  value: number | string;
  hint?: string | undefined;
}) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 font-display text-2xl font-semibold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function RankCard({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: Array<[string, number]>;
  empty: string;
}) {
  const max = Math.max(1, ...rows.map(([, count]) => count));
  return (
    <div className="surface-card p-5 sm:p-6">
      <h3 className="font-display text-sm font-semibold">{title}</h3>
      <ul className="mt-4 grid gap-3">
        {rows.length === 0 && <li className="text-sm text-muted-foreground">{empty}</li>}
        {rows.map(([name, count]) => (
          <li key={name}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate">{name}</span>
              <span className="font-mono text-muted-foreground">{count}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.round((count / max) * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
