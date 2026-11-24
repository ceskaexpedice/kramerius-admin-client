import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { TranslateModule } from '@ngx-translate/core';
import { Collection } from 'src/app/models/collection.model';
import { AuthService } from 'src/app/services/auth.service';
import { ClientApiService } from 'src/app/services/client-api.service';
import { CollectionsService } from 'src/app/services/collections.service';
import { IsoConvertService } from 'src/app/services/isoconvert.service';

@Component({
  selector: 'app-add-remote-collection-to-cdk-dialog',
  templateUrl: './add-remote-collection-to-cdk-dialog.component.html',
  imports: [TranslateModule, FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressBarModule, MatRadioModule]
})
export class AddRemoteCollectionToCdkDialogComponent implements OnInit {
  collections: Collection[] = [];
  filteredCollections: Collection[] = [];
  selectedCollection: Collection;
  query = '';
  collectionsAlreadyContainingSource = new Set<string>();
  loading = true;
  inProgress = false;
  error = false;
  contentFinished = false;
  contentLoading = false;
  contentTotal = 0;
  contentCompleted = 0;
  contentAdded = 0;
  contentFailed: string[] = [];
  private contentItems: any[] = [];
  private allowedCollectionPids: Set<string> = new Set();

  constructor(
    public dialogRef: MatDialogRef<AddRemoteCollectionToCdkDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { pid: string; title: string; addContents?: boolean },
    private clientApi: ClientApiService,
    private collectionsService: CollectionsService,
    private auth: AuthService,
    private isoConvert: IsoConvertService
  ) {}

  ngOnInit(): void {
    this.clientApi.getCollections(1000, 0, false, '', 'title.sort', 'asc', 'cdk').subscribe({
      next: response => {
        const docs = (response as any)?.docs || [];
        this.collections = docs.map((doc: any) => this.collectionFromSolr(doc));
        const sourcePid = this.data.pid.startsWith('cdk/') ? this.data.pid : `cdk/${this.data.pid}`;
        this.collectionsService.getCollectionsContainingItem(this.displayLanguage(), sourcePid).subscribe({
          next: ([containingCollections]) => {
            this.collectionsAlreadyContainingSource = new Set(containingCollections.map(collection => this.normalizePid(collection.id)));
            this.loadAuthorizedCollections();
          },
          error: () => this.loadAuthorizedCollections()
        });
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  alreadyContainsSource(collection: Collection): boolean {
    return this.collectionsAlreadyContainingSource.has(this.normalizePid(collection.id));
  }

  search(): void {
    const query = this.normalizeSearchText(this.query);
    this.filteredCollections = query
      ? this.collections.filter(collection => {
          const names = this.normalizeSearchText(Object.values(collection.names || {}));
          const id = this.normalizeSearchText(collection.id);
          return names.includes(query) || id.includes(query);
        })
      : this.collections;
  }

  add(): void {
    if (!this.selectedCollection || this.inProgress) return;
    if (this.data.addContents) {
      this.addCollectionContents();
      return;
    }
    this.inProgress = true;
    const remotePid = this.data.pid.startsWith('cdk/') ? this.data.pid : `cdk/${this.data.pid}`;
    this.collectionsService.addItemToCollection(this.selectedCollection.id, remotePid).subscribe({
      next: () => this.dialogRef.close({ added: true, collection: this.selectedCollection }),
      error: error => {
        console.error(error);
        this.inProgress = false;
        this.error = true;
      }
    });
  }

  addCollectionContents(): void {
    this.inProgress = true;
    this.contentLoading = true;
    this.error = false;
    this.clientApi.getAllCollectionChildren(this.data.pid).subscribe({
      next: items => {
        this.contentLoading = false;
        this.contentItems = items;
        this.contentTotal = items.length;
        if (this.contentTotal === 0) {
          this.contentFinished = true;
          this.inProgress = false;
          return;
        }
        this.addContentItem(0);
      },
      error: error => {
        console.error(error);
        this.contentLoading = false;
        this.error = true;
        this.inProgress = false;
      }
    });
  }

  closeContentsResult(): void {
    this.dialogRef.close({
      addContents: true,
      added: this.contentAdded > 0,
      addedCount: this.contentAdded,
      failedCount: this.contentFailed.length,
      total: this.contentTotal,
      collection: this.selectedCollection
    });
  }

  private addContentItem(index: number): void {
    if (index >= this.contentItems.length) {
      this.contentFinished = true;
      this.inProgress = false;
      return;
    }

    const item = this.contentItems[index];
    const inputPid = item?.pid;
    const targetPid = this.targetPid(item);
    if (!targetPid) {
      this.contentFailed.push(String(inputPid || ''));
      this.finishContentItem(index);
      return;
    }
    this.auth.getAuthorizedActions(targetPid).subscribe({
      next: actions => {
        if (!(actions || []).some(action => action.code === 'a_able_tobe_part_of_collections')) {
          this.contentFailed.push(inputPid);
          this.finishContentItem(index);
          return;
        }
        this.collectionsService.addItemToCollection(this.selectedCollection.id, targetPid).subscribe({
          next: () => {
            this.contentAdded++;
            this.finishContentItem(index);
          },
          error: error => {
            console.error(error);
            this.contentFailed.push(inputPid);
            this.finishContentItem(index);
          }
        });
      },
      error: error => {
        console.error(error);
        this.contentFailed.push(inputPid);
        this.finishContentItem(index);
      }
    });
  }

  private finishContentItem(index: number): void {
    this.contentCompleted++;
    this.addContentItem(index + 1);
  }

  private targetPid(item: any): string {
    const pid = String(item?.pid || '');
    return pid.startsWith('cdk/') ? pid : `cdk/${pid}`;
  }

  displayLanguage(): string {
    const language = localStorage.getItem('lang') || 'cs';
    return this.isoConvert.isTranslatable(language) ? this.isoConvert.convert(language)[0] : language;
  }

  name(collection: Collection): string {
    const value = collection?.names?.[this.displayLanguage()];
    const name = Array.isArray(value)
      ? value.find(item => typeof item === 'string' && item.trim())
      : value;
    return typeof name === 'string' ? name : collection?.id || '';
  }

  private normalizeSearchText(value: unknown): string {
    const parts: string[] = [];
    const append = (item: unknown) => {
      if (Array.isArray(item)) {
        item.forEach(append);
      } else if (typeof item === 'string' || typeof item === 'number') {
        parts.push(String(item));
      }
    };
    append(value);
    return parts.join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
  }

  private normalizePid(pid: string): string {
    return String(pid || '').replace(/^cdk\//, '');
  }

  private loadAuthorizedCollections(): void {
    this.auth.getPidsAuthorizedActions(this.collections.map(collection => collection.id), ['a_collections_edit']).subscribe({
      next: (actions: any) => {
        this.allowedCollectionPids = new Set(Object.keys(actions || {}).filter(pid =>
          (actions[pid] || []).some((action: any) => action.code === 'a_collections_edit')
        ));
        this.collections = this.collections.filter(collection => this.allowedCollectionPids.has(collection.id));
        this.filteredCollections = this.collections;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  private collectionFromSolr(doc: any): Collection {
    const collection = new Collection();
    collection.id = doc.pid;
    collection.names = {};
    collection.descriptions = {};
    Object.keys(doc).forEach(key => {
      if (key.startsWith('title.search_')) collection.names[key.substring('title.search_'.length)] = doc[key];
      if (key.startsWith('collection.desc_')) collection.descriptions[key.substring('collection.desc_'.length)] = doc[key];
    });
    return collection;
  }
}
