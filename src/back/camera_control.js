var CameraControl, EventEmitter, exec, spawn;

EventEmitter = require("events").EventEmitter;

spawn = require("child_process").spawn;

exec = require("child_process").exec;


/*
 * Interface to gphoto2 via the command line.
#
 * It's highly fragile and prone to failure, so if anyone wants
 * to take a crack at redoing the node-gphoto2 bindings, be my
 * guest...
 */

CameraControl = (function() {
  CameraControl.prototype.saving_regex = /Saving file as ([^.jpg]+)/g;

  CameraControl.prototype.captured_success_regex = /New file is in/g;

  function CameraControl(filename, cwd, web_root_path) {
    this.filename = filename != null ? filename : "%m-%y-%d_%H:%M:%S.jpg";
    this.cwd = cwd != null ? cwd : "public/photos";
    this.web_root_path = web_root_path != null ? web_root_path : "/photos";
  }

  CameraControl.prototype.init = function() {
    var emitter;
    exec("killall PTPCamera");
    emitter = new EventEmitter();
    emitter.on("snap", (function(_this) {
      return function(onCaptureSuccess, onSaveSuccess) {
        var capture;
        emitter.emit("camera_begin_snap");
        capture = spawn("gphoto2", ["--capture-image-and-download", "--force-overwrite", "--filename=" + _this.filename], {
          cwd: _this.cwd
        });
        return capture.stdout.on("data", function(data) {
          var fname, saving;
          if (_this.captured_success_regex.exec(data.toString())) {
            emitter.emit("camera_snapped");
            if (onCaptureSuccess != null) {
              onCaptureSuccess();
            }
          }
          saving = _this.saving_regex.exec(data.toString());
          if (saving) {
            fname = saving[1] + ".jpg";
            emitter.emit("photo_saved", fname, _this.cwd + "/" + fname, _this.web_root_path + "/" + fname);
            if (onSaveSuccess != null) {
              return onSaveSuccess();
            }
          }
        });
      };
    })(this));
    return emitter;
  };

  return CameraControl;

})();

module.exports = CameraControl;