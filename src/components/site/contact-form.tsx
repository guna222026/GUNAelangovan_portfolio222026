import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export function ContactForm({
  title,
  description,
  buttonText,
}: {
  title?: string | undefined;
  description?: string | undefined;
  buttonText?: string | undefined;
}) {
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      company: String(data.get("company") || "").trim(),
      subject: String(data.get("subject") || "").trim(),
      body: String(data.get("body") || "").trim(),
    };
    if (!payload.name || !payload.email || !payload.body) {
      toast.error("Please fill in your name, email and message.");
      return;
    }
    setPending(true);
    const { error } = await supabase.from("messages").insert(payload);
    setPending(false);
    if (error) {
      toast.error("Message could not be sent. Please try again.");
      return;
    }
    toast.success("Message sent — thanks for reaching out.");
    form.reset();
  };

  return (
    <form onSubmit={onSubmit} className="surface-card grid gap-5 p-6 sm:p-8">
      {(title || description) && (
        <div className="grid gap-1">
          {title && <h3 className="font-display text-lg font-semibold">{title}</h3>}
          {description && (
            <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required placeholder="Your name" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required placeholder="you@company.com" />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="company">Company (optional)</Label>
          <Input id="company" name="company" placeholder="Company" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" name="subject" placeholder="Opportunity, collaboration…" />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="body">Message</Label>
        <Textarea id="body" name="body" required rows={6} placeholder="How can I help?" />
      </div>
      <Button type="submit" size="lg" disabled={pending} className="justify-self-start">
        <Send className="size-4" /> {pending ? "Sending…" : buttonText || "Send message"}
      </Button>
    </form>
  );
}