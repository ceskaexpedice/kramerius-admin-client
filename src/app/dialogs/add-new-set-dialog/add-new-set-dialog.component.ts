import { Component, OnInit } from '@angular/core';
import { UIService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-add-new-set-dialog',
  templateUrl: './add-new-set-dialog.component.html',
  styleUrls: ['./add-new-set-dialog.component.scss']
})
export class AddNewSetDialogComponent implements OnInit {

  name: string = '';
  description: string = '';
  filter: string = '';


  constructor(private ui: UIService) { }

  ngOnInit(): void {
  }

  onSave() {
    // to do

    // ready for success
    this.ui.showInfoSnackBar('snackbar.success.savingAnRecord');
    // ready for error
    //this.ui.showErrorSnackBar('snackbar.error.savingAnRecord')
  }

}
