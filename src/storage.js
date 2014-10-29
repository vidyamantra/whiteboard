// This file is part of Vidyamantra - http:www.vidyamantra.com/
/**@Copyright 2014  Vidyamantra Edusystems. Pvt.Ltd.
 * @author  Suman Bogati <http://www.vidyamantra.com>
  */
(
    function(window) {
        var adData = [];
        var wbDataArr = [];
        
        var storage = {
            init : function (){
                 that = this;
                var openRequest = window.indexedDB.open("vidya_app", 1);
                
                openRequest.onerror = function(e) {
                    console.log("Error opening db");
                    console.dir(e);
                };
                
                openRequest.onupgradeneeded = function(e) {
                    var thisDb = e.target.result;
                    var objectStore;

                    //Create Note OS
                    
                    if(!thisDb.objectStoreNames.contains("wbData")) {
                        thisDb.createObjectStore("wbData", { keyPath : 'timeStamp', autoIncrement:true});
                    }
                    
                    if(!thisDb.objectStoreNames.contains("audioData")) {
                        thisDb.createObjectStore("audioData", { keyPath : 'timeStamp', autoIncrement:true});
                    }
                    
                    if(!thisDb.objectStoreNames.contains("allData")) {
                       thisDb.createObjectStore("allData", { keyPath : 'timeStamp', autoIncrement:true});
                     //   thisDb.createObjectStore("allData", {autoIncrement:true});
                    }
                    
                };
                
                openRequest.onsuccess = function(e) {
                    db = e.target.result;
                    db.onerror = function(event) {
                      // Generic error handler for all errors targeted at this database's
                      // requests!
                      //alert("Database error: " + event.target.errorCode);
                      console.dir(event.target);
                    };
                    
                    that.getAllObjs();
                 //   vApp.wb.utility.replayFromLocalStroage();
                  //  vApp.gObj.video.audio.assignFromLocal();

//                    setInterval(
//                        function (){   
//                            var number = Math.floor(Math.random() * 9);
//                            console.log('number to put ' + number);
//                            that.store(number);
//                        }, 
//                        100
//                    );
//                    
//                    setInterval(
//                        function (){
//                            that.displayData();
//                        },
//                        100
//                    );
                };
            },
            
            store : function (data){
                var t = db.transaction(["wbData"], "readwrite");  
                //t.objectStore("wbData").delete();
                
                var objectStore = t.objectStore("wbData");
                objectStore.clear();
                t.objectStore("wbData").add({repObjs :data , timeStamp : new Date().getTime(), id : 1})
                
                
                  
//                return true;
//                var t = db.transaction(["vapp"], "readwrite");
//                if(typeof key == "undefined") {
//                    key = true;
//                    t.objectStore("vapp").add({repObjs :data , updated: new Date().getTime(), id : 1});
//                } else {
//                    t.objectStore("vapp").put({repObjs :data,updated:new Date().getTime(), id : 1});
//                }
                return false;
            },
            
            audioStore : function (data){
//                localStorage.audiostream = data;
//                return;
                
                var t = db.transaction(["audioData"], "readwrite");
                t.objectStore("audioData").add({audiostream :data , timeStamp: new Date().getTime(), id : 2});
                
                return false;
            },
            
            wholeStore_working : function (dt, type){
                //alert(typeof dt);
                var dtArr = [];
                var currTime = new Date().getTime();
                
                if(typeof dt == "object" && !(dt instanceof Array) ) {
                    //dt.peTime = window.pageEnter;
                    
                    dtArr.push(dt);
                }else{
                    dtArr = dt;
                }
                 
                for(var i=0; i<dtArr.length; i++){
                    var dt = dtArr[i];
                    currTime = dt.mt;
                    
                    console.log("current Time " + currTime);
                    
                    dt.peTime = window.pageEnter;
                    var data = JSON.stringify((dt));
                    
                    if(typeof window.prevTime != 'undefined' && currTime == window.prevTime){
                        currTime = currTime + 1;
                    }

                    var t = db.transaction(["allData"], "readwrite");

                    if(typeof type == 'undefined'){
                        t.objectStore("allData").add({recObjs :data, timeStamp : currTime, id : 3});
                    }else{
                        t.objectStore("allData").put({recObjs :data, timeStamp :window.prevTime, id : 3});
                    }
                    

                    window.wholeStoreData = data;
                    window.prevTime = currTime;
                } 
            },
            
            
            wholeStore : function (obj, type){
                obj.peTime = window.pageEnter;
                
                var data = JSON.stringify(obj);
                
                var currTime = new Date().getTime();
                
                if(typeof window.prevTime != 'undefined' && currTime == window.prevTime){
                    currTime = currTime + 1;
                }
                
                var t = db.transaction(["allData"], "readwrite");
                
                if(typeof type == 'undefined'){
                    t.objectStore("allData").add({recObjs :data, timeStamp : currTime, id : 3});
                }else{
                    t.objectStore("allData").put({recObjs :data, timeStamp :window.prevTime, id : 3});
                }
                
                window.wholeStoreData = data;
                window.prevTime = currTime;
            },
            
            displayData : function (){
                var transaction = db.transaction(["vapp"], "readonly"); 
                var objectStore = transaction.objectStore("vapp");
                objectStore.openCursor().onsuccess =  that.handleResult;
            },
            
            getAllObjs : function (){
//                alert('suman');
//                debugger;
                //mycallback = callback;
                //var tables = ["allData", "audioData"];
                
                
//                var adArr = JSON.parse(localStorage.audiostream);
//                vApp.gObj.video.audio.assignFromLocal(adArr);

                var tables = ["wbData", "allData", "audioData"];
                for(var i=0; i<tables.length; i++){
                    var transaction = db.transaction(tables[i], "readonly"); 
                    var objectStore = transaction.objectStore(tables[i]);
                    
                    objectStore.openCursor().onsuccess =  (
                        function (val){
                            return function (){
                                that[tables[val]].handleResult();
                            }
                        }
                    )(i);
                }
            },
            
            
            wbData : {
                handleResult : function (){
                    var cursor = event.target.result;  
                    if (cursor) {
                        if(cursor.value.hasOwnProperty('repObjs')){
                            
                              vApp.wb.utility.replayFromLocalStroage(JSON.parse(cursor.value.repObjs));

//                            wbDataArr.push(JSON.parse(cursor.value.repObjs));
                        }
                        cursor.continue();    
                    } else {
//                        if(wbDataArr.length > 1){
//                            vApp.wb.utility.replayFromLocalStroage(wbDataArr);
//                            
//                        }
                    }
                 }
            },
            
            audioData : {
                handleResult : function (){
                    var cursor = event.target.result;  
                    if (cursor) {
                        if(cursor.value.hasOwnProperty('audiostream')){
                            
                            adData.push(JSON.parse(cursor.value.audiostream));
                        }
                        cursor.continue();    
                    } else {
                        if(adData.length > 1){
                            vApp.gObj.video.audio.recordingLength = 0;
                            vApp.gObj.video.audio.assignFromLocal(adData);
                        }
                    }
                 }
            },
            
            
            allData : {
                handleResult : function (){
                    var cursor = event.target.result;  
                    if (cursor) {
                        if(cursor.value.hasOwnProperty('recObjs')){
                            vApp.recorder.items.push(JSON.parse(cursor.value.recObjs));
                        }
                        cursor.continue();    
                    } 
                }
            },
            shapesData : {
                handleResult : function (){
                    vApp.recorder.items.push(JSON.parse(cursor.value.recObjs));
                }
            },
            
            handleResult : function (){
                var cursor = event.target.result;  
                if (cursor) {
//                  document.getElementById('dummyResult').innerHTML = cursor.key + " " + cursor.value.repObjs;
                    //var allObjs = cursor.value.repObjs;
                    //cursor.value.hasOwnProperty('repObjs')
                    if(cursor.value.hasOwnProperty('repObjs')){
                        var allObjs = JSON.parse(cursor.value.repObjs);
                        vApp.wb.utility.replayFromLocalStroage(allObjs);
                    }else if(cursor.value.hasOwnProperty('audiostream')){
                        
                        var allObjs = JSON.parse(cursor.value.audiostream);
                        vApp.gObj.video.audio.assignFromLocal(allObjs);
                        
                    }else  if (cursor.value.hasOwnProperty('recObjs')){
                        //vApp.witems = JSON.parse(cursor.value.recObjs);
                        //vApp.recorder.items = JSON.parse(cursor.value.recObjs);
                        vApp.recorder.items.push(JSON.parse(cursor.value.recObjs));
                    }
                    
                    //var allObjs = cursor.value[item];
                    //var allObjs = JSON.parse(allObjs);
                    //mycallback(allObjs);
                    cursor.continue();
                }else{
                    
                    alert(vApp.recorder.items.length);
                    alert("something happend");
                }
            }
        }
        
        window.storage = storage;
    }
)(window);
