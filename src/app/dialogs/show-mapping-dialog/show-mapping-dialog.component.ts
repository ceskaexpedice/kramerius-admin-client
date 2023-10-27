import { Component, OnInit, Inject } from '@angular/core';
import { Data } from '@angular/router';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-show-mapping-dialog',
  templateUrl: './show-mapping-dialog.component.html',
  styleUrls: ['./show-mapping-dialog.component.scss']
})
export class ShowMappingDialogComponent implements OnInit {

  public isResult: boolean;

  public mappingTableData: Array<any> = [
    {
      code: "ndk",
      items: [
        { sigla: "ABA001", name: "Národni knihovna ČR"},
        { sigla: "ABA000", name: "Národni knihovna ČR"},
        { sigla: "ABA004", name: "Národni knihovna ČR - Slovanská knihovna"}
      ] 
    },
    {
      code: "knav",
      items: [
        { sigla: "ABA007", name: "Knihovna AVČR"},
        { sigla: "ABB045", name: "KNAV - Etnologický ústav AV ČR"},
        { sigla: "ABB030", name: "KNAV - Orientální ústav AV ČR"},
        { sigla: "ABE459", name: "KNAV - Královská kanonie premonstrátů"},
        { sigla: "ABB060", name: "KNAV - Ústav pro českou literaturu AV ČR"}
      ] 
    },
    {
      code: "mzk",
      items: [
        { sigla: "BOA001", name: "Moravská zemská knihovna v Brně"},
        { sigla: "KME450", name: "MZK - Muzeum umění Olomouc, Arcidiecézní muzeum Kroměříž"},
        { sigla: "BOE950", name: "MZK - Benediktinské opatství Rajhrad"},
        { sigla: "BOE801", name: "MZK - Muzeum Brněnska"},
        { sigla: "BVE301", name: "MZK - Regionální muzeum v Mikulově"},
        { sigla: "HOE802", name: "MZK - Masarykovo muzeum v Hodoníně"}
      ] 
    },
    {
      code: "svkhk",
      items: [
        { sigla: "HKA001", name: "Studijní a vědecká knihovna v Hradci Králové"},
        { sigla: "JCE301", name: "SVKHK - Regionální muzeum v Jičíně"},
        { sigla: "RKE801", name: "SVKHK - Okresní muzeum Orlických hor"},
        { sigla: "NAG001", name: "SVKHK - Městská knihovna Náchod"},
        { sigla: "HKE302", name: "SVKHK - Muzeum východních Čech v Hradci Králové"},
        { sigla: "NAE802", name: "SVKHK - Městské muzeum v Jaroměři"},
        { sigla: "HKG001", name: "SVKHK - Knihovna města Hradce Králové"},
        { sigla: "TUE301", name: "SVKHK - Muzeum Podkrkonoší v Trutnově"}
      ] 
    },
    {
      code: "uzei",
      items: [
        { sigla: "ABA009", name: "Knihovna Antonína Švehly"}
      ] 
    },
    {
      code: "kkp",
      items: [
        { sigla: "PAG001", name: "Krajská knihovna v Pardubicích"}
      ] 
    },
    {
      code: "svkul",
      items: [
        { sigla: "ULG001", name: "Knihovna ústeckého kraje"}
      ] 
    },
    {
      code: "nfa",
      items: [
        { sigla: "ABC135", name: "Národní filmový archiv"}
      ] 
    },
    {
      code: "mlp",
      items: [
        { sigla: "ABG001", name: "Městská knihovna v Praze"}
      ] 
    },
    {
      code: "nm",
      items: [
        { sigla: "ABA010", name: "Jihočeská vědecká knihovna"}
      ] 
    }
  ] 
  

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
  }

  getResult(val) {
    return this.isResult = this.mappingTableData.some(e => e.code === val);
  }

}
