"use client";

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import StarterKit from "@tiptap/starter-kit";
import Document from "@tiptap/extension-document";
import Heading from "@tiptap/extension-heading";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import TextAlign from "@tiptap/extension-text-align";
import { EditorContent, useEditor } from "@tiptap/react";
import Bold from "@tiptap/extension-bold";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Italic from "@tiptap/extension-italic";
import React from "react";

interface TiptapViewProps {
  defaultValue: string;
}

const TiptapView = (props: TiptapViewProps) => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Heading,
      Bold,
      Underline,
      Strike,
      Italic,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: props.defaultValue,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        class:
          " min-h [200px] p-2 ",
      },
    },
  });
  if (!editor) {
    return null;
  }
  return (
    <div>
      <EditorContent editor={editor} readOnly />
    </div>
  );
};
export default TiptapView;
