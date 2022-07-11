import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-nkp-logy',
  templateUrl: './nkp-logy.component.html',
  styleUrls: ['./nkp-logy.component.scss']
})
export class NkpLogyComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<NkpLogyComponent>
  ) { }

  ngOnInit(): void {
  }

  generate() {
    //this.dialogRef.close({options: selected.length > 0 ? selected.join(",")  : ""});
  }


}
