#!/usr/bin/env node

var fs = require('fs');
var util = require('util');
var MediaInfoJs = require('mediainfo.js');
var X2JS = require('x2js');

var CHUNK_SIZE = 5 * 1024 * 1024;
var buffer = new Buffer(CHUNK_SIZE);

function parseFile(fd, fileSize) {
    var processing = true,
        state = 0,
        seekTo = -1;

    function processChunk(data) {
        // var chunk = new Uint8Array();
        var l = data.length;
        state = mi.open_buffer_continue(data, l);
        seekTo = mi.open_buffer_continue_goto_get();
        var to = null;
        if (seekTo !== -1) {
            to = seekTo;
            // console.log('seekTo', to);
            mi.open_buffer_init(fileSize, to);
        }
        // bit 3 set means finalized
        if (state & 0x08) {
            mi.open_buffer_finalize();
            var result = mi.inform();
            processing = false;
            var x2js = new X2JS();
            var resultObj = x2js.xml2js(result);
            console.log(util.inspect(resultObj, false, null))
            mi.close();
            return;
        }
        seek(to);
    }

    function seek(to) {
        fs.read(fd, buffer, 0, CHUNK_SIZE, to, function(err, nread) {
            if (err) throw err;

            if (nread === 0) {
                // done reading file, do any necessary finalization steps
                mi.open_buffer_finalize();
                var result = mi.inform();
                processing = false;
                var x2js = new X2JS();
                var resultObj = x2js.xml2js(result);
                console.log(util.inspect(resultObj, false, null))
                mi.close();
                fs.close(fd, function(err) {
                    if (err) throw err;
                });
                return;
            }

            var data;
            if (nread < CHUNK_SIZE)
                data = buffer.slice(0, nread);
            else
                data = buffer;

            processChunk(data);
        });
    }

    // start
    mi.open_buffer_init(fileSize, 0);
    seek(null);
}


console.log('huhu');
var MediaInfo = MediaInfoJs({
    locateFile: function(f) {
        console.log(f);
        return 'dist/' + f;
    }
});

var mi = new MediaInfo();
var filename = process.argv[2];
var fileSize = fs.statSync(filename).size;
fs.open(filename, 'r', function(err, fd) {
    if (err) {
        console.log(err.message);
        return;
    }
    parseFile(fd, fileSize);
});
