import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { Card } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = "Start writing...",
  disabled = false,
  minHeight = "200px",
}) => {
  const [linkUrl, setLinkUrl] = React.useState("");
  const [linkOpen, setLinkOpen] = React.useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
  });

  const applyLink = () => {
    if (!editor) return;
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }
    setLinkUrl("");
    setLinkOpen(false);
  };

  if (!editor) return null;

  const toolbarItems = [
    {
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
    },
    {
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
    },
    {
      icon: UnderlineIcon,
      action: () => editor.chain().focus().toggleUnderline().run(),
      active: editor.isActive("underline"),
    },
    {
      icon: Strikethrough,
      action: () => editor.chain().focus().toggleStrike().run(),
      active: editor.isActive("strike"),
    },
  ];

  const headingItems = [
    {
      icon: Heading2,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
    },
    {
      icon: Heading3,
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: editor.isActive("heading", { level: 3 }),
    },
  ];

  const listItems = [
    {
      icon: List,
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
    {
      icon: ListOrdered,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
  ];

  const alignItems = [
    {
      icon: AlignLeft,
      action: () => editor.chain().focus().setTextAlign("left").run(),
      active: editor.isActive({ textAlign: "left" }),
    },
    {
      icon: AlignCenter,
      action: () => editor.chain().focus().setTextAlign("center").run(),
      active: editor.isActive({ textAlign: "center" }),
    },
    {
      icon: AlignRight,
      action: () => editor.chain().focus().setTextAlign("right").run(),
      active: editor.isActive({ textAlign: "right" }),
    },
  ];

  return (
    <Card
      className={cn(
        "overflow-hidden",
        disabled && "opacity-50 pointer-events-none",
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5">
        {toolbarItems.map((item, i) => (
          <Toggle
            key={i}
            size="sm"
            pressed={item.active}
            onPressedChange={item.action}
            className={cn(item.active && "bg-primary/10 text-primary")}
          >
            <item.icon className="h-4 w-4" />
          </Toggle>
        ))}
        <Separator orientation="vertical" className="mx-1 h-6" />
        {headingItems.map((item, i) => (
          <Toggle
            key={i}
            size="sm"
            pressed={item.active}
            onPressedChange={item.action}
            className={cn(item.active && "bg-primary/10 text-primary")}
          >
            <item.icon className="h-4 w-4" />
          </Toggle>
        ))}
        <Separator orientation="vertical" className="mx-1 h-6" />
        {listItems.map((item, i) => (
          <Toggle
            key={i}
            size="sm"
            pressed={item.active}
            onPressedChange={item.action}
            className={cn(item.active && "bg-primary/10 text-primary")}
          >
            <item.icon className="h-4 w-4" />
          </Toggle>
        ))}
        <Separator orientation="vertical" className="mx-1 h-6" />
        {alignItems.map((item, i) => (
          <Toggle
            key={i}
            size="sm"
            pressed={item.active}
            onPressedChange={item.action}
            className={cn(item.active && "bg-primary/10 text-primary")}
          >
            <item.icon className="h-4 w-4" />
          </Toggle>
        ))}
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Popover open={linkOpen} onOpenChange={setLinkOpen}>
          <PopoverTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive("link")}
              onPressedChange={() => {
                const existing = editor.getAttributes("link").href as
                  | string
                  | undefined;
                setLinkUrl(existing ?? "");
                setLinkOpen(true);
              }}
              className={cn(
                editor.isActive("link") && "bg-primary/10 text-primary",
              )}
            >
              <LinkIcon className="h-4 w-4" />
            </Toggle>
          </PopoverTrigger>
          <PopoverContent className="flex w-72 gap-2 p-3" align="start">
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLink();
                }
              }}
            />
            <Button size="sm" onClick={applyLink}>
              Apply
            </Button>
          </PopoverContent>
        </Popover>
      </div>
      <EditorContent
        editor={editor}
        className={cn(
          "prose prose-sm dark:prose-invert max-w-none px-4 py-3 focus-within:ring-0 focus-within:ring-ring focus-within:ring-offset-0 focus-within:ring-offset-background rounded-b-lg",
          "[&_.tiptap]:outline-none [&_.tiptap_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:h-0 [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none",
        )}
        style={{ minHeight }}
      />
    </Card>
  );
};
