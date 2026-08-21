import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { messagesQuery } from "@/lib/portfolio";
import { deleteRow, updateRow } from "@/lib/admin-db";

export function MessagesPanel() {
  const queryClient = useQueryClient();
  const { data: messages = [], isLoading } = useQuery(messagesQuery);

  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["messages"] });

  const toggleRead = useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) =>
      updateRow("messages", id, { is_read: isRead }),
    onSuccess: refresh,
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteRow("messages", id),
    onSuccess: () => {
      toast.success("Message deleted");
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div>
      <h2 className="font-display text-lg font-semibold">Inbox</h2>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Messages submitted through the contact form.
      </p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : messages.length === 0 ? (
        <div className="surface-card p-10 text-center text-sm text-muted-foreground">
          No messages yet.
        </div>
      ) : (
        <div className="grid gap-3">
          {messages.map((message) => (
            <article key={message.id} className="surface-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display text-sm font-semibold">{message.name}</p>
                    {!message.is_read && (
                      <Badge className="font-mono text-[10px]">New</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {message.email}
                    {message.company ? ` · ${message.company}` : ""} ·{" "}
                    {new Date(message.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={message.is_read ? "Mark as unread" : "Mark as read"}
                    onClick={() => toggleRead.mutate({ id: message.id, isRead: !message.is_read })}
                  >
                    {message.is_read ? <Mail className="size-4" /> : <MailOpen className="size-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete message"
                    onClick={() => remove.mutate(message.id)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
              {message.subject && (
                <p className="mt-4 font-display text-sm">{message.subject}</p>
              )}
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                {message.body}
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <a href={`mailto:${message.email}?subject=Re: ${message.subject || "Your message"}`}>
                  Reply by email
                </a>
              </Button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
