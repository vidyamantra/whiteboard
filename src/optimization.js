// This file is part of Vidyamantra - http:www.vidyamantra.com/
/**@Copyright 2014  Vidyamantra Edusystems. Pvt.Ltd.
 * @author  Suman Bogati <http://www.vidyamantra.com>
  */

var optimization = function(socket, time) {
    return {
        socket: socket,
        time: time,
        sendPacketWithOptimization: function(jobj, readyState, time) {
            if (typeof this.lastarrowtime == 'undefined') {
                this.lastarrowtime = new Date().getTime();
                whBoard.sentPackets = whBoard.sentPackets + jobj.length;
                if (readyState == 1) {
                    io.send(JSON.parse(jobj));
                }

                whBoard.utility.updateSentInformation(jobj, true);
            }

            this.presentarrowtime = new Date().getTime();
            if ((this.presentarrowtime - this.lastarrowtime) >= time) {
                whBoard.sentPackets = whBoard.sentPackets + jobj.length;
                if(readyState == 1){
                    io.send(JSON.parse(jobj));
                }
                whBoard.utility.updateSentInformation(jobj, true);
                this.lastarrowtime = new Date().getTime();
            }
        }
    }
}

vcan.doOptiMize = function(e) {
    if (((typeof lastmousemovetime == 'undefined') || (lastmousemovetime == null))) {
        lastmousemovetime = new Date().getTime();
        if (!e.detail.hasOwnProperty('cevent')) {
            vcan.calculatePackets(lastmousemovetime, 'm', (e.clientX - vcan.main.offset.x), (e.clientY - vcan.main.offset.y));
        }
    }

    presentmousemovetime = new Date().getTime();

    if ((presentmousemovetime - lastmousemovetime) >= 2000) {	 // Optimized
        var currTime = new Date().getTime();
        if (!e.detail.hasOwnProperty('cevent')) {
            vcan.calculatePackets(lastmousemovetime, 'm', (e.clientX - vcan.main.offset.x), (e.clientY - vcan.main.offset.y));
        }
        vcan.calculatePackets(lastmousemovetime, 'm', (e.clientX - vcan.main.offset.x), (e.clientY - vcan.main.offset.y));
        lastmousemovetime = new Date().getTime();
    }
}

vcan.calculatePackets = function(time, ac, x, y) {
    var obj = vcan.makeStackObj(time, ac, x, y);
    whBoard.uid++;
    obj.uid = whBoard.uid;
    vcan.main.replayObjs.push(obj);
    whBoard.utility.beforeSend({'repObj': [obj]});
    localStorage.repObjs = JSON.stringify(vcan.main.replayObjs);
    whBoard.utility.updateSentPackets(obj);
}