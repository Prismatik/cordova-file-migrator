var FileMigrator = function(fs) {
  var _this = this;
  this.fs = fs;
  var getFs = function(callback) {
    if (!_this.fs) {
      requestFileSystem(3, 0, function(fs) {
        _this.fs = fs;
        return callback(null);
      }, callback);
    } else {
      return callback(null);
    };
  };

  var checkForMarker = function(callback) {
    if (!_this.fs) return callback(new Error('no fs defined'));
    var success = function(fileHandle) {
      return callback(null, true);
    };
    var failure = function(err) {
      if (err && err.code === 1) return callback(null, false);
      if (!err) return callback(new Error('something went wrong attempting to read the migration marker'));
      return callback(err);
    };
    _this.fs.root.getFile('files_migrated', {create: false, exclusive: false}, success, failure);
  };

  var setMarker = function(callback) {
    if (!_this.fs) return callback(new Error('no fs defined'));
    var success = function(fileHandle) {
      var writeSuccess = function(writer) {
        writer.onwrite = function() {
          return callback();
        };
        writer.write('files_migrated');
      };
      fileHandle.createWriter(writeSuccess, callback);
    };
      _this.fs.root.getFile('files_migrated', {create: true, exclusive: false}, success, callback);
  };

  var migrateFiles = function(from, to, callback) {
    var fs = _this.fs;
    var success = function(fromEntry) {
      var parent = to.substring(0, to.lastIndexOf('/'));
      var newName = to.substring(to.lastIndexOf('/') + 1);
      var toSuccess = function(parentEntry) {
        var finalSuccess = function() {
          return callback(null);
        };
        fromEntry.moveTo(parentEntry, newName, finalSuccess, callback);
      };
      fs.root.getDirectory(parent, {create: true, exclusive: false}, toSuccess, callback);
    };
    fs.root.getDirectory(from, {create: false, exclusive: true}, success, callback);
  };

  this.migrateIfNecessary = function(from, to, callback) {
    getFs(function(err) {
      if (err) return callback(err);
      checkForMarker(function(err, present) {
        if (err) return callback(err);
        if (present) return callback(false);
        migrateFiles(from, to, function(err) {
          if (err) return callback(err);
          setMarker(callback);
        });
      });
    });
  };

  return this;
};

module.exports = FileMigrator;
