"use client";

import { useState, useRef } from "react";

interface FileUploadButtonProps {
  gameId: string;
  onImportComplete: (count: number) => void;
  disabled: boolean;
}

export function FileUploadButton({
  gameId,
  onImportComplete,
  disabled,
}: FileUploadButtonProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/games/${gameId}/questions/import`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.details && Array.isArray(data.error.details)) {
          const errorMessages = data.error.details
            .map((err: any) => {
              if (err.index !== undefined) {
                return `Question ${err.index + 1}: ${err.errors?.map((e: any) => e.message).join(", ") || err.message}`;
              }
              return err.message;
            })
            .join("\n");
          throw new Error(errorMessages);
        }
        throw new Error(data.error?.message || "Failed to import questions");
      }

      setSuccess(`Successfully imported ${data.imported} questions`);
      onImportComplete(data.imported);

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.json"
          onChange={handleFileChange}
          disabled={disabled || uploading}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className={`inline-block px-4 py-2 rounded-md cursor-pointer ${
            disabled || uploading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {uploading ? "Uploading..." : "Import Questions (CSV/JSON)"}
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm whitespace-pre-line">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
          {success}
        </div>
      )}
    </div>
  );
}
