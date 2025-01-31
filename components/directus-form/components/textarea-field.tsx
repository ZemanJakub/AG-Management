"use client";

import React, { useEffect, useState } from "react";
import { FormElement } from "./types";
import Tiptap from "@/components/tiptap";

interface TextareaFieldProps {
  element: FormElement;
  defaultValue: string;
  error?: string | any;
}

const TextareaField = ({ element, defaultValue, error }: TextareaFieldProps) => {
  const [textValue, setTextValue] = useState<string>(defaultValue?.toString() || element.defaultValue || "");

  useEffect(() => {
    setTextValue(defaultValue?.toString() || element.defaultValue || ""); // Aktualizace hodnoty, pokud se změní defaultValue
  }, [defaultValue]);

  return (
    <div className="w-full mb-5">
      <label
        htmlFor={element.key}
        className="block text-sm font-medium mb-1 text-left"
      >
        {element.label}
      </label>
      {/* Skrytý textarea má být řízený komponentou, proto používá atribut value */}
      <textarea
        name={element.key}
        id={element.key}
        value={textValue}
        onChange={(e) => setTextValue(e.target.value)} // Reaguje na změny
        className="hidden"
      />
      <Tiptap
        defaultValue={defaultValue}
        onChange={(newText) => setTextValue(newText)} // Tiptap aktualizuje hodnotu
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
