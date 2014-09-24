/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

(
    function (window){
        var vutil = {
             createDOM : function (tag, id, _class){
                var elem = document.createElement(tag);
                if(typeof id != 'undefined'){
                    elem.id = id;
                }
                
                if(typeof _class != 'undefined'){
                    var classes = "";
                    if(_class.length > 0){
                      for(var i=0; i<_class.length; i++){
                         classes += _class[i] + " ";
                      }
                    }
                    
                    elem.className = classes;
                }

                return elem;
            },
            
            ab2str : function(buf) {
                    return String.fromCharCode.apply(null, new Uint8ClampedArray(buf));
            },
            
            str2ab : function(str) {
                var buf = new ArrayBuffer(str.length); // 2 bytes for each char
                var bufView = new Uint8ClampedArray(buf);
                for (var i=0, strLen=str.length; i<strLen; i++) {
                  bufView[i] = str.charCodeAt(i);
                }
                return bufView;
            },
            
            sidebarHeightInit : function (){
                var sidebar = document.getElementById("widgetRightSide");
                sidebar.style.height = (window.innerHeight) + "px";
            },
            
             isSystemCompatible: function() {
                if (window.vApp.error.length > 0) {
                    for (var i = 0; i < window.vApp.error.length; i++) {
                        var error = window.vApp.error[i];
                        if (error.hasOwnProperty('msg')) {
                            vApp.wb.view.displayMessage(error.msg, error.id, error.className);
                        }
                    }
                }
            },
            
            chkValueInLocalStorage : function(property) {
                if (localStorage.getItem(property) === null) {
                    return false;
                } else {
                    return localStorage[property];
                }
            },
            
        }
        window.vutil = vutil;
    }
)(window);