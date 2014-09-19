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

                        this.graph = {
                            height : 56, 
                            width : 4, 
                            average : 0,
                            display : function (){
                                var cvideo = cthis.video;
                                if(vApp.gObj.uRole == 't'){
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


                        var sendstring = vApp.vutil.ab2str(encoded);
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
                        if(vApp.gObj.uRole == 't'){
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
                        var clip = vApp.vutil.str2ab(audioString);

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
                            var clip = vApp.vutil.str2ab(rec1);

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
                        
                        if(!vApp.vutil.chkValueInLocalStorage('recordStart')){
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
                        this.myVideo.width= this.width;
                        this.myVideo.height= this.height;
                    },
                    
                    removeUser : function (id){
                        var element = document.getElementById('user' + id);
                        if(element !=  null){
                            element.parentNode.removeChild(element);
                        }
                    },
                    
                    //createVideo
                    createElement : function (user){
                        var videoWrapper = document.createElement('div');
                        videoWrapper.className = "videoWrapper";

                        var videoSubWrapper = document.createElement('div');
                        videoSubWrapper.className = "videoSubWrapper";
                        videoSubWrapper.id = "user" + user.id;
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
                            document.getElementById(vApp.gObj.chat.mainChatBoxId).style.borderTop = "3px solid #bbb";
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
                                if(vApp.gObj.uRole == 't'){
                                    if(typeof graphCanvas == "undefined"){
                                        var graphCanvas = document.getElementById("graphCanvas");
                                        cthis.audio.graph.cvCont = graphCanvas.getContext('2d');
                                    }
                                    cthis.audio.graph.cvCont.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
                                }

                                cvideo.tempVidCont.clearRect(0, 0, cvideo.tempVid.width, cvideo.tempVid.height);
                                cvideo.tempVidCont.drawImage(cvideo.myVideo, 0, 0, cvideo.width, cvideo.height);


                              //cthis.audio.audioInGraph();
                              if(vApp.gObj.uRole == 't'){
                                  cthis.audio.graph.display();
                              }


                             frame = cvideo.tempVid.toDataURL("image/jpg", 0.3);
                             var user = {
                                 name : vApp.gObj.uName,
                                 id : vApp.gObj.uid
                             }

                             if(vApp.gObj.uRole == 't'){
                                 user.role = vApp.gObj.uRole;
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
                                            document.getElementById(vApp.gObj.chat.mainChatBoxId).style.borderTop = "3px solid #bbb";
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
                    var audio =  (vApp.gObj.uRole == 't') ?  true : false;
                    var session = {
                        audio : audio,
                        video: true
                    };
                    
                    cthis.video.init();
                    vApp.adpt = new vApp.adapter();
                    
                    var cNavigator =  vApp.adpt.init(navigator);
                    cNavigator.getUserMedia(session, this.handleUserMedia, this.handleUserMediaError);
                },
               
                //equivalent to initializeRecorder
                handleUserMedia: function(stream) {
                    
                    cthis.audio.init();
                    cthis.video.myVideo = document.getElementById("video"+ vApp.gObj.uid);
                    
                    vApp.adpt.attachMediaStream(cthis.video.myVideo, stream);
                    
                    if(vApp.gObj.uRole == 't'){
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
                }
            }
            
        };
  
    window.media = media;
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
}
)(window);
