import axios from 'axios';
import mediaDB from './mediaDB';
import qs from 'qs';

export const BASEURL = "https://biuandroid-ssl.smartgslb.com";
export const YUUNOAPI = "https://api.yuuno.cc";
export var Me = null;
export var MusicController = null;
export var Settings = {
    repeat: 0,
    shuffle: 0,
    cache: 1,
}

export var biuDB = new mediaDB("biuDB", "audio");
export var picDB = new mediaDB("biuDB", "image");

export class SuperMusicController {

    constructor() {
        this.list = [];
        this.currentMusic = {
            title: "还没有音乐呐",
            sid: 0,
            length: 0,
        };
        this.currentNum = 0;
        
        let savedInfo = getPlayInfo();
        this.list = savedInfo.list;
        this.currentMusic = savedInfo.currentMusic;
        this.currentNum = savedInfo.currentNum;
        if (this.currentMusic.sid) this.isInit = true; else this.isInit = false;

        this.state = 0;
        this.player = null;
        if (!document.getElementById("musicplayer")) {
            this.player = document.createElement("audio");
            this.player.id = "musicplayer";
            this.player.src = "";
            this.player.repeat = false;
            this.player.onpause = this.onPlayEnds.bind(this);
            document.body.appendChild(this.player);
        } else {
            this.player = document.getElementById("musicplayer");
        }
    }

    onPlayEnds() {
        if (this.state === 0) return;
        if (Settings.repeat) {
            this.player.play();
        } else if (Settings.shuffle) {
            this.playControl(parseInt(Math.random() * this.list.length, 10), 1);
        } else {
            this.playControl(1);
        }
    }

    playControl(index=1) {

        if (this.state === 2) return;
        if (!this.list.length) return;
        this.currentNum += index;
        if (this.currentNum < 0) this.currentNum += this.list.length;
        this.currentNum %= this.list.length;
        this.play(this.list[this.currentNum]);

    }

    playList(list, order=-1) {
        
        if (list.length < 1) return;
        
        this.list = list;
        order %= list.length;

        if (order < 0) {
            this.currentNum = 0;
            this.play(this.list[this.currentNum]);
        } else {
            this.currentNum = order;
            if (!this.currentMusic || this.list[this.currentNum].sid !== this.currentMusic.sid) {
                this.play(this.list[this.currentNum]);
            }
        }
        
    }

    pause() {
        this.state = 0;
        if (!this.player.paused) this.player.pause();
    }

    preload(info=null) {

        if (this.isInit && info === null) { info = this.currentMusic; this.isInit = false; }

        if (!info) return;
        this.state = 2;
        let param = {
            token: Me.token,
            sid: info.sid
        };
        HttpRequest("/Song/get_url", param, (status, data) => {
            this.currentMusic = info;
            this.currentMusic.src = data.url;
            this.state = 2;

            // this.player.src = data.url;
            // if (this.player.paused) this.player.play();
            // this.state = 1;
            // this.pause();
            
            let type = this.currentMusic.src.includes(".mp3") ? "audio/mpeg" : "audio/mp4";
            biuDB.loadFile(this.player, parseInt(this.currentMusic.sid, 10), this.currentMusic.title, this.currentMusic.src, this.currentMusic, type, audio => {
                this.state = 1;
            });

            savePlayInfo(this.list, this.currentMusic, this.currentNum);
            
        });

    }

