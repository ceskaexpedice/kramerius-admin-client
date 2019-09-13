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

  //filterFrom = new FormControl(false);
  //from = new FormControl(null);
  //from = new FormControl(new Date());


  //today = new FormControl(new Date());

  constructor() { }

  ngOnInit() {
    this.form = new FormGroup({
      'filterDate': new FormControl(false),
      'from': new FormControl({ value: null, disabled: true }),
      'until': new FormControl({ value: null, disabled: true }),
      'filterState': new FormControl(false),
      'state': new FormControl('PLANNED'),
      'filterOwner': new FormControl(false),
      'owner': new FormControl('rehan'), //TODO: should not be hardcoded
    });

    this.lastFilter = this.createFilters(this.form.value);
    /*
    this.form.valueChanges.subscribe(value => {
      const filters: Filters = this.createFilters(value);
      //console.log(filters)
      //console.log(this.lastFilter)
      if (JSON.stringify(filters) === JSON.stringify(this.lastFilter)) {
        //nothing
        console.log('no change in filters');
      } else {
        this.lastFilter = filters;
        this.dataChanged.emit(filters);
        console.log(filters);
      }
    });
    */

    this.form.get('filterDate').valueChanges.subscribe(filter => {
      var from = this.form.controls['from'];
      var until = this.form.controls['until'];
      if (filter) {
        from.enable();
        until.enable();
      } else {
        from.disable();
        until.disable();
      }
    })

    /*
  this.form.valueChanges.subscribe(value => {
    console.log(value);
    const data = value.filterFrom ? null : new Date();

    this.form.patchValue(
      { from: data }
    )

    //


  });
*/
  }

  devLog() {
    console.log('formGroup:')
    console.log(this.form.value)
  }

  createFilters(formValue): Filters {
    console.log(formValue);
    const filters: Filters = {}
    //from
    if (formValue.filterFrom && !!formValue.from) {
      const from = this.parseDate(formValue.from);
      if (!!from) {
        filters.from = from;
      }
    }
    //until
    if (formValue.filterUntil && !!formValue.until) {
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
    if (dateModel.year) {
      // result.from = new Date(`${dateModel.year}-${dateModel.month}-${dateModel.day}`);
      return new Date(dateModel.year, dateModel.month - 1, dateModel.day);
    } else {
      const parsed = new Date(dateModel);
      if (!!parsed && parsed.toString() != 'Invalid Date') {
        return parsed;
      } else {
        return null;
      }
    }
  }



}
