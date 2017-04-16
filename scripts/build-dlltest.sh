#!/usr/bin/env bash

set -xe

OPTS="-O2"

em++ ${OPTS} \
    -std=c++11 \
    -DUNICODE \
    -I lib/MediaInfoLib/Source \
    -I lib/ZenLib/Source \
    -c src/dlltest.cpp

em++ ${OPTS} \
    --embed-file testfiles/HEALTH-ECIGARETTES-USA.MP4 \
    -s TOTAL_MEMORY=536870912 \
    dlltest.o \
    lib/MediaInfoLib/Project/GNU/Library/.libs/libmediainfo.a \
    lib/ZenLib/Project/GNU/Library/.libs/libzen.a \
    lib/Shared/Source/zlib/libz.a \
    -o dlltest.js

# cd -
# cat src/pre.js \
#     build/dlltest.js \
#     src/post.js \
#     > dist/dlltest.js
# mv build/dlltest.js.mem dist
# rm -rf build
