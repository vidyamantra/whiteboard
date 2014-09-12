// This file is part of Vidyamantra - http:www.vidyamantra.com/
/**@Copyright 2014  Vidyamantra Edusystems. Pvt.Ltd.
 * @author  Suman Bogati <http://www.vidyamantra.com>
  */
(
    function(window) {
        
        _replay = function() {
            return {
                init: function(repMode) {
                    var vcan = vApp.wb.vcan;
                    this.objs = vcan.getStates('replayObjs');
                    this.objNo = 0;
                    this.repMode = repMode;
                    this.callBkfunc = "";
                },
                renderObj: function(myfunc) {
                    vApp.wb.drawMode = true;
                    wbRep = vApp.wb.replay;
                    if (typeof wbRep.objs[wbRep.objNo] == 'undefined') {
                        console.log("is this happend");
                        return;
                    }

                    if (typeof myfunc != 'undefined') {
                        wbRep.callBkfunc = myfunc;
                    }

                    if (wbRep.objs[wbRep.objNo].hasOwnProperty('cmd')) {
                        vApp.wb.gObj.displayedObjId = wbRep.objs[wbRep.objNo].uid;
                        vApp.wb.toolInit(wbRep.objs[wbRep.objNo].cmd, 'fromFile', true);
                    } else {
                        var event = "";
                        if (wbRep.objs[wbRep.objNo].ac == 'd') {
                            event = 'mousedown';
                        } else if ((wbRep.objs[wbRep.objNo].ac == 'm')) {
                            event = 'mousemove';
                        } else if (wbRep.objs[wbRep.objNo].ac == 'u') {
                            event = 'mouseup';
                        }

                        var currObj = wbRep.objs[wbRep.objNo];

                        if (currObj.hasOwnProperty('mtext')) {
                            var eventObj = {detail: {cevent: {x: currObj.x, y: currObj.y, mtext: currObj.mtext}}};
                        } else {
                            var eventObj = {detail: {cevent: {x: currObj.x, y: currObj.y}}};
                        }

                        vApp.wb.gObj.displayedObjId = wbRep.objs[wbRep.objNo].uid;
                        var eventConstruct = new CustomEvent(event, eventObj); //this is not supported for ie9 and older ie browsers
                        vcan.main.canvas.dispatchEvent(eventConstruct);
                    }

                    if (typeof wbRep.callBkfunc == 'function') {
                        if (wbRep.objs[wbRep.objs.length - 1].uid == vApp.wb.gObj.displayedObjId) {
                            wbRep.callBkfunc('callBkfunc');
                        }
                    }

                    if (typeof wbRep.objs[wbRep.objNo + 1] == 'object') {
                        
                        if (typeof wbRep.repMode != 'undefined' && wbRep.repMode == 'fromBrowser') {
                            vApp.wb.replayTime = 0;
                        }else{
//                            vApp.wb.replayTime = wbRep.objs[wbRep.objNo + 1].mt - wbRep.objs[wbRep.objNo].mt;
                            
                            if(wbRep.objNo == 0){
                                vApp.wb.replayTime =  wbRep.objs[wbRep.objNo].mt - vApp.wb.pageEnteredTime;
                            }else{
                                vApp.wb.replayTime = wbRep.objs[wbRep.objNo + 1].mt - wbRep.objs[wbRep.objNo].mt;
                            }
                           // vApp.wb.replayTime =  vApp.wb.pageEnteredTime - wbRep.objs[wbRep.objNo].mt;
                        }
                 
                        wbRep.objNo++;
                        
                        console.log("replay time " + vApp.wb.replayTime);
                        setTimeout(wbRep.renderObj, vApp.wb.replayTime);
                    }
                    return;
                }
            }
        }
        
        window._replay = _replay;
    }
)(window);
