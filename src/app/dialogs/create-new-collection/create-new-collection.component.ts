import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Collection } from 'src/app/models/collection.model';
import { CollectionsService } from 'src/app/services/collections.service';

@Component({
  selector: 'app-create-new-collection',
  templateUrl: './create-new-collection.component.html',
  styleUrls: ['./create-new-collection.component.scss']
})
export class CreateNewCollectionComponent implements OnInit {

  collection: Collection;
  data: any;
  collectionPid: string;

  constructor(
    private router: Router,
    private collectionsService: CollectionsService,
    @Inject(MAT_DIALOG_DATA) public d: any
  ) { this.data = d }

  ngOnInit(): void {
    this.collectionPid = this.data.pid;
  }
}
