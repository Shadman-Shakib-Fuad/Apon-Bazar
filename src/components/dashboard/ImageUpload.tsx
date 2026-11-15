"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { getUploadSignature } from "@/app/seller/upload-actions";

export default function ImageUpload({
  value,
  onChange,
  compact = false,
}: {
  value: string;
  onChange: (url: string) => void;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      return;
    }

    setUploading(true);
    try {
      const sig = await getUploadSignature();
      if (!sig.ok) {
        setError(sig.error);
        return;
      }

      const body = new FormData();
      body.append("file", file);
      body.append("api_key", sig.apiKey);
      body.append("timestamp", String(sig.timestamp));
      body.append("folder", sig.folder);
      body.append("signature", sig.signature);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
        method: "POST",
        body,
      });
      const data = await res.json();

      if (!res.ok || !data.secure_url) {
        setError(data?.error?.message ?? "Upload failed. Please try again.");
        return;
      }
      onChange(data.secure_url);
    } catch {
      setError("Upload failed. Please check your internet connection.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const box = compact ? "h-16 w-16" : "h-32 w-32";

  return (
    <div>
      <div className="flex items-center gap-3">
        <div
          className={`relative ${box} shrink-0 overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-gray-50`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Product" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              {uploading ? <Loader2 size={22} className="animate-spin" /> : <ImagePlus size={22} />}
            </div>
          )}
          {value && uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 size={22} className="animate-spin text-primary" />
            </div>
          )}
          {value && !uploading && (
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Remove image"
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div>
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="rounded-full border border-primary px-4 py-2 text-xs font-semibold text-primary hover:bg-primary-light disabled:opacity-60"
          >
            {uploading ? "Uploading..." : value ? "Change photo" : "Upload photo"}
          </button>
          {!compact && (
            <p className="mt-1 text-xs text-gray-400">Square photo works best. Max 5 MB.</p>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}