import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FieldOption, FieldSetting, FormField } from '../../models/field';
import { FieldTypesService } from '../../services/field-types.service';
import { FormService } from '../../services/form.service';

@Component({
  selector: 'app-field-settings',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './field-settings.html',
  styleUrl: './field-settings.scss',
})
export class FieldSettings {
  private readonly formService = inject(FormService);
  private readonly fieldTypes = inject(FieldTypesService);

  protected readonly field = this.formService.selectedField;
  protected readonly definition = computed(() => {
    const f = this.field();
    return f ? this.fieldTypes.get(f.type) : null;
  });

  protected readonly nameError = computed(() => {
    const f = this.field();
    if (!f) return '';
    if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(f.name)) return 'Use letters, numbers and _ only, not starting with a number';
    if (this.formService.allFields().some((o) => o.id !== f.id && o.name === f.name)) return 'Name must be unique';
    return '';
  });

  protected has(setting: FieldSetting) {
    return this.definition()?.settings.includes(setting) ?? false;
  }

  protected update<K extends keyof FormField>(key: K, value: FormField[K]) {
    const f = this.field();
    if (f) this.formService.updateField(f.id, { [key]: value } as Partial<FormField>);
  }

  /** Empty numeric inputs clear the constraint instead of storing 0. */
  protected updateNumber(key: 'minLength' | 'maxLength' | 'min' | 'max' | 'rows', value: number | string | null) {
    this.update(key, value === '' || value === null ? null : Number(value));
  }

  protected updateOption(index: number, changes: Partial<FieldOption>) {
    const options = (this.field()?.options ?? []).map((o, i) => (i === index ? { ...o, ...changes } : o));
    this.update('options', options);
  }

  protected addOption() {
    const options = this.field()?.options ?? [];
    const n = options.length + 1;
    this.update('options', [...options, { label: `Option ${n}`, value: `option${n}` }]);
  }

  protected removeOption(index: number) {
    this.update('options', (this.field()?.options ?? []).filter((_, i) => i !== index));
  }

  protected delete() {
    const f = this.field();
    if (f) this.formService.deleteField(f.id);
  }
}
