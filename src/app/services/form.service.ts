import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { FieldType, FormField, FormRow, FormSchema } from '../models/field';
import { FieldTypesService } from './field-types.service';

const STORAGE_KEY = 'dynamic-form-builder';

const uid = () => Math.random().toString(36).slice(2, 10);

@Injectable({ providedIn: 'root' })
export class FormService {
  private fieldTypes = inject(FieldTypesService);

  private readonly _title = signal('Amumtaz Form Design');
  private readonly _rows = signal<FormRow[]>([{ id: uid(), fields: [] }]);
  private readonly _selectedFieldId = signal<string | null>(null);

  readonly title = this._title.asReadonly();
  readonly rows = this._rows.asReadonly();
  readonly allFields = computed(() => this._rows().flatMap((r) => r.fields));
  readonly selectedField = computed(
    () => this.allFields().find((f) => f.id === this._selectedFieldId()) ?? null,
  );
  readonly schema = computed<FormSchema>(() => ({ title: this._title(), rows: this._rows() }));

  constructor() {
    this.restore();
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.schema()));
      } catch {
        // storage unavailable; the builder still works in memory
      }
    });
  }

  setTitle(title: string) {
    this._title.set(title);
  }

  addRow() {
    this._rows.update((rows) => [...rows, { id: uid(), fields: [] }]);
  }

  deleteRow(rowId: string) {
    const row = this._rows().find((r) => r.id === rowId);
    if (row?.fields.some((f) => f.id === this._selectedFieldId())) {
      this._selectedFieldId.set(null);
    }
    this._rows.update((rows) => {
      const remaining = rows.filter((r) => r.id !== rowId);
      return remaining.length ? remaining : [{ id: uid(), fields: [] }];
    });
  }

  moveRow(fromIndex: number, toIndex: number) {
    this._rows.update((rows) => {
      const next = [...rows];
      const [row] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, row);
      return next;
    });
  }

  addField(type: FieldType, rowId: string, index?: number) {
    const def = this.fieldTypes.get(type);
    const field: FormField = {
      id: uid(),
      type,
      name: this.uniqueName(type),
      label: '',
      required: false,
      ...structuredClone(def.defaults),
    };
    this._rows.update((rows) =>
      rows.map((r) => {
        if (r.id !== rowId) return r;
        const fields = [...r.fields];
        fields.splice(index ?? fields.length, 0, field);
        return { ...r, fields };
      }),
    );
    this._selectedFieldId.set(field.id);
  }

  moveField(fromRowId: string, toRowId: string, fromIndex: number, toIndex: number) {
    this._rows.update((rows) => {
      const next = rows.map((r) => ({ ...r, fields: [...r.fields] }));
      const from = next.find((r) => r.id === fromRowId)!;
      const to = next.find((r) => r.id === toRowId)!;
      const [field] = from.fields.splice(fromIndex, 1);
      to.fields.splice(toIndex, 0, field);
      return next;
    });
  }

  updateField(fieldId: string, changes: Partial<FormField>) {
    this._rows.update((rows) =>
      rows.map((r) => ({
        ...r,
        fields: r.fields.map((f) => (f.id === fieldId ? { ...f, ...changes } : f)),
      })),
    );
  }

  deleteField(fieldId: string) {
    if (this._selectedFieldId() === fieldId) this._selectedFieldId.set(null);
    this._rows.update((rows) =>
      rows.map((r) => ({ ...r, fields: r.fields.filter((f) => f.id !== fieldId) })),
    );
  }

  selectField(fieldId: string | null) {
    this._selectedFieldId.set(fieldId);
  }

  clear() {
    this._selectedFieldId.set(null);
    this._rows.set([{ id: uid(), fields: [] }]);
  }

  load(schema: FormSchema) {
    if (!schema || !Array.isArray(schema.rows)) {
      throw new Error('Invalid form schema: "rows" is missing');
    }
    this._selectedFieldId.set(null);
    this._title.set(schema.title ?? 'Amumtaz Form Design');
    this._rows.set(
      schema.rows.length
        ? schema.rows.map((r) => ({ id: r.id ?? uid(), fields: (r.fields ?? []).map((f) => ({ ...f, id: f.id ?? uid() })) }))
        : [{ id: uid(), fields: [] }],
    );
  }

  private restore() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) this.load(JSON.parse(saved));
    } catch {
      // ignore corrupt or unavailable storage
    }
  }

  private uniqueName(type: FieldType): string {
    const names = new Set(this.allFields().map((f) => f.name));
    let i = 1;
    while (names.has(`${type}${i}`)) i++;
    return `${type}${i}`;
  }
}
