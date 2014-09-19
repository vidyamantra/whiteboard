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
        
        var appIs = "whiteboard";
        
        //vApp.init(wbUser.role, "whiteboardtool");
        
        vApp.init(wbUser.role, appIs+ "tool");
        
        if(window.vApp.error.length > 2){
            window.vApp.error = [];
            return;
        }
        
        if(appIs == "whiteboard"){
            vApp.wb.utility.displayCanvas();
        }

        var userobj = {'userid':wbUser.id,'name':wbUser.name};
        if(vApp.system.webSocket){
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
        
        if(appIs == "whiteboard"){
            vApp.wb.utility.replayFromLocalStroage();
        }
        

        var oldData2 = vApp.wb.receivedPackets;
        setInterval(function (){
            if(document.getElementById(vApp.wb.receivedPackDivPS) != null){
                oldData2 = vApp.wb.utility.calcPsRecvdPackets(oldData2);
                document.getElementById(vApp.wb.receivedPackDiv).innerHTML = vApp.wb.receivedPackets;
            }
        }, 1000);
        
        vApp.vutil.sidebarHeightInit();        
        //vApp.gObj.video = new window.vApp.wb.media();
        
        
        vApp.gObj.video = new window.vApp.media();
        vApp.gObj.chat = new window.vApp.chat();
        vApp.gObj.chat.init();
        
        if(localStorage.getItem('audioStream') !=  null){
            vApp.gObj.video.audio.assignFromLocal();
        }
        
        $(document).on("user_logout", function(e){
            removedMemberId = e.fromUser.userid;
            vApp.gObj.video.video.removeUser(removedMemberId);
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
           
            if(joinId == vApp.gObj.uid && vApp.gObj.uRole != 't'){
                var sp = (vApp.gObj.chat.userChatList.length == 0 ) ? 0 : vApp.gObj.chat.userChatList.length;
                vApp.wb.utility.beforeSend({'requestPacketBy' : joinId, sp: sp});
                vApp.wb.utility.beforeSend({'requestImagesBy' : joinId});
            }
            
            vApp.wb.utility.beforeSend({'checkUser' : {'role':wbUser.role, 'id' : wbUser.id, 'e' : {'clientLen' :e.message.length, 'newUser' : e.newuser }}, 'joinId' : e.message[e.message.length - 1].userid});
            
        });
        
        
        if(appIs == 'whiteboard'){
            vApp.wb.utility.crateCanvasDrawMesssage();
            vApp.wb.gObj.packQueue = [];
            vApp.wb.gObj.virtualWindow = false;
        }
   
        $(document).on("newmessage", function(e){
            vApp.wb.view.removeElement('serverErrorCont');
           //if(vApp.gObj.video.reInitVideo(e.message, e.fromUser.userid)){ return true;}
            
            if(e.message.hasOwnProperty('dispWhiteboard')){
                if(e.fromUser.userid != wbUser.id){
                    vApp.makeAppReady("whiteboardtool");
                    return;
                }
            }else if(e.message.hasOwnProperty('ssbyimage')){
                
                if(vApp.gObj.uRole == 's'){
                   
                   if(!e.message.hasOwnProperty('resimg')){
                      drawImageAtStudent(e);
                   }else{
                       if(e.message.byRequest == vApp.gObj.uid){
                            drawImageAtStudent(e);
                        }
                   }
                    
                   
                    
//                    var stool;
//                    app = e.message.st; 
//                    
//                    if(e.message.st == 'ss'){
//                        stool = "screensharetool";
//                    }else{
//                        stool = "wholescreensharetool";
//                    }
//
//                    if(typeof vApp[app] != 'object'){
//                        
//                        vApp.makeAppReady(stool);
//                        vApp[app].vac = true;
//                        
//                        vApp[app].localCanvas = document.getElementById(vApp[app].local+"Video");
//                        vApp[app].localCont = vApp[app].localCanvas.getContext('2d');
//                        
//                        vApp[app].localCanvas.width = e.message.d.w;
//                        vApp[app].localCanvas.height = e.message.d.h;
//                        
//                        if(e.message.hasOwnProperty('vc')){
//                            var vc  = document.getElementById(vApp[app].local);
//                            vc.style.width = e.message.vc.w + "px";
//                            vc.style.height = e.message.vc.h + "px";
//                        }
//                    }else{
//                        var prvScreen = document.getElementById(vApp.previous);
//                        if(prvScreen != null){
//                            prvScreen.style.display = 'none';
//                            document.getElementById(vApp[app].id).style.display = 'block';
//                        }
//                    }
//                    
//                    if(typeof prvWidth != 'undefined' && e.message.d.w != prvWidth){
//                        vApp[app].localCanvas.width = e.message.d.w;
//                        vApp[app].localCanvas.height = e.message.d.h;
//                        if(e.message.hasOwnProperty('vc')){
//                            var vc  = document.getElementById(vApp[app].local);
//                            vc.style.width = e.message.vc.w + "px";
//                            vc.style.height = e.message.vc.h + "px";
//                        }
//                    }
//                    
//                    prvWidth = e.message.d.w;
//                    prvHeight = e.message.d.h;
//                    
//                    vApp[app].drawImages(e.message.ssbyimage);
//                    vApp.previous =  vApp[app].id;
//                    
                }
                
               return;
           }else if(e.message.hasOwnProperty('unshareScreen')){
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
            } if(e.message.hasOwnProperty('videoSlice')){
                //if(e.fromUser.userid != wbUser.id){
                    vApp.gObj.video.playVideo(e.message.videoSlice);
                    return;
                //}
            } else if(e.message.hasOwnProperty('videoByImage')){
                if(e.fromUser.userid != wbUser.id){
                    if(!vApp.gObj.video.existVideoContainer(e.message.user)){
                        vApp.gObj.video.video.createElement(e.message.user);
                    }
                    vApp.gObj.video.video.playWithoutSlice(e.message);
                }
                return;
            } else if(e.message.hasOwnProperty('userMsg')){
                vApp.gObj.chat.display(e.message.userMsg, e.fromUser.userid);
                return;
            } 
//            else if(e.message.hasOwnProperty('chatPackReqest')){
//                if(vApp.gObj.uRole == "t"){
//                    vApp.gObj.chat.sendPackets(e.message.chatPackReqest);
//                } 
//                return;
//            }  
            
            else if(e.message.hasOwnProperty('requestPacketBy')){
                if(vApp.gObj.uRole == "t"){
                    var requestBy = e.message.requestPacketBy; //request user
                    vApp.gObj.chat.sendPackets(requestBy, e.message.sp);
                }
                return;
            }else if(e.message.hasOwnProperty('chatPackResponsed')){
                if(e.message.byRequest == vApp.gObj.uid){
                    vApp.gObj.chat.displayMissedChats(e.message.chatPackResponsed);
                }
                return;
            }else if(e.message.hasOwnProperty('requestImagesBy')){
                if(vApp.gObj.uRole == "t" && (vApp.currApp == 'screensharetool' || vApp.currApp == 'wholescreensharetool')){
                    var requestBy = e.message.requestImagesBy; //request user
                    vApp.ss.sendPackets(requestBy);
                }
                return;
            }else if(e.message.hasOwnProperty('imageResponsed')){
                if(e.message.byRequest == vApp.gObj.uid){
                    drawImageAtStudent(e);
                }
            }else if(e.message.hasOwnProperty('vidInit')){
//                vApp.wb.response.videoInit(e.fromUser.userid, wbUser.id);
//                return;
                
            }else if(e.message.hasOwnProperty('foundVideo')){
//                vApp.wb.response.foundVideo(e.message.foundVideo,  e.fromUser.userid);
//                return;
            }else if(e.message.hasOwnProperty('checkUser')){
                var disconnect = vApp.wb.response.checkUser(e, wbUser.id, vApp.wb.stHasTeacher);
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
               // vApp.gObj.video.videoOnMsg(e.message, e.fromUser.userid);
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
                    vApp.wb.response.clearAll(e.fromUser.userid , wbUser.id, e.message, vApp.wb.oTeacher);
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
                        vApp.wb.response.createArrow(e.message, vApp.wb.oTeacher);
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
                    //if(e.message.hasOwnProperty('repObj')){
                        vApp.wb.response.replayObj(e.message.repObj);
                    //}
                }

                if(e.message.hasOwnProperty('replayAll')){
                    vApp.wb.response.replayAll();
                }
            }
        });
        
        function drawImageAtStudent(e){
            var stool;
            app = e.message.st; 

            if(e.message.st == 'ss'){
                stool = "screensharetool";
            }else{
                stool = "wholescreensharetool";
            }

            if(typeof vApp[app] != 'object'){

                vApp.makeAppReady(stool);
                vApp[app].vac = true;

                vApp[app].localCanvas = document.getElementById(vApp[app].local+"Video");
                vApp[app].localCont = vApp[app].localCanvas.getContext('2d');

                vApp[app].localCanvas.width = e.message.d.w;
                vApp[app].localCanvas.height = e.message.d.h;

                if(e.message.hasOwnProperty('vc')){
                    var vc  = document.getElementById(vApp[app].local);
                    vc.style.width = e.message.vc.w + "px";
                    vc.style.height = e.message.vc.h + "px";
                }
            }else{
                var prvScreen = document.getElementById(vApp.previous);
                if(prvScreen != null){
                    prvScreen.style.display = 'none';
                    document.getElementById(vApp[app].id).style.display = 'block';
                }
            }

            if(typeof prvWidth != 'undefined' && e.message.d.w != prvWidth){
                vApp[app].localCanvas.width = e.message.d.w;
                vApp[app].localCanvas.height = e.message.d.h;
                if(e.message.hasOwnProperty('vc')){
                    var vc  = document.getElementById(vApp[app].local);
                    vc.style.width = e.message.vc.w + "px";
                    vc.style.height = e.message.vc.h + "px";
                }
            }

            prvWidth = e.message.d.w;
            prvHeight = e.message.d.h;

            vApp[app].drawImages(e.message.ssbyimage);
            vApp.previous =  vApp[app].id;
                    
        }
        
   });
});