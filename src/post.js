return function(arg) {
    var options = {};
    if (typeof(arg) === 'function') {
        options.onRuntimeInitialized = arg;
    }
    else {
        options = arg || options;
    }
    var M = Module(options);
    return M.MediaInfo;
};
}));
