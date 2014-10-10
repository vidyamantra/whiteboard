// This file is part of Vidyamantra - http:www.vidyamantra.com/
/**@Copyright 2014  Vidyamantra Edusystems. Pvt.Ltd.
 * @author  Suman Bogati <http://www.vidyamantra.com>
  */

(
    function(window) {
        var rObjs = localStorage.getItem('recObjs')
        var recorder = {
            items :  (rObjs != null) ? JSON.parse(rObjs) : [],
            recImgPlay : false,
            
            init: function(repMode, myfunc) {
                 var vcan = vApp.wb.vcan;
                 if(typeof myfunc != 'undefined'){
                     this.objs = vcan.getStates('replayObjs'); 
                 }else{
                     this.objs = recorder.items;
                 }
                 
                 this.objNo = 0;
                 this.repMode = repMode;
                 this.callBkfunc = "";
                 
                 vApp.ss = "";
                 vApp.wss = "";
                 
                 var allChildrens;
                 var screenShare = document.getElementById('vApp'+ vApp.apps[1]);
                 
                 if(screenShare != null){
                    screenShare.parentNode.removeChild(screenShare);
                 }
                 
                 var wholeScreenShare = document.getElementById('vApp'+ vApp.apps[2]);
                 
                 if(wholeScreenShare != null){
                     wholeScreenShare.parentNode.removeChild(wholeScreenShare);
                 }
             },
                
            renderObj : function(myfunc) {
                
                vApp.wb.drawMode = true;
                if (typeof this.objs[this.objNo] == 'undefined') {
                    console.log("is this happend");
                    return;
                }

                if (this.objs[this.objNo].hasOwnProperty('cmd')) {
                    vApp.wb.gObj.displayedObjId = this.objs[this.objNo].uid;
                    vApp.wb.toolInit(this.objs[this.objNo].cmd, 'fromFile', true);
                } else {
                    if(this.objs[this.objNo].hasOwnProperty('si')){
                        vApp.initStudentScreen(this.objs[this.objNo], "recImgPlay");
                        
                    }else{
                        if(vApp.previous != "vApp"+vApp.apps[0]){
                           document.getElementById('vApp' + vApp.apps[0]).style.display = 'block';
                           document.getElementById(vApp.previous).style.display = 'none';
                           vApp.previous =  "vApp"+vApp.apps[0] 
                        }
                        
                        var event = "";
                        if (this.objs[this.objNo].ac == 'd') {
                           
//                            var totalTime = this.objs[this.objNo].mt - vApp.wb.pageEnteredTime;
//                            console.log("bogatisuman " + totalTime);
                            
                            event = 'mousedown';
                        } else if ((this.objs[this.objNo].ac == 'm')) {
                            event = 'mousemove';
                        } else if (this.objs[this.objNo].ac == 'u') {
                            event = 'mouseup';
                        }

                        var currObj = this.objs[this.objNo];

                        if (currObj.hasOwnProperty('mtext')) {
                            var eventObj = {detail: {cevent: {x: currObj.x, y: currObj.y, mtext: currObj.mtext}}};
                        } else {
                            var eventObj = {detail: {cevent: {x: currObj.x, y: currObj.y}}};
                        }
                        
                        if(this.objs[this.objNo].hasOwnProperty('uid')){
                            vApp.wb.gObj.displayedObjId = this.objs[this.objNo].uid;
                            var eventConstruct = new CustomEvent(event, eventObj); //this is not supported for ie9 and older ie browsers
                            vcan.main.canvas.dispatchEvent(eventConstruct);
                        }
                    }
                }

                if (typeof this.objs[this.objNo + 1] == 'object') {
                    if (typeof this.repMode != 'undefined' && this.repMode == 'fromBrowser') {
                        vApp.wb.replayTime = 0;
                    }else{
                        if(this.objNo == 0){
                            vApp.wb.replayTime =  this.objs[this.objNo].mt - vApp.wb.pageEnteredTime;
                        }else{
                            vApp.wb.replayTime = this.objs[this.objNo + 1].mt - this.objs[this.objNo].mt;
                        }
                    }

                    this.objNo++;
                    var that = this;
                    setTimeout(function (){
                        that.renderObj.call(that);
                    }, vApp.wb.replayTime);
                }
                return;
            }
        };
        window.recorder = recorder;
    }
)(window);