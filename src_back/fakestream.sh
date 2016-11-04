#!/bin/sh
 cat src_back/test.mjpeg | ffmpeg -loglevel quiet -i pipe:0 -c:v libtheora -q:v 7 -f ogg  pipe:1
