import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Tree } from 'src/app/models/tree.model';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { ImportService } from 'src/app/services/import.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss']
})
export class TreeComponent implements OnInit {

  @Input('tree') tree: Tree;
  

  constructor(public properties: LocalStorageService, 
    private router: Router,
    public imports: ImportService,
    private api: AdminApiService) { 
  }

  ngOnInit() {

  }

  select() {
    if (this.tree.file.isDir) {
      this.imports.selectedTree = this.tree;
    }
  }

  toggle(event) {
    event.stopPropagation();
    event.preventDefault();
    if (!this.tree.expanded) {
      this.tree.expand(this.api);
    } else {
      this.tree.expanded = false;
    }
  }

  open() {
    // this.router.navigate(['/document', this.tree.item.pid]);
  }

}
