// This file is part of Vidyamantra - http:www.vidyamantra.com/
/**@Copyright 2014  Vidyamantra Edusystems. Pvt.Ltd.
 * @author  Suman Bogati <http://www.vidyamantra.com>
  */

$.when(

).done(function(){
    $.uiBackCompat = false;
    $(document).ready(function(){
        
        window.earlierWidth = window.innerWidth;
        window.earlierHeight = window.innerHeight;
        
        var vApp = new window.vmApp();
        window.vApp = vApp; //make available to vApp object to each file
        vApp.init(wbUser.role);
        
        vApp.wb.system.check();
        vApp.wb.system.setCanvasDimension();
        vApp.wb.utility.isSystemCompatible();
        
        if(!vApp.wb.utility.chkValueInLocalStorage('orginalTeacherId')){
            vApp.wb.pageEnteredTime = new Date().getTime();
            localStorage.setItem('pageEnteredTime',  vApp.wb.pageEnteredTime);
        }else{
            vApp.wb.pageEnteredTime = localStorage.getItem('pageEnteredTime');
        }
        
        if(window.vApp.wb.error.length > 2){
            window.vApp.wb.error = [];
            return;
        }

        vApp.wb.gObj.myrepObj = [];
        vApp.wb.gObj.replayObjs = []; // this should contain either into whiteboard or into van object
        vApp.wb.gObj.myArr = [];

        var orginalTeacherId = vApp.wb.utility.chkValueInLocalStorage('orginalTeacherId');

        if(vApp.wb.utility.chkValueInLocalStorage('rcvdPackId')){
            vApp.wb.gObj.rcvdPackId = parseInt(localStorage.rcvdPackId);
        }else{
            vApp.wb.gObj.rcvdPackId = 0;
        }
        
        vApp.wb.gObj.uid = wbUser.id;
        vApp.wb.gObj.uRole = wbUser.role;
        vApp.wb.gObj.uName = wbUser.name;
        
        
        vApp.wb.utility.displayCanvas();
        window.addEventListener('resize', vApp.wb.utility.lockCanvas);
        window.addEventListener('click', function (){
            vApp.wb.view.disappearBox('WebRtc')
            vApp.wb.view.disappearBox('Canvas');
            vApp.wb.view.disappearBox('drawArea');
        });

        var storageHasReclaim = vApp.wb.utility.chkValueInLocalStorage('reclaim');
        var storageHasTeacher = vApp.wb.utility.chkValueInLocalStorage('teacherId');

        vApp.wb.utility.setUserStatus(storageHasTeacher, storageHasReclaim);
        vApp.wb.utility.removeOtherUserExist(wbUser.role);

        if(vApp.wb.utility.chkValueInLocalStorage('reclaim')){
            var cmdToolsWrapper = document.getElementById(vApp.wb.commandToolsWrapperId);
            if(cmdToolsWrapper != null){
                while(cmdToolsWrapper.hasChildNodes()){
                    cmdToolsWrapper.removeChild(cmdToolsWrapper.lastChild);
                }
            }
            vApp.wb.utility.createReclaimButton(cmdToolsWrapper);
        }

        var userobj = {'userid':wbUser.id,'name':wbUser.name};
        if(vApp.wb.system.webSocket){
            io.init({
                'userid':wbUser.id, 
                'sid':wbUser.sid,
                'rid': wbUser.path,
                'authuser':wbUser.auth_user,
                'authpass':wbUser.auth_pass,
                'userobj': userobj,
                'fastchat_lasttime':'0',
                'fastchatroom_title':'fastchat',
                'fastchatroom_name':wbUser.room
                });
        }

        vApp.wb.utility.replayFromLocalStroage();

        var oldData2 = vApp.wb.receivedPackets;
        setInterval(function (){
            if(document.getElementById(vApp.wb.receivedPackDivPS) != null){
                oldData2 = vApp.wb.utility.calcPsRecvdPackets(oldData2);
                document.getElementById(vApp.wb.receivedPackDiv).innerHTML = vApp.wb.receivedPackets;
            }
        }, 1000);
        
        window.sidebarHeightInit = function (){
            var sidebar = document.getElementById("widgetRightSide");
            sidebar.style.height = (window.innerHeight) + "px"; 
        }
        
        window.sidebarHeightInit();        
        vApp.wb.gObj.video = new window.vApp.wb.media();
        vApp.wb.gObj.chat = new window.vApp.wb.vcan.chat();
        vApp.wb.gObj.chat.init();
        
        if(localStorage.getItem('audioStream') !=  null){
            vApp.wb.gObj.video.audio.assignFromLocal();
        }
        
        vApp.wb.gObj.displayedObjId = 0;
        
        $(document).on("user_logout", function(e){
            removedMemberId = e.fromUser.userid;
        });

        $(document).on("member_removed", function(e){
            vApp.wb.utility.userIds = [];
            if(e.message.length == 1){
                vApp.wb.utility.actionAfterRemovedUser();
            }else{
                if(typeof removedMemberId != 'undefined'){
                    for(var i = 0; i < e.message.length; i++){
                        if(e.message[i].userid == removedMemberId){
                            vApp.wb.utility.actionAfterRemovedUser();
                        }
                    }
                }else{
                    if(localStorage.getItem('orginalTeacherId') != null){
                        alert("It seems that there is more than two user tried to connect");
                    }
                }
            }
        });

        $(document).on("error", function(e){
            vApp.wb.view.removeElement('serverErrorCont');
            window.vApp.wb.view.displayServerError('serverErrorCont', e.message);
        });
        
        $(document).on("member_added", function(e){
            vApp.wb.clientLen = e.message.length;
            var joinId = e.message[e.message.length - 1].userid;
           
            if(joinId == vApp.wb.gObj.uid && vApp.wb.gObj.uRole != 't'){
                var sp = (vApp.wb.gObj.chat.userChatList.length == 0 ) ? 0 : vApp.wb.gObj.chat.userChatList.length;
                vApp.wb.utility.beforeSend({'requestPacketBy' : joinId, sp: sp});
            }
            
            vApp.wb.utility.beforeSend({'checkUser' : {'role':wbUser.role, 'id' : wbUser.id, 'e' : {'clientLen' :e.message.length, 'newUser' : e.newuser }}, 'joinId' : e.message[e.message.length - 1].userid});
            
        });

        vApp.wb.utility.crateCanvasDrawMesssage();
        vApp.wb.gObj.packQueue = [];
        vApp.wb.gObj.virtualWindow = false;
        
        $(document).on("newmessage", function(e){
            vApp.wb.view.removeElement('serverErrorCont');
           //if(vApp.wb.gObj.video.reInitVideo(e.message, e.fromUser.userid)){ return true;}
            if(e.message.hasOwnProperty('dispWhiteboard')){
                if(e.fromUser.userid != wbUser.id){
                    vApp.makeAppReady("whiteboardtool");
                    return;
                }
            }else if(e.message.hasOwnProperty('ssbyimage')){
                if(vApp.wb.gObj.uRole == 's'){
                    if(!vApp.ss.hasOwnProperty('vac')){
                        //vApp.previous = vApp.wbConfig.id;
                        vApp.previous = vApp.wbConfig.id;
//                        
//                        vApp.ss = new window.screenShare(vApp.ssConfig);
//                        vApp.ss.vac = true;
//                        vApp.ss.dc = window.dirtyCorner;
//                        vApp.ss.sutil = window.sutil;
//                        vApp.ss.init();
//                        
//                        vApp.ss.vac = true;
//                        
                        vApp.makeAppReady("screensharetool");
                        
                        vApp.ss.vac = true;
                        
                        vApp.ss.localCanvas = document.getElementById(vApp.ss.local+"Video");
                        vApp.ss.localCont = vApp.ss.localCanvas.getContext('2d');
                        
                        vApp.ss.localCanvas.width = e.message.d.w;
                        vApp.ss.localCanvas.height = e.message.d.h;
                        
                        if(e.message.hasOwnProperty('vc')){
                            var vc  = document.getElementById(vApp.ss.local);
                            vc.style.width = e.message.vc.w + "px";
                            vc.style.height = e.message.vc.h + "px";
                        }
                    }else{
                        var wboard = document.getElementById(vApp.wb.id);
                        if(wboard != null && wboard.style.display == 'block'){
                            wboard.style.display = 'none';
                            document.getElementById(vApp.ss.id).style.display = 'block';
                        }
                    }
                    
                    if(typeof prvWidth != 'undefined' && e.message.d.w != prvWidth){
                        vApp.ss.localCanvas.width = e.message.d.w;
                        vApp.ss.localCanvas.height = e.message.d.h;
                        if(e.message.hasOwnProperty('vc')){
                            var vc  = document.getElementById(vApp.ss.local);
                            vc.style.width = e.message.vc.w + "px";
                            vc.style.height = e.message.vc.h + "px";
                        }
                    }
                    
                    
                     prvWidth = e.message.d.w;
                     prvHeight = e.message.d.h;
                    
                    vApp.ss.drawImages(e.message.ssbyimage);
                    
                    vApp.previous =  vApp.ss.id;
                    
                }
                
                
               //drawLoop(e.message.ssbyimage);
               return;
           }else if(e.message.hasOwnProperty('unshareScreen')){
                if(e.fromUser.userid != wbUser.id){
                    vApp.ss.prevImageSlices = [];
                    vApp.ss.removeStream(); 
                }
                return;
           }else if(e.message.hasOwnProperty('audioSamp')){
                if(e.fromUser.userid != wbUser.id){
                    var data_pack = e.message.audioSamp;
                    vApp.wb.gObj.video.audio.play(data_pack, 0 , 0);
                    
                }
                return;
            } if(e.message.hasOwnProperty('videoSlice')){
                //if(e.fromUser.userid != wbUser.id){
                    vApp.wb.gObj.video.playVideo(e.message.videoSlice);
                    return;
                //}
            } else if(e.message.hasOwnProperty('videoByImage')){
                if(e.fromUser.userid != wbUser.id){
                    if(!vApp.wb.gObj.video.existVideoContainer(e.message.user)){
                        vApp.wb.gObj.video.video.createElement(e.message.user);
                    }
                    vApp.wb.gObj.video.video.playWithoutSlice(e.message);
                }
                return;
            } else if(e.message.hasOwnProperty('userMsg')){
                vApp.wb.gObj.chat.display(e.message.userMsg, e.fromUser.userid);
                return;
            } else if(e.message.hasOwnProperty('chatPackReqest')){
                if(vApp.wb.gObj.uRole == "t"){
                    vApp.wb.gObj.chat.sendPackets(e.message.chatPackReqest);
                } 
                return;
            }  
            
            if(e.message.hasOwnProperty('requestPacketBy')){
                if(vApp.wb.gObj.uRole == "t"){
                    var requestBy = e.message.requestPacketBy;
                    vApp.wb.gObj.chat.sendPackets(requestBy, e.message.sp);
                }
                return;
            }else if(e.message.hasOwnProperty('chatPackResponsed')){
                if(e.message.byRequest == vApp.wb.gObj.uid){
                    vApp.wb.gObj.chat.displayMissedChats(e.message.chatPackResponsed);
                }
                return;
            } else if(e.message.hasOwnProperty('vidInit')){
//                vApp.wb.response.videoInit(e.fromUser.userid, wbUser.id);
//                return;
                
            }else if(e.message.hasOwnProperty('foundVideo')){
//                vApp.wb.response.foundVideo(e.message.foundVideo,  e.fromUser.userid);
//                return;
            }else if(e.message.hasOwnProperty('checkUser')){
                var disconnect = vApp.wb.response.checkUser(e, wbUser.id, storageHasTeacher);
                if(typeof disconnect != 'undefined'){
                     if(disconnect == 'diconnect'){
                        return;
                     }
                 }
            }else if(e.message.hasOwnProperty('virtualWindow')){
                //vApp.wb.view.virtualWindow.manupulation(e);
                return;
            }else if(e.message.hasOwnProperty('createPeerObj')){
                vApp.wb.response.createPeer(e.message.createPeerObj[0], e.message.createPeerObj[1], wbUser.id);
            }else if(e.message.hasOwnProperty('isChannelReady')){
                e.message.isChannelReady = true;
               // vApp.wb.gObj.video.videoOnMsg(e.message, e.fromUser.userid);
            }else if(e.message.hasOwnProperty('video')){
                vApp.wb.response.video(e.fromUser.userid, wbUser.id, e.message.video);
            }else{
                if(e.message.hasOwnProperty('reclaimRole')){
                    vApp.wb.response.reclaimRole(e.fromUser.userid, wbUser.id);
                    return;
                }

                if(e.message.hasOwnProperty('assignRole')){
                    vApp.wb.response.assignRole(e.fromUser.userid , wbUser.id, e.message.socket, e.message.toolHeight);
                    return;
                }
                vApp.wb.gObj.myrepObj = vApp.wb.vcan.getStates('replayObjs');
                if(e.message.hasOwnProperty('clearAll')){
                    vApp.wb.response.clearAll(e.fromUser.userid , wbUser.id, e.message, orginalTeacherId);
                }

                if(e.fromUser.userid != wbUser.id){
                    if(e.message.hasOwnProperty('repObj') && !e.message.hasOwnProperty('sentObj')){
                        if(e.message.repObj[0].hasOwnProperty('uid')){
                            //vApp.wb.uid = e.message.repObj[0].uid;
                            //WARNING:- can be crtical
                             vApp.wb.uid = e.message.repObj[e.message.repObj.length - 1].uid;
                        }
                        if(vApp.wb.gObj.displayedObjId > 0 && !e.message.hasOwnProperty('getMsPckt') && !e.message.hasOwnProperty('chunk') && vApp.wb.gObj.rcvdPackId != 0){
                             vApp.wb.bridge.makeQueue(e);
                        }
                    }

                   if(e.message.hasOwnProperty('repObj')){
                       vApp.wb.response.repObjForMissedPkts(e.message.repObj);
                   }
                }

                if(e.fromUser.userid != wbUser.id){
                    if(e.message.hasOwnProperty('getMsPckt')){
                        vApp.wb.gObj.chunk = [];
                        var chunk = vApp.wb.bridge.sendPackets(e, vApp.wb.gObj.chunk);
                        vApp.wb.utility.beforeSend({'repObj' : chunk, 'chunk' : true});
                    }
                }

                if(e.fromUser.userid != wbUser.id){
                    if(e.message.hasOwnProperty('createArrow')){
                        vApp.wb.response.createArrow(e.message, orginalTeacherId);
                    }else{
                        if(!e.message.hasOwnProperty('replayAll') && !e.message.hasOwnProperty('clearAll') && !e.message.hasOwnProperty('getMsPckt')
                                && !e.message.hasOwnProperty('checkUser') && !e.message.hasOwnProperty('videoInt')
                            ){
                                if(typeof e.message.repObj == 'undefined'){
                                    vApp.wb.utility.updateRcvdInformation(e.message.repObj[0]);
                                }
                                
                        }
                    }
                }

                if(!e.message.hasOwnProperty('clearAll') && !e.message.hasOwnProperty('replayAll')){
                    if(e.message.hasOwnProperty('repObj')){
                        if(e.message.repObj.length > 1 && e.message.hasOwnProperty('chunk') && e.fromUser.userid == wbUser.id){
                            //TODO this have to be simpliefied.
                        }else{
                            if(vApp.wb.gObj.rcvdPackId + 1 == e.message.repObj[0].uid) {
                                for (var i = 0; i < e.message.repObj.length; i++){
                                     vApp.wb.gObj.replayObjs.push(e.message.repObj[i]);
                                }
                            }

                            if(typeof e.message.repObj[e.message.repObj.length - 1] == 'object' ){
                                if(e.message.repObj[e.message.repObj.length - 1].hasOwnProperty('uid') && !e.message.hasOwnProperty('chunk')){
                                    vApp.wb.gObj.rcvdPackId = e.message.repObj[e.message.repObj.length - 1].uid;
                                    localStorage.setItem('rcvdPackId', vApp.wb.gObj.rcvdPackId);
                                }
                                //Missing one id.
                                if(vApp.wb.gObj.packQueue.length > 0 && !e.message.hasOwnProperty('chunk')){
                                    vApp.wb.gObj.rcvdPackId = vApp.wb.gObj.packQueue[vApp.wb.gObj.packQueue.length - 1].uid;
                                }
                            }

                            if(e.fromUser.userid != wbUser.id){
                                localStorage.setItem('repObjs', JSON.stringify(vApp.wb.gObj.replayObjs));
                            }else{
                                if(typeof vApp.wb.gObj.rcvdPackId != 'undefined'){
                                    vApp.wb.gObj.displayedObjId = vApp.wb.gObj.rcvdPackId;
                                }
                            }
                        }

                        if(e.message.hasOwnProperty('chunk') && e.fromUser.userid != wbUser.id){
                            vApp.wb.response.chunk(e.fromUser.userid, wbUser.id,  e.message.repObj);
                        }
                    }

                    if(orginalTeacherId){
                        if(e.fromUser.userid != wbUser.id ){
                            if(e.message.hasOwnProperty('createArrow')){
                                vApp.wb.receivedPackets = vApp.wb.receivedPackets + (JSON.stringify(e.message).length);
                            }else if(!e.message.hasOwnProperty('getMsPckt') && !e.message.hasOwnProperty('checkUser') && !e.message.hasOwnProperty('videoInt')){
                                vApp.wb.receivedPackets = vApp.wb.receivedPackets + (JSON.stringify(e.message.repObj).length);
                            }
                            if(document.getElementById(vApp.wb.receivedPackDiv) != null){
                                document.getElementById(vApp.wb.receivedPackDiv).innerHTML = vApp.wb.receivedPackets;
                            }
                        }
                        if(typeof vApp.wb.receivedPackets != 'undefined'){
                            localStorage.receivedPackets = vApp.wb.receivedPackets;
                        }
                    }
                }

                if(e.fromUser.userid != wbUser.id && e.message.hasOwnProperty('repObj')){
                    //if(e.message.hasOwnProperty('repObj')){
                        vApp.wb.response.replayObj(e.message.repObj);
                    //}
                }

                if(e.message.hasOwnProperty('replayAll')){
                    vApp.wb.response.replayAll();
                }
            }
        });
   });
});