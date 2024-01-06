cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        bgmVolume:1.0,
        sfxVolume:1.0,
        
        bgmAudioID:-1,
    },

    // use this for initialization
    init: function () {
        var t = cc.sys.localStorage.getItem("bgmVolume");
        if(t != null){
            this.bgmVolume = parseFloat(t);    
        }
        
        var t = cc.sys.localStorage.getItem("sfxVolume");
        if(t != null){
            this.sfxVolume = parseFloat(t);    
        }
        
        cc.game.on(cc.game.EVENT_HIDE, function () {
            console.log("cc.audioEngine.pauseAll");
            cc.audioEngine.pauseAll();
        });
        cc.game.on(cc.game.EVENT_SHOW, function () {
            console.log("cc.audioEngine.resumeAll");
            cc.audioEngine.resumeAll();
        });
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
    
    getUrl:function(url){
        return cc.url.raw("resources/sounds/" + url);
    },
    
    playBGM(url){
        var audioUrl = this.getUrl(url);
        console.log(audioUrl);
        if(this.bgmAudioID >= 0){
            cc.audioEngine.stop(this.bgmAudioID);
        }

        // 注意：在使用loader加载资源时url路径前面会自动拼接 resources/ 
        cc.loader.loadRes(`sounds/${url.split('.')[0]}`, (err, clip) => {
            if (err) {
                console.error(err.message || err);
                return;
            }
            // 播放音乐文件  第一个参数音频clip文件
            // 第二个是否循环播放
            // 第三个音量
            // 该方法返回一个音频播放的标识符 这个标识符可以用于后续控制音频的状态，比如停止播放、暂停、继续播放等
            this.bgmAudioID = cc.audioEngine.play(clip,true,this.bgmVolume); 
        });
    },
    
    playSFX(url){
        var audioUrl = this.getUrl(url);
        if(this.sfxVolume > 0){
            var audioId = cc.audioEngine.play(audioUrl,false,this.sfxVolume);    
        }
    },
    
    setSFXVolume:function(v){
        if(this.sfxVolume != v){
            cc.sys.localStorage.setItem("sfxVolume",v);
            this.sfxVolume = v;
        }
    },
    
    setBGMVolume:function(v,force){
        if(this.bgmAudioID >= 0){
            if(v > 0){
                cc.audioEngine.resume(this.bgmAudioID);
            }
            else{
                cc.audioEngine.pause(this.bgmAudioID);
            }
            //cc.audioEngine.setVolume(this.bgmAudioID,this.bgmVolume);
        }
        if(this.bgmVolume != v || force){
            cc.sys.localStorage.setItem("bgmVolume",v);
            this.bgmVolume = v;
            cc.audioEngine.setVolume(this.bgmAudioID,v);
        }
    },
    
    pauseAll:function(){
        cc.audioEngine.pauseAll();
    },
    
    resumeAll:function(){
        cc.audioEngine.resumeAll();
    }
});
