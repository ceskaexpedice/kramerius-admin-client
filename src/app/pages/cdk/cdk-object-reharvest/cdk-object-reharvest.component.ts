import { Component, OnInit } from '@angular/core';

// --- data mock to delete ---
export interface objectReharvest {
  date: string;
  pid: string;
  deleteObject: boolean;
  description: string;
  state: string;
}

const ELEMENT_DATA: objectReharvest[] = [
  {date: '20.4.2024', pid: 'uuid:3a99c250-bc5d-4318-a5a8-db00547fd5c4', deleteObject: true, description: 'Manualni reharvest objektu z MZK, KNAV', state: 'PLANNED'},
  {date: '24.4.2024', pid: 'uuid:c9b6c867-6d60-4a64-9519-95f5e66ea910', deleteObject: false, description: 'Neplanovany reharvest objektu z duvodu dila/stranky', state: 'FINISHED'},
  {date: '20.4.2024', pid: 'uuid:3a99c250-bc5d-4318-a5a8-db00547fd5c4', deleteObject: true, description: 'Manualni reharvest objektu z MZK, KNAV', state: 'PLANNED'},
  {date: '24.4.2024', pid: 'uuid:c9b6c867-6d60-4a64-9519-95f5e66ea910', deleteObject: false, description: 'Neplanovany reharvest objektu z duvodu dila/stranky', state: 'FINISHED'}
];
// -- data mock to delete ---

@Component({
  selector: 'app-cdk-object-reharvest',
  templateUrl: './cdk-object-reharvest.component.html',
  styleUrls: ['./cdk-object-reharvest.component.scss']
})
export class CdkObjectReharvestComponent implements OnInit {

  displayedColumns: string[] = ['date', 'pid', 'state', 'deleteObject', 'description'];
  dataSource = ELEMENT_DATA;

  constructor() { }

  ngOnInit(): void {
  }

}
