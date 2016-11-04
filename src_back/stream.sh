#!/bin/sh
 gphoto2 --capture-movie --stdout | ffmpeg -loglevel quiet -i pipe:0 -c:v libtheora -q:v 7 -f ogg  pipe:1
