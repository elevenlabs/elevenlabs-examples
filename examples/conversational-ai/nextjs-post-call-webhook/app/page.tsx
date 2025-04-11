"use client";

import type React from "react";
import { uploadFormData } from "@/app/actions/upload";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, Mic } from "lucide-react";

import { useConversation } from "@11labs/react";

async function getSignedUrl(): Promise<string> {
  const response = await fetch("/api/signed-url");
  if (!response.ok) {
    throw Error("Failed to get signed url");
  }
  const data = await response.json();
  return data.signedUrl;
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<
    "initial" | "training" | "voice" | "email" | "ready"
  >("initial");
  const [activeTab, setActiveTab] = useState<"file" | "websites">("file");
  const [fileData, setFileData] = useState<File[]>([]);
  const [websiteUrls, setWebsiteUrls] = useState<string[]>([""]);
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [conversationId, setConversationId] = useState("");

  const conversation = useConversation({
    onConnect: () => console.log("Connected"),
    onDisconnect: () => console.log("Disconnected"),
    onMessage: (message: string) => console.log("Message:", message),
    onError: (error: Error) => console.error("Error:", error),
  });

  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      // Start the conversation with your agent
      const signedUrl = await getSignedUrl();
      const convId = await conversation.startSession({
        signedUrl,
        dynamicVariables: {
          user_name: userName,
        },
        clientTools: {
          set_ui_state: ({ step }: { step: string }): string => {
            // Allow agent to navigate the UI.
            setCurrentStep(
              step as "initial" | "training" | "voice" | "email" | "ready"
            );
            return `Navigated to ${step}`;
          },
        },
      });
      setConversationId(convId);
      console.log("Conversation ID:", convId);
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  }, [conversation, userName]);
  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const handleEmailSubmit = () => {
    stopConversation();
  };

  const addWebsiteField = () => {
    setWebsiteUrls([...websiteUrls, ""]);
  };

  const updateWebsiteUrl = (index: number, value: string) => {
    const updatedUrls = [...websiteUrls];
    updatedUrls[index] = value;
    setWebsiteUrls(updatedUrls);
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-8 flex justify-right">
          <img
            src="/elevenlabs-logo-white.svg"
            alt="ElevenLabs Logo"
            className="h-12 w-auto"
          />
        </div>
        <div className={currentStep === "initial" ? "block" : "hidden"}>
          <div className="space-y-8">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
              Design your Conversational AI Agent
            </h1>
            <p className="text-lg text-gray-300">
              Let's have a chat to design your helpful conversational AI agent!
              Click start and enable microphone access.
            </p>

            <div className="space-y-4">
              <Label htmlFor="name-input" className="text-sm text-gray-400">
                Your Name
              </Label>
              <Input
                id="name-input"
                type="text"
                placeholder="Enter your name"
                className="bg-gray-800 border-gray-700 text-white"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                required
              />
            </div>

            {conversation.status === "connected" ? (
              <Button
                type="button"
                onClick={() => setCurrentStep("training")}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6"
              >
                <span>Next</span>
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={startConversation}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6"
                disabled={!userName.trim()}
              >
                <span>Start</span>
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <form
          action={uploadFormData}
          onSubmit={handleEmailSubmit}
          className="space-y-6"
        >
          <input type="hidden" name="conversation-id" value={conversationId} />
          <div className={currentStep === "training" ? "block" : "hidden"}>
            <div className="space-y-8">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                Train Your Agent
              </h1>

              <div className="bg-gray-900 rounded-lg p-6">
                <div className="flex border-b border-gray-800 mb-6">
                  <button
                    className={`py-2 px-4 ${
                      activeTab === "file"
                        ? "border-b-2 border-purple-500 text-white"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                    onClick={() => setActiveTab("file")}
                    type="button"
                  >
                    File Upload
                  </button>
                  <button
                    className={`py-2 px-4 ${
                      activeTab === "websites"
                        ? "border-b-2 border-purple-500 text-white"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                    onClick={() => setActiveTab("websites")}
                    type="button"
                  >
                    Websites
                  </button>
                </div>

                <div className="space-y-6">
                  <div className={activeTab === "file" ? "block" : "hidden"}>
                    <div className="space-y-4">
                      <Label
                        htmlFor="file-upload"
                        className="text-sm text-gray-400"
                      >
                        Upload Knowledge Base
                      </Label>
                      <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          multiple
                          className="hidden"
                          onChange={e => {
                            const files = Array.from(e.target.files || []);
                            setFileData(files);
                          }}
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer flex flex-col items-center justify-center"
                        >
                          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-purple-400"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="17 8 12 3 7 8"></polyline>
                              <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                          </div>
                          <p className="text-sm text-gray-400">
                            {fileData.length > 0
                              ? `${fileData.length} files selected`
                              : "Drag and drop your files here, or click to browse"}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Supports PDF, DOCX, TXT (max 10MB per file)
                          </p>
                        </label>
                      </div>

                      {fileData.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-400">
                            Selected files:
                          </p>
                          <ul className="space-y-1">
                            {fileData.map((file, index) => (
                              <li
                                key={index}
                                className="flex justify-between items-center text-sm text-gray-300 bg-gray-800 p-2 rounded"
                              >
                                <span>{file.name}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFileData(
                                      fileData.filter((_, i) => i !== index)
                                    );
                                  }}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  Remove
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className={activeTab === "websites" ? "block" : "hidden"}
                  >
                    <div className="space-y-4">
                      <Label className="text-sm text-gray-400">
                        Enter Website URLs
                      </Label>
                      {websiteUrls.map((url, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            name="url-input"
                            placeholder="https://example.com/docs"
                            className="bg-gray-800 border-gray-700 text-white"
                            value={url}
                            onChange={e =>
                              updateWebsiteUrl(index, e.target.value)
                            }
                          />
                          {index === websiteUrls.length - 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              className="border-gray-700 text-gray-400"
                              onClick={addWebsiteField}
                            >
                              +
                            </Button>
                          )}
                        </div>
                      ))}
                      <p className="text-xs text-gray-500">
                        We'll crawl these websites to build your agent's
                        knowledge base
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <Button
                  type="button"
                  onClick={() => setCurrentStep("initial")}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-6"
                >
                  <ChevronRight className="mr-2 h-4 w-4 rotate-180" />
                  <span>Back</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => setCurrentStep("voice")}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6"
                >
                  <span>Next</span>
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className={currentStep === "voice" ? "block" : "hidden"}>
            <div className="space-y-8">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                Design Your Agent's Voice
              </h1>
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label
                      htmlFor="voice-input"
                      className="text-lg text-gray-300"
                    >
                      Describe the voice you want for your agent
                    </Label>
                    <p className="text-sm text-gray-400 italic">
                      For example: "A professional, strong spoken female voice
                      with a slight British accent."
                    </p>
                    <div className="flex items-center justify-center w-full h-32 bg-gray-800 rounded-lg">
                      <Mic size={48} className="text-purple-400" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <Button
                  type="button"
                  onClick={() => setCurrentStep("training")}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-6"
                >
                  <ChevronRight className="mr-2 h-4 w-4 rotate-180" />
                  <span>Back</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => setCurrentStep("email")}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6"
                >
                  <span>Next</span>
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className={currentStep === "email" ? "block" : "hidden"}>
            <div className="space-y-8">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                Deploy Your Agent
              </h1>
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="space-y-4">
                  <Label
                    htmlFor="email-input"
                    className="text-sm text-gray-400"
                  >
                    Your Email Address
                  </Label>
                  <Input
                    id="email-input"
                    name="email-input"
                    type="email"
                    placeholder="you@example.com"
                    className="bg-gray-800 border-gray-700 text-white"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  <p className="text-sm text-gray-400">
                    Do you want to deploy this agent on your site? Submit your
                    email address and we will send you the instructions to do
                    so.
                  </p>
                </div>
                <div className="flex gap-4 mt-8">
                  <Button
                    type="button"
                    onClick={() => setCurrentStep("voice")}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-6"
                  >
                    <ChevronRight className="mr-2 h-4 w-4 rotate-180" />
                    <span>Back</span>
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6"
                  >
                    <span>Send Instructions</span>
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className="text-center mt-8 text-sm text-gray-500">
          Powered by{" "}
          <a
            href="https://elevenlabs.io/conversational-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400 transition-colors underline"
          >
            ElevenLabs Conversational AI
          </a>
        </div>
      </div>
    </main>
  );
}
