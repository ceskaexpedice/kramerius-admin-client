export class Process {

  static PLANNED = 'PLANNED';
  static RUNNING = 'RUNNING';
  static FINISHED = 'FINISHED';
  static FAILED = 'FAILED';
  static KILLED = 'KILLED';
  //jen pro procesy, ne dávky
  static NOT_RUNNING = 'NOT_RUNNING';
  static WARNING = 'WARNING';


  static STATES = [
    Process.PLANNED,
    Process.RUNNING,
    Process.FINISHED,
    Process.FAILED,
    Process.KILLED,
    Process.NOT_RUNNING,
    Process.WARNING
  ];

  static BATCH_STATES = [
    Process.PLANNED,
    Process.RUNNING,
    Process.FINISHED,
    Process.FAILED,
    Process.KILLED,
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
  uuid: string;
  state: string;
  started: Date;
  finished: Date;
  planned: Date;
  name: string;

  constructor() {
  }

  static stateLabel(state: string): string {
    switch (state) {
      case Process.PLANNED: return 'Naplánováno';
      case Process.RUNNING: return 'Běží';
      case Process.FINISHED: return 'Dokončeno';
      case Process.FAILED: return 'Chyba';
      case Process.KILLED: return 'Zrušeno';
      case Process.NOT_RUNNING: return 'Nespuštěno';
      case Process.WARNING: return 'Varování';
    }
    return state;
  }

  static stateColor(state: string): string {
    switch (state) {
      case Process.PLANNED: return '#7b7b7b';
      case Process.RUNNING: return '#456aa5';
      case Process.FINISHED: return '#45a55a';
      case Process.FAILED: return '#ab493f';
      case Process.KILLED: return '#ca7023';
      case Process.KILLED: return '#ca7023';
      case Process.NOT_RUNNING: return '#ca7023';
      case Process.WARNING: return '#ab493f';
    }
    return '#000';
  }

  static stateClass(state: string): string {
    switch (state) {
      case Process.PLANNED: return 'app-planned';
      case Process.RUNNING: return 'app-running';
      case Process.FINISHED: return 'app-finished';
      case Process.FAILED: return 'app-failed';
      case Process.KILLED: return 'app-killed';
      case Process.NOT_RUNNING: return 'app-not-running';
      case Process.WARNING: return 'app-warning';
    }
    return '';
  }

  static fromJson(json): Process {
    const process = new Process();
    process.id = json['id'];
    process.uuid = json['uuid'];
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
