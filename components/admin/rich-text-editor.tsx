"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";

type Props = {
  name: string;
  initialContent?: string;
  placeholder?: string;
};

function Btn({
  title,
  active,
  disabled,
  onClick,
  children,
}: {
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`rte-btn${active ? " is-active" : ""}`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  name,
  initialContent = "",
  placeholder = "Write your article… use the toolbar or drop an image right into the text.",
}: Props) {
  const hiddenRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        },
      }),
      Image.configure({ inline: false, allowBase64: false, HTMLAttributes: { class: "rte-image" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    immediatelyRender: false,
    content: initialContent,
    editorProps: {
      attributes: { class: "rte-content" },
      handleDrop(view, event) {
        const files = Array.from(event.dataTransfer?.files ?? []).filter((f) =>
          f.type.startsWith("image/")
        );
        if (files.length === 0) return false;
        event.preventDefault();
        files.forEach((file) => uploadAndInsert(file));
        return true;
      },
      handlePaste(view, event) {
        const files = Array.from(event.clipboardData?.files ?? []).filter((f) =>
          f.type.startsWith("image/")
        );
        if (files.length === 0) return false;
        event.preventDefault();
        files.forEach((file) => uploadAndInsert(file));
        return true;
      },
    },
    onUpdate({ editor }) {
      if (hiddenRef.current) hiddenRef.current.value = editor.getHTML();
    },
  });

  useEffect(() => {
    if (hiddenRef.current && editor) {
      hiddenRef.current.value = editor.getHTML();
    }
  }, [editor]);

  async function uploadAndInsert(file: File) {
    if (!editor) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-image", { method: "POST", body: fd });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Upload failed");
      editor.chain().focus().setImage({ src: json.url, alt: file.name }).run();
    } catch (err) {
      window.alert((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadAndInsert(file);
    e.target.value = "";
  };

  const insertImageByUrl = () => {
    const url = window.prompt("Image URL", "https://");
    if (url) editor?.chain().focus().setImage({ src: url }).run();
  };

  const addLink = () => {
    const prev = editor?.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (!url) {
      editor?.chain().focus().unsetLink().run();
    } else {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="rte-wrap">
      <div className="rte-toolbar" onMouseDown={(e) => e.preventDefault()}>
        <Btn title="Undo (Ctrl+Z)" disabled={!editor?.can().undo()} onClick={() => editor?.chain().focus().undo().run()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 14 4 9l5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 9h11a5 5 0 0 1 0 10h-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Btn>
        <Btn title="Redo (Ctrl+Shift+Z)" disabled={!editor?.can().redo()} onClick={() => editor?.chain().focus().redo().run()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 14 5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 9H9a5 5 0 0 0 0 10h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Btn>
        <span className="rte-sep" />

        <Btn title="Bold (Ctrl+B)" active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()}>
          <b>B</b>
        </Btn>
        <Btn title="Italic (Ctrl+I)" active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()}>
          <i>I</i>
        </Btn>
        <Btn title="Underline (Ctrl+U)" active={editor?.isActive("underline")} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
          <u>U</u>
        </Btn>
        <Btn title="Strikethrough" active={editor?.isActive("strike")} onClick={() => editor?.chain().focus().toggleStrike().run()}>
          <s>S</s>
        </Btn>
        <span className="rte-sep" />

        <Btn title="Heading 1" active={editor?.isActive("heading", { level: 1 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}>H1</Btn>
        <Btn title="Heading 2" active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Btn>
        <Btn title="Heading 3" active={editor?.isActive("heading", { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>H3</Btn>
        <Btn title="Paragraph" active={editor?.isActive("paragraph")} onClick={() => editor?.chain().focus().setParagraph().run()}>¶</Btn>
        <span className="rte-sep" />

        <Btn title="Align left" active={editor?.isActive({ textAlign: "left" })} onClick={() => editor?.chain().focus().setTextAlign("left").run()}>
          <svg width="14" height="12" viewBox="0 0 24 20" fill="none" aria-hidden="true"><path d="M3 4h18M3 10h12M3 16h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </Btn>
        <Btn title="Align center" active={editor?.isActive({ textAlign: "center" })} onClick={() => editor?.chain().focus().setTextAlign("center").run()}>
          <svg width="14" height="12" viewBox="0 0 24 20" fill="none" aria-hidden="true"><path d="M3 4h18M6 10h12M3 16h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </Btn>
        <Btn title="Align right" active={editor?.isActive({ textAlign: "right" })} onClick={() => editor?.chain().focus().setTextAlign("right").run()}>
          <svg width="14" height="12" viewBox="0 0 24 20" fill="none" aria-hidden="true"><path d="M3 4h18M9 10h12M3 16h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </Btn>
        <Btn title="Justify" active={editor?.isActive({ textAlign: "justify" })} onClick={() => editor?.chain().focus().setTextAlign("justify").run()}>
          <svg width="14" height="12" viewBox="0 0 24 20" fill="none" aria-hidden="true"><path d="M3 4h18M3 10h18M3 16h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </Btn>
        <span className="rte-sep" />

        <Btn title="Bullet list" active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true"><circle cx="1.5" cy="2" r="1.5" fill="currentColor"/><circle cx="1.5" cy="6" r="1.5" fill="currentColor"/><circle cx="1.5" cy="10" r="1.5" fill="currentColor"/><rect x="4" y="1" width="10" height="2" rx="1" fill="currentColor"/><rect x="4" y="5" width="10" height="2" rx="1" fill="currentColor"/><rect x="4" y="9" width="10" height="2" rx="1" fill="currentColor"/></svg>
        </Btn>
        <Btn title="Numbered list" active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
          <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true"><text x="0" y="3" fontSize="4" fill="currentColor">1.</text><text x="0" y="7" fontSize="4" fill="currentColor">2.</text><text x="0" y="11" fontSize="4" fill="currentColor">3.</text><rect x="5" y="1" width="9" height="2" rx="1" fill="currentColor"/><rect x="5" y="5" width="9" height="2" rx="1" fill="currentColor"/><rect x="5" y="9" width="9" height="2" rx="1" fill="currentColor"/></svg>
        </Btn>
        <span className="rte-sep" />

        <Btn title="Pull quote" active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
          <svg width="14" height="11" viewBox="0 0 14 11" fill="currentColor" aria-hidden="true"><path d="M0 0h5v5H2.5C2.5 6.7 3.8 8 5 8.5V11C2 10 0 7.5 0 5V0ZM9 0h5v5h-2.5C11.5 6.7 12.8 8 14 8.5V11C11 10 9 7.5 9 5V0Z"/></svg>
        </Btn>
        <Btn title="Inline code" active={editor?.isActive("code")} onClick={() => editor?.chain().focus().toggleCode().run()}>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true"><path d="M4 1L1 5l3 4M10 1l3 4-3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Btn>
        <Btn title="Code block" active={editor?.isActive("codeBlock")} onClick={() => editor?.chain().focus().toggleCodeBlock().run()}>
          {"{ }"}
        </Btn>
        <span className="rte-sep" />

        <Btn title="Insert link" active={editor?.isActive("link")} onClick={addLink}>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true"><path d="M5.5 5a2.5 2.5 0 0 0 3.5.5l2-2A2.5 2.5 0 0 0 7.5.5L6 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M8.5 5a2.5 2.5 0 0 0-3.5-.5l-2 2A2.5 2.5 0 0 0 6.5 9.5L8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </Btn>
        <Btn title="Remove link" disabled={!editor?.isActive("link")} onClick={() => editor?.chain().focus().unsetLink().run()}>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true"><path d="M5.5 5a2.5 2.5 0 0 0 3.5.5l2-2A2.5 2.5 0 0 0 7.5.5L6 2M8.5 5a2.5 2.5 0 0 0-3.5-.5l-2 2A2.5 2.5 0 0 0 6.5 9.5L8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M1 1l12 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </Btn>
        <span className="rte-sep" />

        <Btn title="Upload image (click) or drop / paste into the text" onClick={() => fileRef.current?.click()}>
          <svg width="15" height="13" viewBox="0 0 24 20" fill="none" aria-hidden="true"><rect x="2" y="2" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><path d="m3 15 5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
          <span className="rte-btn-label">{uploading ? "Uploading…" : "Image"}</span>
        </Btn>
        <Btn title="Insert image from URL" onClick={insertImageByUrl}>
          URL
        </Btn>
        <span className="rte-sep" />

        <Btn title="Horizontal rule" onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
          <svg width="14" height="4" viewBox="0 0 14 4" fill="none" aria-hidden="true"><rect x="0" y="1.5" width="14" height="1.5" rx=".75" fill="currentColor"/></svg>
        </Btn>
        <Btn title="Clear formatting" onClick={() => editor?.chain().focus().clearNodes().unsetAllMarks().run()}>
          <svg width="14" height="13" viewBox="0 0 14 13" fill="none" aria-hidden="true"><path d="M1 2h12M3 2l2 4m6-4-5 9M3.5 11h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M11 9l2 2M13 9l-2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
        </Btn>

        <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={onFileChange} />
      </div>

      <EditorContent editor={editor} />
      <input type="hidden" name={name} ref={hiddenRef} defaultValue={initialContent} />
    </div>
  );
}
