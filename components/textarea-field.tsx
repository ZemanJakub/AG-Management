"use client";

import React, { useState } from "react";

import Tiptap from "@/components/tiptap";
import { FormElement } from "./directus-form/components/types";

interface TextareaFieldProps {
  element: FormElement;
  defaultValue: string;
  error?: string|any; 
}

const TextareaField = ({ element, defaultValue, error }: TextareaFieldProps) => {
  const [textValue, setTextValue] = useState(defaultValue);

  const textHandler = (value: string) => {
    setTextValue(value);
  };

  return (
    <div className="w-full mb-5">
      <label htmlFor={element.key} className="block text-sm font-medium mb-1">
        {element.label}
      </label>
      <textarea
        name={element.key}
        id={element.key}
        defaultValue={textValue}
        className="hidden"
      />
      <Tiptap
        defaultValue={defaultValue}
        onChange={textHandler}
        name={element.key}
        id={element.key}
        placeholder="Poznámka…"
      />
      {error && (
        <div className="text-xs mt-1 text-rose-500">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default TextareaField;
