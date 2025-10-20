"use client";

import { UploadButton } from "@uploadthing/react";
import { useState } from "react";

import { type OurFileRouter } from "~/lib/uploadthing";

import { updateHeroImage } from "../actions";

interface HeroUploaderProps {
  initialImageUrl: string | null;
}

export default function HeroUploader({
  initialImageUrl,
}: HeroUploaderProps) {
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(
    initialImageUrl,
  );
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = () => {
    if (pendingImageUrl) {
      setIsConfirming(true);
      void updateHeroImage(pendingImageUrl).then(() => {
        setCurrentImageUrl(pendingImageUrl);
        setPendingImageUrl(null);
        setIsConfirming(false);
      });
    }
  };

  const handleCancel = () => {
    setPendingImageUrl(null);
  };

  const handleRemove = () => {
    if (confirm("Ertu viss um að þú vilt fjarlægja þessa mynd?")) {
      void updateHeroImage(null).then(() => {
        setCurrentImageUrl(null);
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Image */}
      {currentImageUrl && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-900">
            Núverandi mynd
          </h4>
          <div className="relative">
            <img
              src={currentImageUrl}
              alt="Current hero image"
              className="max-w-md rounded-lg border border-gray-300 shadow-sm"
            />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white shadow-sm hover:bg-red-600"
              title="Fjarlægja mynd"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Pending Image */}
      {pendingImageUrl && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-900">
            Ný mynd - bíður staðfestingar
          </h4>
          <div className="relative">
            <img
              src={pendingImageUrl}
              alt="New hero image preview"
              className="max-w-md rounded-lg border-2 border-blue-300 shadow-sm"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={handleConfirm}
                disabled={isConfirming}
                className="rounded-full bg-green-500 p-1 text-white shadow-sm hover:bg-green-600 disabled:opacity-50"
                title="Staðfesta nýju mynd"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
              <button
                onClick={handleCancel}
                disabled={isConfirming}
                className="rounded-full bg-red-500 p-1 text-white shadow-sm hover:bg-red-600 disabled:opacity-50"
                title="Hætta við"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="mt-2 rounded-lg bg-blue-50 p-3">
            <p className="text-sm text-blue-800">
              <strong>Staðfestu:</strong> Þessi mynd mun koma í stað núverandi
              myndar.
            </p>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {!pendingImageUrl && (
        <div>
          <UploadButton<OurFileRouter, "heroUploader">
            endpoint="heroUploader"
            onClientUploadComplete={(res) => {
              if (res?.[0]?.url) {
                setPendingImageUrl(res[0].url);
                setIsUploading(false);
              }
            }}
            onUploadError={(error: Error) => {
              alert(`Villa við að hlaða upp: ${error.message}`);
              setIsUploading(false);
            }}
            onUploadBegin={() => {
              setIsUploading(true);
            }}
            appearance={{
              button:
                "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm disabled:opacity-50",
              allowedContent: "text-sm text-gray-500 mt-2",
            }}
          />

          {isUploading && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              Hleður upp mynd...
            </div>
          )}
        </div>
      )}

      {isConfirming && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent"></div>
          Vistar breytingar...
        </div>
      )}
    </div>
  );
}