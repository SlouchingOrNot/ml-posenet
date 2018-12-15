'use strict';

var mlPosenet = mlPosenet || {}
mlPosenet.Parameters = {}

// es6 export
export default mlPosenet.Parameters

// put that in ml-posenet-parameters
mlPosenet.Parameters.Sample = {
	algorithm: 'single-pose',
	input: {
		// mobileNetArchitecture: mlPosenet.Utils.isMobile() ? '0.50' : '1.01',
		mobileNetArchitecture: '0.50',
		outputStride: 16,
		imageScaleFactor: 0.5,
	},
	singlePoseDetection: {
		minPoseConfidence: 0.1,
		minPartConfidence: 0.5,
	},
	multiPoseDetection: {
		maxPoseDetections: 2,
		minPoseConfidence: 0.1,
		minPartConfidence: 0.3,
		nmsRadius: 20.0,
	},
	output: {
		showVideo: true,
		showSkeleton: true,
		showPoints: true,
	},
	net: null,
};
