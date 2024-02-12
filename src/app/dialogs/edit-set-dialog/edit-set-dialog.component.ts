import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UIService } from 'src/app/services/ui.service';

@Component({
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

    let props = {};
    props[nameProp]=this.name;
    props[descProp]=this.description;

    props[filterProp]=this.replaceSpacesWithPlus(this.filter);

    this.dialogRef.close({ props });

  }

}
