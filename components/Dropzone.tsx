"use client";

import clsx from "clsx";
import { UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

export function Dropzone({ onFiles, accept, hint, multiple = true }: { onFiles: (files: File[]) => void; accept?: string; hint: string; multiple?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => ref.current?.click()}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && ref.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        onFiles(Array.from(e.dataTransfer.files));
      }}
      className={clsx(
        "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition",
        over ? "border-brand-400 bg-brand-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
      )}
    >
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700">
        <UploadCloud className="h-5 w-5" />
      </span>
      <p className="text-sm font-semibold text-slate-800">Glissez & déposez vos fichiers ici</p>
      <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          onFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
    </div>
  );
}
