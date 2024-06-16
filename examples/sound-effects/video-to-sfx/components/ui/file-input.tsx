import { cn } from "@/lib/utils";
import { ReactNode, Ref, useState } from "react";
import Dropzone, { DropEvent, FileRejection } from "react-dropzone";

export const FileInput = ({
  children = "Drag and drop a file",
  className,
  onChange,
  accept = [],
  maxSize,
  inputRef,
}: {
  children?: ReactNode;
  className?: string;
  onChange: (data: {
    files: File[];
    rejectedFiles: FileRejection[];
    event: DropEvent;
  }) => void;
  accept?: string[];
  maxSize?: number; // megabytes
  inputRef?: Ref<HTMLInputElement>;
}) => {
  const acceptMap: Record<string, string[]> = {};
  accept.forEach(mimeType => {
    acceptMap[mimeType] = [];
  });

  return (
    <Dropzone
      onDrop={(acceptedFiles, rejectedFiles, event) => {
        onChange({
          files: acceptedFiles,
          rejectedFiles: rejectedFiles,
          event,
        });
      }}
      maxSize={maxSize ? maxSize * 1048576 : undefined}
      accept={acceptMap}
    >
      {({ getRootProps, getInputProps, isDragActive }) => {
        const inputProps = getInputProps();
        return (
          <div
            className={cn(
              "p-3 cursor-pointer center rounded-lg transition-colors",
              isDragActive && "bg-gray-alpha-100",
              className
            )}
            {...getRootProps()}
          >
            <input {...inputProps} />
            <div className="center h-full w-full">{children}</div>
          </div>
        );
      }}
    </Dropzone>
  );
};
