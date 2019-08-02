import pick from 'lodash/pick';
import fs from 'fs-extra';

class Uploader {
    constructor(files, path) {
        this.files = files.map(f => pick(f, ['name', 'fresh', 'deleted']));
        this.path = path;
        fs.ensureDirSync(`${STORAGE_PATH}/${this.path}`);
    }

    upload() {
        this.files.filter(f => f.fresh)
            .map(f => {
                fs.moveSync(`${TEMP_PATH}/${f.name}`, `${STORAGE_PATH}/${this.path}/${f.name}`);
            });

        this.delete();

        return this;
    }

    delete() {
        this.files.filter(f => f.deleted)
            .map(f => {
                fs.removeSync(`${STORAGE_PATH}/${this.path}/${f.name}`);
            });

        return this;
    }

    getFiles() {
        return this.files.filter(f => !f.deleted).map(f => f.name);
    }
}

export default Uploader;
