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
          // Format validation errors with better structure
          const errorMessages = data.error.details
            .map((err: any) => {
              if (err.index !== undefined && err.errors) {
                // Batch validation errors
                const fieldErrors = err.errors
                  .map((e: any) => `  • ${e.field}: ${e.message}`)
                  .join("\n");
                return `Question ${err.index + 1}:\n${fieldErrors}`;
              } else if (err.field && err.message) {
                // Parse errors
                return `${err.message}`;
              }
              return err.message || "Unknown error";
            })
            .join("\n\n");

          const errorHeader =
            data.error.details.length === 1
              ? "Error found:"
              : `${data.error.details.length} errors found:`;

          throw new Error(`${errorHeader}\n\n${errorMessages}`);
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

      {/* Format help text */}
      <div className="text-xs text-gray-600">
        <details className="cursor-pointer">
          <summary className="hover:text-gray-800">CSV format help</summary>
          <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
            <p className="mb-1">Required columns:</p>
            <ul className="list-disc list-inside ml-2 mb-2">
              <li>
                <code className="bg-gray-200 px-1 rounded">text</code> - The
                question text
              </li>
              <li>
                <code className="bg-gray-200 px-1 rounded">correctAnswer</code>{" "}
                - A number
              </li>
            </ul>
            <p className="mb-1">Optional columns:</p>
            <ul className="list-disc list-inside ml-2">
              <li>
                <code className="bg-gray-200 px-1 rounded">subText</code> -
                Additional context
              </li>
              <li>
                <code className="bg-gray-200 px-1 rounded">answerFormat</code> -
                plain, currency, date, or percentage
              </li>
              <li>
                <code className="bg-gray-200 px-1 rounded">followUpNotes</code>{" "}
                - Fun facts to show after reveal
              </li>
            </ul>
          </div>
        </details>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm whitespace-pre-line max-h-60 overflow-y-auto">
          <div className="font-semibold mb-1">Import Failed</div>
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
