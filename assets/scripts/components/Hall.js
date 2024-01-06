var Net = require("Net")
var Global = require("Global")
cc.Class({
    extends: cc.Component,

    properties: {
        lblName:cc.Label, // 玩家名称
        lblMoney:cc.Label, // 钱
        lblGems:cc.Label, // 房卡
        lblID:cc.Label, // 玩家id
        lblNotice:cc.Label,
        joinGameWin:cc.Node,
        createRoomWin:cc.Node,
        settingsWin:cc.Node,
        helpWin:cc.Node,
        xiaoxiWin:cc.Node,
        btnJoinGame:cc.Node, // 加入房间按钮
        btnReturnGame:cc.Node, // 返回房间按钮
        sprHeadImg:cc.Sprite,
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },
    
    initNetHandlers:function(){
        var self = this;
    },
    
    onShare:function(){
        cc.vv.anysdkMgr.share("天天麻将","天天麻将，包含了血战到底、血流成河等多种四川流行麻将玩法。");   
    },

    // use this for initialization
    onLoad: function () {
        cc.vv.utils.setFitSreenMode();
        this.initLabels();
        
        // 判断用户是否还有正在进行游戏的房间
        if(cc.vv.gameNetMgr.roomId == null){
            this.btnJoinGame.active = true;
            this.btnReturnGame.active = false;
        }
        else{
            this.btnJoinGame.active = false;
            this.btnReturnGame.active = true;
        }
        
        var roomId = cc.vv.userMgr.oldRoomId 
        if( roomId != null){
            cc.vv.userMgr.oldRoomId = null;
            cc.vv.userMgr.enterRoom(roomId);
        }
        
        var imgLoader = this.sprHeadImg.node.getComponent("ImageLoader"); // 每个节点中的组件上都有.node方法可以获取当前组件的节点
        imgLoader.setUserID(cc.vv.userMgr.userId); // 设置大厅头像用户信息
        cc.vv.utils.addClickEvent(this.sprHeadImg.node,this.node,"Hall","onBtnClicked"); // 给当前用户头像添加点击事件
        
        
        this.addComponent("UserInfoShow"); // 添加用户信息显示脚本组件(cocos会默认从scripts目录下查找所有的匹配脚本)
        
        // 初始化大厅右上角按钮点击事件等
        this.initButtonHandler("Canvas/right_bottom/btn_shezhi");
        this.initButtonHandler("Canvas/right_bottom/btn_help");
        this.initButtonHandler("Canvas/right_bottom/btn_xiaoxi");
        this.helpWin.addComponent("OnBack");
        this.xiaoxiWin.addComponent("OnBack");
        
        if(!cc.vv.userMgr.notice){
            cc.vv.userMgr.notice = {
                version:null,
                msg:"数据请求中...",
            }
        }
        
        if(!cc.vv.userMgr.gemstip){
            cc.vv.userMgr.gemstip = {
                version:null,
                msg:"数据请求中...",
            }
        }
        
        this.lblNotice.string = cc.vv.userMgr.notice.msg;
        
        // 获取大厅房卡、提示信息、公共数据等
        this.refreshInfo();
        this.refreshNotice();
        this.refreshGemsTip();
        
        cc.vv.audioMgr.playBGM("bgMain.mp3");

        cc.vv.utils.addEscEvent(this.node);
    },
    
    refreshInfo:function(){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode !== 0){
                console.log(ret.errmsg);
            }
            else{
                if(ret.gems != null){
                    this.lblGems.string = ret.gems;    
                }
            }
        };
        
        var data = {
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
        };
        cc.vv.http.sendRequest("/get_user_status",data,onGet.bind(this));
    },
    
    refreshGemsTip:function(){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode !== 0){
                console.log(ret.errmsg);
            }
            else{
                cc.vv.userMgr.gemstip.version = ret.version;
                cc.vv.userMgr.gemstip.msg = ret.msg.replace("<newline>","\n");
            }
        };
        
        var data = {
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
            type:"fkgm",
            version:cc.vv.userMgr.gemstip.version
        };
        cc.vv.http.sendRequest("/get_message",data,onGet.bind(this));
    },
    
    refreshNotice:function(){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode !== 0){
                console.log(ret.errmsg);
            }
            else{
                cc.vv.userMgr.notice.version = ret.version;
                cc.vv.userMgr.notice.msg = ret.msg;
                this.lblNotice.string = ret.msg;
            }
        };
        
        var data = {
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
            type:"notice",
            version:cc.vv.userMgr.notice.version
        };
        cc.vv.http.sendRequest("/get_message",data,onGet.bind(this));
    },
    
    initButtonHandler:function(btnPath){
        var btn = cc.find(btnPath);
        cc.vv.utils.addClickEvent(btn,this.node,"Hall","onBtnClicked");        
    },
    
    
    
    initLabels:function(){
        this.lblName.string = cc.vv.userMgr.userName;
        this.lblMoney.string = cc.vv.userMgr.coins;
        this.lblGems.string = cc.vv.userMgr.gems;
        this.lblID.string = "ID:" + cc.vv.userMgr.userId;
    },
    
    onBtnClicked:function(event){
        // event.target.name事件触发来源的组件名
        if(event.target.name == "btn_shezhi"){
            this.settingsWin.active = true;
        }   
        else if(event.target.name == "btn_help"){
            this.helpWin.active = true;
        }
        else if(event.target.name == "btn_xiaoxi"){
            this.xiaoxiWin.active = true;
        }
        else if(event.target.name == "head"){
            // 显示用户信息界面
            cc.vv.userinfoShow.show(cc.vv.userMgr.userName,cc.vv.userMgr.userId,this.sprHeadImg,cc.vv.userMgr.sex,cc.vv.userMgr.ip);
        }
    },
    
    onJoinGameClicked:function(){
        this.joinGameWin.active = true;
    },
    
    onReturnGameClicked:function(){
        cc.vv.wc.show('正在返回游戏房间');
        cc.director.loadScene("mjgame");  
    },
    
    onBtnAddGemsClicked:function(){
        cc.vv.alert.show("提示",cc.vv.userMgr.gemstip.msg,function(){
            this.onBtnTaobaoClicked();
        }.bind(this));
        this.refreshInfo();
    },
    
    // 创建房间
    onCreateRoomClicked:function(){
        // 判断当前用户是否有正在进行游戏的房间
        if(cc.vv.gameNetMgr.roomId != null){
            cc.vv.alert.show("提示","房间已经创建!\n必须解散当前房间才能创建新的房间");
            return;
        }
        console.log("onCreateRoomClicked");
        this.createRoomWin.active = true;   
    },
    
    onBtnTaobaoClicked:function(){
        cc.sys.openURL('https://shop596732896.taobao.com/');
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        var x = this.lblNotice.node.x;
        x -= dt*100;
        if(x + this.lblNotice.node.width < -1000){
            x = 500;
        }
        this.lblNotice.node.x = x;
        
        if(cc.vv && cc.vv.userMgr.roomData != null){
            cc.vv.userMgr.enterRoom(cc.vv.userMgr.roomData);
            cc.vv.userMgr.roomData = null;
        }
    },
});
