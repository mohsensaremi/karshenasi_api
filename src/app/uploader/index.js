import pick from 'lodash/pick';
import fs from 'fs-extra';

class Uploader {
    constructor(files, path, publicPath = true) {
        this.files = files.map(f => pick(f, ['name', 'fresh', 'deleted']));
        this.path = path;
        fs.ensureDirSync(`${STORAGE_PATH}/${this.path}`);
        this.publicPath = publicPath;
    }

    getFullPath(file) {
        return `${STORAGE_PATH}${this.publicPath ? "/public" : "/private"}/${this.path}/${file}`
    }

    upload() {
        this.files.filter(f => f.fresh)
            .map(f => {
                fs.moveSync(`${TEMP_PATH}/${f.name}`, this.getFullPath(f.name));
            });

        this.delete();

        return this;
    }

    delete() {
        this.files.filter(f => f.deleted)
            .map(f => {
                fs.removeSync(this.getFullPath(f.name));
            });

        return this;
    }

    getFiles() {
        return this.files.filter(f => !f.deleted).map(f => f.name);
    }
}

export default Uploader;
