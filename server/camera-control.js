var child = require('child_process');
var instance = null;

function CameraControl(){
	if(instance !== null){
		throw new Error("Cannot instantiate more than one CameraControl, use CameraControl.getInstance()");
	} 
	
	this.initialize();
}
CameraControl.prototype = {
	initialize: function(){
		this.fakeCamera = true;
	},
	getLiveView: function (res) {
		if(this.fakeCamera) {
			this.liveStreamCmd = child.spawn('sh', ['src_back/fakestream.sh']);
		} else {
			this.liveStreamCmd = child.spawn('sh', ['src_back/stream.sh']);
		}
		this.liveStreamCmd.stdout.pipe(res);
		this.liveStreamCmd.stderr.pipe(res);	
	},
	setFakeCamera : function (flag) {
		this.fakeCamera = flag;
	},
	getPicture: function (res) {
		child.spawn('gphoto2', ['--capture-image-and-download', '--filename photo-%Y%m%d-%H%M%S.jpg']);
	}
};
CameraControl.getInstance = function(){
	// summary:
	//      Gets an instance of the singleton. It is better to use 
	if(instance === null){
		instance = new CameraControl();
	}
	return instance;
};

exports = module.exports = CameraControl.getInstance();

