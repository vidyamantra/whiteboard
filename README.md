What whiteboard is in short?
----------------------------

Teacher can use whiteboard for teach online to student by drawing various objects(eg:-circle, rectangle, free drawing etc). There is two users into this application. One is teacher and other is student.

Where it can be located?
-----------------------
This application can be exist into any location under your site root. Like

1) www.yourSite.com/whiteboard

OR

2) www.yourSite.com/learn/whiteboard


For Testing purpose:-
--------------------

For testing purpose you can run teacher.php in a browser as a teacher and can run student.php as a student in other browser. 

Eg:- Please do run below address into browser's address bar. 

www.yourSite.com/whiteboard/example/teacher.php 

Note:- your actual site address(www.something.com)  would be instead of www.yourSite.com

Location for files teacher.php and student.php

1) whiteboard/example/teacher.php
2) whiteboard/example/student.php


Tweak the javaScript and PHP variables:-
---------------------------------------

NOTE:-  Inside the teacher.php and student.php, you will find the PHP and javaScript variables like:-

$whiteboard_path = "http://192.168.1.118/whiteboard/";

var whiteboardPath =  'http://192.168.1.118/whiteboard/';


Please put your actual "whiteboard address" instead of "http://192.168.1.118/whiteboard/", Eg:-

$whiteboard_path = "www.yourSite.com/whiteboard/";

var whiteboardPath =  'www.yourSite.com/whiteboard/';


Feel free to share any bug/improvement etc.

Suman Bogati 

suman@vidyamantra.com

http://www.vidyamantra.com/
