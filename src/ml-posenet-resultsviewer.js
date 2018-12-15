'use strict';

import Utils from "../src/ml-posenet-utils.js";

var mlPosenet = mlPosenet || {}
mlPosenet.ResultsViewer = function(canvasEl){
	const canvasSize = canvasEl.width
	console.assert(canvasEl.width === canvasEl.height)

	const context = canvasEl.getContext('2d');

	this.update = function(poses, sourceEl, guiState, flipHorizontal){
                // handle arguments default values
                if( flipHorizontal === undefined ){
                        flipHorizontal = sourceEl instanceof HTMLVideoElement ? true : false
                }
		
		context.clearRect(0, 0, canvasSize, canvasSize);
		
		if (guiState.output.showVideo) {
			context.save();
			if( flipHorizontal ){
				context.scale(-1, 1);
				context.translate(-canvasSize, 0);
				
			}
			context.drawImage(sourceEl, 0, 0, canvasSize, canvasSize);
			context.restore();
		}
		
		// For each pose (i.e. person) detected in an image, loop through the poses
		// and draw the resulting skeleton and keypoints if over certain confidence
		// scores
		poses.forEach(({ score, keypoints }) => {
			let minPoseConfidence = Number(guiState.singlePoseDetection.minPoseConfidence);
			let minPartConfidence = Number(guiState.singlePoseDetection.minPartConfidence);

			if (score < minPoseConfidence) return

			const scale = canvasSize / sourceEl.width;
			
			if (guiState.output.showPoints) {
				Utils.drawKeypoints(keypoints, minPartConfidence, context, scale);
			}
			if (guiState.output.showSkeleton) {
				Utils.drawSkeleton(keypoints, minPartConfidence, context, scale);
			}
		});
		
	}
};

// es6 export
export default mlPosenet.ResultsViewer
