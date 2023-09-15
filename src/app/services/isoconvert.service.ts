import { Injectable } from '@angular/core';
import { Tree } from '../models/tree.model';

@Injectable()
export class IsoConvertService {

  private iso639_1to2Map: Map<string, string[]>;

  constructor() {
    this.iso639_1to2Map = new Map<string, string[]>();
    this.iso639_1to2Map.set("aa", ["aar"]);
    this.iso639_1to2Map.set("ab", ["abk"]);
    this.iso639_1to2Map.set("af", ["afr"]);
    this.iso639_1to2Map.set("ak", ["aka"]);
    this.iso639_1to2Map.set("am", ["amh"]);
    this.iso639_1to2Map.set("an", ["arg"]);
    this.iso639_1to2Map.set("ar", ["ara"]);
    this.iso639_1to2Map.set("as", ["asm"]);
    this.iso639_1to2Map.set("av", ["ava"]);
    this.iso639_1to2Map.set("ay", ["aym"]);
    this.iso639_1to2Map.set("az", ["aze"]);
    this.iso639_1to2Map.set("ba", ["bak"]);
    this.iso639_1to2Map.set("be", ["bel"]);
    this.iso639_1to2Map.set("bg", ["bul"]);
    this.iso639_1to2Map.set("bh", ["bih"]);
    this.iso639_1to2Map.set("bi", ["bis"]);
    this.iso639_1to2Map.set("bm", ["bam"]);
    this.iso639_1to2Map.set("bn", ["ben"]);
    this.iso639_1to2Map.set("bo", ["tib"]);
    this.iso639_1to2Map.set("br", ["bre"]);
    this.iso639_1to2Map.set("bs", ["bos"]);
    this.iso639_1to2Map.set("ca", ["cat"]);
    this.iso639_1to2Map.set("ce", ["che"]);
    this.iso639_1to2Map.set("ch", ["cha"]);
    this.iso639_1to2Map.set("co", ["cos"]);
    this.iso639_1to2Map.set("cr", ["cre"]);
    
    this.iso639_1to2Map.set("cs", ["cze"]);

    this.iso639_1to2Map.set("cu", ["chu"]);
    this.iso639_1to2Map.set("cv", ["chv"]);
    this.iso639_1to2Map.set("cy", ["wel"]);
    this.iso639_1to2Map.set("da", ["dan"]);
    this.iso639_1to2Map.set("de", ["ger"]);


    this.iso639_1to2Map.set("dv", ["div"]);
    this.iso639_1to2Map.set("dz", ["dzo"]);
    this.iso639_1to2Map.set("ee", ["ewe"]);
    this.iso639_1to2Map.set("el", ["gre"]);
    this.iso639_1to2Map.set("en", ["eng"]);
    this.iso639_1to2Map.set("eo", ["epo"]);
    this.iso639_1to2Map.set("es", ["spa"]);
    this.iso639_1to2Map.set("et", ["est"]);
    this.iso639_1to2Map.set("eu", ["baq"]);
    this.iso639_1to2Map.set("fa", ["per"]);
    this.iso639_1to2Map.set("ff", ["ful"]);
    this.iso639_1to2Map.set("fi", ["fin"]);
    this.iso639_1to2Map.set("fj", ["fij"]);
    this.iso639_1to2Map.set("fo", ["fao"]);
    this.iso639_1to2Map.set("fr", ["fre"]);
    this.iso639_1to2Map.set("fy", ["fry"]);
    this.iso639_1to2Map.set("ga", ["gle"]);
    this.iso639_1to2Map.set("gd", ["gla"]);
    this.iso639_1to2Map.set("gl", ["glg"]);
    this.iso639_1to2Map.set("gn", ["grn"]);
    this.iso639_1to2Map.set("gu", ["guj"]);
    this.iso639_1to2Map.set("gv", ["glv"]);
    this.iso639_1to2Map.set("ha", ["hau"]);
    this.iso639_1to2Map.set("he", ["heb"]);
    this.iso639_1to2Map.set("hi", ["hin"]);
    this.iso639_1to2Map.set("ho", ["hmo"]);
    this.iso639_1to2Map.set("hr", ["hrv"]);
    this.iso639_1to2Map.set("ht", ["hat"]);
    this.iso639_1to2Map.set("hu", ["hun"]);
    this.iso639_1to2Map.set("hy", ["arm"]);
    this.iso639_1to2Map.set("hz", ["her"]);
    this.iso639_1to2Map.set("ia", ["ina"]);
    this.iso639_1to2Map.set("id", ["ind"]);
    this.iso639_1to2Map.set("ie", ["ile"]);
    this.iso639_1to2Map.set("ig", ["ibo"]);
    this.iso639_1to2Map.set("ii", ["iii"]);
    this.iso639_1to2Map.set("ik", ["ipk"]);
    this.iso639_1to2Map.set("io", ["ido"]);
    this.iso639_1to2Map.set("is", ["ice"]);
    this.iso639_1to2Map.set("it", ["ita"]);
    this.iso639_1to2Map.set("iu", ["iku"]);
    this.iso639_1to2Map.set("ja", ["jpn"]);
    this.iso639_1to2Map.set("jv", ["jav"]);
    this.iso639_1to2Map.set("ka", ["geo"]);
    this.iso639_1to2Map.set("kg", ["kon"]);
    this.iso639_1to2Map.set("ki", ["kik"]);
    this.iso639_1to2Map.set("kj", ["kua"]);
    this.iso639_1to2Map.set("kk", ["kaz"]);
    this.iso639_1to2Map.set("kl", ["kal"]);
    this.iso639_1to2Map.set("km", ["khm"]);
    this.iso639_1to2Map.set("kn", ["kan"]);
    this.iso639_1to2Map.set("ko", ["kor"]);
    this.iso639_1to2Map.set("kr", ["kau"]);
    this.iso639_1to2Map.set("ks", ["kas"]);
    this.iso639_1to2Map.set("ku", ["kur"]);
    this.iso639_1to2Map.set("kv", ["kom"]);
    this.iso639_1to2Map.set("kw", ["cor"]);
    this.iso639_1to2Map.set("ky", ["kir"]);
    this.iso639_1to2Map.set("la", ["lat"]);
    this.iso639_1to2Map.set("lb", ["ltz"]);
    this.iso639_1to2Map.set("lg", ["lug"]);
    this.iso639_1to2Map.set("li", ["lim"]);
    this.iso639_1to2Map.set("ln", ["lin"]);
    this.iso639_1to2Map.set("lo", ["lao"]);
    this.iso639_1to2Map.set("lt", ["lit"]);
    this.iso639_1to2Map.set("lu", ["lub"]);
    this.iso639_1to2Map.set("lv", ["lav"]);
    this.iso639_1to2Map.set("mg", ["mlg"]);
    this.iso639_1to2Map.set("mh", ["mah"]);
    this.iso639_1to2Map.set("mi", ["mao"]);
    this.iso639_1to2Map.set("mk", ["mac"]);
    this.iso639_1to2Map.set("ml", ["mal"]);
    this.iso639_1to2Map.set("mn", ["mon"]);
    this.iso639_1to2Map.set("mr", ["mar"]);
    this.iso639_1to2Map.set("ms", ["may"]);
    this.iso639_1to2Map.set("mt", ["mlt"]);
    this.iso639_1to2Map.set("my", ["bur"]);
    this.iso639_1to2Map.set("na", ["nau"]);
    this.iso639_1to2Map.set("nb", ["nob"]);
    this.iso639_1to2Map.set("nd", ["nde"]);
    this.iso639_1to2Map.set("ne", ["nep"]);
    this.iso639_1to2Map.set("ng", ["ndo"]);
    this.iso639_1to2Map.set("nl", ["dut"]);
    this.iso639_1to2Map.set("nn", ["nno"]);
    this.iso639_1to2Map.set("no", ["nor"]);
    this.iso639_1to2Map.set("nr", ["nbl"]);
    this.iso639_1to2Map.set("nv", ["nav"]);
    this.iso639_1to2Map.set("ny", ["nya"]);
    this.iso639_1to2Map.set("oc", ["oci"]);
    this.iso639_1to2Map.set("oj", ["oji"]);
    this.iso639_1to2Map.set("om", ["orm"]);
    this.iso639_1to2Map.set("or", ["ori"]);
    this.iso639_1to2Map.set("os", ["oss"]);
    this.iso639_1to2Map.set("pa", ["pan"]);
    this.iso639_1to2Map.set("pi", ["pli"]);
    this.iso639_1to2Map.set("pl", ["pol"]);
    this.iso639_1to2Map.set("ps", ["pus"]);
    this.iso639_1to2Map.set("pt", ["por"]);
    this.iso639_1to2Map.set("qu", ["que"]);
    this.iso639_1to2Map.set("rm", ["roh"]);
    this.iso639_1to2Map.set("rn", ["run"]);
    this.iso639_1to2Map.set("ro", ["ron"]);
    this.iso639_1to2Map.set("ru", ["rus"]);
    this.iso639_1to2Map.set("rw", ["kin"]);
    this.iso639_1to2Map.set("sa", ["san"]);
    this.iso639_1to2Map.set("sc", ["srd"]);
    this.iso639_1to2Map.set("sd", ["snd"]);
    this.iso639_1to2Map.set("se", ["sme"]);
    this.iso639_1to2Map.set("sg", ["sag"]);
    this.iso639_1to2Map.set("si", ["sin"]);
    this.iso639_1to2Map.set("sk", ["slo"]);
    this.iso639_1to2Map.set("sl", ["slv"]);
    this.iso639_1to2Map.set("sm", ["smo"]);
    this.iso639_1to2Map.set("sn", ["sna"]);
    this.iso639_1to2Map.set("so", ["som"]);
    this.iso639_1to2Map.set("sq", ["alb"]);
    this.iso639_1to2Map.set("sr", ["srp"]);
    this.iso639_1to2Map.set("ss", ["ssw"]);
    this.iso639_1to2Map.set("st", ["sot"]);
    this.iso639_1to2Map.set("su", ["sun"]);
    this.iso639_1to2Map.set("sv", ["swe"]);
    this.iso639_1to2Map.set("sw", ["swa"]);
    this.iso639_1to2Map.set("ta", ["tam"]);
    this.iso639_1to2Map.set("te", ["tel"]);
    this.iso639_1to2Map.set("tg", ["tgk"]);
    this.iso639_1to2Map.set("th", ["tha"]);
    this.iso639_1to2Map.set("ti", ["tir"]);
    this.iso639_1to2Map.set("tk", ["tuk"]);
    this.iso639_1to2Map.set("tl", ["tgl"]);
    this.iso639_1to2Map.set("tn", ["tsn"]);
    this.iso639_1to2Map.set("to", ["ton"]);
    this.iso639_1to2Map.set("tr", ["tur"]);
    this.iso639_1to2Map.set("ts", ["tso"]);
    this.iso639_1to2Map.set("tt", ["tat"]);
    this.iso639_1to2Map.set("tw", ["twi"]);
    this.iso639_1to2Map.set("ty", ["tah"]);
    this.iso639_1to2Map.set("ug", ["uig"]);
    this.iso639_1to2Map.set("uk", ["ukr"]);
    this.iso639_1to2Map.set("ur", ["urd"]);
    this.iso639_1to2Map.set("uz", ["uzb"]);
    this.iso639_1to2Map.set("ve", ["ven"]);
    this.iso639_1to2Map.set("vi", ["vie"]);
    this.iso639_1to2Map.set("vo", ["vol"]);
    this.iso639_1to2Map.set("wa", ["wln"]);
    this.iso639_1to2Map.set("wo", ["wol"]);
    this.iso639_1to2Map.set("xh", ["xho"]);
    this.iso639_1to2Map.set("yi", ["yid"]);
    this.iso639_1to2Map.set("yo", ["yor"]);
    this.iso639_1to2Map.set("za", ["zha"]);
    this.iso639_1to2Map.set("zh", ["chi"]);
    this.iso639_1to2Map.set("zu", ["zul"]);

    }

    convert(iso639_1: string): string[] | undefined {
        return this.iso639_1to2Map.get(iso639_1);
    }

    
    isTranslatable(iso639_1: string): boolean {
        return this.iso639_1to2Map.has(iso639_1);
    }
}
