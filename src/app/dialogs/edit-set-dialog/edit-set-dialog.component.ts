import { Component, OnInit } from '@angular/core';
import { UIService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-edit-set-dialog',
  templateUrl: './edit-set-dialog.component.html',
  styleUrls: ['./edit-set-dialog.component.scss']
})
export class EditSetDialogComponent implements OnInit {

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
