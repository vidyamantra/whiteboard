// This file is part of Vidyamantra - http:www.vidyamantra.com/
/**@Copyright 2014  Vidyamantra Edusystems. Pvt.Ltd.
 * @author  Suman Bogati <http://www.vidyamantra.com>
  */
(
    function(window) {
        var response = {
            reclaimRole: function(formUserId, id) {
                if (formUserId != id) {
                    vApp.wb.utility.removeToolBox();
                    vApp.wb.utility.makeCanvasDisable();
                    if (typeof localStorage.teacherId != 'undefined') {
                        localStorage.removeItem('teacherId');
                    }

                    vApp.wb.utility.uniqueArrOfObjsToStudent();

                    vApp.wb.view.disappearBox('Canvas');
                    vApp.wb.view.disappearBox('drawArea');

                    var canvasWrapper = document.getElementById("vcanvas");
                    canvasWrapper.className = canvasWrapper.className.replace(/\bteacher\b/, ' ');

                    canvasWrapper.className = 'student';
                    localStorage.setItem('canvasDrwMsg', true);

                    if (!vApp.vutil.chkValueInLocalStorage('orginialTeacherId')) {
                        vApp.wb.utility.setCommandToolHeights(toolHeight, 'decrement');
                    }

                } else {
                    if (vApp.vutil.chkValueInLocalStorage('orginialTeacherId')) {
                        var toolHeight = localStorage.getItem('toolHeight');
                        vApp.wb.utility.setCommandToolHeights(toolHeight, 'increment');
                    }

                    vApp.wb.utility.uniqueArrOfObjsToTeacher();
                    var canvasWrapper = document.getElementById("vcanvas");
                    canvasWrapper.className = canvasWrapper.className.replace(/\bstudent\b/, ' ');
                    canvasWrapper.className = 'teacher';
                    localStorage.canvasDrwMsg = true;
                    
                    //vApp.wb.utility.setStyleUserConnetion('coff', 'con');
                    
                }
            },
            assignRole: function(fromUserId, id, socket, toolHeight) {
                if (fromUserId != id) {
                    vApp.wb.socketOn = parseInt(socket);
                    vApp.wb.utility.setClass('vcanvas', 'socketon');
                    vApp.wb.utility.assignRole(id);
                    vApp.wb.utility.uniqueArrOfObjsToTeacher();

                    if (!vApp.vutil.chkValueInLocalStorage('canvasDrwMsg')) {
                        window.vApp.wb.view.canvasDrawMsg('Canvas');
                        window.vApp.wb.view.drawLabel('drawArea');
                        localStorage.setItem('canvasDrwMsg', true);
                    }

                    var canvasWrapper = document.getElementById("vcanvas");
                    canvasWrapper.className = canvasWrapper.className.replace(/\bstudent\b/, ' ');
                    canvasWrapper.className = 'teacher';

                  //  vApp.wb.user.connected = true;

                    var toolHeight = localStorage.getItem('toolHeight');
                    vApp.wb.utility.setCommandToolHeights(toolHeight, 'increment');
                    
                    //vApp.wb.utility.setStyleUserConnetion('coff', 'con', 'fromAssign');

                } else {
                    vApp.wb.utility.uniqueArrOfObjsToStudent();
                    if (!vApp.vutil.chkValueInLocalStorage('orginalTeacherId')) {
                        var canvasWrapper = document.getElementById("vcanvas");
                        canvasWrapper.className = canvasWrapper.className.replace(/\bteacher\b/, ' ');
                        canvasWrapper.className = 'student';
                    }
                    if (localStorage.getItem('orginialTeacherId') == null) {
                        vApp.wb.utility.setCommandToolHeights(toolHeight, 'decrement');
                    }

                    localStorage.setItem('canvasDrwMsg', true);
                }
            },
//            videoInit: function(fromUserId, id) {
//                if (fromUserId != id) {
//                    if (!vApp.wb.videoAdd) {
//                        vApp.wb.utility.beforeSend({'foundVideo': false});
//                    } else {
//                        vApp.wb.utility.beforeSend({'foundVideo': true, 'fromUser': fromUserId});
//                    }
//                }
//            },
//            foundVideo: function(foundVideo, formUserId) {
//                (!foundVideo) ? window.isVideoFound(false, formUserId) : window.isVideoFound(true, formUserId);
//            },
            
            checkUser: function(e, id, storageHasTeacher) {
                
//                var joinId = e.message.joinId;
//                vApp.wb.joinUserId = joinId;
//                var alreadyExist = vApp.wb.utility.existUserLikeMe(e);
//                if ((e.fromUser.userid == id && e.fromUser.userid == joinId)) {
//                    setTimeout(
//                            function() {
//                                alreadyExist = vApp.wb.utility.existUserLikeMe(e);
//                                  // aug
////                                if (alreadyExist) {
////                                    var canvasContainer = document.getElementById('containerWb');
////                                    canvasContainer.parentNode.removeChild(canvasContainer);
////                                    alert('Either Teacher Or Student is already existed, \nIt\'s also possible there other role is passing');
////                                    io.disconnect();
////                                    return 'disconnect';
////                                } else {
////                                    vApp.wb.utility.shareVideoInformation(e, storageHasTeacher);
////                                    vApp.wb.utility.makeUserAvailable(e.message.checkUser.e.clientLen);
////                                    if (vApp.wb.user.connected && !vApp.wb.drawMode) {
////                                        vApp.wb.utility.makeCanvasEnable();
////                                    }
////                                }
//                                    vApp.wb.utility.shareVideoInformation(e, storageHasTeacher);
//                                    vApp.wb.utility.makeUserAvailable(e.message.checkUser.e.clientLen);
//                                    if (vApp.wb.user.connected && !vApp.wb.drawMode) {
//                                        vApp.wb.utility.makeCanvasEnable();
//                                    }
//                            }, 1000  //time may increased according to server response
//                            );
//                } else {
//                    vApp.wb.utility.makeUserAvailable(e.message.checkUser.e.clientLen);
//                }
                var joinId = e.message.joinId;
                if ((typeof vcan.teacher == 'undefined') && (!storageHasTeacher) && (e.fromUser.userid == id) && (e.fromUser.userid == joinId)) {
                    vApp.wb.utility.makeCanvasDisable();
                }
                
                if (e.fromUser.userid == id ){
                    vApp.wb.utility.initDefaultInfo(e, wbUser.role);
                    
                    //vApp.wb.utility.makeCanvasEnable();
                    
                    vApp.wb.utility.makeUserAvailable(e.message.checkUser.e.clientLen);
                }
                
                
                
                
                
             //   vApp.wb.utility.makeUserAvailable(e.message.checkUser.e.clientLen);
            },
            
//            createPeer: function(currObj, peerObj, id) {
//                vApp.gObj.video.currBrowser = currObj;
//                vApp.gObj.video.peerBrowser = peerObj;
//
//                if (vApp.gObj.video.currBrowser == id) {
//                    if (typeof oneExecuted == 'undefined') {
//                        oneExecuted = true; //TODO this should be wrapper with some object
//                        vApp.wb.utility.beforeSend({'isChannelReady': true});
//                        vApp.gObj.video.init(true);
//                        vApp.gObj.video.toUser = vApp.gObj.video.peerBrowser;
//                    }
//                } else {
//                    cthis.isStarted = false;
//                }
//
//            },
            
            video: function(formUserId, id, msgVideo) {
                var video = vApp.gObj.video;
                if (typeof video != 'undefined') {
                    if (msgVideo == 'bye') {
                        if (formUserId != id) {
                           // vApp.gObj.video.videoOnMsg(msgVideo, formUserId);
                        }
                    } else {
                        // vApp.gObj.video.videoOnMsg(msgVideo, formUserId);
                    }
                }
            },
            clearAll: function(formUserId, id, eMessage, orginalTeacherId) {
                if (formUserId != id) {
                    vApp.wb.tool = new vApp.wb.tool_obj('t_clearall');
                    vApp.wb.utility.t_clearallInit();
                    vApp.wb.utility.makeDefaultValue();
                    vApp.storage.clearStorageData();
                }

                if (orginalTeacherId) {
                    vApp.wb.utility.updateRcvdInformation(eMessage);
                }
            },
            // TODO this is not used any more
            // should be deleted
            replayAll: function() {
                window.vApp.wb.vcan.main.replayObjs = vApp.wb.gObj.replayObjs;
                vApp.wb.utility.clearAll(false);
                vApp.wb.toolInit('t_replay', 'fromFile');
            },
            createArrow: function(eMessage, orginalTeacherId) {
                var imageElm = vApp.wb.arrImg;
                var obj = {};
                obj.mp = {x: eMessage.x, y: eMessage.y};
                vApp.wb.utility.drawArrowImg(imageElm, obj);
                if (orginalTeacherId) {
                    vApp.wb.utility.updateRcvdInformation(eMessage);
                }
            },
            replayObj: function(repObj) {
                window.vApp.wb.vcan.main.replayObjs = [];
                if (repObj.length > 0) {
                    if (vApp.wb.gObj.displayedObjId + 1 == repObj[0].uid) {
                        window.vApp.wb.vcan.main.replayObjs = repObj;
                        vApp.wb.toolInit('t_replay', 'fromBrowser', true, vApp.wb.utility.dispQueuePacket);
                    }
                }
            },
            chunk: function(fromUser, id, repObj) {
                vApp.wb.bridge.handleMissedPackets(fromUser, id, repObj);
            },
            //vApp.wb.gObj.rcvdPackId should be define into
            //vApp.wb.reachedItemId
            repObjForMissedPkts: function(msgRepObj) {
                if (vApp.wb.gObj.rcvdPackId != 0 || (vApp.wb.uid > 0 && vApp.wb.gObj.rcvdPackId == 0)) { //for handle very starting stage
                    if ((typeof msgRepObj == 'object' || msgRepObj instanceof Array)) {
                        if (msgRepObj[0].hasOwnProperty('uid')) {
                            if ((vApp.wb.gObj.rcvdPackId + 1 != msgRepObj[0].uid) && (!msgRepObj.hasOwnProperty('chunk'))) {
                                if (Number(vApp.wb.gObj.rcvdPackId) < Number(msgRepObj[0].uid)) {
                                    var reqPacket = vApp.wb.bridge.requestPackets(msgRepObj);
                                    vApp.wb.utility.beforeSend({'getMsPckt': reqPacket});
                                }
                            }
                        }
                    }
                }
            }
        };
        
        window.response = response;
    }
)(window);
