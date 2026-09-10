import { normalizeExternalUrl } from "@/lib/constants";

/**
 * Convert a Google Drive / Docs share link into an embeddable preview URL.
 * Files must be shared as “anyone with the link” for iframe to work.
 */
export function toGoogleEmbedUrl(raw: string): string | null {
  const url = normalizeExternalUrl(raw);
  if (!url) return null;

  try {
    const parsed = new URL(url);

    // Published Docs link: /document/d/e/ID/pub
    if (parsed.pathname.includes("/pub")) {
      const pub = new URL(url);
      pub.searchParams.set("embedded", "true");
      return pub.toString();
    }

    // Google Docs
    let m = parsed.pathname.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
    if (m && m[1] !== "e") {
      return `https://docs.google.com/document/d/${m[1]}/preview`;
    }
    m = parsed.pathname.match(/\/document\/d\/e\/([a-zA-Z0-9_-]+)/);
    if (m) {
      return `https://docs.google.com/document/d/e/${m[1]}/pub?embedded=true`;
    }

    // Sheets
    m = parsed.pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (m) return `https://docs.google.com/spreadsheets/d/${m[1]}/preview`;

    // Slides
    m = parsed.pathname.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
    if (m) {
      return `https://docs.google.com/presentation/d/${m[1]}/embed?start=false&loop=false&delayms=3000`;
    }

    // Drive file
    m = parsed.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;

    // Drive folder
    m = parsed.pathname.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (m) return `https://drive.google.com/embeddedfolderview?id=${m[1]}#list`;

    // open?id= / uc?id=
    const id = parsed.searchParams.get("id");
    if (id && /(drive|docs)\.google\./.test(parsed.hostname)) {
      return `https://drive.google.com/file/d/${id}/preview`;
    }

    // Already an embed/preview URL
    if (
      /\/preview\/?$/.test(parsed.pathname) ||
      parsed.pathname.includes("embeddedfolderview") ||
      parsed.pathname.includes("/embed")
    ) {
      return url;
    }

    // Other Google links — try as-is
    if (/(drive|docs)\.google\./.test(parsed.hostname)) {
      return url;
    }

    // Non-Google URL via Docs viewer
    return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
  } catch {
    return null;
  }
}
