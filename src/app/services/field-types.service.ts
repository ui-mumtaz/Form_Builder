import { Injectable } from '@angular/core';
import { FieldType, FieldTypeDefinition } from '../models/field';

const DEFAULT_OPTIONS = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
];

@Injectable({ providedIn: 'root' })
export class FieldTypesService {
  readonly fieldTypes: FieldTypeDefinition[] = [
    {
      type: 'text',
      label: 'Text Field',
      icon: 'text_fields',
      settings: ['placeholder', 'hint', 'length', 'pattern'],
      defaults: { label: 'Text Field', placeholder: 'Enter text' },
    },
    {
      type: 'email',
      label: 'Email',
      icon: 'alternate_email',
      settings: ['placeholder', 'hint'],
      defaults: { label: 'Email', placeholder: 'name@example.com' },
    },
    {
      type: 'number',
      label: 'Number',
      icon: 'pin',
      settings: ['placeholder', 'hint', 'range'],
      defaults: { label: 'Number', placeholder: '0' },
    },
    {
      type: 'textarea',
      label: 'Text Area',
      icon: 'notes',
      settings: ['placeholder', 'hint', 'length', 'rows'],
      defaults: { label: 'Text Area', placeholder: 'Enter details', rows: 3 },
    },
    {
      type: 'select',
      label: 'Dropdown',
      icon: 'arrow_drop_down_circle',
      settings: ['placeholder', 'hint', 'options'],
      defaults: { label: 'Dropdown', placeholder: 'Select an option', options: DEFAULT_OPTIONS },
    },
    {
      type: 'radio',
      label: 'Radio Group',
      icon: 'radio_button_checked',
      settings: ['options'],
      defaults: { label: 'Radio Group', options: DEFAULT_OPTIONS },
    },
    {
      type: 'checkbox',
      label: 'Checkbox',
      icon: 'check_box',
      settings: [],
      defaults: { label: 'Checkbox' },
    },
    {
      type: 'toggle',
      label: 'Toggle',
      icon: 'toggle_on',
      settings: [],
      defaults: { label: 'Toggle' },
    },
    {
      type: 'date',
      label: 'Date Picker',
      icon: 'calendar_today',
      settings: ['placeholder', 'hint'],
      defaults: { label: 'Date', placeholder: 'Choose a date' },
    },
  ];

  get(type: FieldType): FieldTypeDefinition {
    return this.fieldTypes.find((t) => t.type === type)!;
  }
}
