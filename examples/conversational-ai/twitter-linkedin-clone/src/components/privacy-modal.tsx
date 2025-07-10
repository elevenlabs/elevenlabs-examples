"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-auto p-6 sm:p-8 border border-gray-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
            Important Notice
          </h2>

          <div className="bg-gray-50 rounded-lg p-4 sm:p-5 space-y-4">
            <p className="text-gray-700 leading-relaxed">
              By clicking 'Create AI Twin,' and each time I interact with this
              AI agent, I confirm that:
            </p>

            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-gray-400 mr-2 flex-shrink-0">•</span>
                <span>
                  I am over 18 or the age of majority in my jurisdiction
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2 flex-shrink-0">•</span>
                <span>
                  I consent to the recording, storage, and sharing of my
                  communications with third-party service providers, as
                  described in the{" "}
                  <a
                    href="https://elevenlabs.io/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    Privacy Policy
                  </a>
                </span>
              </li>
            </ul>

            <p className="text-gray-600 italic text-sm">
              If you do not wish to have your conversations recorded, please
              refrain from using this service.
            </p>
          </div>

          <div className="text-center pt-2">
            <p className="text-gray-500 text-sm">
              Made with{" "}
              <span className="text-red-500 text-base inline-block animate-pulse">
                ❤️
              </span>{" "}
              by{" "}
              <a
                href="https://elevenlabs.io"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-gray-700 hover:text-gray-900"
              >
                ElevenLabs
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
