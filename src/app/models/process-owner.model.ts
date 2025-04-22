
export class ProcessOwner {

    public id: string;
    public name: string;

    constructor() {
    }

    static fromJson(json: any): ProcessOwner {
        const owner = new ProcessOwner();
        owner.id = json['id'];
        owner.name = json['name'];
        return owner;
    }

    static fromJsonArray(json: any): ProcessOwner[] {
        const items = [];
        for (const obj of json) {
            items.push(ProcessOwner.fromJson(obj));
        }
        return items;
    }

}