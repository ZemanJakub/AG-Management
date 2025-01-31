
export interface FormElement {
    id: number;
    key: string;
    label: string;
    type: "input" | "textarea" | "select" | "date" | "address" | "number" | "email"; 
    required: boolean;
    choices?: { label: string; value: string }[]; 
    order: number;
    step?: number;
    defaultValue?: string;
  }
  
  export interface MyFormData {
    id: string;
    name: string;
    elements: FormElement[];
  }