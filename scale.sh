#!/bin/bash

#filename=$(basename -- "$1")
#filename="${filename%.*}"
#mkdir $filename
ffmpeg -i "$1" \
-filter_complex \
"[0:v]split=4[v1][v2][v3][v4]; \
[v1]copy[v1out]; [v2]copy[v2out]; [v3]scale=w=1280:h=720[v3out]; [v4]scale=w=640:h=360[v4out]" \
-map [v1out] -c:v:0 libx264 -x264-params "nal-hrd=cbr:force-cfr=1" -b:v:0 5M -maxrate:v:0 5M -minrate:v:0 5M -bufsize:v:0 10M -preset slow -g 48 -sc_threshold 0 -keyint_min 48 \
-map [v2out] -c:v:1 libx264 -x264-params "nal-hrd=cbr:force-cfr=1" -b:v:1 3M -maxrate:v:1 3M -minrate:v:1 3M -bufsize:v:1 5M -preset slow -g 48 -sc_threshold 0 -keyint_min 48 \
-map [v3out] -c:v:2 libx264 -x264-params "nal-hrd=cbr:force-cfr=1" -b:v:2 1M -maxrate:v:2 1M -minrate:v:2 1M -bufsize:v:2 1M -preset slow -g 48 -sc_threshold 0 -keyint_min 48 \
-map [v4out] -c:v:2 libx264 -x264-params "nal-hrd=cbr:force-cfr=1" -b:v:2 500k -maxrate:v:2 1M -minrate:v:2 1M -bufsize:v:2 1M -preset slow -g 48 -sc_threshold 0 -keyint_min 48 \
-map a:0 -c:a:0 aac -b:a:0 96k -ac 2 \
-map a:0 -c:a:1 aac -b:a:1 96k -ac 2 \
-map a:0 -c:a:2 aac -b:a:2 48k -ac 2 \
-map a:0 -c:a:3 aac -b:a:3 48k -ac 2 \
-f hls \
-hls_time 2 \
-hls_playlist_type vod \
-hls_flags independent_segments \
-hls_segment_type mpegts \
-hls_segment_filename stream_%v-data%02d.ts \
-master_pl_name master.m3u8 \
-var_stream_map "v:0,a:0 v:1,a:1 v:2,a:2 v:3,a:3" stream_%v.m3u8

ffmpeg -ss 00:00:00.01 -i "$1" -frames:v 1 poster.jpg