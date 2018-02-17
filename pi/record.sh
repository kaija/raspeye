#!/bin/bash
/usr/bin/raspivid -o /tmp/snapshot.h264 -t 10000
/usr/bin/MP4Box -add /tmp/snapshot.h264 /tmp/snapshot.mp4
rm /tmp/snapshot.h264
