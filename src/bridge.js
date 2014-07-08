// This file is part of Vidyamantra - http:www.vidyamantra.com/
/**@Copyright 2014  Vidyamantra Edusystems. Pvt.Ltd.
 * @author  Suman Bogati <http://www.vidyamantra.com>
  */

(
    function(window) {
        var whBoard = window.whBoard;

        whBoard.bridge.requestPackets = function(msgRepObj) {
            //more than one packets comes after connection on
            if (msgRepObj.length > 1) {
                whBoard.gObj.myArr = msgRepObj;
            }

            whBoard.sentReq = true;
            var sp = whBoard.gObj.rcvdPackId;
            var ep = msgRepObj[0].uid;
            return [sp, ep];
        }

        whBoard.bridge.makeQueue = function(e) {
            if (whBoard.gObj.rcvdPackId != whBoard.gObj.displayedObjId) {
                whBoard.gObj.packQueue = whBoard.gObj.packQueue.concat(e.message.repObj);
            }
        }

        whBoard.bridge.sendPackets = function(e, chunk) {
            if (e.message.getMsPckt[0] == 0) {
                var i = -1;
            } else {
                var fs = e.message.getMsPckt[0].uid;
                //TODO myrepObj should be changed into another name.
                for (var i = 0; i < whBoard.gObj.myrepObj.length; i++) {
                    if (e.message.getMsPckt[0] == whBoard.gObj.myrepObj[i].uid) {
                        fs = e.message.getMsPckt[0];
                        break;
                    }
                }
            }

            for (var j = i + 1; j < e.message.getMsPckt[1]; j++) {
                chunk.push(whBoard.gObj.myrepObj[j]);
            }
            return chunk;
        },
                whBoard.bridge.handleMissedPackets = function(fromUserId, id, repObj) {
                    var repObj = whBoard.bridge.removeDupObjs(repObj);
                    whBoard.gObj.replayObjs = whBoard.gObj.replayObjs.concat(repObj);
                    whBoard.bridge.sortingReplyObjs();

                    if (fromUserId != id) {
                        localStorage.repObjs = JSON.stringify(whBoard.gObj.replayObjs);
                    }
                    whBoard.bridge.containsIfQueuePacks(fromUserId, id, whBoard.gObj.displayedObjId, repObj);
                }

        whBoard.bridge.removeDupObjs = function(repObj) {
            if (whBoard.gObj.myArr.length > 0) {
                if (repObj[repObj.length - 1].uid == whBoard.gObj.myArr[0].uid) {
                    if (!whBoard.gObj.myArr[0].hasOwnProperty('cmd')) {
                        whBoard.gObj.myArr.shift();
                    }
                }
                repObj = repObj.concat(whBoard.gObj.myArr);
                whBoard.gObj.myArr = [];
            }
            return repObj;
        }

        whBoard.bridge.containsIfQueuePacks = function(fromUserId, id, dispId, repObj) {
            if (fromUserId != id && (dispId + 1 != repObj[0].uid)) {
                if (whBoard.gObj.packQueue.length > 0) {
                    if (repObj[repObj.length - 1].uid == whBoard.gObj.packQueue[0].uid) {
                        var fArr = repObj;
                        whBoard.gObj.packQueue = fArr.concat(whBoard.gObj.packQueue);
                    }
                }
            }
        },
        whBoard.bridge.sortingReplyObjs = function() {
            whBoard.gObj.replayObjs = whBoard.gObj.replayObjs.sort(function(a, b) {
                return a.uid - b.uid;
            });
        }

    }
)(window);