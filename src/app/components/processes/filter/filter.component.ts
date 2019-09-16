import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Filters } from '../filters';
import { DateAdapter } from '@angular/material';


@Component({
  selector: 'app-process-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {

  @Output() dataChanged = new EventEmitter<Filters>();

  form: FormGroup;
  lastFilter = null;

  constructor() { }

  ngOnInit() {
    this.form = new FormGroup({
      'filterDate': new FormControl(false),
      'from': new FormControl({ value: null, disabled: true }),
      'until': new FormControl({ value: null, disabled: true }),
      'filterState': new FormControl(false),
      'state': new FormControl({ value: 'PLANNED', disabled: true }),
      'filterOwner': new FormControl(false),
      'owner': new FormControl({ value: 'rehan', disabled: true }), //TODO: should not be hardcoded
    });

    this.lastFilter = this.createFilters(this.form.value);

    this.form.get('filterDate').valueChanges.subscribe(filter => {
      var fromCtrl = this.form.controls['from'];
      var untilCtrl = this.form.controls['until'];
      if (filter) {
        fromCtrl.enable();
        untilCtrl.enable();
      } else {
        fromCtrl.disable();
        untilCtrl.disable();
      }
    })

    this.form.get('filterState').valueChanges.subscribe(filter => {
      var stateCtrl = this.form.controls['state'];
      if (filter) {
        stateCtrl.enable();
      } else {
        stateCtrl.disable();
      }
    })

    this.form.get('filterOwner').valueChanges.subscribe(filter => {
      var ownerCtrl = this.form.controls['owner'];
      if (filter) {
        ownerCtrl.enable();
      } else {
        ownerCtrl.disable();
      }
    })

    this.form.valueChanges.subscribe(value => {
      const filters: Filters = this.createFilters(value);
      //console.log(filters)
      //console.log(this.lastFilter)
      if (JSON.stringify(filters) === JSON.stringify(this.lastFilter)) {
        //nothing, no change
        //console.log('no change in filters');
      } else {
        //console.log('some change in filters');
        this.lastFilter = filters;
        this.dataChanged.emit(filters);
        //console.log(filters);
      }
    });
  }

  createFilters(formValue): Filters {
    const filters: Filters = {}
    //from
    if (formValue.filterDate && !!formValue.from) {
      const from = this.parseDate(formValue.from);
      if (!!from) {
        filters.from = from;
      }
    }
    //until
    if (formValue.filterDate && !!formValue.until) {
      const until = this.parseDate(formValue.until);
      if (!!until) {
        filters.until = until;
      }
    }
    //state
    if (formValue.filterState) {
      filters.state = formValue.state;
    }
    //owner
    if (formValue.filterOwner) {
      filters.owner = formValue.owner;
    }
    return filters;
  }

  parseDate(dateModel) {
    // if (dateModel.year) {
    //   // result.from = new Date(`${dateModel.year}-${dateModel.month}-${dateModel.day}`);
    //   return new Date(dateModel.year, dateModel.month - 1, dateModel.day);
    // } else {
    //   const parsed = new Date(dateModel);
    //   if (!!parsed && parsed.toString() != 'Invalid Date') {
    //     return parsed;
    //   } else {
    //     return null;
    //   }
    // }  
    return dateModel.toDate();
  }


  //TODO: cleanpu
  devLog() {
    console.log('formGroup:')
    console.log(this.form.value)
  }

}
