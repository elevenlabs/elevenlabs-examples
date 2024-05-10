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
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(val => {
            mutation.mutate(val);
          })}
        >
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
              <section className="w-full p-8 bg-gray-100 hover:bg-gray-200 rounded-lg">
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  {file ? (
                    <p className="text-center">
                      Selected <span className="font-bold">{file.name}</span>
                    </p>
                  ) : (
                    <p className="text-center">
                      Drag 'n' drop a video file here, or click to select file
                    </p>
                  )}
                </div>
              </section>
            )}
          </Dropzone>
          <div className="flex gap-x-4 mt-4 justify-center">
            <FormField
              control={form.control}
              name="sourceLang"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source Language</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
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
          </div>
          <div className="flex justify-end">
            <Button type="submit" size={"lg"} disabled={mutation.isLoading}>
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </Layout>
  );
};
