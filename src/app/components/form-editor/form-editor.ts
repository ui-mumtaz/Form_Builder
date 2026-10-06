import { Component, computed, inject } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FIELD_TYPES_LIST_ID, rowListId } from '../../models/drop-lists';
import { FieldType } from '../../models/field';
import { FormService } from '../../services/form.service';
import { FieldRenderer } from '../field-renderer/field-renderer';

@Component({
  selector: 'app-form-editor',
  imports: [CdkDropList, CdkDrag, CdkDragHandle, MatButtonModule, MatIconModule, MatTooltipModule, FieldRenderer],
  templateUrl: './form-editor.html',
  styleUrl: './form-editor.scss',
})
export class FormEditor {
  protected readonly formService = inject(FormService);
  protected readonly rows = this.formService.rows;
  protected readonly selectedId = computed(() => this.formService.selectedField()?.id);

  /** Every row's drop list id, so fields can move between rows. */
  protected readonly rowListIds = computed(() => this.rows().map((r) => rowListId(r.id)));
  protected readonly rowListId = rowListId;

  protected onFieldDrop(event: CdkDragDrop<string, string, FieldType | string>) {
    const toRowId = event.container.data;
    if (event.previousContainer.id === FIELD_TYPES_LIST_ID) {
      this.formService.addField(event.item.data as FieldType, toRowId, event.currentIndex);
      return;
    }
    this.formService.moveField(event.previousContainer.data, toRowId, event.previousIndex, event.currentIndex);
  }

  protected onRowDrop(event: CdkDragDrop<unknown>) {
    this.formService.moveRow(event.previousIndex, event.currentIndex);
  }

  protected select(fieldId: string, event: Event) {
    event.stopPropagation();
    this.formService.selectField(fieldId);
  }

  protected deleteField(fieldId: string, event: Event) {
    event.stopPropagation();
    this.formService.deleteField(fieldId);
  }
}
