import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
  action,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string | undefined;
  children: ReactNode;
  className?: string | undefined;
  action?: ReactNode;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24 border-t border-border/60 py-20 sm:py-28", className)}>
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        {(eyebrow || title) && (
          <Reveal>
            <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
                {title && (
                  <h2 className="text-3xl font-semibold sm:text-4xl">{title}</h2>
                )}
                {description && (
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
              {action}
            </div>
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}