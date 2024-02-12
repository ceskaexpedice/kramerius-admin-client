export class OAISet {

    setSpec:string;
    setName:string;
    setDescription:string;
    filterQuery:string;
    numberDocs:number;

    constructor(setSpec:string, setName:string, setDescription:string, filterQuery:string) {
        this.setSpec = setSpec;
        this.setName = setName;
        this.setDescription = setDescription;
        this.filterQuery = filterQuery;
    }

}
