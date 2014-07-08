// This file is part of Vidyamantra - http:www.vidyamantra.com/
/**@Copyright 2014  Vidyamantra Edusystems. Pvt.Ltd.
 * @author  Suman Bogati <http://www.vidyamantra.com>
  */
(
    function(window) {
        whBoard.system.wbRtc = {};
        whBoard.system.wbRtc.className = 'webrtcCont';
        whBoard.system.mybrowser = {};

        whBoard.system.mybrowser.detection = function() {
            var ua = navigator.userAgent, tem,
                    M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*([\d\.]+)/i) || [];
            if (/trident/i.test(M[1])) {
                tem = /\brv[ :]+(\d+(\.\d+)?)/g.exec(ua) || [];
                return 'IE ' + (tem[1] || '');
            }
            M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
            if ((tem = ua.match(/version\/([\.\d]+)/i)) != null){
                M[2] = tem[1];
            }
            // return M.join(' ');
            return M;
        }

        whBoard.system.isCanvasSupport = function(navigator, browserName, version) {
            if (browserName == 'MSIE') {
                if (version != 9) {
                    //TODO there should be some good method to check exisitence of canvas element in IE browsers
                    whBoard.error.push({'msg': whBoard.lang.getString('notSupportCanvas'), 'id': 'errorCanvas', 'className': 'error'});
                }
            } else {
                var canvasSupported = !!window.CanvasRenderingContext2D;
                if (!canvasSupported) {
                    whBoard.error.push({'msg': whBoard.lang.getString('notSupportCanvas'), 'id': 'errorCanvas', 'className': 'error'});
                }
            }
        }

        whBoard.system.isWebRtcSupport = function(navigator, browser, version) {
            if (browser == 'Firefox') {
                if (navigator.mozGetUserMedia) {
                    whBoard.system.wbRtc.userMedia = true;
                    if (!window.mozRTCPeerConnection) {
                        whBoard.error.push({'msg': whBoard.lang.getString('notSupportPeerConnect'), 'id': 'errorPeerConnect', 'className': 'error'});
                    } else {
                        whBoard.system.wbRtc.peerCon = true;
                    }
                } else {
                    whBoard.error.push({'msg': whBoard.lang.getString('notSupportGetUserMedia'), 'id': 'errorGetUserMedia', 'className': 'error'});
                }
            } else if (browser == 'Chrome' || browser == 'Safari') {
                if (navigator.webkitGetUserMedia) {
                    whBoard.system.wbRtc.userMedia = true;
                    if (!window.webkitRTCPeerConnection) {
                        whBoard.error.push({'msg': whBoard.lang.getString('notSupportPeerConnect'), 'id': 'errorPeerConnect', 'className': 'error'});
                    } else {
                        whBoard.system.wbRtc.peerCon = true;
                    }
                } else {
                    whBoard.error.push({'msg': whBoard.lang.getString('notSupportGetUserMedia'), 'id': 'errorGetUserMedia', 'className': 'error'});
                }
            } else if (browser == 'MSIE' && version <= 9) {
                whBoard.error.push({'msg': whBoard.lang.getString('notSupportWebRtc'), 'id': 'errorWebRtc', 'className': 'error'});
            }
        }

        whBoard.system.isWebSocketSupport = function(navigator, browser, version) {
            whBoard.system.webSocket = {};
            if (typeof window.WebSocket != 'undefined' && (typeof window.WebSocket == 'function' || typeof window.WebSocket == 'object') && window.WebSocket.hasOwnProperty('OPEN')) {
                whBoard.system.webSocket = true;
            } else {
                whBoard.error.push({'msg': whBoard.lang.getString('notSupportWebSocket'), 'id': 'errorWebSocket', 'className': 'error'});
            }
        }

        whBoard.system.measureResoultion = function(resolution) {
            if(typeof vcan.main.offset != 'undefined'){
                var offset = vcan.main.offset;
            }else{
             	var element = document.getElementById('vcanvas');
                var offset = vcan.utility.getElementOffset(element);
            }
            var offsetLeft = offset.x;
            if (resolution.width < 1024) {
                var width = 1024 - offsetLeft;
            } else {
                var width = resolution.width - offsetLeft;
            }
            var height = resolution.height - offset.y;
            return {'width': (width), 'height': (height)};
        }

        whBoard.system.setCanvasDimension = function() {
            var measureRes = whBoard.system.measureResoultion({'width': window.outerWidth, 'height': window.innerHeight});
            var vcanvas = document.getElementById('vcanvas');
            var  rightOffSet = whBoard.utility.getElementRightOffSet(vcanvas);
            console.log('rightOffSet ' + rightOffSet);
            measureRes.width = measureRes.width - rightOffSet; //60 for right edge
            vcanvas.style.width = measureRes.width + 'px';
            if (typeof vcan.main.canvas != 'undefined') {
                var canvas = vcan.main.canvas;
                ctx = vcan.main.canvas.getContext('2d');

                canvas.width = measureRes.width;
                canvas.height = measureRes.height
                //this would be added for moodle clean theme.
                // as first offset of canvas is different afte put the canvas element.
                var element = document.getElementById('canvas');
                var offset = vcan.utility.getElementOffset(element);
                vcan.main.offset.x = offset.x;
            }
        }

        whBoard.system.getResoultion = function(windowWidth) {
            var resolution = {};
            if (windowWidth < 1280) {
                resolution.width = 1024;
                resolution.height = 768;
            } else if (windowWidth >= 1280 && windowWidth < 1366) {
                resolution.width = 1280;
                resolution.height = 1024;
            } else if (windowWidth >= 1366 && windowWidth < 1920) {
                resolution.width = 1366;
                resolution.height = 768;
            } else if (windowWidth >= 1920) {
                resolution.width = 1920;
                resolution.height = 1080;
            }
            return resolution;
        }

        window.addEventListener('resize',
            function (){
                if(window.earlierWidth != window.innerWidth){
                    whBoard.system.setCanvasDimension();
                }
            }
        );

        window.addEventListener('resize',
            function (){
                if(window.earlierWidth != window.innerWidth){
                    whBoard.view.window.resize();
                }
            }
        );

        var browser = whBoard.system.mybrowser.detection();
        var browserName = browser[0];
        var browserVersion = browser[1];
        whBoard.system.mybrowser.name = browserName;
        whBoard.system.mybrowser.version = browserVersion;

        whBoard.system.isCanvasSupport(navigator, browserName, browserVersion);
        whBoard.system.isWebRtcSupport(navigator, browserName, browserVersion);
        whBoard.system.isWebSocketSupport(navigator, browserName, browserVersion);
    }
)(window);
