import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic/';
import '@ckeditor/ckeditor5-build-classic/build/translations/cs';
import coreTranslations from 'ckeditor5/translations/cs.js';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { ClientResource, AdminApiService, UIConfigEndpoint, UIConfigMetadata } from 'src/app/services/admin-api.service';
import { AppSettings } from 'src/app/services/app-settings';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { UIService } from 'src/app/services/ui.service';

interface ClientSettingsEditor {
  key: string;
  endpoint: ClientSettingsEndpoint;
  title: string;
  schema: JsonSchema;
  resourceReferencePatterns: string[];
  value: string;
  highlightedValue: string;
  originalValue: string;
  resourceReferences: ClientSettingsResourceReference[];
  resourceReferencesSortColumn: ResourceReferencesSortColumn;
  resourceReferencesSortDirection: SortDirection;
  validationMessages: string[];
  loading: boolean;
  saving: boolean;
  error: string;
}

interface ClientSettingsResourceReference {
  path: string;
  exists: boolean;
  type: ClientResourceType;
  resource?: ClientResource;
}

interface JsonSchema {
  type?: 'object' | 'array' | 'string' | 'number' | 'integer' | 'boolean' | 'null';
  required?: string[];
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
}

type ClientResourceType = 'html' | 'image' | 'other';
type ClientSettingsEndpoint = UIConfigEndpoint;
type ClientResourcesSortColumn = 'name' | 'type' | 'path';
type ResourceReferencesSortColumn = 'path' | 'type' | 'status';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-client-settings',
  imports: [
    RouterModule, TranslateModule, FormsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatTabsModule, MatFormFieldModule, MatInputModule, MatTooltipModule,
    MatExpansionModule, MatSelectModule, CKEditorModule
  ],
  templateUrl: './client-settings.component.html',
  styleUrls: ['./client-settings.component.scss']
})
export class ClientSettingsComponent implements OnInit {
  view: string;

  HtmlEditor = ClassicEditor as any;
  htmlEditorConfig: any;
  htmlEditorInstance: any = null;

  clientSettingsEditors: ClientSettingsEditor[] = [];
  clientSettingsMetadataLoading = false;

  clientResources: ClientResource[] = [];
  clientResourceKeys: Set<string> = new Set();
  clientResourcesLoaded = false;
  selectedClientResource: ClientResource = null;
  selectedClientResourceType: ClientResourceType = 'other';
  selectedClientResourceContent = '';
  selectedClientResourceOriginalContent = '';
  pendingSelectedClientResourcePath = '';
  clientResourcesLoading = false;
  clientResourceLoading = false;
  clientResourceSaving = false;
  clientResourceUploading = false;
  clientResourceCreating = false;
  clientResourceDeleting = false;
  clientResourcePreviewTimestamp = 0;
  clientResourcesSortColumn: ClientResourcesSortColumn = 'name';
  clientResourcesSortDirection: SortDirection = 'asc';
  newClientResourcePath = '';
  newClientResourceType: Exclude<ClientResourceType, 'other'> = 'html';
  newClientResourceFile: File = null;
  selectedHtmlImageResourcePath = '';

