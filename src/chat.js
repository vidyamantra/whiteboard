 /* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

(
    function(window) {
        //vApp.wb = window.vApp.wb;
        var chat = function (){
            return {
                init : function(){
                   this.mainWrapperId = "chatContainer";
                   this.mainChatBoxId = "chatBox";
                   this.commonChatId = "commonChatBoard";
                   this.inputBoxId =  "textInputBox";
                   this.userChatList = [];
                   this.wrapper(); 
                   var msg = localStorage.getItem('msg');
                   this.loadChatFromLocal();
                },
                
                wrapper : function (){
                   //div create common board for chat 
                   var chatBox = document.createElement('div');
                   chatBox.id = this.mainChatBoxId;
                   
                   var commonChatBd = document.createElement('div');
                   commonChatBd.id = this.commonChatId;
                   
                   this.inputBox = document.createElement('textarea');
                   this.inputBox.disabled=false;
                   this.inputBox.id = this.inputBoxId;

                   this.inputBox.addEventListener("keyup", this.gettingMessage.bind(this));
                   chatBox.appendChild(commonChatBd);
                   chatBox.appendChild(this.inputBox);
                   document.getElementById(this.mainWrapperId).appendChild(chatBox);
                   vApp.vutil.sidebarHeightInit();        
                },
                
                loadChatFromLocal : function (){
                    var chatList = JSON.parse(localStorage.getItem('uChatList'));
                    if(chatList !=  null && chatList.length > 0){
                        this.userChatList = [];
                        for(var i=0; i<chatList.length; i++){
                            this.display(chatList[i]);
                        }
                    }
                }, 
                
                gettingMessage : function (e){
                    var cthis =  e.target;
                    var msgLength = this.getMessageWidth(cthis.id);
                  
                    if(e.keyCode == 13){
                       var message = cthis.value.trim();
                       
                       //removing new line from string 
                       message = message.replace(/(\r\n|\n|\r)/gm,"");
                       if(message.length > 0 && message != ""){
                            var user = {id : vApp.gObj.uid, name : vApp.gObj.uName, msg : message};
                            vApp.wb.utility.beforeSend({"userMsg": user});
                            cthis.value = "";
                       }
                    }
                },
                
                getMessageWidth : function (elemId){
                    var elem = document.getElementById(elemId);
                    var theCSSprop = window.getComputedStyle(elem,null).getPropertyValue("font-size");
                    return elem.value.length * 10;
                },
                
                calcFontSize : function (){
                    
                },
                 
                
                display : function (user){
                    var msg = {};
                    localStorage.setItem('msg', msg);
                    var msgBox = document.createElement('div');
                    msgBox.className = "msgCont" + user.id;
                    var element = document.createElement('span');
                    element.className = "userName";
                    element.innerHTML = user.name + " : ";
                    msgBox.appendChild(element);
                    var msgCont = document.createElement("span");
                    msgCont.className = "userMsg";
                    msgCont.innerHTML = user.msg;
                    
                    this.userChatList.push(user);
                    localStorage.setItem('uChatList', JSON.stringify(this.userChatList));

                    msgBox.appendChild(msgCont);
                    document.getElementById(this.commonChatId).appendChild(msgBox);
                    this.stickScrollbarAtBottom();
                },
                
//                requestMissedPackets : function (start, end){
//                    alert('suman');
//                    debugger;
//                    this.requestUser = true;
//                    vApp.wb.utility.beforeSend({"chatPackReqest": [start, end]});
//                },
                
                //TODO userChatList is not a good name.
                sendPackets : function (user, sp){
                    if(sp + 1 < this.userChatList.length){
                        var chatMissedPackets =  this.userChatList.slice(sp, this.userChatList.length);
                        vApp.wb.utility.beforeSend({"chatPackResponsed": chatMissedPackets, "byRequest": user });
                    }
                    
                },
                
                displayMissedChats : function (chatArray){
                    for(var i=0; i<chatArray.length; i++){
                        this.display(chatArray[i]);
                    }
                },
                
                stickScrollbarAtBottom : function (){
                    var chatBox = document.getElementById("commonChatBoard");
                    chatBox.scrollTop = chatBox.scrollHeight;
                },
                
                makeNameInCapital : function(){
                    
                },
                
                alreadyExist : function (id){
                    var element = document.getElementById(id);
                    return (element != null) ? true : false;
                }                    
            }
        }
        
        window.chat = chat;
        
        
    }
)(window);

