
class mediaDB {

    constructor(DBName="mediaDB", mine="", version=1) {

        this.indexDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
        if (!this.indexDB) this.raiseError("Not Support indexDB.");

        this.DBName = DBName;
        this.version = version;

        this.mineType = {audio: 1, image:1, video:1, fonts:1};
        this.mineName = Object.keys(this.mineType);

        if (!(mine in this.mineType)) this.raiseError("Not Support Mine.");
        this.mine = mine;

        this.openDB();
        
    }

    openDB() {
        this.open = indexedDB.open(this.DBName, this.version);
        this.open.onupgradeneeded = this.initDB.bind(this);
        this.open.onsuccess = this.startDB.bind(this);
    }

    initDB() {
        let db = this.open.result;
        for (let m in this.mineName) {
            let mine = this.mineName[m];
            let theStore = db.createObjectStore(mine, {keyPath: `${mine}ID`});
                theStore.createIndex("identifier", "name");
        }
    }

    startDB() {
        let db = this.open.result;
        let tx = null;
        let store = null;
        let index = null;
        try {
            tx = db.transaction(this.mine, "readwrite");
            store = tx.objectStore(this.mine);
            index = store.index("identifier");
        } catch (error) {
            this.raiseError("Storage is Busy, please do it later.")
        }
        return [store, index];
    }
    
    blobToArrayBuffer(blob, callback) {
        let reader = new FileReader();
        reader.readAsArrayBuffer(blob);
        reader.onload = function (e) {
            callback(blob.type, reader.result);
        }
    }
    
    arrayBufferToBlob(array, type) {
        return new Blob([array], {type: type});
    }

    put(id, name="", data=new Blob(), extra={}, callback) {

        if (typeof id !== "number") this.raiseError("Invalid id.");
        
        let storingObj = {};
            storingObj[`${this.mine}ID`] = id;
            storingObj[`name`] = name;
            storingObj[`extra`] = extra;
        let cb = callback;
        let that = this;
        
        if (data && typeof data === "object" && data.constructor === Blob) {

            return new Promise((resolve, reject) => {
                that.blobToArrayBuffer(data, (type, array) => {
                    storingObj[`data`] = array;
                    storingObj[`datatype`] = type;
                    let store = that.startDB()[0];
                    let req = store.put(storingObj);
                    req.onsuccess = () => {
                        that.get(id).then(info => {
                            resolve(info);
                            if (cb) cb(info);
                        });
                    };
                });
            });

        } else if (data && typeof data === "string") {

            return new Promise((resolve, reject) => {
                that.retriveFromNet(data).then((blob) => {
                    that.put(id, name, blob, extra, callback)
                        .then(resolve);
                });
            });

        } else {
            this.raiseError("Unknown DataType");
        }

    }

    get(id, callback) {
        
        let [store, index] = this.startDB();
        let get = null;
        if (typeof id === "number") {
            get = store.get(id);
        } else if (typeof id === "string") {
            get = index.get(id);
        } else {
            this.raiseError("Unknown ID.");
        }
        let cb = callback;
        let that = this;

        return new Promise((resolve, reject) => {
            get.onsuccess = function() {
                let res = get.result;
                if (res) res.data = that.arrayBufferToBlob(res.data, res.datatype);
                resolve(res);
                if (cb) cb(res);
            }
        });

    }

    retriveFromNet(url, callback) {

        let xhr = new XMLHttpRequest();
        let cb = callback;
        xhr.onprogress = this.onprogress || (() => {});
        xhr.open("GET", url, true);
        xhr.responseType = "blob";

        return new Promise((resolve, reject) => {
            xhr.onload = function() {
                resolve(xhr.response);
                if (cb) cb(xhr.response);
            };
            xhr.send();
        });

    }

    loadMedia(dom, data, callback) {
        if (dom.tagName.toLocaleLowerCase() in {audio:1, image:1, video:1}) {
            dom.src = window.URL.createObjectURL(data);
        } else {
            dom.style.backgroundImage = `url(${window.URL.createObjectURL(data)});`
        }
        callback(dom);
    }

    loadFile(dom, id, name, url="", extra={}, callback=()=>{}) {

        if (!dom || !id || !name) this.raiseError("Not Enough Parameters.");
        // if (typeof a != "object" || !a.tagName) this.raiseError("Please Input a DOM");

        this.get(id)
            .then((res) => {
                if (!res) {
                    if (!url) this.raiseError("No Such File!");
                    this.put(id, name, url, extra)
                        .then(info => {
                            this.loadMedia(dom, info.data, callback);
                        })
                } else {
                    this.loadMedia(dom, res.data, callback);
                }
            });
    }

    raiseError(msg="") {
        if (this.onerror) this.onerror(msg);
        else throw new DOMException(msg);
    }

}

window.mediaDB = mediaDB;
export default mediaDB;
