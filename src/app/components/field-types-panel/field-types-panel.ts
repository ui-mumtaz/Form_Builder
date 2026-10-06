import { Component, computed, inject } from '@angular/core';
import { CdkDrag, CdkDragPlaceholder, CdkDragPreview, CdkDropList } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { FIELD_TYPES_LIST_ID, rowListId } from '../../models/drop-lists';
import { FieldType } from '../../models/field';
import { FieldTypesService } from '../../services/field-types.service';
import { FormService } from '../../services/form.service';

@Component({
  selector: 'app-field-types-panel',
  imports: [CdkDropList, CdkDrag, CdkDragPlaceholder, CdkDragPreview, MatIconModule],
  templateUrl: './field-types-panel.html',
  styleUrl: './field-types-panel.scss',
})
export class FieldTypesPanel {
  protected readonly fieldTypes = inject(FieldTypesService).fieldTypes;
  private readonly formService = inject(FormService);
  protected readonly listId = FIELD_TYPES_LIST_ID;
  protected readonly rowListIds = computed(() => this.formService.rows().map((r) => rowListId(r.id)));

  /** Nothing may be dropped back into the palette. */
  protected readonly noEnter = () => false;

  /** Click (instead of drag) appends the field to the last row. */
  protected add(type: FieldType) {
    const rows = this.formService.rows();
    this.formService.addField(type, rows[rows.length - 1].id);
  }
}