  constructor(
    private dialog: MatDialog,
    private ui: UIService,
    private adminApi: AdminApiService,
    private local: LocalStorageService,
    private router: Router,
    public settings: AppSettings
  ) {
    this.htmlEditorConfig = {
      translations: [
        coreTranslations
      ],
      licenseKey: 'GPL',
      language: 'cs',
      toolbar: [
        'undo', 'redo', '|',
        'heading', '|',
        'bold', 'italic', '|',
        'link', '|',
        'bulletedList', 'numberedList', '|',
        'blockQuote'
      ],
      image: {
        toolbar: ['imageTextAlternative', 'toggleImageCaption', 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side']
      }
    };
  }

  ngOnInit() {
    this.view = this.getViewFromUrl();
    const resourceName = this.getResourceNameFromUrl();
    if (resourceName) {
      this.pendingSelectedClientResourcePath = resourceName;
    }
    this.loadClientSettings();
    this.ensureClientResourcesLoaded();
  }

  changeView(view: string) {
    this.view = view;
    this.local.setStringProperty('client-settings.view', view);
    this.router.navigate(['/client-settings', view]);

    this.ensureClientResourcesLoaded();
  }

  loadClientSettings() {
    this.clientSettingsMetadataLoading = true;
    this.adminApi.getUIConfigMetadata().subscribe(configs => {
      this.clientSettingsEditors = configs.map(config => this.toClientSettingsEditor(config));
      this.clientSettingsMetadataLoading = false;
      this.clientSettingsEditors.forEach(editor => this.loadClientSetting(editor));
    }, error => {
      this.clientSettingsEditors = [];
      this.clientSettingsMetadataLoading = false;
      this.ui.showErrorSnackBar('snackbar.error.loadingAnItem');
    });
  }

  loadClientSetting(editor: ClientSettingsEditor) {
    editor.loading = true;
    editor.error = '';
    this.adminApi.getUIConfig(editor.endpoint).subscribe(result => {
      const value = this.uiConfigValueToString(result);
      editor.value = this.formatJson(value);
      editor.originalValue = editor.value;
      this.updateClientSettingValidation(editor);
      editor.loading = false;
    }, error => {
      editor.loading = false;
      editor.error = 'snackbar.error.loadingAnItem';
      this.ui.showErrorSnackBar('snackbar.error.loadingAnItem');
    });
  }

  saveClientSetting(editor: ClientSettingsEditor) {
    editor.saving = true;
    const formattedValue = this.formatJson(editor.value);
    this.adminApi.saveUIConfig(editor.endpoint, this.uiConfigValueFromString(formattedValue)).subscribe(result => {
      editor.value = formattedValue;
      editor.originalValue = formattedValue;
      this.updateClientSettingValidation(editor);
      editor.saving = false;
      this.ui.showInfoSnackBar('snackbar.success.savingAnItem');
    }, error => {
      editor.saving = false;
      this.ui.showErrorSnackBar('snackbar.error.savingAnItem');
    });
  }

  private uiConfigValueToString(value: unknown) {
    if (typeof value === 'string') {
      return value;
    }

    if (value === undefined || value === null) {
      return '';
    }

    return JSON.stringify(value, null, 2);
  }

  private uiConfigValueFromString(value: string) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return value;
    }
  }

  onClientSettingChange(editor: ClientSettingsEditor) {
    this.updateClientSettingValidation(editor);
  }

  isClientSettingChanged(editor: ClientSettingsEditor) {
    return editor.value !== editor.originalValue;
  }

  isClientSettingValid(editor: ClientSettingsEditor) {
    return !editor.error;
  }

  isClientSettingBusy(editor: ClientSettingsEditor) {
    return editor.loading || editor.saving;
  }

  onJsonEditorScroll(event: Event, highlight: HTMLElement) {
    const textarea = event.target as HTMLTextAreaElement;
    highlight.scrollTop = textarea.scrollTop;
    highlight.scrollLeft = textarea.scrollLeft;
  }

  onJsonEditorKeydown(event: KeyboardEvent, editor: ClientSettingsEditor) {
    if (event.key !== 'Tab') {
      return;
    }

    event.preventDefault();
    const textarea = event.target as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const indentation = '  ';

    editor.value = `${editor.value.substring(0, start)}${indentation}${editor.value.substring(end)}`;
    this.onClientSettingChange(editor);

    requestAnimationFrame(() => {
      textarea.selectionStart = start + indentation.length;
      textarea.selectionEnd = start + indentation.length;
    });
  }

  loadClientResources() {
    this.clientResourcesLoading = true;
    this.adminApi.getClientResources().subscribe(resources => {
      this.clientResources = resources.map(resource => ({
        ...resource,
        name: resource.name || this.getClientResourceName(resource.path),
        type: this.getClientResourceType(resource)
      }));
      this.sortClientResources();
      this.clientResourceKeys = new Set(this.clientResources.map(resource => this.normalizeResourceKey(resource.path)));
      this.clientResourcesLoaded = true;
      this.clientResourcesLoading = false;
      this.updateClientSettingsResourceErrors();

      if (this.pendingSelectedClientResourcePath) {
        this.selectClientResourceByPath(this.pendingSelectedClientResourcePath);
      } else if (!this.selectedClientResource && this.clientResources.length > 0) {
        this.selectClientResource(this.clientResources[0]);
      } else if (this.selectedClientResource) {
        const selected = this.getClientResourceByPath(this.selectedClientResource.path);
        if (selected) {
          this.selectedClientResource = selected;
        } else {
          this.selectedClientResource = null;
          this.selectedClientResourceContent = '';
          this.selectedClientResourceOriginalContent = '';
        }
      }
    }, error => {
      this.clientResourcesLoading = false;
      this.clientResources = [];
      this.clientResourceKeys = new Set();
      this.clientResourcesLoaded = false;
      this.ui.showErrorSnackBar('snackbar.error.loadingAnItem');
    });
  }

  private ensureClientResourcesLoaded() {
    if (this.clientResourcesLoaded || this.clientResourcesLoading) {
      return;
    }

    this.loadClientResources();
  }

  private getViewFromUrl() {
    return this.router.url.startsWith('/client-settings/resources') ? 'resources' : 'settings';
  }

  private getResourceNameFromUrl() {
    const url = this.router.url.split(/[?#]/)[0];
    const prefix = '/client-settings/resources/';
    if (!url.startsWith(prefix)) {
      return '';
    }

    return decodeURIComponent(url.substring(prefix.length));
  }

  private navigateToClientResource(path: string) {
    const resourceName = this.getClientResourceName(path);
    if (!resourceName) {
      this.router.navigate(['/client-settings', 'resources']);
      return;
    }

    const url = `/client-settings/resources/${encodeURIComponent(resourceName)}`;
    if (this.router.url.split(/[?#]/)[0] !== url) {
      this.router.navigateByUrl(url);
    }
  }

  selectClientResource(resource: ClientResource, updateUrl = true) {
    this.pendingSelectedClientResourcePath = '';
    this.selectedClientResource = resource;
    this.selectedClientResourceType = this.getClientResourceType(resource);
    this.selectedClientResourceContent = '';
    this.selectedClientResourceOriginalContent = '';
    this.selectedHtmlImageResourcePath = '';

    if (updateUrl && this.view === 'resources') {
      this.navigateToClientResource(resource.path);
    }

    if (this.selectedClientResourceType === 'html') {
      this.clientResourceLoading = true;
      this.adminApi.getClientResourceText(resource.path).subscribe(content => {
        this.selectedClientResourceContent = content || '';
        this.selectedClientResourceOriginalContent = this.selectedClientResourceContent;
        this.clientResourceLoading = false;
      }, error => {
        this.clientResourceLoading = false;
        this.ui.showErrorSnackBar('snackbar.error.loadingAnItem');
      });
    }
  }

  onHtmlEditorReady(editor: any) {
    this.htmlEditorInstance = editor;
  }

  getClientImageResources() {
    return this.clientResources.filter(resource => this.getClientResourceType(resource) === 'image');
  }

  canInsertSelectedHtmlImage() {
    return !!this.selectedHtmlImageResourcePath && !!this.selectedClientResource && this.selectedClientResourceType === 'html';
  }

  insertSelectedHtmlImageResource() {
    if (!this.canInsertSelectedHtmlImage()) {
      return;
    }

    const resource = this.getClientResourceByPath(this.selectedHtmlImageResourcePath);
    const path = resource?.path || this.selectedHtmlImageResourcePath;
    const imageUrl = this.adminApi.getClientResourceUrl(path);
    const imageName = this.escapeHtml(resource?.name || this.getClientResourceName(path));

    if (this.htmlEditorInstance) {
      try {
        this.htmlEditorInstance.model.change((writer: any) => {
          const imageElement = writer.createElement('imageBlock', {
            src: imageUrl,
            alt: imageName
          });
          this.htmlEditorInstance.model.insertObject(imageElement, null, null, { setSelection: 'on' });
        });
        this.selectedClientResourceContent = this.htmlEditorInstance.getData();
        return;
      } catch (error) {
        // Fall back to appending HTML when the active editor build does not expose imageBlock insertion.
      }
    }

    this.selectedClientResourceContent = `${this.selectedClientResourceContent || ''}<p><img src="${this.escapeAttribute(imageUrl)}" alt="${this.escapeAttribute(imageName)}"></p>`;
  }

  selectClientResourceByPath(path: string) {
    const normalizedPath = this.normalizeResourceKey(path);
    const resource = this.getClientResourceByPath(normalizedPath) || this.getClientResourceByName(normalizedPath);
    if (resource) {
      this.selectClientResource(resource);
      return true;
    }

    this.pendingSelectedClientResourcePath = normalizedPath;
    return false;
  }

  saveSelectedClientResource() {
    if (!this.selectedClientResource || this.selectedClientResourceType !== 'html') {
      return;
    }

    this.clientResourceSaving = true;
    this.adminApi.setClientResourceText(this.selectedClientResource.path, this.selectedClientResourceContent).subscribe(result => {
      this.selectedClientResourceOriginalContent = this.selectedClientResourceContent;
      this.clientResourceSaving = false;
      this.ui.showInfoSnackBar('snackbar.success.savingAnItem');
      this.loadClientResources();
      this.updateClientSettingsResourceErrors();
    }, error => {
      this.clientResourceSaving = false;
      this.ui.showErrorSnackBar('snackbar.error.savingAnItem');
    });
  }

  onClientResourceFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.selectedClientResource) {
      return;
    }

    this.clientResourceUploading = true;
    this.adminApi.uploadClientResource(this.selectedClientResource.path, file).subscribe(result => {
      this.clientResourceUploading = false;
      this.clientResourcePreviewTimestamp = Date.now();
      this.ui.showInfoSnackBar('snackbar.success.savingAnItem');
      this.loadClientResources();
      this.updateClientSettingsResourceErrors();
      input.value = '';
    }, error => {
      this.clientResourceUploading = false;
      this.ui.showErrorSnackBar('snackbar.error.savingAnItem');
      input.value = '';
    });
  }

  onNewClientResourceFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.newClientResourceFile = input.files?.[0] || null;

    if (this.newClientResourceType === 'image' && this.newClientResourceFile && !this.newClientResourcePath.trim()) {
      this.newClientResourcePath = this.newClientResourceFile.name;
    }
  }

  createClientResource() {
    const path = this.getNormalizedNewClientResourcePath();
    if (!path || this.clientResourceCreating || this.clientResourceExists(path)) {
      return;
    }

    const type = this.newClientResourceType;
    this.clientResourceCreating = true;
    const request = type === 'html'
      ? this.adminApi.setClientResourceText(path, '')
      : this.adminApi.uploadClientResource(path, this.newClientResourceFile);

    request.subscribe(result => {
      this.clientResourceCreating = false;
      this.ui.showInfoSnackBar('snackbar.success.savingAnItem');
      this.resetNewClientResourceForm();
      this.clientResourcePreviewTimestamp = Date.now();
      this.loadClientResources();
      this.updateClientSettingsResourceErrors();
      this.selectClientResource({
        path,
        name: this.getClientResourceName(path),
        type
      });
    }, error => {
      this.clientResourceCreating = false;
      this.ui.showErrorSnackBar('snackbar.error.savingAnItem');
    });
  }

  loadClientResourceByKey() {
    const path = this.getNormalizedNewClientResourcePath();
    if (!path || this.clientResourceLoading) {
      return;
    }

    const resource: ClientResource = {
      path,
      name: this.getClientResourceName(path),
      type: this.newClientResourceType
    };

    if (!this.clientResourceExists(path)) {
      this.clientResources = [...this.clientResources, resource];
    }

    this.selectClientResource(resource);
  }

  deleteClientResource(resource = this.selectedClientResource) {
    if (!resource || this.clientResourceDeleting) {
      return;
    }

    const dialogRef = this.dialog.open(SimpleDialogComponent, {
      data: {
        title: 'Smazat zdroj',
        message: `Opravdu chcete smazat zdroj <strong>${this.escapeHtml(resource.name || resource.path)}</strong>?`,
        btn1: {
          color: 'warn',
          label: 'Smazat',
          value: 'delete'
        },
        btn2: {
          color: 'primary',
          label: 'Zrusit',
          value: 'cancel'
        }
      },
      width: '420px',
      panelClass: 'app-simple-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== 'delete') {
        return;
      }

      this.clientResourceDeleting = true;
      this.adminApi.deleteClientResource(resource.path).subscribe(() => {
        this.clientResourceDeleting = false;
        if (this.selectedClientResource?.path === resource.path) {
          this.selectedClientResource = null;
          this.selectedClientResourceContent = '';
          this.selectedClientResourceOriginalContent = '';
        }
        this.ui.showInfoSnackBar('snackbar.success.deletingItem');
        this.loadClientResources();
        this.updateClientSettingsResourceErrors();
      }, error => {
        this.clientResourceDeleting = false;
        this.ui.showErrorSnackBar('snackbar.error.deletingItem');
      });
    });
  }

  isClientResourceBusy() {
    return this.clientResourceLoading || this.clientResourceSaving || this.clientResourceUploading || this.clientResourceCreating || this.clientResourceDeleting;
  }

  isSelectedClientResourceChanged() {
    return this.selectedClientResourceContent !== this.selectedClientResourceOriginalContent;
  }

  getSelectedClientResourcePreviewUrl() {
    if (!this.selectedClientResource) {
      return 'assets/img/no-image.png';
    }

    return this.adminApi.getClientResourceUrl(this.selectedClientResource.path, this.clientResourcePreviewTimestamp);
  }

  getSelectedClientResourceClientUrl() {
    if (!this.selectedClientResource) {
      return '';
    }

    return this.adminApi.getClientResourceUrl(this.selectedClientResource.path, this.clientResourcePreviewTimestamp);
  }

  getClientResourceType(resource: ClientResource): ClientResourceType {
    if (resource.type === 'html' || resource.type === 'image') {
      return resource.type;
    }

    const mimeType = resource.mimeType || '';
    const path = (resource.path || resource.name || '').toLowerCase();

    if (mimeType.includes('html') || path.endsWith('.html') || path.endsWith('.htm')) {
      return 'html';
    }

    if (mimeType.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(path)) {
      return 'image';
    }

    return 'other';
  }

  sortClientResourcesBy(column: ClientResourcesSortColumn) {
    if (this.clientResourcesSortColumn === column) {
      this.clientResourcesSortDirection = this.clientResourcesSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.clientResourcesSortColumn = column;
      this.clientResourcesSortDirection = 'asc';
    }

    this.sortClientResources();
  }

  getClientResourcesSortIcon(column: ClientResourcesSortColumn) {
    if (this.clientResourcesSortColumn !== column) {
      return 'unfold_more';
    }

    return this.clientResourcesSortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  isClientResourcesSortedBy(column: ClientResourcesSortColumn) {
    return this.clientResourcesSortColumn === column;
  }

  sortResourceReferencesBy(editor: ClientSettingsEditor, column: ResourceReferencesSortColumn) {
    if (editor.resourceReferencesSortColumn === column) {
      editor.resourceReferencesSortDirection = editor.resourceReferencesSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      editor.resourceReferencesSortColumn = column;
      editor.resourceReferencesSortDirection = 'asc';
    }

    editor.resourceReferences = this.getSortedResourceReferences(editor, editor.resourceReferences);
  }

  getResourceReferencesSortIcon(editor: ClientSettingsEditor, column: ResourceReferencesSortColumn) {
    if (editor.resourceReferencesSortColumn !== column) {
      return 'unfold_more';
    }

    return editor.resourceReferencesSortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  isResourceReferencesSortedBy(editor: ClientSettingsEditor, column: ResourceReferencesSortColumn) {
    return editor.resourceReferencesSortColumn === column;
  }

  openClientResourceReference(reference: ClientSettingsResourceReference) {
    if (reference.exists) {
      this.pendingSelectedClientResourcePath = this.normalizeResourceKey(reference.path);
      this.view = 'resources';
      this.local.setStringProperty('client-settings.view', 'resources');
      this.navigateToClientResource(reference.path);
      this.selectClientResourceByPath(reference.path);
      return;
    }

    this.prepareNewClientResourceFromReference(reference);
    this.changeView('resources');
  }

  getClientResourceReferenceClientUrl(reference: ClientSettingsResourceReference) {
    return this.adminApi.getClientResourceUrl(reference.path);
  }

  createClientResourceFromReference(reference: ClientSettingsResourceReference) {
    if (reference.exists) {
      this.openClientResourceReference(reference);
      return;
    }

    if (this.clientResourceCreating) {
      return;
    }

    const path = this.normalizeResourceKey(reference.path);
    if (reference.type === 'html' || reference.type === 'image') {
      this.createEmptyClientResource(path, reference.type);
    } else {
      this.prepareNewClientResourceFromReference(reference);
      this.openMissingClientResource(path, reference.type);
    }
  }

  private createEmptyClientResource(path: string, type: Exclude<ClientResourceType, 'other'>) {
    this.clientResourceCreating = true;
    const request = type === 'html'
      ? this.adminApi.setClientResourceText(path, '')
      : this.adminApi.uploadClientResource(path, this.createEmptyImageFile(path));

    request.subscribe(result => {
      this.clientResourceCreating = false;
      this.clientResourcePreviewTimestamp = Date.now();
      this.ui.showInfoSnackBar('snackbar.success.savingAnItem');
      this.pendingSelectedClientResourcePath = path;
      this.view = 'resources';
      this.local.setStringProperty('client-settings.view', 'resources');
      this.navigateToClientResource(path);
      this.loadClientResources();
    }, error => {
      this.clientResourceCreating = false;
      this.ui.showErrorSnackBar('snackbar.error.savingAnItem');
    });
  }

  private createEmptyImageFile(path: string) {
    return new File([], this.getClientResourceName(path), { type: this.getImageContentType(path) });
  }

  private getImageContentType(path: string) {
    const normalizedPath = path.toLowerCase();
    if (normalizedPath.endsWith('.svg')) {
      return 'image/svg+xml';
    }
    if (normalizedPath.endsWith('.jpg') || normalizedPath.endsWith('.jpeg')) {
      return 'image/jpeg';
    }
    if (normalizedPath.endsWith('.gif')) {
      return 'image/gif';
    }
    if (normalizedPath.endsWith('.webp')) {
      return 'image/webp';
    }

    return 'image/png';
  }

  private prepareNewClientResourceFromReference(reference: ClientSettingsResourceReference) {
    this.newClientResourcePath = this.normalizeResourceKey(reference.path);
    this.newClientResourceType = reference.type === 'image' ? 'image' : 'html';
  }

  private openMissingClientResource(path: string, type: ClientResourceType) {
    const resource: ClientResource = {
      path,
      name: this.getClientResourceName(path),
      type
    };

    if (!this.clientResourceExists(path)) {
      this.clientResources = [...this.clientResources, resource];
      this.sortClientResources();
      this.clientResourceKeys = new Set(this.clientResources.map(item => this.normalizeResourceKey(item.path)));
    }

    this.view = 'resources';
    this.local.setStringProperty('client-settings.view', 'resources');
    this.navigateToClientResource(path);
    this.selectClientResource(resource, false);
  }

  private getClientResourceName(path: string) {
    return path?.split('/').filter(Boolean).pop() || path || '';
  }

  canCreateClientResource() {
    const path = this.getNormalizedNewClientResourcePath();
    return !!path
      && !this.clientResourceCreating
      && !this.clientResourceExists(path)
      && (this.newClientResourceType === 'html' || !!this.newClientResourceFile);
  }

  private clientResourceExists(path: string) {
    return this.clientResources.some(resource => resource.path === path);
  }

  private sortClientResources() {
    const direction = this.clientResourcesSortDirection === 'asc' ? 1 : -1;
    this.clientResources = [...this.clientResources].sort((a, b) => {
      const valueA = this.getClientResourceSortValue(a, this.clientResourcesSortColumn);
      const valueB = this.getClientResourceSortValue(b, this.clientResourcesSortColumn);
      return valueA.localeCompare(valueB, 'cs', { sensitivity: 'base', numeric: true }) * direction;
    });
  }

  private getClientResourceSortValue(resource: ClientResource, column: ClientResourcesSortColumn) {
    if (column === 'type') {
      return this.getClientResourceType(resource);
    }

    if (column === 'path') {
      return resource.path || '';
    }

    return resource.name || this.getClientResourceName(resource.path);
  }

  private getSortedResourceReferences(editor: ClientSettingsEditor, references: ClientSettingsResourceReference[]) {
    const direction = editor.resourceReferencesSortDirection === 'asc' ? 1 : -1;
    return [...references].sort((a, b) => {
      const valueA = this.getResourceReferenceSortValue(a, editor.resourceReferencesSortColumn);
      const valueB = this.getResourceReferenceSortValue(b, editor.resourceReferencesSortColumn);
      return valueA.localeCompare(valueB, 'cs', { sensitivity: 'base', numeric: true }) * direction;
    });
  }

  private getResourceReferenceSortValue(reference: ClientSettingsResourceReference, column: ResourceReferencesSortColumn) {
    if (column === 'type') {
      return reference.type;
    }

    if (column === 'status') {
      return reference.exists ? '1' : '0';
    }

    return reference.path || '';
  }

  private getNormalizedNewClientResourcePath() {
    const path = (this.newClientResourcePath || '').trim().replace(/^\/+/, '');
    if (!path) {
      return '';
    }

    if (this.newClientResourceType === 'html' && !/\.(html|htm)$/i.test(path)) {
      return `${path}.html`;
    }

    if (this.newClientResourceType === 'image' && this.newClientResourceFile && !/\.[a-z0-9]+$/i.test(path)) {
      const extension = this.newClientResourceFile.name.match(/(\.[a-z0-9]+)$/i)?.[1] || '';
      return `${path}${extension}`;
    }

    return path;
  }

  private resetNewClientResourceForm() {
    this.newClientResourcePath = '';
    this.newClientResourceType = 'html';
    this.newClientResourceFile = null;
  }

  private updateClientSettingsResourceErrors() {
    this.clientSettingsEditors.forEach(editor => this.updateClientSettingValidation(editor));
  }

  private clearClientSettingValidation(editor: ClientSettingsEditor) {
    editor.resourceReferences = [];
    editor.validationMessages = [];
    editor.error = '';
    editor.highlightedValue = this.highlightJson(editor.value);
  }

  private updateClientSettingValidation(editor: ClientSettingsEditor) {
    const resourceReferences = this.getResourceReferencePaths(editor.value, editor.resourceReferencePatterns)
      .map(path => this.toClientSettingsResourceReference(path));
    const jsonError = this.getJsonError(editor.value, editor.schema);
    editor.resourceReferences = this.getSortedResourceReferences(editor, resourceReferences);
    editor.validationMessages = jsonError ? [jsonError] : [];
    editor.error = '';
    editor.highlightedValue = this.highlightJson(
      editor.value,
      resourceReferences.filter(reference => !reference.exists).map(reference => reference.path)
    );
  }

  private toClientSettingsEditor(config: UIConfigMetadata): ClientSettingsEditor {
    return {
      key: config.key || config.endpoint,
      endpoint: config.endpoint,
      title: config.title || config.key || config.endpoint,
      schema: config.schema || {},
      resourceReferencePatterns: config.resourceReferencePatterns || [],
      value: '',
      highlightedValue: '',
      originalValue: '',
      resourceReferences: [],
      resourceReferencesSortColumn: 'path',
      resourceReferencesSortDirection: 'asc',
      validationMessages: [],
      loading: false,
      saving: false,
      error: ''
    };
  }

  private getResourceReferencePaths(value: string, resourceReferencePatterns: string[]) {
    if (!value?.trim() || this.clientResourcesLoading || !this.clientResourcesLoaded || resourceReferencePatterns.length === 0) {
      return [];
    }

    let resourceReferences: string[] = [];
    let parsedValue: unknown;
    try {
      parsedValue = JSON.parse(value);
      resourceReferences = this.extractResourceReferences(parsedValue, resourceReferencePatterns);
    } catch (error) {
      resourceReferences = [];
    }

    if (resourceReferences.length === 0) {
      return [];
    }

    return resourceReferences;
  }

  private toClientSettingsResourceReference(path: string): ClientSettingsResourceReference {
    const normalizedPath = this.normalizeResourceKey(path);
    const resource = this.getClientResourceByPath(normalizedPath);
    return {
      path: normalizedPath,
      exists: !!resource,
      type: resource ? this.getClientResourceType(resource) : this.getClientResourceTypeByPath(normalizedPath),
      resource
    };
  }

  private extractResourceReferences(value: unknown, resourceReferencePatterns: string[]): string[] {
    const references = new Set<string>();
    const patterns = resourceReferencePatterns.map(pattern => this.normalizeJsonPathPattern(pattern));

    const visit = (node: unknown, path: string[]) => {
      if (typeof node === 'string') {
        if (this.isResourceReferencePath(path, patterns) && this.isResourceReference(node)) {
          references.add(this.normalizeResourceKey(node));
        }
        return;
      }

      if (Array.isArray(node)) {
        node.forEach(item => visit(item, path));
        return;
      }

      if (node && typeof node === 'object') {
        Object.entries(node as Record<string, unknown>).forEach(([key, item]) => {
          visit(item, [...path, key]);
        });
      }
    };

    visit(value, []);
    return Array.from(references);
  }

  private normalizeJsonPathPattern(pattern: string) {
    return (pattern || '').split('/').map(segment => segment.trim()).filter(segment => !!segment);
  }

  private isResourceReferencePath(path: string[], patterns: string[][]) {
    return patterns.some(pattern => pattern.length === path.length
      && pattern.every((segment, index) => segment === '*' || segment === path[index]));
  }

  private isResourceReference(value: string) {
    const normalizedValue = this.normalizeResourceKey(value);
    return !!normalizedValue && !/^https?:\/\//i.test(normalizedValue);
  }

  private getClientResourceByPath(path: string) {
    const normalizedPath = this.normalizeResourceKey(path);
    return this.clientResources.find(resource => this.normalizeResourceKey(resource.path) === normalizedPath);
  }

  private getClientResourceByName(name: string) {
    const normalizedName = this.normalizeResourceKey(name);
    return this.clientResources.find(resource => this.getClientResourceName(resource.path) === normalizedName || resource.name === normalizedName);
  }

  private getClientResourceTypeByPath(path: string): ClientResourceType {
    const normalizedPath = path.toLowerCase();
    if (/\.(html|htm)$/i.test(normalizedPath)) {
      return 'html';
    }

    if (/\.(png|jpe?g|gif|webp|svg)$/i.test(normalizedPath)) {
      return 'image';
    }

    return 'other';
  }

  private normalizeResourceKey(value: string) {
    return (value || '').trim().replace(/^\/+/, '');
  }

  private highlightJson(value: string, missingResources: string[] = []) {
    let escapedValue = this.escapeHtml(value || ' ');
    if (escapedValue.endsWith('\n')) {
      escapedValue += ' ';
    }

    const missingResourceSet = new Set(missingResources);
    return escapedValue.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, match => {
      let className = 'app-json-number';
      let title = '';
      if (match.startsWith('"')) {
        className = match.endsWith(':') ? 'app-json-key' : 'app-json-string';
        if (!match.endsWith(':')) {
          try {
            const stringValue = JSON.parse(match);
            const normalizedStringValue = this.normalizeResourceKey(String(stringValue));
            if (missingResourceSet.has(normalizedStringValue)) {
              className += ' app-json-missing-resource';
              title = ` title="${this.escapeAttribute(`Chybějící resource: ${stringValue}`)}"`;
            }
          } catch (error) {
            // keep ordinary string highlighting
          }
        }
      } else if (match === 'true' || match === 'false') {
        className = 'app-json-boolean';
      } else if (match === 'null') {
        className = 'app-json-null';
      }

      return `<span class="${className}"${title}>${match}</span>`;
    });
  }

  private formatJson(value: string) {
    if (!value) {
      return '';
    }

    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch (error) {
      return value;
    }
  }

  private getJsonError(value: string, schema?: JsonSchema) {
    if (!value?.trim()) {
      return '';
    }

    let parsedValue: unknown;
    try {
      parsedValue = JSON.parse(value);
    } catch (error) {
      return 'Invalid JSON';
    }

    return this.validateJsonSchema(parsedValue, schema);
  }

  private validateJsonSchema(value: unknown, schema?: JsonSchema, path = '$'): string {
    if (!schema?.type) {
      return '';
    }

    const actualType = this.getJsonType(value);
    if (actualType !== schema.type) {
      return `${path}: expected ${schema.type}, got ${actualType}`;
    }

    if (actualType === 'object') {
      const objectValue = value as Record<string, unknown>;
      const missingProperty = schema.required?.find(property => objectValue[property] === undefined);
      if (missingProperty) {
        return `${path}: missing required property "${missingProperty}"`;
      }

      if (schema.properties) {
        for (const property of Object.keys(schema.properties)) {
          if (objectValue[property] !== undefined) {
            const propertyError = this.validateJsonSchema(objectValue[property], schema.properties[property], `${path}.${property}`);
            if (propertyError) {
              return propertyError;
            }
          }
        }
      }
    }

    if (actualType === 'array' && schema.items && Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const itemError = this.validateJsonSchema(value[i], schema.items, `${path}[${i}]`);
        if (itemError) {
          return itemError;
        }
      }
    }

    return '';
  }

  private getJsonType(value: unknown) {
    if (value === null) {
      return 'null';
    }

    if (Array.isArray(value)) {
      return 'array';
    }

    if (Number.isInteger(value)) {
      return 'integer';
    }

    return typeof value;
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  private escapeAttribute(value: string) {
    return this.escapeHtml(value).replace(/"/g, '&quot;');
  }
}
