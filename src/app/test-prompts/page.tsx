"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";

type GeneratedState = {
  urls: string[];
  error?: string;
};

/**
 * Test Prompt page — wiring the existing static UI to working logic:
 * - Upload images to Cloudinary first (via /api/upload)
 * - Call Gemini 2.5 Flash to generate premium product images based on prompt/template and image URLs (via /api/test-generate)
 * - Show generated results without altering the existing layout or styles
 */
export default function TestPromptsPage() {
  const [imagesCount, setImagesCount] = useState<number>(3);
  const [files, setFiles] = useState<File[]>([]);
  const [prompt, setPrompt] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<GeneratedState>({ urls: [] });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const templateLabels = useMemo(
    () => ["Minimalist Studio", "Outdoor Lifestyle", "Futuristi"],
    []
  );

  const onFilesSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = Array.from(e.target.files || []);
    if (!f.length) return;
    // limit to 5 files
    setFiles(f.slice(0, 5));
    setError("");
  }, []);

  const onTemplateClick = useCallback((label: string) => {
    setSelectedTemplate(label);
    setError("");
  }, []);

  async function uploadToCloudinarySingle(fileOrBase64: File | string): Promise<string> {
    const fd = new FormData();
    if (fileOrBase64 instanceof File) {
      fd.append("file", fileOrBase64);
    } else {
      fd.append("base64", fileOrBase64);
    }
    const res = await fetch("/api/upload", {
      method: "POST",
      body: fd,
    });
    const json = await res.json();
    if (!res.ok || !json?.secure_url) {
      throw new Error(json?.error || "Upload failed");
    }
    return json.secure_url as string;
  }

  const handleGenerate = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setResult({ urls: [] });

      if (!files.length) {
        setError("Please upload at least one product image.");
        setLoading(false);
        return;
      }

      // Upload images to Cloudinary first
      const cloudinaryUrls: string[] = [];
      for (const f of files.slice(0, 5)) {
        try {
          const url = await uploadToCloudinarySingle(f);
          cloudinaryUrls.push(url);
        } catch (e: any) {
          setError(e?.message || "Failed to upload image to Cloudinary.");
          setLoading(false);
          return;
        }
      }

      // Call backend to generate via Gemini 2.5 Flash
      const res = await fetch("/api/test-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: cloudinaryUrls,
          prompt,
          template: selectedTemplate,
          count: imagesCount,
        }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(json?.error || "Gemini generation failed.");
        setLoading(false);
        return;
      }

      const urls: string[] = Array.isArray(json?.urls) ? json.urls : [];
      if (!urls.length) {
        setError("No images returned. Try adjusting your prompt or template.");
        setLoading(false);
        return;
      }

      setResult({ urls });
    } catch (e: any) {
      setError(typeof e?.message === "string" ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, [files, imagesCount, prompt, selectedTemplate]);

  return (
    <section className="container mx-auto px-6 md:px-10 lg:px-16 py-10">
      {/* Two-column layout: left controls card, right template area */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-12">
        {/* Left: Generate Product Ads card */}
        <div className="rounded-2xl border bg-white shadow-sm p-5 md:p-6">
          <h3 className="text-lg font-semibold text-slate-900">Generate Product Ads</h3>

          {/* Product Image upload */}
          <div className="mt-5">
            <div className="text-sm font-medium text-slate-900">Product Image</div>

            <div className="mt-3 rounded-xl border border-slate-200 border-dashed bg-white">
              <label
                htmlFor="product-image"
                className="flex flex-col items-center justify-center gap-2 px-6 py-10 cursor-pointer text-center"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" className="text-slate-400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16V8M12 8l-3 3M12 8l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20 16.5a3.5 3.5 0 0 0-3.5-3.5H7.5A3.5 3.5 0 0 0 4 16.5V17a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <p className="text-sm text-slate-500">Drag &amp; drop your product image here,</p>
                <p className="text-sm text-slate-500">or</p>
                <button className="mt-1 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Browse Files
                </button>
              </label>
              {/* Keep same input element; enable multiple selection and hook up handler */}
              <input
                id="product-image"
                type="file"
                multiple
                className="sr-only"
                ref={fileInputRef}
                onChange={onFilesSelected}
              />
            </div>

            {/* Minimal helper text area for errors/loading without altering layout */}
            {error ? (
              <p className="mt-2 text-xs text-red-600">{error}</p>
            ) : null}
            {loading ? (
              <p className="mt-2 text-xs text-slate-600">Generating...</p>
            ) : null}
          </div>

          {/* Custom Prompt */}
          <div className="mt-6">
            <div className="text-sm font-medium text-slate-900">Custom Prompt</div>
            <textarea
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300"
              rows={3}
              placeholder="Describe your desired product ad (e.g., 'A sleek smartphone on a futuristic minimalist desk with soft studio lighting')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          {/* Number of Images */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-slate-900">Number of Images (1-5)</div>
              <div className="text-sm text-slate-700">{imagesCount}</div>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={imagesCount}
              onChange={(e) => setImagesCount(Number(e.target.value))}
              className="mt-3 w-full accent-indigo-600"
            />
          </div>

          {/* Generate button */}
          <button
            className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            disabled={loading}
            onClick={handleGenerate}
          >
            Generate Product Ads
          </button>
        </div>

        {/* Right: predefined templates and results header */}
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-slate-900">Predefined Templates</h3>

          {/* Three template boxes */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Template 1 */}
            <button
              type="button"
              className="flex flex-col items-center"
              onClick={() => onTemplateClick(templateLabels[0])}
            >
              <div className="h-28 w-full rounded-2xl border border-slate-200"></div>
              <div className="mt-3 text-sm text-slate-700">Minimalist Studio</div>
            </button>

            {/* Template 2 */}
            <button
              type="button"
              className="flex flex-col items-center"
              onClick={() => onTemplateClick(templateLabels[1])}
            >
              <div className="h-28 w-full rounded-2xl border border-slate-200"></div>
              <div className="mt-3 text-sm text-slate-700">Outdoor Lifestyle</div>
            </button>

            {/* Template 3 */}
            <button
              type="button"
              className="flex flex-col items-center"
              onClick={() => onTemplateClick(templateLabels[2])}
            >
              <div className="h-28 w-full rounded-2xl border border-slate-200"></div>
              <div className="mt-3 text-sm text-slate-700">Futuristi</div>
            </button>
          </div>

          {/* Results section title */}
          <div className="mt-12">
            <h3 className="text-center text-lg font-semibold text-slate-900">Your AI-Generated Product Ads</h3>

            {/* Render generated images in same area without changing layout */}
            {result.urls.length > 0 ? (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {result.urls.map((u, i) => (
                  <div key={`${u}-${i}`} className="flex flex-col items-center">
                    <img
                      src={u}
                      alt={`Generated ${i + 1}`}
                      className="h-28 w-full rounded-2xl border border-slate-200 object-cover"
                      loading="lazy"
                    />
                    <div className="mt-3 text-sm text-slate-700">Result {i + 1}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6"></div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}