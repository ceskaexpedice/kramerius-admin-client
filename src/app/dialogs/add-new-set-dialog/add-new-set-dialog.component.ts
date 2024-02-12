import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UIService } from 'src/app/services/ui.service';

@Component({
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

    let props = {};
    props[nameProp]=this.name;
    props[descProp]=this.description;
    props[filterProp]=this.replaceSpacesWithPlus(this.filter);



    this.dialogRef.close({ props });
  }

}
