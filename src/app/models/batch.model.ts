import { Process } from './process.model';

export class Batch {

  id: number;
  state: string;
  started: Date;
  finished: Date;
  planned: Date;
  ownerId: string;
  ownerName: string;
  processes: Process[];
  expanded = false;

  constructor() {
  }

  static fromJson(json): Batch {
    const batch = new Batch();
    const jBatch = json['batch'];
    const jProcesses = json['processes'];
    batch.id = jBatch['id'];
    batch.state = jBatch['state'];
    batch.ownerId = jBatch['owner_id'];
    batch.ownerName = jBatch['owner_name'];
    if (jBatch['started']) {
      batch.started = new Date(jBatch['started']);
    }
    if (jBatch['finished']) {
      batch.finished = new Date(jBatch['finished']);
    }
    if (jBatch['planned']) {
      batch.planned = new Date(jBatch['planned']);
    }
    batch.processes = [];
    if (jProcesses) {
      for (const process of jProcesses) {
        batch.processes.push(Process.fromJson(process));
      }
    }
    return batch;
  }

  static fromJsonArray(json): Batch[] {
    const items = [];
    for (const obj of json) {
      items.push(Batch.fromJson(obj));
    }
    return items;
  }

  isDeletable(): boolean {
    return Process.DELETABLE_STATES.indexOf(this.state) > -1;
  }

  isKillable(): boolean {
    return Process.KILLABLE_STATES.indexOf(this.state) > -1;
  }

  getStateLabel(): string {
    return Process.stateLabel(this.state);
  }

  getStateColor(): string {
    return Process.stateColor(this.state);
  }

  getName(): string {
    if (this.processes.length > 0) {
      return this.processes[0].name;
    }
  }

  hasSubprocesses(): boolean {
    return this.processes.length > 1;
  }

  getDuration(): number {
    if (!this.started || !this.finished) {
      return null;
    }
    return this.finished.getTime() - this.started.getTime();
  }


}
