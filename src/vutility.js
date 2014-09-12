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
            }
        }
        window.vutil = vutil;
    }
)(window);