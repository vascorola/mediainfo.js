#!/usr/bin/env bash

set -xe

# download sources
mkdir -p lib
wget https://mediaarea.net/download/source/libmediainfo/0.7.94/libmediainfo_0.7.94.tar.bz2 -q -O - | tar -xj -C lib
wget https://mediaarea.net/download/source/libzen/0.4.35/libzen_0.4.35.tar.bz2 -q -O - | tar -xj -C lib
mkdir -p lib/Shared/Source
wget http://zlib.net/zlib-1.2.11.tar.gz -q -O - | tar -xz -C lib/Shared/Source
mv lib/Shared/Source/zlib-1.2.11 lib/Shared/Source/zlib

# zlib
cd lib/Shared/Source/zlib
emconfigure ./configure
emmake make libz.a
cd ../../..

# Zenlib
cd ZenLib/Project/GNU/Library/
./autogen.sh
emconfigure ./configure --host=le32-unknown-nacl
emmake make
cd ../../../..

# MediaInfoLib
cd MediaInfoLib/Project/GNU/Library
./autogen.sh
emconfigure ./configure --with-libz-static --host=le32-unknown-nacl
emmake make
