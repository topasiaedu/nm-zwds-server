/**
 * Supabase Storage service for uploading generated PDFs and returning links
 *
 * Provides a typed, reusable API for uploading buffers to a configured
 * Supabase Storage bucket and generating signed URLs for client download.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Blob } from "buffer";
import { config } from "@/config/environment";
import { logger } from "@/utils/logger";

/**
 * Allowed PDF types mapped to folder names in the bucket
 */
export type PdfCategory = "lifecycle" | "wealth" | "career";

const CATEGORY_TO_FOLDER: Record<PdfCategory, string> = {
  lifecycle: "Life Cycle Decoder",
  wealth: "Wealth Code Decoder",
  career: "Timing Window Decoder",
};

/**
 * Upload result containing both the storage path and an accessible URL
 */
export interface StorageUploadResult {
  readonly path: string;
  readonly url: string;
}

/**
 * Internal singleton Supabase client instance
 */
let supabase: SupabaseClient | null = null;

/**
 * Initialize and return a Supabase client using environment configuration
 */
function getSupabaseClient(): SupabaseClient {
  if (supabase) return supabase;

  const url = config.SUPABASE.url;
  const key = config.SUPABASE.key;

  if (!url || !key) {
    throw new Error("Supabase configuration is missing. Please set SUPABASE_URL and SUPABASE_KEY.");
  }

  supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return supabase;
}

/**
 * Generates a safe storage object path for the PDF
 */
function buildObjectPath(category: PdfCategory, filename: string, userName?: string): string {
  const folder = CATEGORY_TO_FOLDER[category];
  const safeName = (userName || "user")
    .trim()
    .replace(/[^A-Za-z0-9_\- ]+/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 80);
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const base = filename.endsWith(".pdf") ? filename.slice(0, -4) : filename;
  return `${folder}/${safeName}/${base}_${ts}.pdf`;
}

/**
 * Upload a PDF Buffer to Supabase storage and return a signed URL.
 *
 * - Bucket is configured via environment variables
 * - Creates folder structure based on PDF category and user name
 * - Overwrites if the path already exists by setting upsert=true
 */
export async function uploadPdfToSupabase(
  params: {
    readonly buffer: Buffer;
    readonly filename: string;
    readonly category: PdfCategory;
    readonly userName?: string;
    readonly contentType?: string;
    readonly signedUrlExpiresSeconds?: number;
  }
): Promise<StorageUploadResult> {
  const client = getSupabaseClient();
  const bucket = config.SUPABASE.bucket;
  if (!bucket) {
    throw new Error("Supabase bucket is not configured. Please set SUPABASE_BUCKET.");
  }

  const objectPath = buildObjectPath(params.category, params.filename, params.userName);

  // Use Blob for Node 18+ environment which is available globally
  const blob = new Blob([params.buffer], { type: params.contentType || "application/pdf" });

  const { error: uploadError } = await client.storage
    .from(bucket)
    .upload(objectPath, blob, { contentType: params.contentType || "application/pdf", upsert: true });

  if (uploadError) {
    logger.error("Supabase upload failed", { error: uploadError.message, path: objectPath, bucket });
    throw new Error(`Failed to upload PDF to storage: ${uploadError.message}`);
  }

  // Prefer signed URLs to work with private buckets by default
  const expiresIn = params.signedUrlExpiresSeconds ?? 60 * 60 * 24 * 7; // 7 days
  const { data: signed, error: signedError } = await client.storage
    .from(bucket)
    .createSignedUrl(objectPath, expiresIn);

  if (signedError || !signed?.signedUrl) {
    // As a fallback, try to build a public URL (works only for public buckets)
    const publicUrl = client.storage.from(bucket).getPublicUrl(objectPath).data.publicUrl;
    logger.warn("Falling back to public URL for Supabase object", { path: objectPath, bucket });
    return { path: objectPath, url: publicUrl };
  }

  return { path: objectPath, url: signed.signedUrl };
}


