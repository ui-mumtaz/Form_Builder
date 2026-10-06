import { Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormField } from '../../models/field';

/** Renders one Material control for a field definition. Used by both the editor canvas and the preview. */
@Component({
  selector: 'app-field-renderer',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatDatepickerModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './field-renderer.html',
  styleUrl: './field-renderer.scss',
})
export class FieldRenderer {
  readonly field = input.required<FormField>();
  /** Control to bind to. When omitted (editor canvas) a detached control is used. */
  readonly control = input<FormControl>();

  private readonly fallback = new FormControl();
  protected readonly ctrl = computed(() => this.control() ?? this.fallback);

  protected errorMessage(): string {
    const f = this.field();
    const errors = this.ctrl().errors;
    if (!errors) return '';
    if (errors['required']) return `${f.label || 'This field'} is required`;
    if (errors['email']) return 'Enter a valid email address';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} characters`;
    if (errors['min']) return `Minimum value is ${errors['min'].min}`;
    if (errors['max']) return `Maximum value is ${errors['max'].max}`;
    if (errors['pattern']) return 'Invalid format';
    return 'Invalid value';
  }
}
