"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";

type Props = {
  name: string;
  initialContent?: string;
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

export default function RichTextEditor({ name, initialContent = "" }: Props) {
  const hiddenRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Underline,
    ],
    content: initialContent,
    editorProps: { attributes: { class: "rte-content" } },
    onUpdate({ editor }) {
      if (hiddenRef.current) hiddenRef.current.value = editor.getHTML();
    },
  });

  // Keep hidden input in sync on first mount
  useEffect(() => {
    if (hiddenRef.current && editor) {
      hiddenRef.current.value = editor.getHTML();
    }
  }, [editor]);

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
        <Btn title="Heading 2" active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </Btn>
        <Btn title="Heading 3" active={editor?.isActive("heading", { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
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
        <span className="rte-sep" />
        <Btn title="Insert link" active={editor?.isActive("link")} onClick={addLink}>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true"><path d="M5.5 5a2.5 2.5 0 0 0 3.5.5l2-2A2.5 2.5 0 0 0 7.5.5L6 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M8.5 5a2.5 2.5 0 0 0-3.5-.5l-2 2A2.5 2.5 0 0 0 6.5 9.5L8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </Btn>
        <Btn title="Remove link" disabled={!editor?.isActive("link")} onClick={() => editor?.chain().focus().unsetLink().run()}>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true"><path d="M5.5 5a2.5 2.5 0 0 0 3.5.5l2-2A2.5 2.5 0 0 0 7.5.5L6 2M8.5 5a2.5 2.5 0 0 0-3.5-.5l-2 2A2.5 2.5 0 0 0 6.5 9.5L8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M1 1l12 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </Btn>
        <span className="rte-sep" />
        <Btn title="Horizontal rule" onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
          <svg width="14" height="4" viewBox="0 0 14 4" fill="none" aria-hidden="true"><rect x="0" y="1.5" width="14" height="1.5" rx=".75" fill="currentColor"/></svg>
        </Btn>
        <Btn title="Clear formatting" onClick={() => editor?.chain().focus().clearNodes().unsetAllMarks().run()}>
          <svg width="14" height="13" viewBox="0 0 14 13" fill="none" aria-hidden="true"><path d="M1 2h12M3 2l2 4m6-4-5 9M3.5 11h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M11 9l2 2M13 9l-2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
        </Btn>
      </div>

      <EditorContent editor={editor} />
      <input type="hidden" name={name} ref={hiddenRef} defaultValue={initialContent} />
    </div>
  );
}
