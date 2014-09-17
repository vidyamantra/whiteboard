/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

(
  function (window){
      window.vmApp = function (){
          return {
              wbConfig : { id : "vAppWhiteboard", classes : "appOptions"},
              ssConfig : { id : "vAppscreenShare", classes : "appOptions"},
              wssConfig :{ id : "vAppWholeScreenShare", classes : "appOptions"}, 
              rWidgetConfig : {id: 'widgetRightSide' },
              wb : "", 
              ss : "",
              wss: "",
              rw : "",
              lang : {},
              init : function (urole){
                  this.lang.getString = window.getString;
                  this.lang.message = window.message;
                  this.vutil = window.vutil;
                  this.clear = "";
                  this.html.init(this);
                  
                  if(urole == 't'){
                      this.html.optionsWithWrapper();
                      this.attachFunction();
                  }
                  
                  this.adapter = window.adapter;
                  this.makeAppReady("whiteboardtool");
              },
              
              html : {
                id : "vAppCont",
                optionsClass : "appOptions",
                init : function (cthis){
                    this.vapp = cthis;   
                },
                
                optionsWithWrapper : function (){
                    var appCont = document.getElementById(this.id);
                    var appOptCont =  this.createElement('div', 'vAppOptionsCont');
                    appCont.insertBefore(appOptCont, appCont.firstChild);
                        
                    this.createDiv(vApp.wbConfig.id + "Tool", "whiteboard", appOptCont, vApp.wbConfig.classes);
                    this.createDiv(vApp.ssConfig.id + "Tool", "screenshare", appOptCont, vApp.ssConfig.classes);
                    this.createDiv(vApp.wssConfig.id + "Tool", "wholescreenshare", appOptCont, vApp.wssConfig.classes);
                    
                    //this.createDiv(vApp.ssConfig.id + "Tool", "screenshare", appOptCont, vApp.ssConfig.classes);
                    
                },  
                
                createDiv: function(toolId, text, cmdToolsWrapper, cmdClass) {
                    var ancTag = document.createElement('a');
                    ancTag.href = '#';

                    var lDiv = document.createElement('div');
                    lDiv.id = toolId;
                    if (typeof cmdClass != 'undefined') {
                        lDiv.className = cmdClass;
                    }

                    var imgTag = document.createElement('img');
                    
                    imgTag.alt = this.vapp.lang.getString(text);
                    if(typeof window.whiteboardPath != 'undefined'){
                        imgTag.src = window.whiteboardPath + '/images/' + text + ".png";
                    }else{
                        imgTag.src = '/images/' + text + ".png";
                    }
                    ancTag.appendChild(imgTag);
                    ancTag.title = '';
                    ancTag.dataset.title = text;
                    ancTag.className = 'tooltip';

                    lDiv.appendChild(ancTag);

                    cmdToolsWrapper.appendChild(lDiv);
                },
                
                
                //todo transfered into vutility
                createElement : function (tag, id, _class){
                    var elem = document.createElement(tag);
                    if(typeof id != 'undefined'){
                        elem.id = id;
                    }

                    if(typeof _class != 'undefined'){
                        if(_class.length > 1){
                          for(var i=0; i<_class.length; i++){
                             elem.className += _class[i] + " ";
                          }
                        }
                    }
                    return elem;
                }
              },
              
              
              makeAppReady : function (app, cusEvent){
                  
                  
                  if(app == 'whiteboardtool'){
                      if(typeof this.ss == 'object'){
                            this.ss.prevStream = false;   
                       } 
                      
                       
                        if(typeof this.previous != 'undefined'){
                            if(typeof cusEvent != 'undefined' && cusEvent == "byclick"){
                                io.send({'dispWhiteboard' : true});
                            }
                            document.getElementById(vApp.previous).style.display = 'none';
                        }
                        
                        var wb = document.getElementById(this.wbConfig.id);
                        
                        if(wb != null){
                            wb.style.display = 'block';
                        }
                        
                        //this should be checked with solid condition
                        
                        if(typeof this.wb != 'object'){
                            this.wb = new window.whiteboard(this.wbConfig); 
                            this.wb.utility = new window.utility();


                            this.wb.view = window.view;
                            this.wb.system = window.system;

                            this.wb.packContainer = new window.packContainer();
                            this.wb.draw_object = window.draw_object;
                            this.wb.makeobj =  window.makeobj;
                            this.wb.readyFreeHandObj = window.readyFreeHandObj;
                            this.wb._replay = _replay;
                            this.wb.readyTextObj = window.readyTextObj;

    //                        this.adapter = window.adapter;

                            this.wb.media = window.media; 
                            this.wb.bridge = window.bridge;
                            this.wb.response = window.response;
                        }
                        
                        if(typeof this.prevApp != 'undefined' && this.prevApp.hasOwnProperty('currentStream')){
                            this.prevApp.unShareScreen();    
                        }
                        
                        this.previous = this.wbConfig.id;
                  }else if(app == "screensharetool"){
                      
                        if(typeof this.ss != 'object'){
                            this.ss = new window.screenShare(vApp.ssConfig);
                        }
                        
                        this.ss.init({type: 'ss', app : app});
                        
                        //this.previous = vApp.ssConfig.id;
                  }else if(app == "wholescreensharetool"){
                      if(typeof this.wss != 'object'){
                            this.wss = new window.screenShare(vApp.wssConfig);
                      }
                        
                   // this.wss.init(app);
                    
                    this.wss.init({type: 'wss', app : app});
                  }
              },
              
              attachFunction :function (){
                  var allAppOptions = document.getElementsByClassName("appOptions");
                  for(var i=0; i<allAppOptions.length; i++){
                      //allAppOptions[i].onclick = this.initlizer.bind(this, allAppOptions[i]);
                      var anchTag = allAppOptions[i].getElementsByTagName('a')[0];
                      //anchTag.addEventListener('click', this.initlizer);
                      var that = this;
                      anchTag.onclick = function (){
                          that.initlizer(this)
                      };
                  }
              },
              
              initlizer : function (elem){
                   var appName = elem.parentNode.id.split("vApp")[1].toLowerCase();
                   
                   if(!this.PrvAndCurrIsWss(this.previous, appName)){
                       this.makeAppReady(appName, "byclick");
                   }else{
                       alert("Already the whole screen is being shared.");
                   }
//                   
//                   
//                    if(this.previous == 'vAppWholeScreenShare' && appName == 'wholescreensharetool'){
//                        alert("Already the whole screen is being shared.");
//                    }else{
//                        this.makeAppReady(appName, "byclick");
//                    }
                  
              },
              
              render : function(){
                  
              },
              
              PrvAndCurrIsWss : function (previous, appName){
                        return (previous == 'vAppWholeScreenShare' && appName == 'wholescreensharetool') ? true : false;
              },
              
               
              //TODO remove this function
              //the same function is defining at script.js
               
          }
      }
  }
)(window);