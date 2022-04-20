import { AdminApiService } from "../services/admin-api.service";
import { UIService } from "../services/ui.service";

export class Tree {

    type: string;
    file: File
    expanded: boolean;
    children: Tree[];
    loading: boolean;
    level: number;
    parent: Tree;

    constructor(private ui: UIService, type: string, file: File, parent: Tree = null, level: number = 0) {
        this.type = type;
        this.file = file;
        this.parent = parent;
        this.expanded = false;
        this.loading = false;
        this.level = level;
    }


    getFullPath() {
        if (!this.parent) {
            return '/';
        }
        if (this.parent.getFullPath() == '/') {
            return '/' + this.file.name;
        }
        return this.parent.getFullPath() + '/' + this.file.name;
    }

    expand(api: AdminApiService, all: boolean = false, onError?) {
        if (!this.expandable()) {
            return;
        }
        if (this.expanded && !all) {
            return;
        }
        if (this.children) {
            this.expanded = true;
            if (all) {
                this.expandChildren(api);
            }
            return;
        }
        this.loading = true;
        this.children = [];

        api.getImportFiles(this.type, this.getFullPath()).subscribe((files: File[]) => {
            console.log('files', files);
            for (const file of files) {
                const tree = new Tree(this.ui, this.type, file, this, this.level + 1);
                this.children.push(tree);
            }
            this.expanded = true;
            this.loading = false;
            if (all) {
                this.expandChildren(api);
            }
        }, error => {
            console.error(error);
            if (onError) {
                onError(`Chyba načítání dat: ${error.error.error}`);
            } else {
                this.ui.showErrorSnackBar(`Chyba načítání dat: ${error.error.error}`)
            }
        });
    }

    expandChildren(api: AdminApiService) {
        for (const child of this.children) {
            child.expand(api, true);
        }
    }

    expandAll(api: AdminApiService) {
        this.expand(api, true);
    }

    expandable(): boolean {
        return this.file.isDir;
    }
}


export interface File {
    name: string;
    isDir: boolean;
}