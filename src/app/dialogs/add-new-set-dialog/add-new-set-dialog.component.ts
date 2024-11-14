import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

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
  selector: 'app-add-new-set-dialog',
  templateUrl: './add-new-set-dialog.component.html',
  styleUrls: ['./add-new-set-dialog.component.scss']
})
export class AddNewSetDialogComponent implements OnInit {

  id: string=''
  name: string = '';
  description: string = '';
  filter: string = '';


  constructor(public dialogRef: MatDialogRef<AddNewSetDialogComponent>,private ui: UIService) { }

  ngOnInit(): void {
  }

  replaceSpacesWithPlus(inputString: string): string {
    return inputString.replace(/\s+/g, '+');
  }

  /*
  oai.set.monograph2.name=Test setu
oai.set.monograph2.desc=Test setu
oai.set.monograph2.filter=model:monograph
*/
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
