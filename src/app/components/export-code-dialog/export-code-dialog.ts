import { Component, inject, signal } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { FormSchema } from '../../models/field';
import { CodeGeneratorService } from '../../services/code-generator.service';

interface CodeFile {
  label: string;
  fileName: string;
  code: string;
}

@Component({
  selector: 'app-export-code-dialog',
  imports: [MatDialogModule, MatTabsModule, MatButtonModule, MatIconModule],
  templateUrl: './export-code-dialog.html',
  styleUrl: './export-code-dialog.scss',
})
export class ExportCodeDialog {
  private readonly schema = inject<FormSchema>(MAT_DIALOG_DATA);
  private readonly generator = inject(CodeGeneratorService);
  private readonly clipboard = inject(Clipboard);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly files: CodeFile[] = [
    { label: 'HTML', fileName: 'generated-form.html', code: this.generator.generateHtml(this.schema) },
    { label: 'TypeScript', fileName: 'generated-form.ts', code: this.generator.generateTs(this.schema) },
    { label: 'SCSS', fileName: 'generated-form.scss', code: this.generator.generateScss() },
    { label: 'JSON schema', fileName: 'form-schema.json', code: this.generator.generateJson(this.schema) },
  ];
  protected readonly selected = signal(0);

  protected copy() {
    const file = this.files[this.selected()];
    this.clipboard.copy(file.code);
    this.snackBar.open(`${file.fileName} copied to clipboard`, undefined, { duration: 2000 });
  }

  protected download() {
    const file = this.files[this.selected()];
    const url = URL.createObjectURL(new Blob([file.code], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = file.fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
}
