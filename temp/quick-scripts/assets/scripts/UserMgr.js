(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/UserMgr.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '74d78JBqHdDKY6hckY2YuL+', 'UserMgr', __filename);
// scripts/UserMgr.js

"use strict";

cc.Class({
    extends: cc.Component,
    properties: {
        account: null,
        userId: null,
        userName: null,
        lv: 0,
        exp: 0,
        coins: 0,
        gems: 0,
        sign: 0,
        ip: "",
        sex: 0,
        roomData: null,

        oldRoomId: null
    },

    // 该函数负责处理账号数据为空的情况
    guestAuth: function guestAuth() {
        var account = cc.args["account"]; // 获取url地址栏中的账户参数
        if (account == null) {
            account = cc.sys.localStorage.getItem("account");
        }

        if (account == null) {
            account = Date.now();
            cc.sys.localStorage.setItem("account", account);
        }

        cc.vv.http.sendRequest("/guest", { account: account }, this.onAuth);
    },

    // 这个函数是游客身份验证请求的回调
    onAuth: function onAuth(ret) {
        var self = cc.vv.userMgr;
        if (ret.errcode !== 0) {
            console.log(ret.errmsg);
        } else {
            // 返回账号和签名信息
            self.account = ret.account;
            self.sign = ret.sign;
            cc.vv.http.url = "http://" + cc.vv.SI.hall;
            self.login();
        }
    },

    // 该函数在成功进行游客身份验证后处理登录过程
    login: function login() {
        var self = this;
        var onLogin = function onLogin(ret) {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            } else {
                // 判断账号id是否存在
                if (!ret.userid) {
                    // 进入创建账号场景
                    cc.director.loadScene("createrole");
                } else {
                    // 存在就进入大厅
                    console.log(ret);
                    self.account = ret.account;
                    self.userId = ret.userid;
                    self.userName = ret.name;
                    self.lv = ret.lv;
                    self.exp = ret.exp;
                    self.coins = ret.coins;
                    self.gems = ret.gems;
                    self.roomData = ret.roomid;
                    self.sex = ret.sex;
                    self.ip = ret.ip;
                    cc.director.loadScene("hall");
                }
            }
        };
        cc.vv.wc.show("正在登录游戏");

        // 将账号和签名传入进行登录
        cc.vv.http.sendRequest("/login", { account: this.account, sign: this.sign }, onLogin);
    },

    create: function create(name) {
        var self = this;
        var onCreate = function onCreate(ret) {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            } else {
                self.login();
            }
        };

        var data = {
            account: this.account,
            sign: this.sign,
            name: name
        };
        cc.vv.http.sendRequest("/create_user", data, onCreate);
    },

    enterRoom: function enterRoom(roomId, callback) {
        var self = this;
        var onEnter = function onEnter(ret) {
            if (ret.errcode !== 0) {
                if (ret.errcode == -1) {
                    setTimeout(function () {
                        self.enterRoom(roomId, callback);
                    }, 5000);
                } else {
                    cc.vv.wc.hide();
                    if (callback != null) {
                        callback(ret);
                    }
                }
            } else {
                cc.vv.wc.hide();
                if (callback != null) {
                    callback(ret);
                }
                cc.vv.gameNetMgr.connectGameServer(ret);
            }
        };

        var data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            roomid: roomId
        };
        cc.vv.wc.show("正在进入房间 " + roomId);
        cc.vv.http.sendRequest("/enter_private_room", data, onEnter);
    },
    getHistoryList: function getHistoryList(callback) {
        var self = this;
        var onGet = function onGet(ret) {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            } else {
                console.log(ret.history);
                if (callback != null) {
                    callback(ret.history);
                }
            }
        };

        var data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign
        };
        cc.vv.http.sendRequest("/get_history_list", data, onGet);
    },
    getGamesOfRoom: function getGamesOfRoom(uuid, callback) {
        var self = this;
        var onGet = function onGet(ret) {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            } else {
                console.log(ret.data);
                callback(ret.data);
            }
        };

        var data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            uuid: uuid
        };
        cc.vv.http.sendRequest("/get_games_of_room", data, onGet);
    },

    getDetailOfGame: function getDetailOfGame(uuid, index, callback) {
        var self = this;
        var onGet = function onGet(ret) {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            } else {
                console.log(ret.data);
                callback(ret.data);
            }
        };

        var data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            uuid: uuid,
            index: index
        };
        cc.vv.http.sendRequest("/get_detail_of_game", data, onGet);
    }
});

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=UserMgr.js.map
        