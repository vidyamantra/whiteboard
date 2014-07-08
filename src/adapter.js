// This file is part of google
/**
 * @author(Current)  Suman Bogati <http://www.vidyamantra.com>
 * @author(Previous) google.
  */

(
    function(window) {
        var whBoard = window.whBoard;
        whBoard.RTCPeerConnection = null;
        var attachMediaStream = null;
        var reattachMediaStream = null;
        window.webrtcDetectedBrowser = null;

        if (whBoard.system.wbRtc.peerCon == true && whBoard.system.wbRtc.userMedia == true) {
            if (navigator.mozGetUserMedia) {
                console.log("This appears to be Firefox");
                window.webrtcDetectedBrowser = "firefox";
                whBoard.RTCPeerConnection = mozRTCPeerConnection;
                whBoard.RTCSessionDescription = mozRTCSessionDescription;
                whBoard.RTCIceCandidate = mozRTCIceCandidate;
                navigator.getUserMedia = navigator.mozGetUserMedia;

                whBoard.attachMediaStream = function(element, stream) {
                    whBoard.videoAdd = true;
                    console.log("Attaching media stream");
                    element.mozSrcObject = stream;
                    element.play();
                };

                reattachMediaStream = function(to, from) {
                    console.log("Reattaching media stream");
                    to.mozSrcObject = from.mozSrcObject;
                    to.play();
                };

                // Fake get{Video,Audio}Tracks
                MediaStream.prototype.getVideoTracks = function() {
                    return [];
                };

                MediaStream.prototype.getAudioTracks = function() {
                    return [];
                };
            } else if (navigator.webkitGetUserMedia) {
                console.log("This appears to be Chrome");
                window.webrtcDetectedBrowser = "chrome";
                whBoard.RTCPeerConnection = webkitRTCPeerConnection;
                whBoard.RTCSessionDescription = RTCSessionDescription;
                whBoard.RTCIceCandidate = RTCIceCandidate;
                navigator.getUserMedia = navigator.webkitGetUserMedia;

                whBoard.attachMediaStream = function(element, stream) {
                    element.src = window.URL.createObjectURL(stream);
                    whBoard.videoAdd = true;
                };

                reattachMediaStream = function(to, from) {
                    to.src = from.src;
                };

                // The representation of tracks in a stream is changed in M26
                // Unify them for earlier Chrome versions in the coexisting period
                if (!webkitMediaStream.prototype.getVideoTracks) {
                    webkitMediaStream.prototype.getVideoTracks = function() {
                        return this.videoTracks;
                    };
                    webkitMediaStream.prototype.getAudioTracks = function() {
                        return this.audioTracks;
                    };
                }

                // New syntax of get streams method in M26
                if (!webkitRTCPeerConnection.prototype.getLocalStreams) {
                    webkitRTCPeerConnection.prototype.getLocalStreams = function() {
                        return this.localStreams;
                    };
                    webkitRTCPeerConnection.prototype.getRemoteStreams = function() {
                        return this.remoteStreams;
                    };
                }
            } else {
                console.log("Browser does not appear to be WebRTC-capable");
            }

        }
    }
)(window);
