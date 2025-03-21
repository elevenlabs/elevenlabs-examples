"use client";

import type React from "react";

import { useState, useRef } from "react";
import Image from "next/image";
import { ImageIcon, Loader2, Play, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ScreenshotToSoundEffect() {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      setAudioUrl(null);
      setPrompt("");
      setActiveTab("analyze");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      setAudioUrl(null);
      setPrompt("");
      setActiveTab("analyze");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          setImageFile(file);
          const reader = new FileReader();
          reader.onload = (event) => {
            setImage(event.target?.result as string);
          };
          reader.readAsDataURL(file);
          setAudioUrl(null);
          setPrompt("");
          setActiveTab("analyze");
        }
      }
    }
  };

  const analyzeImage = async () => {
    if (!imageFile) return;

    setIsAnalyzing(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await fetch("/api/analyze-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      setProgress(50);
      const data = await response.json();
      setPrompt(data.prompt);
      setProgress(100);

      toast({
        title: "Image analyzed successfully",
        description:
          "Now you can generate a sound effect based on the analysis.",
      });

      setActiveTab("generate");
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast({
        title: "Error analyzing image",
        description: "Please try again with a different image.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateSoundEffect = async () => {
    if (!prompt) return;

    setIsGenerating(true);
    setProgress(10);

    try {
      const response = await fetch("/api/generate-sound", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate sound effect");
      }

      setProgress(90);
      const data = await response.json();
      setAudioUrl(data.audioUrl);
      setProgress(100);

      toast({
        title: "Sound effect generated",
        description: "Your sound effect is ready to play!",
      });

      setActiveTab("result");
    } catch (error) {
      console.error("Error generating sound effect:", error);
      toast({
        title: "Error generating sound effect",
        description: "Please try again with a different prompt.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
        toast({
          title: "Error playing audio",
          description: "There was an error playing the sound effect.",
          variant: "destructive",
        });
      });
    }
  };

  const downloadAudio = () => {
    if (audioUrl) {
      // For data URLs, we need to create a temporary link
      const a = document.createElement("a");
      a.href = audioUrl;
      a.download = "sound-effect.mp3";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const resetAll = () => {
    setImage(null);
    setImageFile(null);
    setPrompt("");
    setAudioUrl(null);
    setActiveTab("upload");
  };

  return (
    <div className="w-full space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="analyze" disabled={!image}>
            Analyze
          </TabsTrigger>
          <TabsTrigger value="generate" disabled={!prompt}>
            Generate
          </TabsTrigger>
          <TabsTrigger value="result" disabled={!audioUrl}>
            Result
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-4">
          <div
            className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onPaste={handlePaste}
            tabIndex={0}
            role="button"
            aria-label="Upload screenshot"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            {image ? (
              <div className="relative w-full max-w-md h-64">
                <Image
                  src={image || "/placeholder.svg"}
                  alt="Uploaded screenshot"
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="bg-muted rounded-full p-3 mb-4">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You can also paste (Cmd+V) a screenshot
                  </p>
                </div>
              </div>
            )}
          </div>

          {image && (
            <div className="flex justify-end mt-4">
              <Button onClick={() => setActiveTab("analyze")}>
                Continue to Analysis
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analyze" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-full max-w-md h-48">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt="Uploaded screenshot"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Image Analysis</h3>
                  <Button
                    onClick={analyzeImage}
                    disabled={isAnalyzing || !image}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Analyze with Gemini 2.0 Flash"
                    )}
                  </Button>
                </div>
                {isAnalyzing && <Progress value={progress} className="h-2" />}
                <p className="text-sm text-muted-foreground">
                  Click the button to analyze the image with Google's Gemini 2.0
                  Flash AI and generate a sound effect prompt.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">AI-Generated Prompt</h3>
                <Textarea
                  placeholder="The analysis result will appear here..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-sm text-muted-foreground">
                  You can edit the prompt if needed before generating the sound
                  effect.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Sound Generation</h3>
                  <Button
                    onClick={generateSoundEffect}
                    disabled={isGenerating || !prompt}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate with ElevenLabs"
                    )}
                  </Button>
                </div>
                {isGenerating && <Progress value={progress} className="h-2" />}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="result" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="relative w-full max-w-xs h-48">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt="Uploaded screenshot"
                    fill
                    className="object-contain"
                  />
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      Generated Sound Effect
                    </h3>
                    <p className="text-sm text-muted-foreground">{prompt}</p>
                  </div>

                  {audioUrl && (
                    <div className="flex items-center justify-between p-4 bg-muted rounded-md">
                      <div className="flex items-center">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-10 w-10 rounded-full"
                          onClick={playAudio}
                        >
                          <Play className="h-5 w-5" />
                          <span className="sr-only">Play</span>
                        </Button>
                        <audio
                          ref={audioRef}
                          src={audioUrl}
                          controls
                          className="hidden"
                        />
                        <span className="text-sm ml-2">sound-effect.mp3</span>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-10 w-10"
                        onClick={downloadAudio}
                      >
                        <Download className="h-5 w-5" />
                        <span className="sr-only">Download</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={resetAll}
                  className="flex items-center"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Start Over
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