    play(info=null) {

        if (this.isInit && info === null) { info = this.currentMusic; this.isInit = false; }

        if (!info) {
            if (!this.currentMusic.sid) return;
            if (this.player.paused) this.player.play();
            this.state = 1;
            this.setSession();
            return;
        }
        if (this.state === 2) return;
        let param = {
            token: Me.token,
            sid: info.sid
        };
        this.state = 2;
        HttpRequest("/Song/get_url", param, (status, data) => {
            this.currentMusic = info;
            this.currentMusic.src = data.url;
            this.state = 2;

            // this.player.src = data.url;
            // if (this.player.paused) this.player.play();
            // this.state = 1;
            // this.pause();
            
            let type = this.currentMusic.src.includes(".mp3") ? "audio/mpeg" : "audio/mp4";
            biuDB.loadFile(this.player, parseInt(this.currentMusic.sid, 10), this.currentMusic.title, this.currentMusic.src, this.currentMusic, type, audio => {
                if (this.player.paused) this.player.play();
                this.state = 1;
                this.setSession();
            });

            savePlayInfo(this.list, this.currentMusic, this.currentNum);
            
        });
    }

    setSession() {
        if ('mediaSession' in window.navigator && 'MediaMetadata' in window) {

            window.navigator.mediaSession.metadata = new window.MediaMetadata({
                title: this.currentMusic.title,
                artist: this.currentMusic.singer || "Biu",
                album: this.currentMusic.album || "iBiu",
                artwork: [
                    { src: `https://biu.moe/Song/showCover/sid/${this.currentMusic.sid}`, sizes: '128x128', type: 'image/jpeg' },
                ]
            });
            
            let that = this;
            window.navigator.mediaSession.setActionHandler('play', function() {that.play();});
            window.navigator.mediaSession.setActionHandler('pause', function() {that.pause();});
            window.navigator.mediaSession.setActionHandler('previoustrack', function() {that.playControl(-1);});
            window.navigator.mediaSession.setActionHandler('nexttrack', function() {that.playControl(1);});
        }
    }

}

/**
 * email check
 * Return whether the email address is valid
 */
export var EmailOfflineValidationCheck = (email) => {
    var reg = /^\w+([-_.]?\w+)*@\w+([\\.-]?\\w+)*(\.\w{2,6})+$/;
    return (email.match(reg) != null);
}

/**
 * password check
 * Return whether the password is valid
 */
export var PasswdOfflineValidationCheck = (passwd) => {
    var reg = /^[\w]{6,20}$/;
    if (passwd.length <= 0) return true;
    else return (passwd.match(reg) != null);
}

/**
 * Global Token-With Http Post Func
 */
export var HttpRequest = (route, data, callback, method="POST") => {

    const options = {
        method: method,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: qs.stringify(data),
        url: `${BASEURL}${route}`,
    };

    axios(options)
        .catch((error) => {
            console.log(error);
            callback(false, error);
        })
        .then((data) => {
            data = data.data;
            if (data.status) {
                callback(true, data);
            } else {
                callback(false, data.error);
            }
        });
}

export class User {
    
    /*
     * init user, if with uid, then fetch the userinfo from server.
     */
    constructor(uid="") {
        this.init();
        if (uid) {
            this.uid = uid;
            this.fetchInfo();
        }
    }

    /*
     * init current class.
     */
    init() {
        this.uid = "";
        this.passwd = "";
        this.token = "";
        this.name = "";
        this.email = "";
        this.qq = "";
        this.gender = "";
        this.upCount = "";
        this.likeCollect = "";
        this.banCollect = "";
    }

    /*
     * clear detailed info of current class.
     * Email is kept
     */
    clear() {
        var isMe = this.uid === Me.uid;
        this.uid = "";
        this.passwd = "";
        this.token = "";
        this.name = "";
        this.qq = "";
        this.gender = "";
        this.upCount = "";
        this.likeCollect = "";
        this.banCollect = "";
        if (isMe) {
            setMeInfoToStorage("", "", this.email, "");
        }
    }

    /*
     * fetch the userinfo from server.
     */
    fetchInfo(callback = () => {}, isMe=false) {

        if (!this.uid && !isMe) {
            callback(false, "Unknown User.");
            return;
        }

        let uri = isMe ? "/User/me" : "/User/get";
        let param = isMe ? { token: this.token } : { uid: this.uid };
        HttpRequest(uri, param , (state, data) => {
            if (state) {
                this.uid = data.uid;
                this.name = data.name;
                this.email = data.email;
                this.qq = data.qq;
                this.gender = data.gender;
                this.upCount = data.up_count;
                this.likeCollect = data.like_collect;
                this.banCollect = data.ban_collect;
                callback(true, this);
            } else {
                callback(false, data);
            }
        });
    }

