import { languages } from "@/components/languages";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { addProject } from "@/services/dubbing";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import Dropzone from "react-dropzone";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";

interface FormProps {
  file: File;
  targetLang: string;
  sourceLang: string;
}

export const Create = () => {
  const form = useForm<FormProps>({
    defaultValues: {
      targetLang: "",
      sourceLang: "detect",
    },
  });
  const [showError, setShowError] = useState<boolean>(false);

  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (payload: FormProps) => {
      const dubbingId = await addProject(
        payload.sourceLang,
        payload.targetLang,
        payload.file
      );
      return dubbingId;
    },
    onSuccess: (dubbingId: string) => {
      toast({ description: "Project added successfully" });
      navigate(`/stream/${dubbingId}`);
    },
    onError: () => {
      toast({
        description: "Failed to add dubbing project",
        variant: "destructive",
      });
    },
  });

  const file = form.watch("file");

  return (
    <Layout>
      <div className="mx-auto max-w-screen-md w-full">
        <h1 className="font-bold text-xl mb-4">Upload Dubbing Project</h1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(val => {
              if (!val.file || !val.sourceLang || !val.targetLang) {
                setShowError(true);
                return;
              }
              setShowError(false);
              mutation.mutate(val);
            })}
          >
            <h2 className="font-medium text-sm">Source Video</h2>
            <Dropzone
              onDrop={acceptedFiles => {
                if (acceptedFiles.length === 1) {
                  form.setValue("file", acceptedFiles[0]);
                }
              }}
              accept={{
                "video/mp4": [".mp4"],
              }}
              maxFiles={1}
            >
              {({ getRootProps, getInputProps }) => (
                <section className="w-full p-8 bg-gray-100 hover:bg-gray-200 rounded-lg border-2 hover:border-gray-500 hover:cursor-pointer">
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    {file ? (
                      <p className="text-center text-gray-700">
                        Selected{" "}
                        <span className="font-medium">{file.name}</span>
                      </p>
                    ) : (
                      <p className="text-center text-gray-700">
                        Drag 'n' drop a video file here, or click to select file
                      </p>
                    )}
                  </div>
                </section>
              )}
            </Dropzone>
            <div className="flex gap-x-4 mt-4">
              <FormField
                control={form.control}
                name="sourceLang"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source Language</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      required
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="detect" key={"detect"}>
                          Auto Detect
                        </SelectItem>
                        {languages
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map(language => {
                            return (
                              <SelectItem
                                value={language.code}
                                key={language.code}
                              >
                                {language.countryLogo} {language.name}
                              </SelectItem>
                            );
                          })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetLang"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Language</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      required
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language target" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map(language => {
                            return (
                              <SelectItem
                                value={language.code}
                                key={language.code}
                              >
                                {language.countryLogo} {language.name}
                              </SelectItem>
                            );
                          })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>{" "}
            {showError && (
              <p className="mt-2 font-medium text-destructive">
                *Please fill all the required fields
              </p>
            )}
            <div className="flex justify-end">
              <Button type="submit" disabled={mutation.isLoading}>
                {mutation.isLoading ? (
                  <div className="flex gap-2 items-center">
                    <Loader2 className="animate-spin" />
                    <p>Uploading ...</p>
                  </div>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
};
