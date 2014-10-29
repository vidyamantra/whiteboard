/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

(
    function (window){
    var screenShare = function (config){
        return {
            
            prevStream : false,
            init : function (screen){
                this.type = screen.type;
                this.ssByClick =  true;
                this.manualStop = false; 
                //if(vApp.gObj.uRole == 't' && !vApp.hasOwnProperty('repType')){
                if(vApp.gObj.uRole == 't' && !vApp.recorder.recImgPlay){
                    //if(!vApp.hasOwnProperty('repType')){
                    this.readyTostart(screen.app);
                    //}
                }else{
                    this._init();
                }
            },
            
            //called when user select the screen
            _init : function (){
                if(vApp.previous != config.id){
                    document.getElementById(vApp.previous).style.display = 'none';    
                    vApp.previous = config.id;
                }
                
                var ss = document.getElementById(config.id);
                if(ss != null){
                    ss.style.display = 'block';
                }
                
                if(!this.hasOwnProperty('id')){
                    this.dc = window.dirtyCorner;
                    this.sutil = window.sutil;
                    
                    this.postFix = "Cont";
                    this.id =  config.hasOwnProperty('id') ? config.id  : "vAppScreenShare";
                    this.className = "vmApp";
                    this.label = "Local",

                    this.local = this.id + this.label;
                    this.localTemp = this.id + this.label + "Temp";

                    this.classes =  config.hasOwnProperty('class') ? config.classes : "";

                    this.prevImageSlices = [];

                    var ssUI = this.html.UI.call(this, vApp.gObj.uRole);
                    
                    var beforeAppend = document.getElementById(vApp.rWidgetConfig.id);
                    document.getElementById(vApp.html.id).insertBefore(ssUI, beforeAppend);
                    
                   // if(vApp.gObj.uRole == 't' && !vApp.hasOwnProperty('repType')){
                    if(vApp.gObj.uRole == 't' && !vApp.recorder.recImgPlay){
                        this.localtempCanvas = document.getElementById(this.localTemp+"Video");
                        this.localtempCont =  this.localtempCanvas.getContext('2d');
                    }
                }
            },

            readyTostart : function (app){
                if(app == vApp.apps[1]){
                    this.getScreen();
                }else if(app == vApp.apps[2]){
                    this.wholeScreen(); 
                }
            },
            
            onError : function (e){
                console.log("Error " +  e);
            },

            getScreen : function (){
                window.postMessage({ type: 'getScreen'}, '*');
            },
            
            wholeScreen : function (){
                var  constraints = constraints || {audio: false, video: {
                    mandatory: {
                        chromeMediaSource: 'screen'
                    },

                    optional: [
                        {maxWidth: window.screen.width},
                        {maxHeight: window.screen.height},
                        {maxFrameRate: 3}
                    ]
                
                    }
                };
                
                
                if(typeof vApp.adpt != 'object'){
                    vApp.adpt = new vApp.adapter();
                }
               
                
                navigator =  vApp.adpt.init(navigator);
                navigator.getUserMedia(constraints, function (stream){
                    vApp.wss._init();   
                    vApp.wss.initializeRecorder.call(vApp.wss, stream);   
                }, function (e){
                    vApp.wss.onError.call(vApp.ss, e);   
                });
            
            },
            
            
            unShareScreen : function (){    
                this.video.src = "";
                this.localtempCont.clearRect(0, 0, this.localtempCanvas.width, this.localtempCanvas.height);
                clearInterval(vApp.clear);
                this.prevImageSlices = [];
                
                if(this.hasOwnProperty('currentStream')){
                    this.currentStream.stop(); 
                }
                
                vApp.wb.utility.beforeSend({'unshareScreen' : true, st : this.type});
            },
            
            removeStream : function(){
                this.localCont.clearRect(0, 0, this.localCanvas.width, this.localCanvas.height);
            },

            initializeRecorder : function (stream){

                if(this.prevStream){
                    this.ssByClick = false;
                }
                
                if(typeof vApp.prevApp != 'undefined'){
                    if(vApp.prevApp.hasOwnProperty('currentStream')){
                       vApp.prevApp.unShareScreen();
                    }
                }
                
                this.video = document.getElementById(this.local+"Video");

                this.currentStream = stream;
                 var that = this;

                vApp.adpt.attachMediaStream(this.video, stream);
                this.prevStream = true;
               
                this.currentStream.onended = function (name){
                    if(that.ssByClick){
                        that.video.src = "";
                        that.localtempCont.clearRect(0, 0, that.localtempCanvas.width, that.localtempCanvas.height);
                        clearInterval(vApp.clear);
                        that.prevImageSlices = [];
                        vApp.wb.utility.beforeSend({'unshareScreen' : true, st : that.type});
                        that.prevStream = false;
                        that.prevApp = "";
                    }else{
                        that.ssByClick = true;
                    }
                }
                
                
                var container = {};
                container.width = window.innerWidth;
                container.height = window.innerHeight - 140;

                var vidContainer = document.getElementById(this.local);
                
                var dimension =  this.html.getDimension(container);
                dimension.width = dimension.width - 100;
                
                vidContainer.style.width = Math.round(dimension.width) + "px";
                vidContainer.style.height = Math.round(dimension.height) + "px";

                //setStyleToElement(vidContainer, width, height);
                var that = this;
                this.video.onloadedmetadata = function (){
                    if(dimension.width < that.video.offsetWidth){
                        that.width = dimension.width;
                        that.height = dimension.height;
                        that.video.style.maxWidth = (that.width - 5)  + "px";
                    }else{
                        var video = document.getElementById(that.local+"Video");
                        that.width = video.clientWidth;
                        that.height = video.clientHeight;
                        
                    }
                    
                    that.localtempCanvas.width = that.width ;
                    that.localtempCanvas.height = that.height;
                    vApp.prevApp = that;
                    
                    var res = vApp.system.measureResoultion({'width': window.innerWidth, 'height': window.innerHeight});
                    
            
                    //that.initAfterImg();
                    that.sharing();
                    vApp.vutil.setContainerWidth(res);
                }
            },
            
            sharing : function (){
                var tempObj, encodedData, stringData, d, matched, imgData;
                this.latestScreen = [];
                
                var resA = Math.round(this.height/12);
                var resB = Math.round(this.width/12);

                this.imageSlices = this.dc.getImageSlices(resA, resB, this);
                var that = this;
                
                
                vApp.clear =  setInterval(
                    function (){
                        that.localtempCont.drawImage(that.video, 0, 0, that.width, that.height);
                        var sendobj = [];
                        for (sl=0; sl<(resA * resB); sl++) {
                                d = that.imageSlices[sl];
                                imgData = that.localtempCont.getImageData(d.x,d.y,d.w,d.h);
                            if(typeof that.prevImageSlices[sl] != 'undefined'){
                                 matched = that.dc.matchWithPrevious(imgData.data, that.prevImageSlices[sl], d.w);
                                if(!matched){
                                    //console.log("second");
                                    that.prevImageSlices[sl] = imgData.data;
                                    //conslice.putImageData(imgData, d.x, d.y);
                                    encodedData = that.dc.encodeRGB(imgData.data);
                                    stringData = vApp.vutil.ab2str(encodedData);

                                    tempObj = {'si' : stringData, 'd' : d};
                                    sendobj.push(tempObj);    
                                    that.latestScreen[sl] = tempObj; 
                                }
                            }else{
                                that.prevImageSlices[sl] = imgData.data;
                                encodedData = that.dc.encodeRGB(imgData.data);
                                stringData = vApp.vutil.ab2str(encodedData);
                                tempObj = {'si' : stringData, 'd' : d};
                                sendobj.push(tempObj);    
                                that.latestScreen[sl] = tempObj; 
                            }

                        }

                        if(sl ==  resA * resB){
                            if(sendobj.length > 0){
                                var encodedString = LZString.compressToBase64(JSON.stringify(sendobj));
                                var contDimension = that.getContainerDimension();
                                var madeTime = new Date().getTime();
                                var imgObj = {'si' : encodedString, 'st' : that.type, d : {w:that.width, h:that.height}, vc : {w:contDimension.width, h:contDimension.height}, mt : madeTime};
                                vApp.recorder.items.push(imgObj);
                                
//                                localStorage.recObjs = JSON.stringify(vApp.recorder.items);
                                
                               // var data = JSON.stringify(vApp.recorder.items);
                               // vApp.storage.wholeStore(JSON.stringify(vApp.recorder.items));
                               // vApp.rwitems = JSON.stringify(vApp.recorder.items);
                               
                                //vApp.storage.wholeStore(JSON.stringify(imgObj));
                                vApp.storage.wholeStore(imgObj);
                                //vApp.storage.wholeStore(JSON.stringify(vApp.recorder.items));
                                
                                vApp.wb.utility.beforeSend(imgObj);                                      
                                sendobj=[];
                            }
                        }
                    },
                    300
                );
            },
            
            getContainerDimension : function (){
                var vidCont = document.getElementById(this.id + "Local");
                return {width : vidCont.offsetWidth, height:vidCont.offsetHeight};
            },

            drawImages : function (rec){
                var imgDataArr = LZString.decompressFromBase64(rec);
                imgDataArr = JSON.parse(imgDataArr);
                for (i=0;i<imgDataArr.length;i++){
                     this.drawSingleImage(imgDataArr[i].si, imgDataArr[i].d);
                }
            },

            drawSingleImage : function(imgDataArr, d){
                var imgData = this.dc.decodeRGB(vApp.vutil.str2ab(imgDataArr), this.localCont, d);
                this.localCont.putImageData(imgData, d.x, d.y);
            },
            
            dimensionStudentScreen : function (msg, vtype){
                if(typeof this.vac == 'undefined'){
                    this.vac = true;
                    this.localCanvas = document.getElementById(vApp[app].local+"Video");
//                    if(typeof vtype == 'undefined'){
//                        this.localCanvas = document.getElementById(vApp[app].local+"Video");
//                    }else{
//                        this.localCanvas = document.getElementById(vApp[app].local+"TempVideo");
//                    }
                    this.localCont = vApp[app].localCanvas.getContext('2d');
                }
                
                this.localCanvas.width = msg.d.w;
                this.localCanvas.height = msg.d.h;
                
                if(msg.hasOwnProperty('vc')){
                    var vc  = document.getElementById(vApp[app].local);
                    vc.style.width = msg.vc.w + "px";
                    vc.style.height = msg.vc.h + "px";
                }
                
                if(vApp.previous != 'vAppWhiteboard'){
                    vApp.vutil.setScreenInnerTagsWidth(vApp.previous);
                }
            },
           
            html : {
                
               UI : function (user){
                   var mainCont =  vApp.vutil.createDOM("div", this.id, [this.className]);
                   var locVidCont =  vApp.vutil.createDOM("div", this.local, [this.label]);
                   if((user == 't')){
                       
                       //if(vApp.hasOwnProperty('repType')){
                       if(vApp.recorder.recImgPlay){
                           var vidCont =  vApp.vutil.createDOM("canvas", this.local+"Video");
                           //vidCont.setAttribute("autoplay", true);
                           
                       }else{
                           var vidCont =  vApp.vutil.createDOM("video", this.local+"Video");
                           vidCont.setAttribute("autoplay", true);
                       }
                       
                       css(locVidCont, "position:relative");
                       
                       //css(vidCont, "position : absolute; height : 99%");
                       css(vidCont, "position : absolute; height : 99%");
                       
                   }else{
                       var vidCont =  vApp.vutil.createDOM("canvas", this.local+"Video");
                   }
                   
                   //var vidCont =  vApp.vutil.createDOM("canvas", this.id+label+"Video");

                   locVidCont.appendChild(vidCont);
                   mainCont.appendChild(locVidCont);

                //   if(user == 't' && !vApp.hasOwnProperty('repType')){
                   if(user == 't' && !vApp.recorder.recImgPlay){ 
                       var locVidContTemp =  vApp.vutil.createDOM("div", this.localTemp);
                       var vidContTemp =  vApp.vutil.createDOM("canvas", this.localTemp+"Video");
                       locVidContTemp.appendChild(vidContTemp);
                       mainCont.appendChild(locVidContTemp);
                   }
                   
                   function css(element, styles){
                        if(typeof styles == 'string'){
                            element.style.cssText += ';' + styles;
                        }
                   }
                   return mainCont;
               },
               
               getDimension : function (container, aspectRatio){
                   var aspectRatio = aspectRatio || (3 / 4),
                        height = (container.width * aspectRatio),
                        res = {};

                    if (height > container.height) {
                        return {
                            height: container.height,
                            width: container.height / aspectRatio
                        };
                    } else {
                        return {
                            width: container.width,
                            height: container.width * aspectRatio
                        };
                    }
               },
               
            },
            
            sendPackets : function (user){
                var encodedString = LZString.compressToBase64(JSON.stringify(this.latestScreen));
                var contDimension = this.getContainerDimension();
                vApp.wb.utility.beforeSend({'resimg' : true, 'si' : encodedString, 'st' : this.type, d : {w:this.width, h:this.height}, vc : {w:contDimension.width, h:contDimension.height}, 'byRequest' : user });                                      
            }
        }
    }
    
    window.screenShare  = screenShare;
        
})(window);