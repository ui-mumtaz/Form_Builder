export type FieldType =
  | 'text'
  | 'email'
  | 'number'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'toggle'
  | 'date';

export interface FieldOption {
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  name: string;
  label: string;
  placeholder?: string;
  hint?: string;
  required: boolean;
  options?: FieldOption[];
  minLength?: number | null;
  maxLength?: number | null;
  min?: number | null;
  max?: number | null;
  pattern?: string;
  rows?: number;
}

export interface FormRow {
  id: string;
  fields: FormField[];
}

export interface FormSchema {
  title: string;
  rows: FormRow[];
}

/** Settings that the field settings panel can show for a field type. */
export type FieldSetting =
  | 'placeholder'
  | 'hint'
  | 'options'
  | 'length'
  | 'range'
  | 'pattern'
  | 'rows';

export interface FieldTypeDefinition {
  type: FieldType;
  label: string;
  icon: string;
  settings: FieldSetting[];
  defaults: Partial<FormField>;
}
