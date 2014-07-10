// This file is part of Vidyamantra - http:www.vidyamantra.com/
/**@Copyright 2014  Vidyamantra Edusystems. Pvt.Ltd.
 * @author  Suman Bogati <http://www.vidyamantra.com>
  */
(
    function(window) {
        var whBoard = window.whBoard;
        whBoard.utility = {
            userIds: [],
            /**
             * This function does check that passed object is existing into 
             * removeElements array or not
             * @param obj expects the object which have to be checked against removeElements
             * @returns that position if the object is existing into remove Elements
             * TODO This function is not used any more can be removed from here 
             */
            isObjExistRE: function(obj) {
                if (whBoard.replay.removeElements.length >= 0) {
                    var objPos = whBoard.vcan.ArrayIndexOf(whBoard.replay.removeElements, function(pobj) {
                        return pobj.id == obj.id
                    });
                    if (objPos >= 0) {
                        return objPos;
                    }
                }
            },
            /**
             *  This function checks that particular object has property or not
             *  @obj the object should be tested that object has property or not 
             *  return true if the object is empty false otherwise
             */
            IsObjEmpty: function(obj) {
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        return false;
                    }
                }
                return true;
            },
            /**
             *  This function converts string to number
             *  @param expects pmdTime which has to be converted
             *  returns that converted number
             */
            stringToNumber: function(pmdTime) {
                if (pmdTime[pmdTime.length - 1] == ' ') {
                    pmdTime = pmdTime.substring(0, pmdTime.length - 1); //removing the space
                }

                pmdTime = Number(pmdTime); //converting string into number
                return pmdTime;
            },
            /***
             * this function does check that the user 
             * click at very first on canvas for draw the text
             * or click outside the box for finalize the  written text  
             * return true at second case false otherwise 
             * at @param expects the number either it is odd or even
             */

            clickOutSidebox: function(num) {
                return (num % 2 != 1) ? true : false;
            },
            /**
             * Through this function the selected object would be deleted
             * when user press on delete button after selected particular object
             * @param evt expects key down event
             */
            keyOperation: function(evt) {
                // This is used for removed the selected object.
                var currTime = new Date().getTime();
                if (evt.keyCode == 8) {
                    var vcan = whBoard.vcan;
                    if (vcan.main.currObj != "") {
                        whBoard.canvas.removeObject(vcan.main.currObj);
                        var obj = vcan.main.currObj;
                        var tempObj = vcan.extend({}, obj);
                        //tempObj = vcan.extend(tempObj, {mdTime:currTime, func:'remove', usrCurrAction : 'delete', lastElement :true});
                        tempObj = vcan.extend(tempObj, {mt: currTime, func: 'remove', usrCurrAction: 'delete', lastElement: true});
                        vcan.main.replayObjs.push(tempObj);
                        vcan.main.currObj = "";
                    }
                }
            },
            /**
             *  Through this function the event handlers attaching  
             *  the canvas there are three kinds of event handlers
             *  mouse down, up and move
             */
            attachEventHandlers: function() {
                whBoard.canvas.bind('mousedown', whBoard.utility.ev_canvas);
                whBoard.canvas.bind('mousemove', whBoard.utility.ev_canvas);
                whBoard.canvas.bind('mouseup', whBoard.utility.ev_canvas);
            },
            /**
             * Call the function through which     
             * the canvas would be clear
             */
            t_clearallInit: function() {
                var delRpNode = true;
                whBoard.utility.clearAll(delRpNode);
                if (localStorage.repObjs) {
                    //localStorage.clear();
                    //alert('suman bogati');
                    //debugger;
                }

            },
            /**
             * By this function  all drawn object over the canvas would be erased   
             * which means the canvas would be cleared
             * @param delRpNode
             */
            clearAll: function(delRpNode, pkMode) {

                whBoard.uid = 0; //this should be done with proper way
                whBoard.lt = "";
                var vcan = whBoard.vcan;
                while (vcan.main.children.length > 0) {
                    whBoard.canvas.removeObject(vcan.main.children[0]);
                }

                //removing all the elements from replayObjs
                if (delRpNode == true) {
                    /*****
                     This would I have disbaled can be critical
                     whBoard.repObj.replayObjs.splice(0, whBoard.repObj.replayObjs);
                     *****/
                    vcan.main.replayObjs.splice(0, vcan.main.replayObjs.length);
                }

                if (whBoard.replay != undefined) {
                    whBoard.replay.objNo = 0;
                }

                if (vcan.getStates('action') == 'move') {
                    vcan.setValInMain('action', 'create');
                }

                var sentPacketCont = document.getElementById('sendPackCont');
                if (sentPacketCont != null) {
                    var allDivs = sentPacketCont.getElementsByClassName('numbers')
                    if (allDivs.length > 0) {
                        for (var i = 0; i < allDivs.length; i++) {
                            allDivs[i].innerHTML = 0;
                        }
                    }
                }
                if (typeof pkMode == 'undefined') {
                    whBoard.sentPackets = 0;
                    whBoard.receivedPackets = 0;
                }

                //for clear sent and received msg information
                var sentMsgInfo = document.getElementById('sentMsgInfo');
                if (sentMsgInfo != null) {
                    //document.getElementById('sentMsgInfo').innerHTML  = "";
                    sentMsgInfo.innerHTML = "";
                }

                var receivedMsgInfo = document.getElementById('rcvdMsgInfo');
                if (receivedMsgInfo != null) {
                    receivedMsgInfo.innerHTML = "";
                }

                var allTextBoxContainer = document.getElementsByClassName('textBoxContainer');
                for (var i = 0; i < allTextBoxContainer.length; i++) {
                    allTextBoxContainer[i].parentNode.removeChild(allTextBoxContainer[i]);
                }

            },
            /**
             * By this function there would de-activating all the objects
             * which is stored into children array of vcan
             * de-activating means the particular object would not be select able 
             * @returns {Boolean}
             */
            deActiveFrmDragDrop: function() {
                var vcan = whBoard.vcan;
                var allChildren = vcan.main.children;
                var currState = vcan.getStates('action');
                if (currState == 'move') {
                    vcan.setValInMain('action', 'create');
                    for (var i = 0; i < allChildren.length; i++) {
                        //allChildren[i].draggable = false;
                        allChildren[i].dragDrop(false);
                        allChildren[i].setActive(false);
                    }
                    return true;
                }
                return false;
            },

            /**
             *   This function just determines the mouse 
             *   position relative to the canvas element. which means the mouse position(x, y)
             *   would counted from there where the canvas is started on browser
             *   @param evt expects the mouse event object
             *   @returns the object which has x and y co-ordination
             */
            getOffset: function(evt) {

                var el = evt.target,
                        x = y = 0;
                //getting the total mouse position from the relative element where the event is occurred
                while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
                    x += el.offsetLeft - el.scrollLeft;
                    y += el.offsetTop - el.scrollTop;
                    el = el.offsetParent;
                }

                x = evt.clientX - x;
                y = evt.clientY - y;
                return {x: x, y: y};
            },
            /**
             * Through this function the mouse event would called on the
             * particular object eg:- mouse down over the rectangle object 
             * which means the mouse is downed/created for create the rectangle
             */
            ev_canvas: function(ev) {
                //NOTE:- this have been done during the unit testing
                var posMous = whBoard.vcan.utility.getReltivePoint(ev);
                ev.currX = posMous.x;
                ev.currY = posMous.y;

                // Here the particular function is calling according to mouse event.
                var func = whBoard.tool[ev.type];
                if (func) {
                    func(ev);
                    return this.ev_canvas;
                }
            },
            /**
             * This function does active all the object which are 
             * created on canvas, after active all the object
             * they can be selectable, draggable, rotateable etc
             */
            t_activeallInit: function() {
                var vcan = whBoard.vcan;
                var allChildren = vcan.getStates('children');
                if (allChildren.length >= 1) {
                    /* TODO this should not contain here */
                    vcan.setValInMain('action', 'move');
                    for (var i = 0; i < allChildren.length; i++) {
                        allChildren[i].dragDrop(true);
                    }
                }
            },
            drawArrowImg: function(img, obj) {
                var ctx = whBoard.vcan.main.canvas.getContext('2d');
                ctx.clearRect(0, 0, whBoard.vcan.main.canvas.width, whBoard.vcan.main.canvas.height);
                vcan.renderAll();
                ctx.save();
                ctx.beginPath();
                ctx.translate(obj.mp.x, obj.mp.y);
                ctx.drawImage(img, -3, -3, 18, 24);
                ctx.closePath();
                ctx.restore();
            },
            calcPsSentPackets: function(oldData) {
                if (whBoard.utility.chkValueInLocalStorage('orginalTeacherId')) {
                    var pacPerSec = whBoard.sentPackets - oldData;
                    if (pacPerSec < 0) {
                        pacPerSec = 0;
                    }
                    if(document.getElementById(whBoard.sentPackDivPS != null)){
                        document.getElementById(whBoard.sentPackDivPS).innerHTML = pacPerSec;
                    }
                    return whBoard.sentPackets;
                }

            },
            calcPsRecvdPackets: function(oldData2) {
                var pacPerSec = whBoard.receivedPackets - oldData2;
                if (pacPerSec < 0) {
                    pacPerSec = 0;
                }
                if(document.getElementById(whBoard.receivedPackDivPS) != null){
                    document.getElementById(whBoard.receivedPackDivPS).innerHTML = pacPerSec;
                }
                return whBoard.receivedPackets;
            },
            //initialize transfred packets from local storage when
            // browser is reloaded.
            initStoredPacketsNumbers: function() {
                if (whBoard.utility.chkValueInLocalStorage('orginalTeacherId')) {
                    if (localStorage.sentPackets) {
                        var totSentPackets = JSON.parse(localStorage.sentPackets);
                        whBoard.sentPackets = totSentPackets;
                        if(document.getElementById(whBoard.sentPackDiv) != null){
                            document.getElementById(whBoard.sentPackDiv).innerHTML = totSentPackets;
                        }
                    }

                    if (localStorage.receivedPackets) {
                        whBoard.receivedPackets = JSON.parse(localStorage.receivedPackets);
                        if(document.getElementById(whBoard.receivedPackDiv) != null){
                            document.getElementById(whBoard.receivedPackDiv).innerHTML = whBoard.receivedPackets;
                        }
                    }
                }
            },
            updateSentPackets: function(obj) {
                if (whBoard.dataInfo == 1) {
                    if (whBoard.utility.chkValueInLocalStorage('orginalTeacherId')) {
                        whBoard.sentPackets = whBoard.sentPackets + JSON.stringify(obj).length;
                        if(document.getElementById(whBoard.sentPackDiv) != null){
                            document.getElementById(whBoard.sentPackDiv).innerHTML = whBoard.sentPackets;
                        }
                    }
                }
            },
            assignRole: function(studentId) {
                whBoard.tool = "";
                if (vcan.main.action == 'move') {
                    whBoard.utility.deActiveFrmDragDrop();
                }

                if (typeof studentId != 'undefined') {
                    if (localStorage.getItem('reclaim') != null) {
                        var cmdToolsWrapper = document.getElementById(whBoard.commandToolsWrapperId);
                        cmdToolsWrapper.parentNode.removeChild(cmdToolsWrapper);
                        localStorage.removeItem('reclaim');
                    }

                    window.whBoard.attachToolFunction(vcan.cmdWrapperDiv, true);
                    if(whBoard.hasOwnProperty('canvasDisable') || whBoard.canvasDisable){
                        whBoard.utility.toolWrapperDisable();
                    }
                    localStorage.setItem('teacherId', studentId);
                    whBoard.utility.makeCanvasEnable();
                } else {

                    var cmdToolsWrapper = document.getElementById(whBoard.commandToolsWrapperId);
                    if (cmdToolsWrapper != null) {
                        while (cmdToolsWrapper.hasChildNodes()) {
                            cmdToolsWrapper.removeChild(cmdToolsWrapper.lastChild);
                        }
                    }

                    whBoard.utility.makeCanvasDisable();

                    if (typeof localStorage.orginalTeacherId != 'undefined') {
                        whBoard.utility.createReclaimButton(cmdToolsWrapper);
                        //localStorage.reclaim = true;
                        localStorage.setItem('reclaim', true);
                    } else {
                        if (cmdToolsWrapper != null) {
                            cmdToolsWrapper.parentNode.removeChild(cmdToolsWrapper);
                        }
                    }
                    localStorage.removeItem('teacherId');
                }
            },
            reclaimRole: function() {
                whBoard.tool = "";
                if (vcan.main.action == 'move') {
                    whBoard.utility.deActiveFrmDragDrop();
                }
                whBoard.utility.removeToolBox();
                window.whBoard.attachToolFunction(vcan.cmdWrapperDiv, true);
                localStorage.teacherId = localStorage.orginalTeacherId;
                if (typeof localStorage.reclaim != 'undefined') {
                    localStorage.removeItem('reclaim');
                }
                whBoard.utility.makeCanvasEnable();
            },
            connectionOff: function() {
                cthis.isInitiator = false;
                cthis.pc = [];
                cthis.cn = 0;
                cthis.isStarted = false;
                cthis.byCommand = true;
                io.disconnect();
            },
            connectionOn: function() {
                io.wsconnect();
            },
            dispQueuePacket: function(result) {
                if ((localStorage.getItem('teacherId') != null) ||
                        (localStorage.getItem('orginalTeacherId') != null && whBoard.utility.chkValueInLocalStorage('reclaim'))) {
                    whBoard.utility.toolWrapperEnable();
                }
                whBoard.utility.isUserConnected(whBoard.clientLen);
                whBoard.drawMode = false;
                if (localStorage.getItem('teacherId') != null && whBoard.user.connected) {
                    whBoard.utility.makeCanvasEnable();
                }
                if (whBoard.gObj.packQueue.length > 0) {
                    window.whBoard.vcan.main.replayObjs = whBoard.gObj.packQueue;
                    whBoard.gObj.packQueue = [];
                    whBoard.toolInit('t_replay', 'fromBrowser', true, whBoard.utility.dispQueuePacket);
                } else {
                    return;
                }
            },
            updateRcvdInformation: function(msg) {
                var receivedMsg = document.getElementById('rcvdMsgInfo');
                if (receivedMsg != null) {
                    var compMsg = "";
                    for (var key in msg) {
                        compMsg += key + " : " + msg[key] + " <br />";
                    }
                    receivedMsg.innerHTML = compMsg;
                }
            },
            makeCanvasDisable: function() {
                var canvasElement = vcan.main.canvas;
                canvasElement.style.position = 'relative';
                //canvasElement.style.zIndex = "-1000";
                canvasElement.style.pointerEvents = "none";
            },
            makeCanvasEnable: function() {
                if (localStorage.getItem('teacherId') != null) {
                    if(!whBoard.hasOwnProperty('canvasDisable') || !whBoard.canvasDisable){
                        var canvasElement = vcan.main.canvas;
                        canvasElement.style.pointerEvents = "visible";
                    }
                }
            },
            removeToolBox: function() {
                var cmdWrapper = document.getElementById(vcan.cmdWrapperDiv);
                cmdWrapper.parentNode.removeChild(cmdWrapper);
            },
            createReclaimButton: function(cmdToolsWrapper) {
                whBoard.createDiv('t_reclaim', 'reclaim', cmdToolsWrapper);
                var aTags = document.getElementById('t_reclaim').getElementsByTagName('a');
                aTags[0].addEventListener('click', whBoard.objInit);
            },
            chkValueInLocalStorage: function(property) {
                if (localStorage.getItem(property) === null) {
                    return false;
                } else {
                    return localStorage[property];
                }
            },
            // The uniqueArrOfObjsToStudent and.
            // uniqueArrOfObjsToTeacher can be into sign.
            uniqueArrOfObjsToStudent: function() {
                var tempRepObjs = "";
                whBoard.gObj.replayObjs = [];
                for (var i = 0; i < vcan.main.replayObjs.length; i++) {
                    tempRepObjs = vcan.extend({}, vcan.main.replayObjs[i]);
                    whBoard.gObj.replayObjs.push(tempRepObjs);
                }
            },
            uniqueArrOfObjsToTeacher: function() {
                vcan.main.replayObjs = [];
                var tempRepObjs = "";
                for (var i = 0; i < whBoard.gObj.replayObjs.length; i++) {
                    tempRepObjs = vcan.extend({}, whBoard.gObj.replayObjs[i]);
                    vcan.main.replayObjs.push(tempRepObjs);
                }
            },
            makeDefaultValue: function() {
                whBoard.gObj.myrepObj = [];
                whBoard.gObj.replayObjs = [];
                whBoard.gObj.rcvdPackId = 0;
                whBoard.gObj.displayedObjId = 0;
                whBoard.gObj.packQueue = [];
                whBoard.uid = 0;

                var teacherId = whBoard.utility.chkValueInLocalStorage('teacherId');
                var orginalTeacherId = whBoard.utility.chkValueInLocalStorage('orginalTeacherId');
                var wbrtcMsg = whBoard.utility.chkValueInLocalStorage('wbrtcMsg');
                var canvasDrwMsg = whBoard.utility.chkValueInLocalStorage('canvasDrwMsg');
                var toolHeight = whBoard.utility.chkValueInLocalStorage('toolHeight');

                localStorage.clear();

                if (teacherId) {
                    localStorage.setItem('teacherId', teacherId);
                }

                if (orginalTeacherId) {
                    localStorage.setItem('orginalTeacherId', orginalTeacherId);
                }

                if (wbrtcMsg) {
                    localStorage.setItem('wbrtcMsg', wbrtcMsg);
                }

                if (canvasDrwMsg) {
                    localStorage.setItem('canvasDrwMsg', canvasDrwMsg);
                }

                if (toolHeight) {
                    localStorage.setItem('toolHeight', toolHeight);
                }

                if (typeof vcan.objTxt != 'undefined') {
                    vcan.objTxt.removeTextNode();
                }

                if (typeof vcan.main.currentTransform != 'undefined') {
                    vcan.main.currentTransform = "";
                }
            },
            setOrginalTeacherContent: function(e) {
                localStorage.setItem('teacherId', whBoard.gObj.uid);
                window.whBoard.view.canvasDrawMsg('Canvas');
                localStorage.setItem('canvasDrwMsg', true);
                if (!whBoard.utility.alreadyExistPacketContainer()) {
                    if (parseInt(wbUser.dataInfo, 10) == 1) {
                        whBoard.createPacketContainer();
                        whBoard.createPacketInfoContainer();
                        whBoard.utility.initStoredPacketsNumbers();
                    }
                }
                localStorage.setItem('orginalTeacherId', whBoard.gObj.uid);
            },
            isSystemCompatible: function() {
                if (window.whBoard.error.length > 0) {
                    for (var i = 0; i < window.whBoard.error.length; i++) {
                        var error = window.whBoard.error[i];
                        if (error.hasOwnProperty('msg')) {
                            whBoard.view.displayMessage(error.msg, error.id, error.className);
                        }
                    }
                }
            },
            initDefaultInfo: function(e, role) {
                var clientNum = e.message.checkUser.e.clientLen;
                var newuser = e.message.checkUser.e.newUser;
                if (role == 't') {
                    if (localStorage.getItem('orginalTeacherId') == null) {
                        whBoard.utility.setOrginalTeacherContent(e);
                        window.whBoard.attachToolFunction(vcan.cmdWrapperDiv, true);
                    }
                } else if (role == 's' && newuser == null) {
                    vcan.studentId = wbUser.id;
                    if (localStorage.getItem('studentId') == null) {
                        localStorage.setItem('studentId', wbUser.id);
                    }
                }

                if (clientNum == 1) {
                    whBoard.gObj.video.init();
                    whBoard.gObj.video.isInitiator = true;
                    vcan.oneExecuted = false;
                } else if (clientNum >= 2 && newuser == null) {
                    console.log("browser number " + clientNum);
                    if (clientNum > 2) {
                        alert("there may be the problem because of user is more than 2");
                    }
                    whBoard.utility.beforeSend({'videoInt': true});
                    whBoard.utility.beforeSend({'isChannelReady': true, 'memberAdded': true});
                    vcan.oneExecuted = false;
                    whBoard.gObj.video.init();
                }
            },
            checkWebRtcConnected: function() {
                if (typeof cthis != 'undefined') {
                    if (cthis.pc[0].hasOwnProperty('iceConnectionState') || typeof cthis.pc[0].iceConnectionState != 'undefined') {
                        return true;
                    }
                }
                return false;
            },
            createVirtualWindow: function(resolution) {
                whBoard.gObj.virtualWindow = true;
                var div = document.createElement('div');
                whBoard.utility.removeVirtualWindow('virtualWindow');
                var divId = 'virtualWindow';
                div.setAttribute('id', divId);
                var offset = vcan.main.offset;
                var drawWhiteboard = resolution;

                div.style.width = (drawWhiteboard.width) + "px";
               // div.style.width = (drawWhiteboard.width) + "px";
                if (typeof assignRoleAtStudent != 'undefined') {
                    var toolHeight = 0;
                } else {
                    var toolHeight = parseInt(localStorage.getItem('toolHeight'));
                    toolHeight = toolHeight != null ? toolHeight : 0;
                }

                if (localStorage.getItem('orginalTeacherId') != null) {
                    div.style.height = (drawWhiteboard.height + toolHeight) + "px";
                } else {
                    if (localStorage.getItem('teacherId') != null) {
                        div.style.height = (drawWhiteboard.height) + "px";
                    } else {
                        div.style.height = (drawWhiteboard.height - toolHeight) + "px";
                    }
                }
                var containerWhiteBoard = document.getElementById('containerWb');
                containerWhiteBoard.insertBefore(div, containerWhiteBoard.firstChild);
            },
            removeVirtualWindow: function(id) {
                var virtualWindow = document.getElementById(id);
                if (virtualWindow != null) {
                    whBoard.gObj.virtualWindow = false;
                    virtualWindow.parentNode.removeChild(virtualWindow);
                }
            },
            getWideValueAppliedByCss: function(id, attr) {
                var element = document.getElementById(id);
                if (element != null) {
                    var style = window.getComputedStyle(element);

                    if (typeof style.marginTop != 'undefined') {
                        var marginTop = parseInt(style.marginTop.match(/\d+/));
                        if (marginTop == null) {
                            marginTop = 0;
                        }
                    }
                    return (element.clientHeight + marginTop);
                } else {
                    return false;
                }
            },
            isNumber: function(num) {
                if (!isNaN(+num)) {
                    return +num;
                }
                return false;
            },
            setCommandToolHeights: function(toolHeight, operation) {
                var virDiv = document.getElementById('virtualWindow');
                if (virDiv != null) {
                    var divHeight = parseInt(virDiv.style.height.match(/\d+/));
                    if (operation == 'decrement') {
                        virDiv.style.height = (divHeight - parseInt(toolHeight)) + "px";
                    } else {
                        virDiv.style.height = (divHeight + parseInt(toolHeight)) + "px";
                    }
                }
            },
            setClass: function(elmentId, newClass) {
                var elem = document.getElementById(elmentId);
                var allClasses = elem.classList;
                var classes = "";
                if (allClasses.length > 0) {
                    if (classes.length < 2) {
                        classes = allClasses[0] + " ";
                    } else {
                        classes = allClasses.join(" ") + " ";
                    }
                }
                var classes = classes + newClass;
                elem.setAttribute('class', classes);
            },
            isUserConnected: function(userLength) {
                if (userLength > 1 && localStorage.getItem('otherRole')) {
                    whBoard.user.connected = true;
                }
            },
            isUserConnected_old: function(userLength) {
                if (userLength > 1) {
                    whBoard.user.connected = true;
                }
            },
            setStyleUserConnetion: function(currClass, newClass, whoIs) {
                var cdiv = document.getElementsByClassName(currClass)[0];
                if (cdiv != null){
                        cdiv.setAttribute('class', newClass + ' controlCmd');
                    }
            },
            existUserLikeMe: function(e) {
                if (e.fromUser.userid != wbUser.id) {
                    if (e.message.checkUser.hasOwnProperty('role')) {
                        var role = e.message.checkUser.role;
                        if (role) {
                            if (localStorage.getItem('otherRole') == null) {
                                var roles = [];
                                if (role != whBoard.gObj.uRole) {
                                    roles.push(role);
                                } else {
                                    existUser = true;
                                    return true;
                                }
                            } else {
                                roles = JSON.parse(localStorage.getItem('otherRole'));
                                if (roles.indexOf(role) == -1) {
                                    roles.push(role);
                                }
                            }

                            if (typeof roles != 'undefined') {
                                localStorage.setItem('otherRole', JSON.stringify(roles));
                                console.log("Other Browser " + role + ' ' + e.fromUser.userid);
                            }
                        }
                        return (whBoard.gObj.uRole == role) ? true : false;
                    }
                } else {
                    if (typeof existUser != 'undefined') {
                        return true;
                    } else {
                        var otherRoles = JSON.parse(localStorage.getItem('otherRole'));
                        if (otherRoles != null) {
                            for (var i = 0; i < otherRoles.length; i++) {
                                if (whBoard.gObj.uRole == otherRoles[i]) {
                                    return true;
                                }
                            }
                            return false;
                        }
                    }
                }
            },
            existUserWithSameId: function(e) {
                var myId = e.message.checkUser.wbUser.id;
                this.userIds.push(e.fromUser.userid);

                if (this.userIds.length > 1) {
                    var userSameId = whBoard.utility.arrayContainsSameValue(this.userIds[0], this.userIds);
                    if (userSameId) {
                        return true;
                    }
                }
            },
            makeUserAvailable: function(browerLength) {
                whBoard.utility.isUserConnected(browerLength);
                if (whBoard.user.connected) {
                    if (localStorage.getItem('repObjs') == null) {
                        whBoard.utility.toolWrapperEnable();
                        if (vcan.main.canvas != null) {
                            whBoard.utility.makeCanvasEnable();
                        }
                    }
                    whBoard.utility.setStyleUserConnetion('coff', 'con');
                }
            },
            displayCanvas: function() {
                window.whBoard.attachToolFunction(vcan.cmdWrapperDiv);
                window.whBoard.init();
                whBoard.utility.makeCanvasDisable();
                // This is disabled because its need to be enable for teacher
                //TODO this should be evaluate
                 whBoard.utility.toolWrapperDisable();
            },
            initAll: function(e) {
                if (localStorage.getItem('teacherId') != null) {
                    whBoard.utility.makeCanvasDisable();
                }

                var res = whBoard.system.measureResoultion({'width': window.outerWidth, 'height': window.innerHeight});

                var toolHeight = whBoard.utility.getWideValueAppliedByCss('commandToolsWrapper');
                if (toolHeight != false) {
                    whBoard.utility.beforeSend({'virtualWindow': {'shareBrowserWidth': true, 'browserRes': res, 'toolHeight': toolHeight, 'role': wbUser.role}});
                } else {
                    whBoard.utility.beforeSend({'virtualWindow': {'shareBrowserWidth': true, 'browserRes': res, 'role': wbUser.role}});
                }
            },
            alreadyExistToolBar: function() {
                var rectDiv = document.getElementById('t_rectangle');
                if (rectDiv != null) {
                    var allToolDivs = rectDiv.parentNode.getElementsByClassName('tool');
                    return (allToolDivs.length >= 8) ? true : false;
                }
            },
            alreadyExistPacketContainer: function() {
                var packDiv = document.getElementById('packetContainer');
                var infoDiv = document.getElementById('informationCont');

                if (packDiv.getElementsByTagName('div').length >= 2 || infoDiv.getElementsByTagName('div').length >= 1) {
                    return true;
                } else {
                    return false;
                }
            },
            toolWrapperDisable: function() {
                var commandToolWrapper = document.getElementById('commandToolsWrapper');
                if (commandToolWrapper != null) {
                    commandToolWrapper.style.pointerEvents = "none";
                }
            },
            //change the name with toolBoxEnable
            toolWrapperEnable: function() {
                var commandToolWrapper = document.getElementById('commandToolsWrapper');
                if (commandToolWrapper != null) {
                    commandToolWrapper.style.pointerEvents = "visible";
                }
            },
            replayFromLocalStroage: function() {
                if (typeof (Storage) !== "undefined") {
                    //if (localStorage.repObjs) {
                    if (localStorage.getItem('repObjs') != null) {
                        var allRepObjs = JSON.parse(localStorage.repObjs);
                        whBoard.vcan.main.replayObjs = allRepObjs;
                        whBoard.utility.clearAll(false, 'dontClear');

                        whBoard.gObj.replayObjs = whBoard.gObj.replayObjs.concat(allRepObjs);
                        if (allRepObjs.length > 0) {
                            whBoard.uid = allRepObjs[allRepObjs.length - 1].uid;
                            whBoard.gObj.rcvdPackId = whBoard.uid;
                            whBoard.toolInit('t_replay', 'fromBrowser', true, whBoard.utility.dispQueuePacket);
                        }
                    }else{
                        whBoard.utility.toolWrapperEnable();
                    }
                }
            },
            shareVideoInformation: function(e, storageHasTeacher) {
                whBoard.utility.isUserConnected(e.message.length);
                if (whBoard.user.connected) {
                    whBoard.utility.setStyleUserConnetion('coff', 'con');
                }

                if (typeof vcan.teacher == 'undefined' && !storageHasTeacher) {
                    whBoard.utility.makeCanvasDisable();
                }

                whBoard.utility.initDefaultInfo(e, wbUser.role);
                var res = whBoard.system.measureResoultion({'width': window.outerWidth, 'height': window.innerHeight});

                var toolHeight = whBoard.utility.getWideValueAppliedByCss('commandToolsWrapper');
                if (toolHeight != false) {
                    whBoard.utility.beforeSend({'virtualWindow': {'shareBrowserWidth': true, 'browserRes': res, 'toolHeight': toolHeight}});
                } else {
                    whBoard.utility.beforeSend({'virtualWindow': {'shareBrowserWidth': true, 'browserRes': res}});
                }
            },
            setUserStatus: function(storageHasTeacher, storageHasReclaim) {
                //TODO storageHasTeacher check with null rather than style of now.
                if (!storageHasTeacher && !storageHasReclaim) {
                    whBoard.utility.removeToolBox();
                    whBoard.utility.setClass('vcanvas', 'student');
                } else {
                    whBoard.utility.setClass('vcanvas', 'teacher');
                }
            },
            crateCanvasDrawMesssage: function() {
                if (typeof localStorage.teacherId != 'undefined') {
                    if (localStorage.getItem('canvasDrwMsg') == null) {
                        window.whBoard.view.canvasDrawMsg('Canvas');
                        window.whBoard.view.drawLabel('drawArea');
                        localStorage.canvasDrwMsg = true;
                    }
                }
            },
            removeOtherUserExist: function(role) {
                if (role == 't') { //If i am teacher
                    if (localStorage.getItem('studentId') != null) {
                        localStorage.removeItem('studentId');
                    }
                } else if (role == 's') { //If i am student
                    if (localStorage.getItem('orginalTeacherId') != null) {
                        localStorage.removeItem('orginalTeacherId');
                        if (localStorage.getItem('teacherId') != null) {
                            localStorage.removeItem('teacherId');
                            //whBoard.utility.removeToolBox();
                        }
                        if(localStorage.getItem('reclaim') != null){
                            localStorage.removeItem('reclaim');
                        }
                        whBoard.utility.removeToolBox();
                    }
                }
            },
            canvasEnabelWhenRefresh: function() {
                if (localStorage.getItem('teacherId') != null) {
                    whBoard.utility.makeCanvasEnable();
                }
            },
            arrayContainsSameValue: function(val, ids) {
                for (var i = 0; i < ids.length; i++) {
                    if (ids[i] !== val) {
                        return false;
                    }
                }
                return true;
            },
            actionAfterRemovedUser: function() {
                whBoard.utility.makeCanvasDisable();
                whBoard.utility.setStyleUserConnetion('con', 'coff');
                whBoard.utility.removeVirtualWindow('virtualWindow');
                whBoard.user.connected = false;
                localStorage.removeItem('otherRole');

                if (typeof cthis != 'undefined') {
                    tempIsInitiaor = true;
                    if (cthis.isStarted) {
                        cthis.handleRemoteHangup();
                    }
                }
            },
            sendRequest: function(msg, value) {
                whBoard.utility.beforeSend({'reclaimRole': true});
            },
            updateSentInformation: function(jobj, createArrow) {
                if (whBoard.utility.chkValueInLocalStorage('orginalTeacherId')) {
                    var sentObj = JSON.parse(jobj);
                    if (typeof createArrow != 'undefined') {
                        var msg = sentObj;
                    } else {
                        var msg = sentObj.repObj[0];
                    }

                    var compMsg = "";
                    for (var key in msg) {
                        compMsg += key + " : " + msg[key] + " <br />";
                    }
                    if(document.getElementById('sentMsgInfo') != null){
                        document.getElementById('sentMsgInfo').innerHTML = compMsg;
                    }
                }
            },
            /**
             * the operation before send infor to server
             * @param {type} msg
             * @returns {undefined}
             */
            beforeSend : function (msg){
                var jobj = JSON.stringify(msg);
                if (msg.hasOwnProperty('createArrow')) {
                    if (typeof optimizObj == 'undefined') {
                        optimizObj = optimization(); //new operand should be attached with optimization()
                    } else {
                        optimizObj.sendPacketWithOptimization(jobj, io.sock.readyState, 100);
                    }
                } else {
                    whBoard.sentPackets = whBoard.sentPackets + jobj.length;
                    if (io.sock.readyState == 1) {
                        io.send(msg);
                    }

                    //TODO this should be enable
                    var tempObj = JSON.parse(jobj);
                    if (tempObj.hasOwnProperty('repObj')) {
                        whBoard.utility.updateSentInformation(jobj);
                    }
                }
                localStorage.sentPackets = whBoard.sentPackets;
            },
           checkCanvasHasParents : function (){
               var currentTag = document.getElementById("vcanvas");
               while(currentTag.parentNode.tagName != 'BODY'){
                   if(currentTag.id != "vcanvas"){
                       currentTag.style.margin = "0";
                       currentTag.style.padding = "0";
                   }
                   currentTag  = currentTag.parentNode;
               }
               if(currentTag.id != 'vcanvas'){
                   currentTag.style.margin = "0";
                   currentTag.style.padding = "0";
               }
           },
           lockCanvas : function (){
                if(window.earlierWidth != window.innerWidth){
                    whBoard.canvasDisable = true;
                    whBoard.utility.makeCanvasDisable();
                    whBoard.utility.toolWrapperDisable();
                    if(document.getElementById('divForReloadMsg') == null){
                        var label = (localStorage.getItem('teacherId') != null) ? 'msgForReload' : 'msgStudentForReload';
                        window.whBoard.view.displayMsgBox('divForReloadMsg', label);
                        //fix me earlierWidth and innerwidth are same
                        window.earlierWidth = window.innerWidth;
                    }
                }
           },
            getElementRightOffSet : function (element){
                var rightOffSet = 20;
                //if whiteboard has right sidebar
                if(element.parentNode != null){
                     var elemContainer = element.parentNode;
                     var offset = vcan.utility.getElementOffset(elemContainer);
                    //WARNING 50 can be dangerous.
                     //var rspace  = (window.earlierWidth != window.innerWidth)  ? 25 : 40;.
                     var rspace = 0;
                     rightOffSet = window.innerWidth - (elemContainer.clientWidth + (offset.x - rspace));
                }
                return rightOffSet;
            }
        };
    }
)(window);
