"use client";

import { ChangeEvent, ReactNode, useEffect, useRef, useState } from "react";
import { AlignCenter, AlignLeft, AlignRight, Bold, Code2, Eraser, Heading1, Heading2, Highlighter, ImageIcon, Italic, Link, List, ListOrdered, Quote, Redo2, Strikethrough, Underline, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { sanitizeRichHtml } from "@/lib/sanitize-html";

type RichTextEditorProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
  minHeight?: number;
  maxImageWidth?: number;
  imageQuality?: number;
  error?: string;
  hint?: string;
  className?: string;
};

export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = "محتوای خود را وارد کنید...",
  editable = true,
  minHeight = 220,
  maxImageWidth = 900,
  imageQuality = 0.82,
  error,
  hint,
  className
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [color, setColor] = useState("#111827");
  const [highlight, setHighlight] = useState("#fde68a");

  useEffect(() => {
    const safeValue = sanitizeRichHtml(value);
    if (editorRef.current && editorRef.current.innerHTML !== safeValue) {
      editorRef.current.innerHTML = safeValue;
    }
  }, [value]);

  function emit() {
    onChange(sanitizeRichHtml(editorRef.current?.innerHTML ?? ""));
  }

  function run(command: string, commandValue?: string) {
    if (!editable) return;
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emit();
  }

  function setHeading(tag: "h1" | "h2" | "p") {
    run("formatBlock", tag);
  }

  function addLink() {
    const url = window.prompt("آدرس لینک را وارد کنید:");
    if (!url) return;
    const safe = sanitizeUrl(url);
    if (!safe) return;
    run("createLink", safe);
  }

  async function onImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const src = await compressImage(file, maxImageWidth, imageQuality);
    run("insertImage", src);
    event.target.value = "";
  }

  return (
    <div className={cn("grid min-w-0 gap-1.5 text-sm", className)}>
      {label ? <div className="font-bold text-foreground">{label}</div> : null}
      <div className={cn("min-w-0 overflow-hidden rounded-lg border bg-white", error ? "border-danger" : "border-border")}>
        <div className="flex flex-wrap gap-1 border-b border-border p-2">
          <ToolbarButton title="Bold" onClick={() => run("bold")}><Bold className="size-4" /></ToolbarButton>
          <ToolbarButton title="Italic" onClick={() => run("italic")}><Italic className="size-4" /></ToolbarButton>
          <ToolbarButton title="Underline" onClick={() => run("underline")}><Underline className="size-4" /></ToolbarButton>
          <ToolbarButton title="Strike" onClick={() => run("strikeThrough")}><Strikethrough className="size-4" /></ToolbarButton>
          <ToolbarSeparator />
          <ToolbarButton title="Bullet list" onClick={() => run("insertUnorderedList")}><List className="size-4" /></ToolbarButton>
          <ToolbarButton title="Ordered list" onClick={() => run("insertOrderedList")}><ListOrdered className="size-4" /></ToolbarButton>
          <ToolbarSeparator />
          <ToolbarButton title="H1" onClick={() => setHeading("h1")}><Heading1 className="size-4" /></ToolbarButton>
          <ToolbarButton title="H2" onClick={() => setHeading("h2")}><Heading2 className="size-4" /></ToolbarButton>
          <ToolbarButton title="Paragraph" onClick={() => setHeading("p")}>P</ToolbarButton>
          <ToolbarSeparator />
          <ToolbarButton title="Right" onClick={() => run("justifyRight")}><AlignRight className="size-4" /></ToolbarButton>
          <ToolbarButton title="Center" onClick={() => run("justifyCenter")}><AlignCenter className="size-4" /></ToolbarButton>
          <ToolbarButton title="Left" onClick={() => run("justifyLeft")}><AlignLeft className="size-4" /></ToolbarButton>
          <ToolbarSeparator />
          <label className="grid size-9 place-items-center rounded-md border border-border bg-white text-muted">
            <input type="color" value={color} onChange={(event) => { setColor(event.target.value); run("foreColor", event.target.value); }} className="size-5 cursor-pointer border-0 bg-transparent p-0" title="رنگ متن" />
          </label>
          <label className="grid size-9 place-items-center rounded-md border border-border bg-white text-muted">
            <input type="color" value={highlight} onChange={(event) => { setHighlight(event.target.value); run("hiliteColor", event.target.value); }} className="size-5 cursor-pointer border-0 bg-transparent p-0" title="هایلایت" />
          </label>
          <ToolbarButton title="Highlight" onClick={() => run("hiliteColor", highlight)}><Highlighter className="size-4" /></ToolbarButton>
          <ToolbarButton title="Clear format" onClick={() => run("removeFormat")}><Eraser className="size-4" /></ToolbarButton>
          <ToolbarSeparator />
          <ToolbarButton title="Quote" onClick={() => run("formatBlock", "blockquote")}><Quote className="size-4" /></ToolbarButton>
          <ToolbarButton title="Code" onClick={() => run("formatBlock", "pre")}><Code2 className="size-4" /></ToolbarButton>
          <ToolbarButton title="Link" onClick={addLink}><Link className="size-4" /></ToolbarButton>
          <ToolbarButton title="Image" onClick={() => fileRef.current?.click()}><ImageIcon className="size-4" /></ToolbarButton>
          <ToolbarSeparator />
          <ToolbarButton title="Undo" onClick={() => run("undo")}><Undo2 className="size-4" /></ToolbarButton>
          <ToolbarButton title="Redo" onClick={() => run("redo")}><Redo2 className="size-4" /></ToolbarButton>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onImageUpload} />
        </div>
        <div
          ref={editorRef}
          contentEditable={editable}
          dir="rtl"
          role="textbox"
          aria-multiline
          data-placeholder={placeholder}
          className="prose-editor min-h-52 min-w-0 overflow-auto px-4 py-3 text-sm leading-7 outline-none empty:before:text-muted empty:before:content-[attr(data-placeholder)]"
          style={{ minHeight }}
          onInput={emit}
          onBlur={emit}
          onPaste={(event) => {
            const file = event.clipboardData.files?.[0];
            if (file?.type.startsWith("image/")) {
              event.preventDefault();
              void compressImage(file, maxImageWidth, imageQuality).then((src) => run("insertImage", src));
              return;
            }

            const html = event.clipboardData.getData("text/html");
            if (html) {
              event.preventDefault();
              run("insertHTML", sanitizeRichHtml(html));
              return;
            }

            const text = event.clipboardData.getData("text/plain");
            if (text) {
              event.preventDefault();
              run("insertText", text);
            }
          }}
        />
      </div>
      {error ? <span className="text-xs font-bold text-danger">{error}</span> : hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </div>
  );
}

function ToolbarButton({ title, onClick, children }: { title: string; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" title={title} onMouseDown={(event) => event.preventDefault()} onClick={onClick} className="grid size-9 place-items-center rounded-md border border-border bg-white text-xs font-black text-muted hover:border-accent hover:text-foreground">
      {children}
    </button>
  );
}

function ToolbarSeparator() {
  return <span className="mx-1 h-9 w-px bg-border" />;
}

function sanitizeUrl(url: string) {
  try {
    const parsed = new URL(url, window.location.origin);
    return ["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol) ? parsed.toString() : "";
  } catch {
    return "";
  }
}

function compressImage(file: File, maxWidth: number, quality: number) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/webp", quality));
      };
      img.src = String(event.target?.result ?? "");
    };
    reader.readAsDataURL(file);
  });
}
