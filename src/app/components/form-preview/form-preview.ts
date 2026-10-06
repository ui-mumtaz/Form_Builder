import { Component, computed, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FormField } from '../../models/field';
import { FormService } from '../../services/form.service';
import { FieldRenderer } from '../field-renderer/field-renderer';

function validatorsFor(f: FormField): ValidatorFn[] {
  const v: ValidatorFn[] = [];
  const boolean = f.type === 'checkbox' || f.type === 'toggle';
  if (f.required) v.push(boolean ? Validators.requiredTrue : Validators.required);
  if (f.type === 'email') v.push(Validators.email);
  if (f.minLength != null) v.push(Validators.minLength(f.minLength));
  if (f.maxLength != null) v.push(Validators.maxLength(f.maxLength));
  if (f.min != null) v.push(Validators.min(f.min));
  if (f.max != null) v.push(Validators.max(f.max));
  if (f.pattern) v.push(Validators.pattern(f.pattern));
  return v;
}

@Component({
  selector: 'app-form-preview',
  imports: [ReactiveFormsModule, JsonPipe, MatCardModule, MatButtonModule, MatIconModule, FieldRenderer],
  templateUrl: './form-preview.html',
  styleUrl: './form-preview.scss',
})
export class FormPreview {
  private readonly formService = inject(FormService);
  protected readonly title = this.formService.title;
  protected readonly rows = computed(() => this.formService.rows().filter((r) => r.fields.length));

  /** A live reactive form built from the current schema. */
  protected readonly form = computed(() => {
    const controls: Record<string, FormControl> = {};
    for (const f of this.formService.allFields()) {
      const initial = f.type === 'checkbox' || f.type === 'toggle' ? false : '';
      controls[f.name] = new FormControl(initial, validatorsFor(f));
    }
    return new FormGroup(controls);
  });

  protected readonly submitted = signal<unknown>(null);

  protected control(name: string) {
    return this.form().controls[name] as FormControl;
  }

  protected submit() {
    const form = this.form();
    if (form.invalid) {
      form.markAllAsTouched();
      this.submitted.set(null);
      return;
    }
    this.submitted.set(form.getRawValue());
  }

  protected reset() {
    this.form().reset();
    this.submitted.set(null);
  }
}
