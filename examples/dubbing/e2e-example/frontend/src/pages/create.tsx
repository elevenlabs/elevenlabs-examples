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
      const dubbing_id = await addProject(
        payload.sourceLang,
        payload.targetLang,
        payload.file
      );
      return dubbing_id;
    },
    onSuccess: (dubbing_id: string) => {
      toast({ description: "Project added successfully" });
      navigate(`/watch/${dubbing_id}`);
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
              <section className="w-full bg-gray-100 hover:bg-gray-200 rounded-lg h-96 flex">
                <div
                  {...getRootProps()}
                  className="text-center w-full h-full flex items-center justify-center cursor-pointer"
                >
                  <input {...getInputProps()} />
                  {file ? (
                    <p>
                      Selected <span className="font-bold">{file.name}</span>
                    </p>
                  ) : (
                    <p>Drag and drop a video</p>
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
            <div className="flex mt-8">
              <Button
                type="submit"
                size={"lg"}
                disabled={
                  mutation.isLoading || !file || !form.watch("targetLang")
                }
              >
                {mutation.isLoading ? "Loading..." : "Submit"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </Layout>
  );
};
