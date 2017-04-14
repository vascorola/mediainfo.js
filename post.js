return function(opts) {
    var options;
    if (typeof(opts) === 'function') {
        options = {};
        options.onRuntimeInitialized = opts;
    }
    else {
        options = opts || {};
    }
    options.memoryInitializerPrefixURL = options.hasOwnProperty('memoryInitializerPrefixURL') ? options.memoryInitializerPrefixURL : './';
  return Module(opts);
};
}));
