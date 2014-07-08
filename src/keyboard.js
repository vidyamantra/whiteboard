// This file is part of Vidyamantra - http:www.vidyamantra.com/
/**@Copyright 2014  Vidyamantra Edusystems. Pvt.Ltd.
 * @author  Suman Bogati <http://www.vidyamantra.com>
  */


(
    function(window) {
        window.onload = function() {
            var whBoard = window.whBoard;
            whBoard.keyBoard = {
                prvTool: "",
                skey: false,
                /**
                 * this function triggers the activeAll function 
                 */
                triggerActiveAll: function(e) {
                    if (e.shiftKey) {
                        console.log('what happend mere bhai');
                        whBoard.keyBoard.skey = true;
                        whBoard.keyBoard.prvTool = whBoard.tool.cmd;
                        whBoard.toolInit('t_activeall');
                        var currTime = new Date().getTime();
                        var obj = {'cmd': 't_activeall', mt: currTime};
                        vcan.main.replayObjs.push(obj);
                        whBoard.utility.beforeSend({'repObj': [obj]});
                        whBoard.vcan.main.action = 'move';
                    }
                },
                /**
                 * this function triggers the deActiveAll function 
                 */
                triggerdeActiveAll: function(e) {
                    if (whBoard.keyBoard.skey) {
                        console.log('what happend mere bhai ddd');
                        var currTime = new Date().getTime();
                        whBoard.utility.deActiveFrmDragDrop();
                        whBoard.toolInit(whBoard.keyBoard.prvTool);
                        //var obj = {'cmd': whBoard.keyBoard.prvTool,  mdTime : currTime};
                        var obj = {'cmd': whBoard.keyBoard.prvTool, mt: currTime};
                        vcan.main.replayObjs.push(obj);
                        //io.send({'repObj': [obj]}); //after optimized
                        whBoard.utility.beforeSend({'repObj': [obj]});
                    }
                }
            }

            // this is used for demo only.
            // todo should be into seprate file.
            var io = window.io;
            function connectionOpen() {
                io.wsconnect();
            }

            function connectionOff() {
                io.disconnect();
            }

        }
})(window);
