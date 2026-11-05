import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CdkApiService } from 'src/app/services/cdk-api.service';

interface ModelCount {
  value: string;
  count: number;
}

interface ModelOption {
  name: string;
  cdkCount: number;
  remoteCount: number;
  selected: boolean;
}

export interface CompareCdkLibraryOptions {
  deleteMissing: boolean;
  onlyShowConfiguration: boolean;
  models?: string;
  license?: string;
}

@Component({
  selector: 'app-compare-cdk-library-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatCheckboxModule, MatProgressBarModule, MatSlideToggleModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './compare-cdk-library-dialog.component.html',
  styleUrls: ['./compare-cdk-library-dialog.component.scss']
})
export class CompareCdkLibraryDialogComponent implements OnInit {
  loading = true;
  loadError = false;
  deleteMissing = false;
  onlyShowConfiguration = false;
  license: string | null = null;
  licenses: string[] = [];
  models: ModelOption[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { code: string; name: string },
    private dialogRef: MatDialogRef<CompareCdkLibraryDialogComponent, CompareCdkLibraryOptions>,
    private cdkApi: CdkApiService
  ) {}

  ngOnInit(): void {
    this.cdkApi.indexHealth(this.data.code).subscribe({
      next: health => {
        this.models = this.toModelOptions(health?.cdk?.models, health?.remote?.models);
        this.licenses = [...new Set((health?.cdk?.licenses || []).map((item: ModelCount) => item.value).filter(Boolean))]
          .sort((a, b) => a.localeCompare(b));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.loadError = true;
      }
    });
  }

  selectAll(selected: boolean): void {
    this.models.forEach(model => model.selected = selected);
  }

  submit(): void {
    const selectedModels = this.models.filter(model => model.selected).map(model => model.name);
    this.dialogRef.close({
      deleteMissing: this.deleteMissing,
      onlyShowConfiguration: this.onlyShowConfiguration,
      ...(this.license ? { license: this.license } : {}),
      ...(selectedModels.length ? { models: selectedModels.join(',') } : {})
    });
  }

  private toModelOptions(cdkModels: ModelCount[] | undefined, remoteModels: ModelCount[] | undefined): ModelOption[] {
    const cdkCounts = new Map((cdkModels || []).map(model => [model.value, Number(model.count) || 0]));
    const remoteCounts = new Map((remoteModels || []).map(model => [model.value, Number(model.count) || 0]));
    return [...new Set([...cdkCounts.keys(), ...remoteCounts.keys()])]
      .sort((a, b) => a.localeCompare(b))
      .map(name => {
        const cdkCount = cdkCounts.get(name) || 0;
        const remoteCount = remoteCounts.get(name) || 0;
        return { name, cdkCount, remoteCount, selected: cdkCount > remoteCount };
      });
  }
}
