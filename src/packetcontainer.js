// This file is part of Vidyamantra - http:www.vidyamantra.com/
/**@Copyright 2014  Vidyamantra Edusystems. Pvt.Ltd.
 * @author  Suman Bogati <http://www.vidyamantra.com>
  */
(
    function(window) {
        var whBoard = window.whBoard;

        whBoard.createPacketContDiv = function(id, clasName) {
            var tag = document.createElement('div');
            if (typeof id != 'undefined') {
                tag.id = id;
            }
            if (typeof clasName != 'undefined') {
                tag.clasName = clasName;
            }
            return tag;
        }

        //creating divs about sending data per seconds and total
        whBoard.createPacketContainer = function() {
            //Creating Column Two.
            var packetContainer = document.getElementById('packetContainer');

            var headingTag = document.createElement("h4");
            headingTag.id = 'dataInfoHeading';
            headingTag.innerHTML = whBoard.lang.getString('dataDetails');

            var mainContainer = document.getElementById('mainContainer');
            mainContainer.insertBefore(headingTag, mainContainer.firstChild);

            var labelDiv = whBoard.createPacketContDiv("dataInformation");
            packetContainer.appendChild(labelDiv);

            var blankDiv = whBoard.createPacketContDiv("blankDiv");
            blankDiv.innerHTML = "&nbsp;<br/>&nbsp;";
            labelDiv.appendChild(blankDiv);

            var perSecLabel = whBoard.createPacketContDiv("perSecData");
            perSecLabel.innerHTML = whBoard.lang.getString('perSecond');
            labelDiv.appendChild(perSecLabel);

            var totalDataLabel = whBoard.createPacketContDiv('totalDataLabel');
            totalDataLabel.innerHTML = whBoard.lang.getString('total');
            labelDiv.appendChild(totalDataLabel);

            //Creating Column Two.
            var sentPackCont = whBoard.createPacketContDiv('sendPackCont');
            packetContainer.appendChild(sentPackCont);

            var sendPacketPSLabel = whBoard.createPacketContDiv('sentPacketsLabel');
            sendPacketPSLabel.innerHTML = whBoard.lang.getString('sentPackets');
            sentPackCont.appendChild(sendPacketPSLabel);

            var sendPacketPS = whBoard.createPacketContDiv('sendPackPsCont');
            sentPackCont.appendChild(sendPacketPS);

            var counterDiv = whBoard.createPacketContDiv(whBoard.sentPackDivPS, 'numbers');
            counterDiv.innerHTML = 0;
            sendPacketPS.appendChild(counterDiv);

            var totSendPacket = whBoard.createPacketContDiv('totSendPackCont');
            sentPackCont.appendChild(totSendPacket);

            counterDiv = whBoard.createPacketContDiv(whBoard.sentPackDiv, 'numbers');
            counterDiv.innerHTML = 0;
            totSendPacket.appendChild(counterDiv);

            //Creating Column Three.
            var receviedPackCont = whBoard.createPacketContDiv('receivePackCont');
            packetContainer.appendChild(receviedPackCont);

            var receivedPacketPSLabel = whBoard.createPacketContDiv('receivedPacketsLabel');
            receivedPacketPSLabel.innerHTML = whBoard.lang.getString('receviedPackets');
            receviedPackCont.appendChild(receivedPacketPSLabel);

            var receivePacketPS = whBoard.createPacketContDiv('receivePackPsCont');
            receviedPackCont.appendChild(receivePacketPS);

            counterDiv = whBoard.createPacketContDiv(whBoard.receivedPackDivPS, 'numbers');
            counterDiv.innerHTML = 0;
            receivePacketPS.appendChild(counterDiv);

            var totReceivedPack = whBoard.createPacketContDiv('totReceivedPackCont');
            receviedPackCont.appendChild(totReceivedPack);

            counterDiv = whBoard.createPacketContDiv(whBoard.receivedPackDiv, 'numbers');
            counterDiv.innerHTML = 0;
            totReceivedPack.appendChild(counterDiv);

        }

        //creating divs about sending data information in detail
        whBoard.createPacketInfoContainer = function() {
            ///creating sent message information
            var informationCont = document.getElementById('informationCont');
            label = document.createElement('label');
            label.innerHTML = whBoard.lang.getString("sentMessageInfo");

            var sentMsgInfoCont = whBoard.createPacketContDiv('sentMsgInfoContainer');
            sentMsgInfoCont.appendChild(label);

            var sentMsgInfo = whBoard.createPacketContDiv('sentMsgInfo');

            sentMsgInfoCont.appendChild(sentMsgInfo);
            informationCont.appendChild(sentMsgInfoCont);

            var receivedMsgInfoCont = whBoard.createPacketContDiv('receivedMsgInfoContainer');
            label = document.createElement('label');
            label.innerHTML = whBoard.lang.getString("receivedMessageInfo");

            receivedMsgInfoCont.appendChild(label);

            var rcvdMsgInfo = whBoard.createPacketContDiv('rcvdMsgInfo');
            receivedMsgInfoCont.appendChild(rcvdMsgInfo);
            informationCont.appendChild(receivedMsgInfoCont);
        }
    }
)(window);