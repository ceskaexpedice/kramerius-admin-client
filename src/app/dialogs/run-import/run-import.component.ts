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
  scheduleIndexations: boolean;


  constructor(    
    public dialogRef: MatDialogRef<RunImportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.licenses = data.licenses;
   }

  ngOnInit(): void {
  }

}
