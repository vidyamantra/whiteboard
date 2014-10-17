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
        window.wbUser = wbUser;
        
        var vApp = new window.vmApp();
        window.vApp = vApp; //make available to vApp object to each file
        
        var appIs = "Whiteboard";
        
        vApp.init(wbUser.role, appIs);
        
        if(window.vApp.error.length > 2){
            window.vApp.error = [];
            return;
        }
        
        if(localStorage.getItem('audioStream') !=  null){
            vApp.gObj.video.audio.assignFromLocal();
        }
        
        $(document).on("user_logout", function(e){
            removedMemberId = e.fromUser.userid;
            vApp.gObj.video.video.removeUser(removedMemberId);
        });

        $(document).on("member_removed", function(e){
            vApp.wb.utility.userIds = [];
        });

        $(document).on("error", function(e){
            vApp.wb.view.removeElement('serverErrorCont');
            window.vApp.wb.view.displayServerError('serverErrorCont', e.message);
        });
        
        $(document).on("member_added", function(e){
            vApp.wb.clientLen = e.message.length;
            var joinId = e.message[e.message.length - 1].userid;
           
            if(joinId == vApp.gObj.uid && vApp.gObj.uRole != 't'){
                var sp = (vApp.gObj.chat.userChatList.length == 0 ) ? 0 : vApp.gObj.chat.userChatList.length;
                vApp.wb.utility.beforeSend({'requestPacketBy' : joinId, sp: sp});
                vApp.wb.utility.beforeSend({'requestImagesBy' : joinId});
            }
            
            vApp.wb.utility.beforeSend({'checkUser' : {'role':wbUser.role, 'id' : wbUser.id, 'e' : {'clientLen' :e.message.length, 'newUser' : e.newuser }}, 'joinId' : e.message[e.message.length - 1].userid});
            
        });
        
        $(document).on("newmessage", function(e){
            vApp.wb.view.removeElement('serverErrorCont');
            
            if(e.message.hasOwnProperty('dispWhiteboard')){
                if(e.fromUser.userid != wbUser.id){
                    vApp.makeAppReady(vApp.apps[0]);
                    return;
                }
            } else if(e.message.hasOwnProperty('si')){ //screen share start
                if(vApp.gObj.uRole == 's'){
                   if(!e.message.hasOwnProperty('resimg')){
                      vApp.initStudentScreen(e.message);
                   }else{
                       if(e.message.byRequest == vApp.gObj.uid){
                            vApp.initStudentScreen(e.message);
                        }
                   }
                }
               return;
           } else if(e.message.hasOwnProperty('requestImagesBy')){
                if(vApp.gObj.uRole == "t" && (vApp.currApp == vApp.apps[1] || vApp.currApp == vApp.apps[2])){
                    var requestBy = e.message.requestImagesBy; //request user
                    if(vApp.currApp == vApp.apps[1]){
                        vApp.ss.sendPackets(requestBy);
                    }else if(vApp.currApp == vApp.apps[2]){
                        vApp.wss.sendPackets(requestBy);
                    }
                }
                return;
            }else if(e.message.hasOwnProperty('imageResponsed')){
                if(e.message.byRequest == vApp.gObj.uid){
                    vApp.initStudentScreen(e.message);
                }
                return;
            }else if(e.message.hasOwnProperty('unshareScreen')){ //screen share end
                var app  =  e.message.st;
                if(e.fromUser.userid != wbUser.id){
                    vApp[app].prevImageSlices = [];
                    vApp[app].removeStream();
                }
                return;
           }else if(e.message.hasOwnProperty('audioSamp')){
                if(e.fromUser.userid != wbUser.id){
                    var data_pack = e.message.audioSamp;
                    vApp.gObj.video.audio.play(data_pack, 0 , 0);
                    
                }
                return;
            } if(e.message.hasOwnProperty('videoSlice')){ //video share start
                vApp.gObj.video.playVideo(e.message.videoSlice);
                return;
            } else if(e.message.hasOwnProperty('videoByImage')){ //video end start
                if(e.fromUser.userid != wbUser.id){ 
                    if(!vApp.gObj.video.existVideoContainer(e.message.user)){
                        vApp.gObj.video.video.createElement(e.message.user);
                    }
                    vApp.gObj.video.video.playWithoutSlice(e.message);
                }
                return;
            } else if(e.message.hasOwnProperty('userMsg')){ //chat start
                //vApp.gObj.chat.display(e.message.userMsg, e.fromUser.userid);
                vApp.gObj.chat.display(e.message.userMsg);
                return;
            } else if(e.message.hasOwnProperty('requestPacketBy')){
                if(vApp.gObj.uRole == "t"){
                    var requestBy = e.message.requestPacketBy; //request user
                    vApp.gObj.chat.sendPackets(requestBy, e.message.sp);
                }
                return;
            }else if(e.message.hasOwnProperty('chatPackResponsed')){ //chat end
                if(e.message.byRequest == vApp.gObj.uid){
                    vApp.gObj.chat.displayMissedChats(e.message.chatPackResponsed);
                }
                return;
            } else if(e.message.hasOwnProperty('checkUser')){
                var disconnect = vApp.wb.response.checkUser(e, wbUser.id, vApp.wb.stHasTeacher);
                if(typeof disconnect != 'undefined'){
                     if(disconnect == 'diconnect'){
                        return;
                     }
                 }
            }

            else if(e.message.hasOwnProperty('video')){
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
                    vApp.wb.response.clearAll(e.fromUser.userid , wbUser.id, e.message, vApp.wb.oTeacher);
                }

                if(e.fromUser.userid != wbUser.id){
                    if(e.message.hasOwnProperty('repObj') && !e.message.hasOwnProperty('sentObj')){
                        
                        if(e.message.repObj[0].hasOwnProperty('uid')){
                            if(vApp.previous !=  "vApp" + vApp.apps[0]){
                               vApp.makeAppReady(vApp.apps[0]);
                            }
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
                        vApp.wb.response.createArrow(e.message, vApp.wb.oTeacher);
                    }else{
                        if(!e.message.hasOwnProperty('replayAll') && !e.message.hasOwnProperty('clearAll') && !e.message.hasOwnProperty('getMsPckt') && !e.message.hasOwnProperty('checkUser')){
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

                    if(vApp.wb.oTeacher){
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
                    vApp.wb.response.replayObj(e.message.repObj);
                }

                if(e.message.hasOwnProperty('replayAll')){
                    vApp.wb.response.replayAll();
                }
            }
        });
   });
});