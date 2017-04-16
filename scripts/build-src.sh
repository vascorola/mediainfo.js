#!/usr/bin/env bash

set -xe

#OPTS="-O2 --closure 1"
OPTS="-O2 --closure 0 --js-opts 0"

mkdir -p build dist
cd build
em++ ${OPTS} \
    -std=c++11 \
    -DUNICODE \
    -I ../lib/MediaInfoLib/Source \
    -I ../lib/ZenLib/Source \
    --bind \
    -c ../src/mediainfojs.cpp

em++ ${OPTS} \
    --llvm-lto 0 \
    -s TOTAL_MEMORY=536870912 \
    -s NO_FILESYSTEM=1 \
    -s MODULARIZE=1 \
    --bind \
    mediainfojs.o \
    ../lib/MediaInfoLib/Project/GNU/Library/.libs/libmediainfo.a \
    ../lib/ZenLib/Project/GNU/Library/.libs/libzen.a \
    ../lib/Shared/Source/zlib/libz.a \
    -o mediainfo.js

cd -
cat src/pre.js \
    build/mediainfo.js \
    src/post.js \
    > dist/mediainfo.js
mv build/mediainfo.js.mem dist
rm -rf build
