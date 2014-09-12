// This file is part of Vidyamantra - http:www.vidyamantra.com/
/**@Copyright 2014  Vidyamantra Edusystems. Pvt.Ltd.
 * @author  Suman Bogati <http://www.vidyamantra.com>
  */

(
    function (window){
   
    var optiomize = {
        sendPacketWithOptimization: function(jobj, readyState, time) {
            if (typeof this.lastarrowtime == 'undefined') {
                this.lastarrowtime = new Date().getTime();
                vApp.wb.sentPackets = vApp.wb.sentPackets + jobj.length;
                if (readyState == 1) {
                    io.send(JSON.parse(jobj));
                }

                vApp.wb.utility.updateSentInformation(jobj, true);
            }

            this.presentarrowtime = new Date().getTime();
            if ((this.presentarrowtime - this.lastarrowtime) >= time) {
                vApp.wb.sentPackets = vApp.wb.sentPackets + jobj.length;
                if(readyState == 1){
                    io.send(JSON.parse(jobj));
                }
                vApp.wb.utility.updateSentInformation(jobj, true);
                this.lastarrowtime = new Date().getTime();
            }
        },

        doOptiMize : function(e) {
            if (((typeof lastmousemovetime == 'undefined') || (lastmousemovetime == null))) {
                lastmousemovetime = new Date().getTime();
                if (!e.detail.hasOwnProperty('cevent')) {
                    vcan.optimize.calculatePackets(lastmousemovetime, 'm', (e.clientX - vcan.main.offset.x), (e.clientY - vcan.main.offset.y));
                }
            }

            presentmousemovetime = new Date().getTime();

            if ((presentmousemovetime - lastmousemovetime) >= 2000) {	 // Optimized
                var currTime = new Date().getTime();
                if (!e.detail.hasOwnProperty('cevent')) {
                    vcan.optimize.calculatePackets(lastmousemovetime, 'm', (e.clientX - vcan.main.offset.x), (e.clientY - vcan.main.offset.y));
                }
                vcan.optimize.calculatePackets(lastmousemovetime, 'm', (e.clientX - vcan.main.offset.x), (e.clientY - vcan.main.offset.y));
                lastmousemovetime = new Date().getTime();
            }
        },

        calculatePackets : function(time, ac, x, y) {
            var obj = vcan.makeStackObj(time, ac, x, y);
            vApp.wb.uid++;
            obj.uid = vApp.wb.uid;
            vcan.main.replayObjs.push(obj);
            vApp.wb.utility.beforeSend({'repObj': [obj]});
            localStorage.repObjs = JSON.stringify(vcan.main.replayObjs);
            vApp.wb.utility.updateSentPackets(obj);
        }
    }
    vcan.optimize = optiomize;
//
//var optimization = function(socket, time) {
//    return {
//        socket: socket,
//        time: time,
//        sendPacketWithOptimization: function(jobj, readyState, time) {
//            if (typeof this.lastarrowtime == 'undefined') {
//                this.lastarrowtime = new Date().getTime();
//                vApp.wb.sentPackets = vApp.wb.sentPackets + jobj.length;
//                if (readyState == 1) {
//                    io.send(JSON.parse(jobj));
//                }
//
//                vApp.wb.utility.updateSentInformation(jobj, true);
//            }
//
//            this.presentarrowtime = new Date().getTime();
//            if ((this.presentarrowtime - this.lastarrowtime) >= time) {
//                vApp.wb.sentPackets = vApp.wb.sentPackets + jobj.length;
//                if(readyState == 1){
//                    io.send(JSON.parse(jobj));
//                }
//                vApp.wb.utility.updateSentInformation(jobj, true);
//                this.lastarrowtime = new Date().getTime();
//            }
//        }
//    }
//}
//
//vcan.optimize.doOptiMize = function(e) {
//    if (((typeof lastmousemovetime == 'undefined') || (lastmousemovetime == null))) {
//        lastmousemovetime = new Date().getTime();
//        if (!e.detail.hasOwnProperty('cevent')) {
//            vcan.optimize.calculatePackets(lastmousemovetime, 'm', (e.clientX - vcan.main.offset.x), (e.clientY - vcan.main.offset.y));
//        }
//    }
//
//    presentmousemovetime = new Date().getTime();
//
//    if ((presentmousemovetime - lastmousemovetime) >= 2000) {	 // Optimized
//        var currTime = new Date().getTime();
//        if (!e.detail.hasOwnProperty('cevent')) {
//            vcan.optimize.calculatePackets(lastmousemovetime, 'm', (e.clientX - vcan.main.offset.x), (e.clientY - vcan.main.offset.y));
//        }
//        vcan.optimize.calculatePackets(lastmousemovetime, 'm', (e.clientX - vcan.main.offset.x), (e.clientY - vcan.main.offset.y));
//        lastmousemovetime = new Date().getTime();
//    }
//}
//
//vcan.optimize.calculatePackets = function(time, ac, x, y) {
//    var obj = vcan.makeStackObj(time, ac, x, y);
//    vApp.wb.uid++;
//    obj.uid = vApp.wb.uid;
//    vcan.main.replayObjs.push(obj);
//    vApp.wb.utility.beforeSend({'repObj': [obj]});
//    localStorage.repObjs = JSON.stringify(vcan.main.replayObjs);
//    vApp.wb.utility.updateSentPackets(obj);
//}
}            
)(window);
