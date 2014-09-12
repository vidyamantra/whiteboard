/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

(
    function (window){
        //prevStream = false;
    var screenShare = function (config){
        
        return {
            prevStream : false,
            init : function (ssc){
               
                this.ssByClick =  true;
                //this.ssc = ssc;   
                this.manualStop = false;
                if(vApp.wb.gObj.uRole == 't'){
                    this.readyTostart();
                }else{
                    this._init();
                }
            },
            
            //called when user select the screen
            _init : function (){
                
                if(vApp.previous != vApp.ssConfig.id){
                    document.getElementById(vApp.previous).style.display = 'none';    
                    vApp.previous = vApp.ssConfig.id;
                }
                var ss = document.getElementById(vApp.ssConfig.id);
                if(ss != null){
                    ss.style.display = 'block';
                }

                if(!vApp.ss.hasOwnProperty('id')){
                    //if(vApp.wb.gObj.uRole == 't'){
                        
                        vApp.ss.dc = window.dirtyCorner;
                        vApp.ss.sutil = window.sutil;
                    //}
                    
                    this.postFix = "Cont";
                    this.id =  config.hasOwnProperty('id') ? config.id  : "vAppscreenShare";
                    this.className = "vmApp";
                    this.label = "Local",

                    this.local = this.id + this.label;
                    this.localTemp = this.id + this.label + "Temp";

                    this.classes =  config.hasOwnProperty('class') ? config.classes : "";

                    this.prevImageSlices = [];

                    var ssUI = this.html.UI.call(this, vApp.wb.gObj.uRole);
                    //document.getElementById(vApp.html.id).appendChild(ssUI);
                    
                    var beforeAppend = document.getElementById(vApp.rWidgetConfig.id);
                    document.getElementById(vApp.html.id).insertBefore(ssUI, beforeAppend);
                    
                    
                    if(vApp.wb.gObj.uRole == 't'){
                        this.localtempCanvas = document.getElementById(vApp.ss.localTemp+"Video");
                        this.localtempCont =  this.localtempCanvas.getContext('2d');
                    }
                }
            },

            readyTostart : function (){
                this.getScreen();
            },
            
            onError : function (e){
                console.log("Error " +  e);
            },

            //works only for chrome
            getScreen : function (){
                window.postMessage({ type: 'getScreen'}, '*');
            },
            
            unShareScreen : function (){    
                this.video.src = "";
                this.localtempCont.clearRect(0, 0, this.localtempCanvas.width, this.localtempCanvas.height);
                clearInterval(vApp.clear);
                this.prevImageSlices = [];
                
                if(this.hasOwnProperty('currentStream')){
                    this.currentStream.stop(); 
                }
                
                io.send({'unshareScreen' : true});
            },
            
            removeStream : function(){
                this.localCont.clearRect(0, 0, this.localCanvas.width, this.localCanvas.height);
            },

            initializeRecorder : function (stream){
//                if(typeof prevStream != 'undefined'){
//                    myFlag = false;
//                }

                if(this.prevStream){
                    this.ssByClick = false;
                }
                
                if(this.hasOwnProperty('currentStream')){
                    this.unShareScreen();
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
                        io.send({'unshareScreen' : true});
                        that.prevStream = false;
                    }else{
                        that.ssByClick = true;
                    }
                    
                    //that.currentStream.stop();
//                    that.video.src = "";
//                    that.localtempCont.clearRect(0, 0, that.localtempCanvas.width, that.localtempCanvas.height);
//                    clearInterval(vApp.clear);
                    //this.stop();
                    
//                    if(!that.manualStop){
//                        that.unShareScreen();
//                    }
                }
                //var elements = $('#videoContainer');
                var container = {};
                container.width = window.innerWidth;
                container.height = window.innerHeight - 140;
                
                var vidContainer = document.getElementById('vAppscreenShareLocal');
                
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
                          console.log("clientWidth " + that.video.clientWidth);
//                        console.log("clientHeight " + that.video.clientHeight);
                        var video = document.getElementById(that.local+"Video");
                        that.width = video.clientWidth;
                        that.height = video.clientHeight;
                        
                    }
                    
                    that.localtempCanvas.width = that.width ;
                    that.localtempCanvas.height = that.height;
                    that.initAfterImg();
                }
            },
            
            initAfterImg : function (){
                var resA = Math.round(this.height/12);
                var resB = Math.round(this.width/12);

                var imageSlices = this.dc.getImageSlices(resA, resB);
                var that = this;
                vApp.clear =  setInterval(
                    function (){
                        that.localtempCont.drawImage(that.video, 0, 0, that.width, that.height);
                        console.log("this is happend first time ");
                        var sendobj = [];
                        for (sl=0; sl<(resA * resB); sl++) {
                            var d = imageSlices[sl];
                            var imgData = that.localtempCont.getImageData(d.x,d.y,d.w,d.h);
                            if(typeof that.prevImageSlices[sl] != 'undefined'){
                                var matched = that.dc.matchWithPrevious(imgData.data, that.prevImageSlices[sl], d.w);
                                if(!matched){
                                    that.prevImageSlices[sl] = imgData.data;
                                    //conslice.putImageData(imgData, d.x, d.y);
                                    var encodedData = that.dc.encodeRGB(imgData.data);
                                    var stringData = that.sutil.ab2str(encodedData);
                                    sendobj.push({'ssbyimage' : stringData, 'des' : d});
                                }
                            }else{
                                that.prevImageSlices[sl] = imgData.data;
                                var encodedData = that.dc.encodeRGB(imgData.data);
                                var stringData = that.sutil.ab2str(encodedData);
                                sendobj.push({'ssbyimage' : stringData, 'des' : d});    
                            }

                        }

                        if(sl ==  resA * resB){
                            if(sendobj.length > 0){
                                var encodedString = LZString.compressToBase64(JSON.stringify(sendobj));
                                var contDimension = that.getContainerDimension();
                                io.send({'ssbyimage' : encodedString, d : {w:that.width, h:that.height}, vc : {w:contDimension.width, h:contDimension.height}   });       
                              
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
                //var imgDataArr  = str2ab(decodedString);
                for (i=0;i<imgDataArr.length;i++){
                     this.drawSingleImage(imgDataArr[i].ssbyimage, imgDataArr[i].des);
                }
            },

            drawSingleImage : function(imgDataArr, d){
                var imgData = this.dc.decodeRGB(this.sutil.str2ab(imgDataArr), vApp.ss.localCont, d);
                vApp.ss.localCont.putImageData(imgData, d.x, d.y);
            },

            html : {
                
               UI : function (user){
                   
                   var mainCont =  vApp.vutil.createDOM("div", this.id, [this.className]);
                   
                   var locVidCont =  vApp.vutil.createDOM("div", this.local);
                   
                   
                   if((user == 't')){
                       var vidCont =  vApp.vutil.createDOM("video", this.local+"Video");
                       vidCont.setAttribute("autoplay", true);
                       css(locVidCont, "position:relative");
                       css(vidCont, "position : absolute; height : 99%");
                   }else{
                       var vidCont =  vApp.vutil.createDOM("canvas", this.local+"Video");
                   }
                   
                   

                   //var vidCont =  vApp.vutil.createDOM("canvas", this.id+label+"Video");

                   locVidCont.appendChild(vidCont);
                   mainCont.appendChild(locVidCont);

                   if(user == 't'){
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
               }
              
            },
        }
    }
    
    window.screenShare  = screenShare;
        
})(window);