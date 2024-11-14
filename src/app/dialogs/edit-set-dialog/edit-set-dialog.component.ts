import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from 'ngx-flexible-layout';
import { UIService } from 'src/app/services/ui.service';

@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, FlexLayoutModule, FormsModule, MatDialogModule,
    MatButtonModule, MatIconModule, MatTooltipModule, 
    MatFormFieldModule, MatInputModule],
  selector: 'app-edit-set-dialog',
  templateUrl: './edit-set-dialog.component.html',
  styleUrls: ['./edit-set-dialog.component.scss']
})
export class EditSetDialogComponent implements OnInit {

  id: string=''
  name: string = '';
  description: string = '';
  filter: string = '';


  constructor(
    public dialogRef: MatDialogRef<EditSetDialogComponent>,
    @Inject( MAT_DIALOG_DATA) public data: any,
    private ui: UIService) {
      this.id = data.id;
      this.name = data.name;
      this.description = data.description;
      this.filter = data.filter;

  }

  ngOnInit(): void {
  }

  replaceSpacesWithPlus(inputString: string): string {
    return inputString.replace(/\s+/g, '+');
  }

  onSave() {

    let nameProp =  `oai.set.${this.id}.name`;
    let descProp =  `oai.set.${this.id}.description`;
    let filterProp =  `oai.set.${this.id}.filter`;

    let props: any = {};
    props[nameProp]=this.name;
    props[descProp]=this.description;

    props[filterProp]=this.replaceSpacesWithPlus(this.filter);

    this.dialogRef.close({ props });

  }

}
