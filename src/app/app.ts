import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExportCodeDialog } from './components/export-code-dialog/export-code-dialog';
import { FieldSettings } from './components/field-settings/field-settings';
import { FieldTypesPanel } from './components/field-types-panel/field-types-panel';
import { FormEditor } from './components/form-editor/form-editor';
import { FormPreview } from './components/form-preview/form-preview';
import { FormService } from './services/form.service';

@Component({
  selector: 'app-root',
  imports: [
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatTooltipModule,
    FieldTypesPanel,
    FormEditor,
    FieldSettings,
    FormPreview,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly formService = inject(FormService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly mode = signal<'edit' | 'preview'>('edit');

  protected exportCode() {
    this.dialog.open(ExportCodeDialog, {
      data: this.formService.schema(),
      width: '900px',
      maxWidth: '95vw',
    });
  }

  protected async importJson(input: HTMLInputElement) {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    try {
      this.formService.load(JSON.parse(await file.text()));
      this.snackBar.open(`Imported ${file.name}`, undefined, { duration: 2000 });
    } catch (e) {
      this.snackBar.open(`Could not import ${file.name}: ${(e as Error).message}`, 'Dismiss');
    }
  }

  protected clear() {
    if (confirm('Remove all rows and fields?')) this.formService.clear();
  }
}
