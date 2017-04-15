#!/usr/bin/env node

var fs = require('fs');
var MediaInfoJs = require('mediainfo.js');


//var BUF_SIZE = 7 * 188;
var BUF_SIZE = 28 * 188;
// var BUF_SIZE = 1024; // 1 KiB, 6.62sec
// var BUF_SIZE = 1 * 1024;
//var BUF_SIZE = 512 * 1024; // 512 KiB

function parseFile(filename, fileSize) {
    return new Promise((resolve, reject) => {
        fs.open(filename, 'r', (err, fd) => {
            if (err) {
                reject(err.message);
                return;
            }
            var buffer = new Buffer(BUF_SIZE, 'binary');
            var mi = new MediaInfo(), seekPos = -1;
            var total = 0, every = 0;

            function _resolve() {
                mi.open_buffer_finalize();
                var result = mi.inform();
                resolve(result);
            }

            function process(err, bytesRead) {
                if (err) {
                    reject(err.message);
                    return;
                }
                if (bytesRead > 0) {
                    //Sending the buffer to MediaInfo
                    var state = mi.open_buffer_continue(
                        bytesRead === BUF_SIZE ? buffer : buffer.slice(0, bytesRead),
                        bytesRead
                    );
//                    if (state & 0x02 || state & 0x08) { // Bit 3 => Finished
                    if (++every > 50000) {
                        console.log('bytes read: %d', total);
                        every = 0;
                    }
                    total += bytesRead;
                    if (state & 0x08) { // Bit 3 => Finished
                        _resolve();
                        return;
                    }
                    //Testing if there is a MediaInfo request to go elsewhere
                    var oldSeekPos = seekPos;
                    seekPos = mi.open_buffer_continue_goto_get();
                    if (oldSeekPos !== seekPos && seekPos !== -1) {
                        // inform MediaInfo we have seek
                        console.log('SEEK', seekPos);
                        mi.open_buffer_init(fileSize, seekPos);
                        fs.read(fd, buffer, 0, BUF_SIZE, seekPos, process);
                    }
                    else {
                        fs.read(fd, buffer, 0, BUF_SIZE, null, process);
                    }
                }
                else {
                    // EOF encountered
                    _resolve();
                    return;
                }
            }
            mi.open_buffer_init(fileSize, 0);
            fs.read(fd, buffer, 0, BUF_SIZE, null, process);
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
