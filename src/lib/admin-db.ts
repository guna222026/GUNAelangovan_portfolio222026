import { supabase } from "@/integrations/supabase/client";

export type Row = Record<string, unknown> & { id: string };

type Result<T> = { data: T | null; error: { message: string } | null };

function fail<T>(result: Result<T>): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

/** Table name is dynamic in the dashboard, so the typed client is narrowed once here. */
function table(name: string) {
  return supabase.from(name as "profile");
}

export async function listRows(name: string, orderColumn = "sort_order"): Promise<Row[]> {
  const result = (await table(name)
    .select("*")
    .order(orderColumn, { ascending: true })) as unknown as Result<Row[]>;
  return fail(result) ?? [];
}

export async function insertRow(name: string, values: Record<string, unknown>) {
  const result = (await table(name).insert(values as never)) as unknown as Result<null>;
  fail(result);
}

export async function updateRow(name: string, id: string, values: Record<string, unknown>) {
  const result = (await table(name)
    .update(values as never)
    .eq("id", id)) as unknown as Result<null>;
  fail(result);
}

export async function deleteRow(name: string, id: string) {
  const result = (await table(name).delete().eq("id", id)) as unknown as Result<null>;
  fail(result);
}

export async function uploadMedia(
  file: File | Blob,
  folder: string,
  extension?: string,
): Promise<string> {
  const ext =
    extension ??
    (file instanceof File ? file.name.split(".").pop()?.toLowerCase() : undefined) ??
    "bin";
  const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "-");
  const path = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const options = { upsert: false, ...(file.type ? { contentType: file.type } : {}) };
  const { error } = await supabase.storage.from("media").upload(path, file, options);
  if (error) throw new Error(error.message);
  return path;
}