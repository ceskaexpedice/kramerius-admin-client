import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { License } from 'src/app/models/license.model';

@Component({
  selector: 'app-run-import',
  templateUrl: './run-import.component.html',
  styleUrls: ['./run-import.component.scss']
})
export class RunImportComponent implements OnInit {

  selectedLicense:License;
  licenses:License[];

  scheduleIndexation: boolean = true;
  ndkIIPServer:boolean = true;
  type="foxml";

  constructor(    
    public dialogRef: MatDialogRef<RunImportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.licenses = data.licenses;
    this.type= data.type;
   }

  ngOnInit(): void {
  }

  scheduleProcess() {
    const data = {
      selectedLicense:  this.selectedLicense,
      scheduleIndexation: this.scheduleIndexation,
      ndkIIPServer: this.ndkIIPServer
    };
    this.dialogRef.close(data);
  }

  

  // onClose(data) {
  //   this.dialogRef.close(data);
  // }

}
