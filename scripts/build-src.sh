#!/bin/bash

set -xe

OPTS="-O2"
em++ ${OPTS} \
    -DUNICODE \
    -std=c++11 \
    -I lib/MediaInfoLib/Source \
    -I lib/ZenLib/Source \
    --bind \
    -c src/mediainfojs.cpp && \
em++ ${OPTS} \
    --llvm-lto 0 \
    --pre-js src/pre.js \
    --post-js src/post.js \
    -s TOTAL_MEMORY=1073741824 \
    -s NO_FILESYSTEM=1 \
    -s MODULARIZE=1 \
    --bind \
    src/mediainfojs.o \
    lib/MediaInfoLib/Project/GNU/Library/.libs/libmediainfo.a \
    lib/ZenLib/Project/GNU/Library/.libs/libzen.a \
    lib/Shared/Source/zlib/libz.a \
    -o dist/mediainfo.js
