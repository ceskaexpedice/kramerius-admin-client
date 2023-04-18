import { Process } from './process.model';

export class Batch {

  id: number;
  state: string;
  batchState:string;
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
    if (jBatch['batchState']) {
      batch.batchState = jBatch['batchState'];
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

  /* to delete after testing 
  getStateClass(): string {
    return Process.stateClass(this.state);
  } */

  getName(): string {
    if (this.processes.length > 0) {
      return this.processes[0].name;
    }
  }

  hasSubprocesses(): boolean {
    return this.processes.length > 1;
  }


  getDuration(now: Date): number {
    if (!this.started) {
      return undefined;
    }
    if (this.finished) {
      return this.finished.getTime() - this.started.getTime();
    }
    if (now) {
      let nowRoundedToSeconds = Math.floor(now.getTime() / 1000) * 1000;
      //cas prideleny na servru a na klientovi se muze lisit (az o stovky sekund), takze by vysledek mohl byt negativni, takze vracim jen kladne hodnoty
      //proto pro procesy, ktere bezi asi do 2 minut se nezobracuje cas, dokud proces jeste bezi, po dokonceni uz ano
      const duration = nowRoundedToSeconds - this.started.getTime();
      return duration > 0 ? duration : null;
    }
    return undefined;
  }


}
