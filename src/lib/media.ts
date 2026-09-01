/**
 * Client-side media validation and image processing for admin uploads.
 * Images are validated, optionally center-cropped to a target aspect ratio,
 * and downscaled before upload so huge phone photos don't ship to visitors.
 */

export type MediaKind = "image" | "video" | "pdf" | "any";

const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/ogg"];
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB source image
const MAX_PDF_BYTES = 15 * 1024 * 1024;
const MAX_ANY_BYTES = 20 * 1024 * 1024;

export function validateMediaFile(file: File, kind: MediaKind): void {
  if (kind === "image") {
    if (!IMAGE_TYPES[file.type]) {
      throw new Error("Please choose an image file (JPG, PNG, WebP, GIF or AVIF).");
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error("That image is too large — maximum 10 MB.");
    }
    return;
  }
  if (kind === "video") {
    if (!VIDEO_TYPES.includes(file.type)) {
      throw new Error("Please choose a video file (MP4, WebM, MOV or OGG).");
    }
    if (file.size > MAX_VIDEO_BYTES) {
      throw new Error("That video is too large — maximum 50 MB.");
    }
    return;
  }
  if (kind === "pdf") {
    if (file.type !== "application/pdf") {
      throw new Error("Please choose a PDF file.");
    }
    if (file.size > MAX_PDF_BYTES) {
      throw new Error("That PDF is too large — maximum 15 MB.");
    }
    return;
  }
  if (file.size > MAX_ANY_BYTES) {
    throw new Error("That file is too large — maximum 20 MB.");
  }
}

export function acceptAttribute(kind: MediaKind): string | undefined {
  if (kind === "image") return Object.keys(IMAGE_TYPES).join(",");
  if (kind === "video") return VIDEO_TYPES.join(",");
  if (kind === "pdf") return "application/pdf";
  return undefined;
}

/**
 * Center-crops to `aspect` (width / height) when provided, downscales so the
 * longest edge is at most `maxDim` px, and re-encodes as WebP. GIFs pass
 * through untouched so animations survive.
 */
export async function processImage(
  file: File,
  options: { aspect?: number; maxDim?: number } = {},
): Promise<{ blob: Blob; extension: string }> {
  if (file.type === "image/gif") return { blob: file, extension: "gif" };

  const { aspect, maxDim = 1600 } = options;
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not read that image file."));
      el.src = objectUrl;
    });

    let sx = 0;
    let sy = 0;
    let sw = image.naturalWidth;
    let sh = image.naturalHeight;
    if (!sw || !sh) throw new Error("That image appears to be empty.");

    if (aspect && sw / sh > aspect) {
      const cropped = sh * aspect;
      sx = (sw - cropped) / 2;
      sw = cropped;
    } else if (aspect) {
      const cropped = sw / aspect;
      sy = (sh - cropped) / 2;
      sh = cropped;
    }

    const scale = Math.min(1, maxDim / Math.max(sw, sh));
    const width = Math.max(1, Math.round(sw * scale));
    const height = Math.max(1, Math.round(sh * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Image processing is not supported in this browser.");
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.86),
    );
    if (!blob) throw new Error("Could not process that image.");
    return { blob, extension: "webp" };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