    /*
     * update userinfo to server.
     */
    setInfo(callback) {
        if (this.uid !== Me.uid) {
            callback(false, "Illegal Operation.");
            return;
        }
        let postData = {
            user: this.user,
            email: this.email,
            qq: this.qq,
            gender: this.gender
        }
        HttpRequest("/User/change_info", postData, (state, data) => {
            if (state) {
                callback(true, this);
            } else {
                callback(false, data);
            }
        });
    }
}

export var getMe = (callback) => {
    if (!Me.token) return;
    Me.fetchInfo((state, data) => {
        if (state) {
            setMeInfoToStorage(Me.uid, Me.token, Me.email, Me.name);
            callback(true, data);
        } else {
            setMeInfoToStorage("", "", Me.email, "");
            Me.clear();
            callback(false, data);
        }
    }, true);
}

export var login = (loginInfo, callback) => {
    Me.clear();
    if (!loginInfo.email) {
        callback(false, "Please input your email.");
        return;
    }
    Me.email = loginInfo.email;
    Me.passwd = loginInfo.passwd;

    let postData = {
        email: Me.email,
        password: Me.passwd,
    };

    HttpRequest("/User/login", postData, (state, data) => {
        if (state) {
            Me.token = data.token;
            getMe(callback);
        } else {
            callback(false, data);
        }
    });
}

export var savePlayInfo = (list, currentMusic, currentNum) => {
    localStorage.setItem("ibiu_list", JSON.stringify({
        list, currentMusic, currentNum
    }), (error) => {
        // Nothing
    });
}

export var getPlayInfo = () => {
    let list = [];
    let currentMusic = {
        title: "还没有音乐呐",
        sid: 0,
        length: 0,
    };
    let currentNum = 0;

    try {
        let myInfo = localStorage.getItem("ibiu_list");
        let myInfoJson = JSON.parse(myInfo);
        list = myInfoJson.list;
        currentMusic = myInfoJson.currentMusic;
        currentNum = myInfoJson.currentNum;
        return {list, currentMusic, currentNum};
    } catch (error) {
        return {list, currentMusic, currentNum};
    }
}

export var setMeInfoToStorage = (uid, token, email, name) => {
    localStorage.setItem("ibiu_me", JSON.stringify({
        uid: uid,
        token: token,
        email: email,
        name: name,
    }), (error) => {
        // Nothing
    });
}

export var getMeInfoFromStorage = () => {
    try {
        let myInfo = localStorage.getItem("ibiu_me");
        let myInfoJson = JSON.parse(myInfo);
        Me.uid = myInfoJson.uid;
        Me.name = myInfoJson.name;
        Me.token = myInfoJson.token;
        Me.email = myInfoJson.email;
        if (Me.email !== "") {
            console.log("Load User From Storage.");
        } else {
            console.log("No Local User Found.");
            Me.init();
        }
    } catch (error) {
        // Export Debugging Message
        console.log("No Local User Found.");
        Me.init();
    }
}

export var getCollects = (callback) => {
    if (!Me.token) { callback(false, "Login Required!"); return; }

    let param = {
        token: Me.token,
        uid: Me.uid
    };
    HttpRequest('/Collect/get', param, callback);
}

export var getOneCollect = (collect, callback) => {
    if (!Me.token) { callback(false, "Login Required!"); return; }

    let param = {
        token: Me.token,
        sid: collect.sids.join(",")
    };

    HttpRequest('/Song/get', param, callback);
}

Me = new User();
MusicController = new SuperMusicController();
getMeInfoFromStorage();
