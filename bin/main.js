#!/usr/bin/env node

var fs = require('fs');
var MediaInfoJs = require('mediainfo.js');


var BUF_SIZE = 7 * 188;

function parseFile(filename, fileSize) {
    return new Promise((resolve, reject) => {
        fs.open(filename, 'r', (err, fd) => {
            if (err) {
                reject(err.message);
                return;
            }
            var buffer = new Buffer(BUF_SIZE, 'binary');
            var mi = new MediaInfo();
            mi.open_buffer_init(fileSize, 0);
            var totalRead = 0, filePos = 0;

            function readChunk() {
                fs.read(fd, buffer, 0, BUF_SIZE, filePos, function(err, bytesRead) {
                    if (err) {
                        reject(err.message);
                        return;
                    }
                    totalRead += bytesRead;
                    console.log("Read %d bytes.", totalRead);
                    //Sending the buffer to MediaInfo
                    var state = mi.open_buffer_continue(buffer, bytesRead);
                    if (state & 0x08) { // Bit 3 => Finished
                        console.log('state => FINISHED');
                        console.log("Read %d bytes.", totalRead);
                        var result = mi.inform();
                        resolve(result)
                        return;
                    }
                    //Testing if there is a MediaInfo request to go elsewhere
                    var seekPos = mi.open_buffer_continue_goto_get();
                    if (seekPos !== -1) {
                        filePos = seekPos;
                        console.log('SEEKING: %d', filePos);
                        mi.open_buffer_init(fileSize, filePos); // Informing MediaInfo we have seek
                    }
                    if (bytesRead > 0)
                        readChunk();
                });
            }

            readChunk();
        });
    })
}

var MediaInfo = MediaInfoJs({
    locateFile: function(f) {
        return 'dist/' + f;
    },
    onRuntimeInitialized: function() {
        console.log('emscripten runtime initialized...');
        var filename = process.argv[2];
        var fileSize = fs.statSync(filename).size;
        console.log('Parsing file %s', filename);
        parseFile(filename, fileSize).then(function(result) {
            console.log(result);
        });
    }
});
