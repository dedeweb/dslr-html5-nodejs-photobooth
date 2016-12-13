var child = require('child_process');
var process = require('process');
var instance = null;

//Go to script directory 
process.chdir(__dirname);


function CameraControl(){
	if(instance !== null){
		throw new Error("Cannot instantiate more than one CameraControl, use CameraControl.getInstance()");
	} 
	
	this.initialize();
}
CameraControl.prototype = {
	initialize: function(){
		this.fakeCamera = false;
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
	getCameraMode: function () {
		return this.fakeCamera;
	},
	getPicture: function (res) {
		child.spawn('gphoto2', ['--capture-image-and-download', '--filename photo-%Y%m%d-%H%M%S.jpg']);
	},
	
	getStatus: function (res) {
		
		var summaryCmd;
		if(this.fakeCamera) {
			//summaryCmd = child.spawnSync('server/fake_gphoto.sh', ['--summary']);	
			summaryCmd = child.spawnSync('sh', ['fake_gphoto.sh', '--summary']);	
		} else {
			summaryCmd = child.spawnSync('gphoto2', ['--summary']);	
		}
		
		if('' + summaryCmd.stderr ) {
			console.log('response : ' + summaryCmd.stderr)
			//res.json( {error: true, message: ''+summaryCmd.stderr});
			res.json( {error: true, message: '' + summaryCmd.stderr});
			
		} 
		else 
		{
			res.json( {error: false, message : '' + summaryCmd.stdout});
		}
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

