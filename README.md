# Dynamic Form Builder (Angular Material)

A drag-and-drop form designer built with Angular standalone components, signals,
Angular Material and the CDK, modelled on the "Angular Material Forms Designer"
Developed by Mumtaz Ahmad.


## Features

- **Field palette**: text, email, number, text area, dropdown, radio group,
  checkbox, toggle and date picker. Drag a field onto the form, or click it to
  append it to the last row.
- **Rows and columns**: each row holds several fields side by side. Drag fields
  within a row or between rows, reorder rows by their handle, add and delete rows.
- **Field settings panel**: label, form control name, placeholder, hint, rows
  (text area), options (dropdown and radio) and validation (required, min/max
  length, min/max value, regex pattern).
- **Live preview**: a real reactive form with validation messages and the
  submitted value.
- **Code export**: generates a standalone Angular Material component
  (HTML, TypeScript, SCSS) using reactive forms, plus the JSON schema. Copy or
  download each file.
- **Import / persistence**: load a form from a JSON schema
  (try [`sample-form.json`](sample-form.json)); the current form is saved in
  the browser's local storage.

## Run it

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm start          # http://localhost:4200
npm run build      # production build in dist/
```

`.npmrc` sets `legacy-peer-deps=true` because some npm 10 versions fail to
resolve the test tooling's peer dependencies otherwise.

## Structure

```
src/app
├── models/field.ts                    Field, row and schema types
├── models/drop-lists.ts               Shared CDK drop list ids
├── services/
│   ├── form.service.ts                Signal-based form state (rows, fields, selection)
│   ├── field-types.service.ts         Palette definitions and defaults per field type
│   └── code-generator.service.ts      HTML / TS / SCSS / JSON generation
└── components/
    ├── field-types-panel/             Left palette (drag source)
    ├── form-editor/                   Canvas with rows (drop targets)
    ├── field-renderer/                Renders one Material control for a field
    ├── field-settings/                Right settings panel
    ├── form-preview/                  Live reactive-form preview
    └── export-code-dialog/            Export dialog with tabs
```
