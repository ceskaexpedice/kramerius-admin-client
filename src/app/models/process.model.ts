export class Process {

  static RUNNING = 'RUNNING';
  static FINISHED = 'FINISHED';
  static FAILED = 'FAILED';
  static PLANNED = 'PLANNED';
  static KILLED = 'KILLED';

  static STATES = [
    Process.RUNNING,
    Process.FINISHED,
    Process.FAILED,
    Process.PLANNED,
    Process.KILLED
  ];

  static DELETABLE_STATES = [
    Process.FINISHED,
    Process.FAILED,
    Process.KILLED
  ];

  static KILLABLE_STATES = [
    Process.RUNNING,
    Process.PLANNED
  ];

  id: number;
  state: string;
  started: Date;
  finished: Date;
  planned: Date;
  name: string;

  constructor() {
  }

  static stateLabel(state: string): string {
    switch (state) {
      case Process.RUNNING: return 'Běží';
      case Process.FINISHED: return 'Dokončeno';
      case Process.FAILED: return 'Chyba';
      case Process.PLANNED: return 'Naplánováno';
      case Process.KILLED: return 'Zrušeno';
    }
    return state;
  }

  static stateColor(state: string): string {
    switch (state) {
      case Process.RUNNING: return '#456aa5';
      case Process.FINISHED: return '#45a55a';
      case Process.FAILED: return '#ab493f';
      case Process.PLANNED: return '#7b7b7b';
      case Process.KILLED: return '#ca7023';
    }
    return '#000';
  }

  static fromJson(json): Process {
    const process = new Process();
    process.id = json['id'];
    process.state = json['state'];
    process.name = json['name'];
    if (json['started']) {
      process.started = new Date(json['started']);
    }
    if (json['finished']) {
      process.finished = new Date(json['finished']);
    }
    if (json['planned']) {
      process.planned = new Date(json['planned']);
    }
    return process;
  }

  static fromJsonArray(json): Process[] {
    const items = [];
    for (const obj of json) {
      items.push(Process.fromJson(obj));
    }
    return items;
  }

  getStateLabel(): string {
    return Process.stateLabel(this.state);
  }

  getStateColor(): string {
    return Process.stateColor(this.state);
  }

  getDuration(): number {
    if (!this.started || !this.finished) {
      return null;
    }
    return this.finished.getTime() - this.started.getTime();
  }

}
