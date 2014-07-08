// This file is part of Vidyamantra - http:www.vidyamantra.com/
/**@Copyright 2014  Vidyamantra Edusystems. Pvt.Ltd.
 * @author  Suman Bogati <http://www.vidyamantra.com>
  */
(
    function(window) {
        whBoard = window.whBoard;
        whBoard.view.msgBoxClass = 'msgBox';
        whBoard.view.window = {};
        whBoard.view.virtualWindow = {};

        whBoard.view.displayMessage = function(msg, id, className, intoAppend, imageTag) {
            if (typeof imageTag == 'undefined') {
                var msgBox = whBoard.view.createMsgBox(msg, id, className);
            } else {
                var msgBox = whBoard.view.createMsgBox(msg, id, className, imageTag);
            }

            var parTag = document.getElementById('vcanvas');
            if (typeof intoAppend != 'undefined') {
                document.getElementById(intoAppend).appendChild(msgBox);
            } else {
                parTag.insertBefore(msgBox, parTag.childNodes[0]);
            }
        }

        whBoard.view.customCreateElement = function(tagName, id, className) {
            var tag = document.createElement(tagName);
            if (typeof id != 'undefined') {
                tag.id = id;
            }

            if (typeof className != 'undefined') {
                tag.className = className;
            }
            return tag;
        }

        whBoard.view.createMsgBox = function(msg, id, className, imageTag) {
            var divTag = whBoard.view.customCreateElement('div', id, className);
            if (typeof imageTag == 'undefined') {
                var imageHolder = whBoard.view.customCreateElement('div', id + 'img', className + 'img');
                divTag.appendChild(imageHolder);
            }

            var pTag = whBoard.view.customCreateElement('p', id + 'Para');
            pTag.innerHTML = msg;
            divTag.appendChild(pTag);
            return divTag;
        }

        whBoard.view.disappearBox = function(className) {
            var allDivs = document.getElementsByClassName(whBoard.view.msgBoxClass + className);
            if (allDivs[0] != null) {
                allDivs[0].parentNode.removeChild(allDivs[0]);
            }
        }

        whBoard.view.multiMediaMsg = function(className) {
            if (whBoard.system.mybrowser.name == 'Firefox') {
                var msg = whBoard.lang.getString('wbrtcMsgFireFox');
                whBoard.view.displayMessage(msg, "fireFoxWebrtcCont", whBoard.view.msgBoxClass + className);

            } else if (whBoard.system.mybrowser.name == 'Chrome') {
                var msg = whBoard.lang.getString('wbrtcMsgChrome');
                whBoard.view.displayMessage(msg, "chormeWebrtcCont", whBoard.view.msgBoxClass + className);
            }
        }

        whBoard.view.canvasDrawMsg = function(className) {
            var mainContainer = document.getElementById('vcanvas');
            mainContainer.className = 'canvasMsgBoxParent';
            if (whBoard.system.mybrowser.name == 'Firefox') {
                var msg = whBoard.lang.getString('canvasDrawMsg');
                whBoard.view.displayMessage(msg, "canvasDrawMsgContFirefox", whBoard.view.msgBoxClass + className, 'containerWb');

            } else if (whBoard.system.mybrowser.name == 'Chrome') {
                var msg = whBoard.lang.getString('canvasDrawMsg');
                whBoard.view.displayMessage(msg, "canvasDrawMsgContChrome", whBoard.view.msgBoxClass + className, 'containerWb');
            }
        }

        window.whBoard.view.drawLabel = function(className) {
            var msg = whBoard.lang.getString('drawArea');
            whBoard.view.displayMessage(msg, "canvasDrawArea", whBoard.view.msgBoxClass + className, 'containerWb', false);
        }
        window.whBoard.view.displayMsgBox = function (id, msg){
            var div = whBoard.view.customCreateElement('div', id);
            var p = whBoard.view.customCreateElement('p', id + "Para");
            p.innerHTML = whBoard.lang.getString(msg);
            div.appendChild(p);
            var a = whBoard.view.customCreateElement('a', id + "Anchor");
            a.href = window.location;
            a.innerHTML = whBoard.lang.getString('reload');
            a.onclick = function (){
                window.location.reload();
            }
            div.appendChild(a);
            var vcanvas = document.getElementById('vcanvas');
            vcanvas.parentNode.insertBefore(div, vcanvas);
        }
        window.whBoard.view.displayServerError = function (id, msg){
            var div = whBoard.view.customCreateElement('div', id);
            div.innerHTML = msg;
            var vcanvas = document.getElementById('vcanvas');
            vcanvas.parentNode.insertBefore(div, vcanvas);
        }

        window.whBoard.view.removeElement = function (id){
            var errorDiv = document.getElementById(id);
            if(errorDiv != null){
               errorDiv.parentNode.removeChild(errorDiv);
            }
        }

        count = 0;
        // TODO the resizeFinished and resize function
        // should be place at whBoard.utility function
        whBoard.view.window.resizeFinished = (function() {
            var timer = 0;
            return function(callback, ms) {
                clearTimeout(timer);
                timer = setTimeout(callback, ms);
            };
        })();
        whBoard.view.window.resize = function() {
            var res = whBoard.system.measureResoultion({'width': window.innerWidth, 'height': window.innerHeight});
            var vcanvas = document.getElementById('vcanvas');
            var  rightOffSet = whBoard.utility.getElementRightOffSet(vcanvas);
            res.width = res.width - rightOffSet; //60 for right edge
            vcanvas.style.width = res.width + 'px';
            vcan.renderAll();
            if (typeof lastresizetime == 'undefined') {
                lastresizetime = new Date().getTime();
                whBoard.utility.beforeSend({'virtualWindow': {'resizeWindow': res}});
            }

            presentresizetime = new Date().getTime();
            if ((presentresizetime - lastresizetime) >= 500) { // Optimized
                whBoard.utility.beforeSend({'virtualWindow': {'resizeWindow': res}});
                lastresizetime = new Date().getTime();
                console.log('send request ' + count);
            }

            whBoard.view.window.resizeFinished(function() {
                whBoard.utility.beforeSend({'virtualWindow': {'resizeWindow': res}});
            }, 500);
        },
        whBoard.view.virtualWindow.manupulation = function(e) {
            var message = e.message.virtualWindow;
            if (message.hasOwnProperty('removeVirtualWindow')) {
                if (e.fromUser.userid != wbUser.id) {
                    whBoard.utility.removeVirtualWindow('virtualWindow');
                }
                return;
            } else if (message.hasOwnProperty('resizeWindow')) {
                myResolution = whBoard.system.measureResoultion({'width': window.outerWidth, 'height': window.innerHeight});
                if (e.fromUser.userid != wbUser.id) {
                    var otherResolution = message.resizeWindow;
                    otherBrowser = otherResolution;
                    if (otherResolution.width < myResolution.width) {
                        whBoard.utility.createVirtualWindow(otherResolution);
                    } else if (otherResolution.width == myResolution.width) {
                        whBoard.utility.removeVirtualWindow('virtualWindow');
                    }
                } else {
                    if (typeof otherBrowser != 'undefined') {
                        if (myResolution.width < otherBrowser.width) {
                            //CRITICAL this function does call undefinite
                            whBoard.utility.beforeSend({'virtualWindow' : { 'resizeWindow' : myResolution}});
                            whBoard.utility.removeVirtualWindow('virtualWindow');
                        } else if (myResolution.width > otherBrowser.width) {
                            whBoard.utility.createVirtualWindow(otherBrowser);
                            whBoard.utility.beforeSend({'virtualWindow': {'removeVirtualWindow': true}});
                        } else if (myResolution.width == otherBrowser.width) {
                            whBoard.utility.removeVirtualWindow('virtualWindow');
                        }
                    }
                }
                return;
            } else if (message.hasOwnProperty('createVirtualWindow')) {
                if (message.hasOwnProperty('toolHeight')) {
                    localStorage.setItem('toolHeight', message.toolHeight);
                }

                if (e.fromUser.userid != wbUser.id) {
                    whBoard.utility.createVirtualWindow(message.createVirtualWindow);
                    return;
                }
            } else if (message.hasOwnProperty('shareBrowserWidth')) {
                if (message.hasOwnProperty('toolHeight')) {
                    localStorage.setItem('toolHeight', message.toolHeight);
                }

                if (localStorage.getItem('teacherId') != null) {
                    var toolBoxHeight = whBoard.utility.getWideValueAppliedByCss('commandToolsWrapper');
                    localStorage.setItem('toolHeight', toolBoxHeight);
                }

                if (e.fromUser.userid != wbUser.id) {
                    if (localStorage.getItem('teacherId') != null) {
                        whBoard.utility.makeCanvasEnable();
                    }
                    otherBrowser = message.browserRes;
                } else {
                    myBrowser = whBoard.system.measureResoultion({'width': window.outerWidth, 'height': window.innerHeight});
                }

                if (typeof myBrowser == 'object' && typeof otherBrowser == 'object') {
                    if (myBrowser.width > otherBrowser.width) {
                        if (!whBoard.gObj.virtualWindow) {
                            whBoard.utility.createVirtualWindow(otherBrowser);
                            whBoard.gObj.virtualWindow = true;
                        }
                    } else if (myBrowser.width < otherBrowser.width) {
                        if (!whBoard.gObj.virtualWindow) {
                           // whBoard.gObj.virtualWindow = true;
                           var canvaContainer = document.getElementById("vcanvas");
                           var rightOffset = whBoard.utility.getElementRightOffSet(canvaContainer);
                            if (localStorage.getItem('teacherId') != null) {
                                whBoard.utility.beforeSend({'virtualWindow': {'createVirtualWindow': myBrowser - rightOffset, 'toolHeight': toolBoxHeight}});
                            } else {
                                whBoard.utility.beforeSend({'virtualWindow': {'createVirtualWindow': myBrowser - rightOffset}});
                            }
                        }
                    }
                }
            }
            return;
        }
    }
)(window);
