// This file is part of Vidyamantra - http:www.vidyamantra.com/
/**@Copyright 2014  Vidyamantra Edusystems. Pvt.Ltd.
 * @author  Suman Bogati <http://www.vidyamantra.com>
  */
(
    function(window) {
        var io = window.io;
//        var vcan = window.vcan;
//        
//        vApp.wb = window.vApp.wb;
        //this.recordAudio = false;
        
        
        var responseErorr = function() {
            console.log("this error is come when the create and answer is occurring");
        }
        
        //TODO change naming convention
//        var encMode = "alaw"; 
//
//        var resampler = new Resampler(44100, 8000, 1, 4096);
//        var Html5Audio = {};
//        Html5Audio.audioContext = new AudioContext();
//        
//        var imageSlices;
//        var sl= 0;
//        var prevImageSlices = [];
//        var completeImg = [];
        
        // videoChat name should be converted into 
        // another name
        
      var  media = function() {
            return {
                isChannelReady: '',
                isInitiator: false,
                isStarted: '',
                localStream: '',
                pc: [],
                cn: 0,
                ba: false,
                bb: false,
                bc: false,
                bNotRender: false,
                remoteStream: '',
                turnReady: '',
                oneExecuted: false,
                videoControlId: 'videoContainer',
                videoContainerId: "videos",
                
                audio : {
                   audioStreamArr : [],
                   tempAudioStreamArr :  [],
                   recordingLength : 0,
                   bufferSize : 0,
                   encMode : "alaw",
                   recordAudio : false,
                   resampler : new Resampler(44100, 8000, 1, 4096),
                   Html5Audio : {audioContext : new AudioContext()},
                    
                    init : function (){
//                        this.audioStreamArr = [];
//                        this.tempAudioStreamArr =  [];
//                        this.recordingLength = 0;
//                        this.bufferSize = 0;
//                        this.encMode = "alaw";
//                        this.recordAudio = false;
//                        this.resampler = new Resampler(44100, 8000, 1, 4096);
//                        this.Html5Audio = {audioContext : new AudioContext()};
                        
                        
                        this.graph = {
                            height : 56, 
                            width : 4, 
                            average : 0,
                            display : function (){
                                var cvideo = cthis.video;
                                if(vApp.wb.gObj.uRole == 't'){
                                    var avg = this.height - (this.height*this.average)/100;   
                                    this._display(cvideo.tempVidCont, avg);
                                    this._display(cthis.audio.graph.cvCont, avg);
                                }
                            },
                            
                            _display : function (context, avg){
                                context.beginPath();
                                context.moveTo(this.width, this.height);
                                context.lineTo(this.width, avg);
                                context.lineWidth = this.width;
                                context.strokeStyle = "rgba(32, 37, 247, 0.8)";
                                context.closePath();
                                context.stroke();
                            },
                            
                            canvasForVideo : function (){
                                var videoParent = cthis.video.myVideo.parentNode;
                                var graphCanvas = document.createElement("canvas");
                                graphCanvas.width = this.width + 3;
                                graphCanvas.height = this.height;

                                graphCanvas.id = "graphCanvas";   
                                videoParent.style.position = "relative"
                                graphCanvas.style.position = "absolute"
                                graphCanvas.style.left = 0;
                                graphCanvas.style.top = 0;
                                videoParent.appendChild(graphCanvas);
                            }
                        };
                    },
                    
                    recorderProcess : function (e) {
//                        this.audioInGraph();
                        this.calcAverage();
                        
                        var left = e.inputBuffer.getChannelData(0);
                        var samples = this.resampler.resampler(left);

                        if(!this.recordAudio){
                            this.audioStreamArr.push(new Float32Array(samples));
                            this.recordingLength += this.bufferSize;
                        }

                        var leftSix = convertFloat32ToInt16(samples);
                        var encoded = G711.encode(leftSix, {
                            alaw: this.encMode == "alaw" ? true : false
                        });


                        var sendstring = ab2str(encoded);
                        var send = LZString.compressToBase64(sendstring);

                        this.tempAudioStreamArr.push(send);
                        localStorage.audioStream = JSON.stringify(this.tempAudioStreamArr);
                        vApp.wb.utility.beforeSend({'audioSamp' : send});
                    },
                    
                    calcAverage : function (){
                        var array =  new Uint8Array(analyser.frequencyBinCount);
                        analyser.getByteFrequencyData(array);
                        var values = 0;

                        var length = array.length;
                        for (var i = 0; i < length; i++) {
                            values += array[i];
                        }
                        
                        this.graph.average = values / length;
                    },
                    
                    //this is not using right now
                    audioInGraph : function (){
                        var cvideo = cthis.video;
                        if(vApp.wb.gObj.uRole == 't'){
                            var avg = this.graph.height - (this.graph.height*this.graph.average)/100;   
                            cvideo.tempVidCont.beginPath();
                            cvideo.tempVidCont.moveTo(cvideo.tempVid.width-this.graph.width, this.graph.height);
                            
                            cvideo.tempVidCont.lineTo(cvideo.tempVid.width-this.graph.width, avg);
                            cvideo.tempVidCont.lineWidth = this.graph.width;
                            cvideo.tempVidCont.strokeStyle = "rgba(247, 25, 77, 1)";
                            cvideo.tempVidCont.closePath();
                            cvideo.tempVidCont.stroke();
                        }
                    },
                    
                    play : function (receivedAudio, inHowLong, offset){
                        var audioString = LZString.decompressFromBase64(receivedAudio);
                        var clip = str2ab(audioString);

                        var samples = G711.decode(clip, {
                            alaw: this.encMode == "alaw" ? true : false,
                            floating_point : true,
                            Eight : true
                        });

                        var when = this.Html5Audio.audioContext.currentTime + inHowLong;

                        var newBuffer = this.Html5Audio.audioContext.createBuffer(1, samples.length, 8000);
                        newBuffer.getChannelData(0).set(samples);

                        var newSource = this.Html5Audio.audioContext.createBufferSource();
                        newSource.buffer = newBuffer;

                        newSource.connect(this.Html5Audio.audioContext.destination);
                        newSource.start(when, offset);
                    }, 
                        
                    replay : function (inHowLong, offset){
                        //cthis = this;
                        var samples,whenTime,newBuffer,newSource, totArr8;
                        if(this.audioStreamArr.length > 0){
                            samples =  mergeBuffers(this.audioStreamArr);;

                            whenTime = this.Html5Audio.audioContext.currentTime + inHowLong;

                            //newBuffer = this.Html5Audio.audioContext.createBuffer(1, samples.length, 8000);
                            newBuffer = this.Html5Audio.audioContext.createBuffer(1, samples.length, 8000);
                            newBuffer.getChannelData(0).set(samples);

                            newSource = this.Html5Audio.audioContext.createBufferSource();
                            newSource.buffer = newBuffer;

                            newSource.connect(this.Html5Audio.audioContext.destination);
                            newSource.start(whenTime, offset); 
                        }
                    },
                    
                    assignFromLocal : function () {
                        this.init();
                        var arrStream = JSON.parse(localStorage.audioStream);
                        for(var i=0; i<arrStream.length; i++){
                            var rec1 = LZString.decompressFromBase64(arrStream[i]);
                            var clip = str2ab(rec1);

                            samples = G711.decode(clip, {
                               alaw: this.encMode == "alaw" ? true : false,
                               floating_point : true,
                               Eight : true
                            });

                            this.audioStreamArr.push(new Float32Array(samples));
                            this.recordingLength += 16384;
                        }
                    }, 
                    
                    manuPulateStream : function (){
                        var stream = cthis.stream;
                        
                        if(!vApp.wb.utility.chkValueInLocalStorage('recordStart')){
                            vApp.wb.recordStarted = new Date().getTime();
                            localStorage.setItem('recordStart', vApp.wb.recordStarted);
                        }else{
                            vApp.wb.recordStarted = localStorage.getItem('recordStart');
                        }

                        var audioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
                        var context = new audioContext();
                         analyser = context.createAnalyser();

                        var audioInput = context.createMediaStreamSource(stream);
                        cthis.audio.bufferSize = 16384;

                        var recorder = context.createScriptProcessor(cthis.audio.bufferSize, 1, 1);
                        recorder.onaudioprocess = cthis.audio.recorderProcess.bind(cthis.audio);

                        audioInput.connect(analyser);
                        analyser.connect(recorder);

                        recorder.connect(context.destination);
                    },
                    
                    updateInfo : function (){
                        this.audioStreamArr = [];
                        vApp.wb.pageEnteredTime = vApp.wb.recordStarted =  new Date().getTime();
                        this.recordAudio = false;
                    }
                },
                
                video : {
                    width : 75,
                    height : 56,
                    tempVid : "",
                    tempVidCont : "",
                    myVideo : "",
                    remoteVid : "",
                    remoteVidCont : "", 
                    maxHeight : 250,
                    
                    init : function (){
                        cthis.video.tempVid = document.getElementById('tempVideo');
                        cthis.video.tempVid.width = cthis.video.width;
                        cthis.video.tempVid.height = cthis.video.height;
                        cthis.video.tempVidCont = cthis.video.tempVid.getContext('2d');  
                        this.videoCont = document.getElementById("allVideosCont");
                        
                        this.videoCont.style.maxHeight = this.maxHeight + "px";
                    },
                    
                    calcDimension : function (){
                        //var cthis = vcan.videoChat;
                        //this.height = this.myVideo.videoHeight / (this.myVideo.videoWidth/this.width);
                        this.myVideo.width= this.width;
                        this.myVideo.height= this.height;
                    },
                    
                    //createVideo
                    createElement : function (user){
                        var videoWrapper = document.createElement('div');
                        videoWrapper.className = "videoWrapper";
//                        videoWrapper.setAttribute("data-uname", user.name);

                        var videoSubWrapper = document.createElement('div');
                        videoSubWrapper.className = "videoSubWrapper";
                        videoSubWrapper.setAttribute("data-uname", user.name);
                        videoWrapper.appendChild(videoSubWrapper);
                                        
                        vidId = user.id;
                        var video = document.createElement('canvas');
                        video.id = "video"+ vidId;
                        video.className = "userVideos";
                        video.width = this.width;
                        video.height = this.height;
                        
//                        alert("sss");
//                        debugger;
                        
                        var videoCont = this.videoCont;
                        
                        if(typeof videoCont == 'undefined'){
                            var videoCont = document.getElementById("allVideosCont");
                        }
                        
                        var prvContHeight = videoCont.offsetHeight;
                        videoSubWrapper.appendChild(video);
                        
                        if(user.hasOwnProperty('role') && user.role == 't'){
                            videoCont.insertBefore(videoWrapper, videoCont.firstChild);
                        }else{
                            videoCont.appendChild(videoWrapper);
                        }
                        
                        var newContHeight = videoCont.offsetHeight;

                        if(newContHeight != prvContHeight){
                            if(typeof cthis != 'undefined'){
                                cthis.video.updateHightInSideBar(newContHeight);
                            }
                        }
                        
                        if(videoCont.style.overflowY != 'undefined' && videoCont.style.overflowY != "scroll"){
                            videoCont.style.overflowY = "scroll";
                            document.getElementById(vApp.wb.gObj.chat.mainChatBoxId).style.borderTop = "3px solid #bbb";
                        }
                    },
                    
                    updateHightInSideBar : function (videoHeight){
                        //TODO this is not to do every time a function is called
                        var sidebar = document.getElementById('widgetRightSide');
                        var sidebarHeight = sidebar.offsetHeight;
                        var chatBox = document.getElementById("chatContainer");
                        var chatBoxHeight = sidebarHeight - videoHeight;
                        chatBox.style.height = chatBoxHeight + "px";
                    },
                    
                    send : function (){
                        var cvideo = this;
                        var frame;
                        
                        setInterval(
                             function (){
                                    //canvasContext.clearRect(0, 0, canvas.width, canvas.height);		
                                if(vApp.wb.gObj.uRole == 't'){
                                    if(typeof graphCanvas == "undefined"){
                                        var graphCanvas = document.getElementById("graphCanvas");
                                        cthis.audio.graph.cvCont = graphCanvas.getContext('2d');
                                    }
                                    cthis.audio.graph.cvCont.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
                                }

                                cvideo.tempVidCont.clearRect(0, 0, cvideo.tempVid.width, cvideo.tempVid.height);
                                cvideo.tempVidCont.drawImage(cvideo.myVideo, 0, 0, cvideo.width, cvideo.height);


                              //cthis.audio.audioInGraph();
                              if(vApp.wb.gObj.uRole == 't'){
                                  cthis.audio.graph.display();
                              }


                             frame = cvideo.tempVid.toDataURL("image/jpg", 0.3);
                             var user = {
                                 name : vApp.wb.gObj.uName,
                                 id : vApp.wb.gObj.uid
                             }

                             if(vApp.wb.gObj.uRole == 't'){
                                 user.role = vApp.wb.gObj.uRole;
                             }
                             io.send({user : user, 'videoByImage': frame});
                             },
                             1000
                         );
                     },
                     
                     startToStream : function (){
                        cthis.video.calcDimension();
                        cthis.video.send();
                     },

                     playWithoutSlice : function(msg){
                        var frames = msg.videoByImage;
                        var img = new Image();
                        img.src = frames;

                        this.remoteVid = document.getElementById("video" + msg.user.id);
                        //canvas2 = document.getElementById("video" + msg.videoId);
                        this.remoteVidCont =  this.remoteVid.getContext('2d');
                        var vthis = this;
                        
                        img.onload = function (){
                            vthis.remoteVidCont.drawImage(this, 0, 0);
                        }
                      },
                    
                    justForDemo : function (){
                        var maxHeight = 250;
                        var num  = 0;
                        var videoCont = document.getElementById("allVideosCont");
                        videoCont.style.maxHeight = maxHeight + "px";
                        
                        setInterval(
                            function (){
                                if(++num <= 20){
                                    
                                    videoCont = document.getElementById("allVideosCont");
                                    
                                    var videoWrapper = document.createElement('div');
                                        videoWrapper.className = "videoWrapper";
//                                        videoWrapper.setAttribute("data-uname", "suman" + num);
                                        
                                    var videoSubWrapper = document.createElement('div');
                                        videoSubWrapper.className = "videoSubWrapper";
                                        videoSubWrapper.setAttribute("data-uname", "suman" + num);
                                        videoWrapper.appendChild(videoSubWrapper);
                                        
                                    var prvContHeight = videoCont.offsetHeight;
                                    var video = document.createElement('video');
                                    video.className = "userVideo";
                                    video.src ="http://html5demos.com/assets/dizzy.mp4";
                                    
                                    videoSubWrapper.appendChild(video);
                                    videoCont.appendChild(videoWrapper);
                                    var newContHeight = videoCont.offsetHeight;
                                    
                                    if(newContHeight != prvContHeight){
                                        cthis.video.updateHightInSideBar(newContHeight);
                                    }
                                    
                                    if(videoCont.offsetHeight >= maxHeight){
                                        if(videoCont.style.overflowY != 'undefined' && videoCont.style.overflowY != "scroll"){
                                            videoCont.style.overflowY = "scroll";
                                            document.getElementById(vApp.wb.gObj.chat.mainChatBoxId).style.borderTop = "3px solid #bbb";
                                        }
                                    }
                                }
                            },
                            200
                        );
                    }
                },
                
                init: function(vbool) {
                    cthis = this; //TODO there should be done work for cthis
                    vcan.oneExecuted = true;
                    var audio =  (vApp.wb.gObj.uRole == 't') ?  true : false;
                    var session = {
                        audio : audio,
                        video: true
                    };
                    
                    cthis.video.init();
                    vApp.adpt = new vApp.adapter();
                    
                    navigator =  vApp.adpt.init(navigator);
                    navigator.getUserMedia(session, this.handleUserMedia, this.handleUserMediaError);
                },
               
                //equivalent to initializeRecorder
                handleUserMedia: function(stream) {
                    
                    cthis.audio.init();
                    cthis.video.myVideo = document.getElementById("myVideo"+ vApp.wb.gObj.uid);
                    
                    vApp.adpt.attachMediaStream(cthis.video.myVideo, stream);
                    
                    if(vApp.wb.gObj.uRole == 't'){
                        cthis.stream = stream;
                        cthis.audio.manuPulateStream();
                        cthis.audio.graph.canvasForVideo();
                    }
                    
                    cthis.video.myVideo.onloadedmetadata = function (){
                        cthis.video.startToStream();
                        cthis.video.updateHightInSideBar(cthis.video.myVideo.offsetHeight);
//                        cthis.video.justForDemo();
                    }
                },
                
                sendMessage: function(message) {
                    if (arguments.length > 1) {
                        vApp.wb.utility.beforeSend({'video': message}, arguments[1]);
                    } else {
                        vApp.wb.utility.beforeSend({'video': message});
                    }
                },
                
                existVideoContainer : function(user){
                    var allVideos = document.getElementsByClassName('userVideos');
                    for(var i=0; i<allVideos.length; i++ ){
                        if(allVideos[i].id == "video" + user.id){
                            return true;
                        }
                    }
                    return false;
                },
                
                handleUserMediaError: function(error) {
                    vApp.wb.view.disappearBox('WebRtc');
                    console.log('navigator.getUserMedia error: ', error);
                },
            }
            
        }
        window.media = media;
    
    
    
    function drawReceivedImage (imgDataArr, d){
        if(typeof con2 == 'undefined'){
            //canvas2 = document.getElementById('mycanvas2');
            context2 = canvas2.getContext('2d');
            con2 = true;
        }
        var imgData = decodeRGB(str2ab(imgDataArr), context2, d);
        context2.putImageData(imgData, d.x, d.y);
    }
    
    window.onbeforeunload = function() {
        localStorage.removeItem('otherRole');
        vApp.wb.utility.userIds = [];
        cthis.sendMessage('bye');
        io.disconnect();
    }

    window.isVideoFound = function(videoFound, fromUser) {
        if (fromUser != wbUser.id) {
            if (videoFound == false) {
                cthis.isInitiator = true;
            }
            cthis.sendMessage('got user media');
        }
    }
        
        
    function Float32Concat(first, second){
        var firstLength = first.length,
            result = new Float32Array(firstLength + second.length);
        result.set(first);
        result.set(second, firstLength);
        return result;
    }


    function mergeBuffers(channelBuffer){
        var result = new Float32Array(cthis.audio.recordingLength);
        var offset = 0;
        var lng = channelBuffer.length;
        for (var i = 0; i < lng; i++){
          var buffer = channelBuffer[i];
          result.set(buffer, offset);
          offset += buffer.length;
        }
        return result;
    }

    function recordStart(ev){
        cthis.video.calcDimension();
        cthis.video.send();
    }

    function str2ab(str) {
      var buf = new ArrayBuffer(str.length); // 2 bytes for each char
      var bufView = new Uint8ClampedArray(buf);
      for (var i=0, strLen=str.length; i<strLen; i++) {
        bufView[i] = str.charCodeAt(i);
      }
      return bufView;
    }



    function encodeRGB(imgData){
        var length = imgData.length/4;
        var encodeDataArr = new Uint8ClampedArray(length);
     //   int packed = (red / 32 << 5) + (green / 32 << 2) + (blue / 64)
                        //(r*6/256)*36 + (g*6/256)*6 + (b*6/256)
        var red, green, blue, encodedData;


        for(var i=0; i<length; i++){
            red = imgData[(i * 4)+ 0];
            green = imgData[(i * 4)+ 1];
            blue = imgData[(i * 4)+ 2];
            //encodedData = (Math.round((red / 32)) << 5) + (Math.round((green / 32)) << 2) + Math.round((blue / 64));
            encodedData = (Math.round((red / 36.5)) << 5) + (Math.round((green / 36.5)) << 2) + Math.round((blue / 85));
            //encodedData = (red*6/256)*36 + (green*6/256)*6 + (blue*6/256)

            encodeDataArr[i]=encodedData;
    //        encodeDataArr.push(encodedData);    
        }

        return encodeDataArr;
    }




    function decodeRGB(encodeDataArr, ctx, d){
    //    var ab = new ArrayBuffer(encodeDataArr.length); // 256-byte ArrayBuffer.
    //    var imgArr = new Uint8Array(ab);
        //var decodeDataArr = new Uint8ClampedArray(encodeDataArr.length * 4);

        var imageData = ctx.createImageData(d.w, d.h); // TODO - Create empty Array


        var red, green, blue;    
        for(var i=0; i<encodeDataArr.length * 4; i++){
    //        red = (encodeDataArr[i] >> 5) * 32;
    //        green = ((encodeDataArr[i] >> 2) << 3) * 32;
    //        blue = (encodeDataArr[i] << 6) * 64;

            imageData.data[(i * 4)+ 0] = (encodeDataArr[i] >> 5) * 36.5; //red
            imageData.data[(i * 4)+ 1] = ((encodeDataArr[i] & 28) >> 2) * 36.5;
            imageData.data[(i * 4)+ 2] = (encodeDataArr[i] & 3) * 85;
            imageData.data[(i * 4)+ 3] = 255;

           //decodeRGB.push(((encodeDataArr[i] >> 2) << 3) * 32); //green
           //decodeRGB.push((encodeDataArr[i] << 6) * 64); //blue
        }
        return imageData;
    }

        function ab2str(buf) {
            return String.fromCharCode.apply(null, new Uint8ClampedArray(buf));
        }

        function str2ImageData(str, d) {
            var imageData=  context2.createImageData(d.w, d.h);
            var buf = new ArrayBuffer(str.length); // 2 bytes for each char
            imageData.data = new Uint8Array(buf);
            for (var i=0, strLen=str.length; i<strLen; i++) {
              imageData.data[i] = str.charCodeAt(i);
            }
            return imageData;
        }

        function doClearCanvas(){
            context2.clearRect(0, 0, cthis.remoteVid.width, cthis.remoteVid.height);
        }

 
    function getImageSlices(resA, resB){
        //resB ==  y
        //resA ==  x
        var imgSlicesArr = [];
        var totLen = resA * resB;
        var width =  Math.round(canvas.width / resB);
        var height = Math.round(canvas.height / resA);

        for(var i=0; i<totLen; i++){
            var eachSlice  = _getSingleSliceImg(i, width, height, resA, resB);
            imgSlicesArr.push(eachSlice);
        }
        return imgSlicesArr;
    }

    function _getSingleSliceImg(i, width, height, resA, resB){
        var imgSlice = {};
        var cwidth, cheight, cx, cy, ci =  0;

        if(i==0){
            x = 0;
            y = 0;
        }else{
            cx = i  % resB; // for x
            cy = Math.floor(i / resB); // for y

            x = cx * width;
            y = cy * height;;
        }
        return {'x' : x, 'y' : y, 'w' : width, 'h' : height}
    }


    function matchWithPrevious (newI, oldI, width){
        var l = oldI.length;
        var w = width * 4;
        for(var i=0; i<l; i=i+4){ // Quickly Check Forward Diagnal
           if ( (! matchI (oldI,newI,i)) || (! matchIShade (oldI,newI,i)) ) {
               return false;
           }
           i = i + w;
        }
        for(var i=0; i<l; i=i-4){ // Quickly Check Backword Diagnal
           i = i + w;
           if ( (! matchI (oldI,newI,i)) || (! matchIShade (oldI,newI,i)) ) {
               return false;
           }
        }
        var jump = 5*4;
        for(var i=0; i<l; i=i+jump){ // Check (all/jump) pixals 
            if ( (! matchI (oldI,newI,i)) || (! matchIShade (oldI,newI,i)) ) {
                return false;
            }
        }
        return true;
    }



    function matchI (oldImageArr,newImageArr,p) {
        var quality = 60; // Lower is better but will create more false positive
        for (var c=0; c<=2; c++) {
            var color = oldImageArr[p + c]; 
            var pcolor = newImageArr[p + c];
            if( ( Math.abs(color - pcolor) ) > quality ){
                return false;
            }
        }
        return true;
    }

    function matchIShade (oldImageArr,newImageArr,p) {
        var quality = 15; // Lower is better but will create more false positive
        var r = oldImageArr[p + 0]; 
        var pr = newImageArr[p + 0];
        var g = oldImageArr[p + 1]; 
        var pg = newImageArr[p + 1];
        var b = oldImageArr[p + 2]; 
        var pb = newImageArr[p + 2];
        var cr = Math.abs(pr-r);
        var cg = Math.abs(pg-g);
        var cb = Math.abs(pb-b);
        var ave = (cr + cg + cb) / 3;

        if (Math.abs(ave-cr) > quality || Math.abs(ave-cg) > quality || Math.abs(ave-cb) > quality) {
            return false;
        }

        return true;
    }
}
)(window);
