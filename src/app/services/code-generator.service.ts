import { Injectable } from '@angular/core';
import { FormField, FormSchema } from '../models/field';

const esc = (s: string | undefined) =>
  (s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const indent = (text: string, spaces: number) =>
  text
    .split('\n')
    .map((l) => (l ? ' '.repeat(spaces) + l : l))
    .join('\n');

/** Generates a standalone Angular Material component (reactive forms) from a form schema. */
@Injectable({ providedIn: 'root' })
export class CodeGeneratorService {
  generateHtml(schema: FormSchema): string {
    const rows = schema.rows
      .filter((r) => r.fields.length)
      .map((r) => {
        const fields = r.fields.map((f) => this.fieldHtml(f)).join('\n');
        return `<div class="form-row">\n${indent(fields, 2)}\n</div>`;
      })
      .join('\n');

    return `<form [formGroup]="form" (ngSubmit)="onSubmit()" class="dynamic-form">
  <h2>${esc(schema.title)}</h2>
${indent(rows, 2)}
  <div class="form-actions">
    <button mat-flat-button type="submit">Submit</button>
  </div>
</form>
`;
  }

  generateTs(schema: FormSchema): string {
    const fields = schema.rows.flatMap((r) => r.fields);
    const controls = fields
      .map((f) => {
        const validators = this.validators(f);
        const initial = f.type === 'checkbox' || f.type === 'toggle' ? 'false' : "''";
        return validators.length
          ? `${f.name}: [${initial}, [${validators.join(', ')}]],`
          : `${f.name}: [${initial}],`;
      })
      .join('\n');

    const imports = new Set<string>(['ReactiveFormsModule', 'MatButtonModule']);
    const matImports = new Map<string, string>([
      ['MatButtonModule', '@angular/material/button'],
    ]);
    const need = (name: string, from: string) => {
      imports.add(name);
      matImports.set(name, from);
    };
    for (const f of fields) {
      switch (f.type) {
        case 'select':
          need('MatFormFieldModule', '@angular/material/form-field');
          need('MatSelectModule', '@angular/material/select');
          break;
        case 'radio':
          need('MatRadioModule', '@angular/material/radio');
          break;
        case 'checkbox':
          need('MatCheckboxModule', '@angular/material/checkbox');
          break;
        case 'toggle':
          need('MatSlideToggleModule', '@angular/material/slide-toggle');
          break;
        case 'date':
          need('MatFormFieldModule', '@angular/material/form-field');
          need('MatInputModule', '@angular/material/input');
          need('MatDatepickerModule', '@angular/material/datepicker');
          break;
        default:
          need('MatFormFieldModule', '@angular/material/form-field');
          need('MatInputModule', '@angular/material/input');
      }
    }
    const hasDate = fields.some((f) => f.type === 'date');
    const importLines = [...matImports.entries()]
      .map(([name, from]) => `import { ${name} } from '${from}';`)
      .join('\n');

    return `import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
${hasDate ? "import { provideNativeDateAdapter } from '@angular/material/core';\n" : ''}${importLines}

@Component({
  selector: 'app-generated-form',
  imports: [${[...imports].join(', ')}],${hasDate ? '\n  providers: [provideNativeDateAdapter()],' : ''}
  templateUrl: './generated-form.html',
  styleUrl: './generated-form.scss',
})
export class GeneratedForm {
  private fb = inject(FormBuilder);

  form = this.fb.group({
${indent(controls, 4)}
  });

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    console.log(this.form.value);
  }
}
`;
  }

  generateScss(): string {
    return `.dynamic-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 960px;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin-bottom: 8px;

  > * {
    flex: 1 1 200px;
  }
}

.radio-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}
`;
  }

  generateJson(schema: FormSchema): string {
    return JSON.stringify(schema, null, 2);
  }

  private validators(f: FormField): string[] {
    const v: string[] = [];
    if (f.required) v.push(f.type === 'checkbox' || f.type === 'toggle' ? 'Validators.requiredTrue' : 'Validators.required');
    if (f.type === 'email') v.push('Validators.email');
    if (f.minLength != null) v.push(`Validators.minLength(${f.minLength})`);
    if (f.maxLength != null) v.push(`Validators.maxLength(${f.maxLength})`);
    if (f.min != null) v.push(`Validators.min(${f.min})`);
    if (f.max != null) v.push(`Validators.max(${f.max})`);
    if (f.pattern) v.push(`Validators.pattern(${JSON.stringify(f.pattern).replace(/^"|"$/g, "'")})`);
    return v;
  }

  private errorsHtml(f: FormField): string {
    const lines: string[] = [];
    const ctrl = `form.controls.${f.name}`;
    if (f.required) lines.push(`@if (${ctrl}.hasError('required')) { <mat-error>${esc(f.label)} is required</mat-error> }`);
    if (f.type === 'email') lines.push(`@if (${ctrl}.hasError('email')) { <mat-error>Enter a valid email</mat-error> }`);
    if (f.minLength != null) lines.push(`@if (${ctrl}.hasError('minlength')) { <mat-error>Minimum ${f.minLength} characters</mat-error> }`);
    if (f.maxLength != null) lines.push(`@if (${ctrl}.hasError('maxlength')) { <mat-error>Maximum ${f.maxLength} characters</mat-error> }`);
    if (f.min != null) lines.push(`@if (${ctrl}.hasError('min')) { <mat-error>Minimum value is ${f.min}</mat-error> }`);
    if (f.max != null) lines.push(`@if (${ctrl}.hasError('max')) { <mat-error>Maximum value is ${f.max}</mat-error> }`);
    if (f.pattern) lines.push(`@if (${ctrl}.hasError('pattern')) { <mat-error>Invalid format</mat-error> }`);
    return lines.join('\n');
  }

  private fieldHtml(f: FormField): string {
    const label = esc(f.label);
    const placeholder = f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : '';
    const hint = f.hint ? `\n  <mat-hint>${esc(f.hint)}</mat-hint>` : '';
    const errors = this.errorsHtml(f);
    const errorBlock = errors ? '\n' + indent(errors, 2) : '';
    const opts = (f.options ?? []);

    switch (f.type) {
      case 'text':
      case 'email':
      case 'number':
        return `<mat-form-field appearance="outline">
  <mat-label>${label}</mat-label>
  <input matInput type="${f.type}" formControlName="${f.name}"${placeholder} />${hint}${errorBlock}
</mat-form-field>`;
      case 'textarea':
        return `<mat-form-field appearance="outline">
  <mat-label>${label}</mat-label>
  <textarea matInput rows="${f.rows ?? 3}" formControlName="${f.name}"${placeholder}></textarea>${hint}${errorBlock}
</mat-form-field>`;
      case 'select':
        return `<mat-form-field appearance="outline">
  <mat-label>${label}</mat-label>
  <mat-select formControlName="${f.name}"${placeholder}>
${opts.map((o) => `    <mat-option value="${esc(o.value)}">${esc(o.label)}</mat-option>`).join('\n')}
  </mat-select>${hint}${errorBlock}
</mat-form-field>`;
      case 'date':
        return `<mat-form-field appearance="outline">
  <mat-label>${label}</mat-label>
  <input matInput [matDatepicker]="${f.name}Picker" formControlName="${f.name}"${placeholder} />
  <mat-datepicker-toggle matIconSuffix [for]="${f.name}Picker" />
  <mat-datepicker #${f.name}Picker />${hint}${errorBlock}
</mat-form-field>`;
      case 'radio':
        return `<div class="radio-field">
  <label>${label}${f.required ? ' *' : ''}</label>
  <mat-radio-group formControlName="${f.name}">
${opts.map((o) => `    <mat-radio-button value="${esc(o.value)}">${esc(o.label)}</mat-radio-button>`).join('\n')}
  </mat-radio-group>
</div>`;
      case 'checkbox':
        return `<mat-checkbox formControlName="${f.name}">${label}</mat-checkbox>`;
      case 'toggle':
        return `<mat-slide-toggle formControlName="${f.name}">${label}</mat-slide-toggle>`;
    }
  }
}
