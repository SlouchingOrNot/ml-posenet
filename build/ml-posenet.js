(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.mlPosenet = factory());
}(this, (function () { 'use strict';

	var mlPosenet = mlPosenet || {};
	mlPosenet.Parameters = {};

	// es6 export
	var Parameters = mlPosenet.Parameters;

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

	/**
	* @license
	* Copyright 2018 Google Inc. All Rights Reserved.
	* Licensed under the Apache License, Version 2.0 (the "License");
	* you may not use this file except in compliance with the License.
	* You may obtain a copy of the License at
	*
	* http://www.apache.org/licnses/LICENSE-2.0
	*
	* Unless required by applicable law or agreed to in writing, software
	* distributed under the License is distributed on an "AS IS" BASIS,
	* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	* See the License for the specific language governing permissions and
	* limitations under the License.
	* =============================================================================
	*/

	var mlPosenet$1 = mlPosenet$1 || {};



	mlPosenet$1.Utils = (function(){

	        async function warmUp(posenetModel) {
	        	let canvasEl = document.createElement('canvas');
	        	canvasEl.width = 224;
	        	canvasEl.height = 224;
	        	await mlPosenet$1.Utils.estimatePoses(canvasEl, posenetModel, Parameters.Sample);
	        }

	        async function estimatePoses(sourceEl, net, parameters, flipHorizontal){
	                // handle arguments default values
	                if( flipHorizontal === undefined ){
	                        flipHorizontal = sourceEl instanceof HTMLVideoElement ? true : false;
	                }

			switch (parameters.algorithm) {
				case 'single-pose':
				const pose = await net.estimateSinglePose(
					sourceEl, +parameters.input.imageScaleFactor, flipHorizontal, +parameters.input.outputStride
				);
				var poses = [pose];
				break;
				case 'multi-pose':
				var poses = await net.estimateMultiplePoses(
					sourceEl, +parameters.input.imageScaleFactor, flipHorizontal, +parameters.input.outputStride,
					+parameters.multiPoseDetection.maxPoseDetections,
					+parameters.multiPoseDetection.minPartConfidence,
					+parameters.multiPoseDetection.nmsRadius
				);
				break;
	                        default:
	                                console.assert(false, `unknown algorithm ${parameters.algorithm}`);
			}
	                return poses
	        }

	        // TODO make that private - anonymous function
	        // in fact put all that in a namespace
	        const color = 'pink';
	        const lineWidth = 2;

	        function toTuple({ y, x }) {
	                return [y, x];
	        }

	        /**
	        * Draws a line on a canvas, i.e. a joint
	        */
	        function drawSegment([ay, ax], [by, bx], color, scale, ctx) {
	                ctx.beginPath();
	                ctx.moveTo(ax * scale, ay * scale);
	                ctx.lineTo(bx * scale, by * scale);
	                ctx.lineWidth = lineWidth;
	                ctx.strokeStyle = color;
	                ctx.stroke();
	        }

	        /**
	        * Draws a pose skeleton by looking up all adjacent keypoints/joints
	        */
	        function drawSkeleton(keypoints, minConfidence, ctx, scale = 1) {
	                const adjacentKeyPoints = posenet.getAdjacentKeyPoints(
	                        keypoints, minConfidence
	                );

	                adjacentKeyPoints.forEach((keypoints) => {
	                        drawSegment(toTuple(keypoints[0].position),
	                        toTuple(keypoints[1].position), color, scale, ctx);
	                });
	        }

	        /**
	        * Draw pose keypoints onto a canvas
	        */
	        function drawKeypoints(keypoints, minConfidence, context, scale = 1) {
	                // debugger

	                context.font = "8px Arial bolder";
	                for (let i = 0; i < keypoints.length; i++) {
	                        const keypoint = keypoints[i];

	                        if (keypoint.score < minConfidence) {
	                                continue;
	                        }

	                        const { y, x } = keypoint.position;
	                        context.beginPath();
	                        context.arc(x * scale, y * scale, 3, 0, 2 * Math.PI);
	                        context.fillStyle = color;
	                        context.fill();

	                        context.fillStyle = 'aqua';
	                        context.fillText(keypoint.part, x * scale+4, y * scale+2);

	                        context.fillStyle = 'aqua';
	                        context.fillText((keypoint.score*100).toFixed(2), x * scale+4, y * scale+10);
	                }
	        }

	        //////////////////////////////////////////////////////////////////////////////
	        //                Code Separator
	        //////////////////////////////////////////////////////////////////////////////
		async function setupCamera() {
			const videoEl = document.querySelector('#sourceVideo');
			videoEl.width = 224;
			videoEl.height = 224;

	                try {
	                        const stream = await navigator.mediaDevices.getUserMedia({
	                                'audio': false,
	                                'video': {
	                                        // facingMode: 'user',
	                                        width: videoEl.width,
	                                        height: videoEl.height,
	                                },
	                        });
	                        videoEl.srcObject = stream;        
	                        return new Promise((resolve) => {
	                                videoEl.onloadedmetadata = () => {
	                                        videoEl.play();
	                                        resolve(videoEl);
	                                };
	                        });
	                }catch(myException){
	                        return new Promise((resolve, reject) => {
	                                reject(new Error(myException.message));
	                        });
	                }
		}

	        //////////////////////////////////////////////////////////////////////////////
	        //		Code Separator
	        //////////////////////////////////////////////////////////////////////////////
	        function isMobile() {
	                function isAndroid() {
	                        return /Android/i.test(navigator.userAgent);
	                }

	                function isiOS() {
	                        return /iPhone|iPad|iPod/i.test(navigator.userAgent);
	                }
	                return isAndroid() || isiOS();
	        }

	        return {
	                warmUp: warmUp,
	                setupCamera: setupCamera,
	                isMobile : isMobile,
	                drawKeypoints: drawKeypoints,
	                drawSkeleton: drawSkeleton,
	                estimatePoses: estimatePoses,
	        }

	})();


	// es6 export
	var Utils = mlPosenet$1.Utils;

	var mlPosenet$2 = mlPosenet$2 || {};
	mlPosenet$2.ResultsViewer = function(canvasEl){
		const canvasSize = canvasEl.width;
		console.assert(canvasEl.width === canvasEl.height);

		const context = canvasEl.getContext('2d');

		this.update = function(poses, sourceEl, guiState, flipHorizontal){
	                // handle arguments default values
	                if( flipHorizontal === undefined ){
	                        flipHorizontal = sourceEl instanceof HTMLVideoElement ? true : false;
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
			
		};
	};

	// es6 export
	var ResultsViewer = mlPosenet$2.ResultsViewer;

	var mlPosenet$3 = mlPosenet$3 || {};

	/**
	* Sets up dat.gui controller on the top-right of the window
	*/
	mlPosenet$3.createDatGUI = function (guiState) {
	        
	        const gui = new dat.GUI({ width: 300 });
	        
	        // The single-pose algorithm is faster and simpler but requires only one person to be
	        // in the frame or results will be innaccurate. Multi-pose works for more than 1 person
	        const algorithmController = gui.add(
	                guiState, 'algorithm', ['single-pose', 'multi-pose']
	        );
	        
	        // The input parameters have the most effect on accuracy and speed of the network
	        let input = gui.addFolder('Input');
	        // Architecture: there are a few PoseNet models varying in size and accuracy. 1.01
	        // is the largest, but will be the slowest. 0.50 is the fastest, but least accurate.
	        const architectureController =
	        input.add(guiState.input, 'mobileNetArchitecture', ['1.01', '1.00', '0.75', '0.50']);
	        // Output stride:  Internally, this parameter affects the height and width of the layers
	        // in the neural network. The lower the value of the output stride the higher the accuracy
	        // but slower the speed, the higher the value the faster the speed but lower the accuracy.
	        input.add(guiState.input, 'outputStride', [8, 16, 32]);
	        // Image scale factor: What to scale the image by before feeding it through the network.
	        input.add(guiState.input, 'imageScaleFactor').min(0.2).max(1.0);
	        input.open();
	        
	        // Pose confidence: the overall confidence in the estimation of a person's
	        // pose (i.e. a person detected in a frame)
	        // Min part confidence: the confidence that a particular estimated keypoint
	        // position is accurate (i.e. the elbow's position)
	        let single = gui.addFolder('Single Pose Detection');
	        single.add(guiState.singlePoseDetection, 'minPoseConfidence', 0.0, 1.0);
	        single.add(guiState.singlePoseDetection, 'minPartConfidence', 0.0, 1.0);
	        single.open();
	        
	        let multi = gui.addFolder('Multi Pose Detection');
	        multi.add(guiState.multiPoseDetection, 'maxPoseDetections').min(1).max(20).step(1);
	        multi.add(guiState.multiPoseDetection, 'minPoseConfidence', 0.0, 1.0);
	        multi.add(guiState.multiPoseDetection, 'minPartConfidence', 0.0, 1.0);
	        // nms Radius: controls the minimum distance between poses that are returned
	        // defaults to 20, which is probably fine for most use cases
	        multi.add(guiState.multiPoseDetection, 'nmsRadius').min(0.0).max(40.0);
	        
	        let output = gui.addFolder('Output');
	        output.add(guiState.output, 'showVideo');
	        output.add(guiState.output, 'showSkeleton');
	        output.add(guiState.output, 'showPoints');
	        output.open();
	        
	        
	        architectureController.onChange(function (architecture) {
	                guiState.changeToArchitecture = architecture;
	        });
	        
	        algorithmController.onChange(function (value) {
	                switch (guiState.algorithm) {
	                        case 'single-pose':
	                                multi.close();
	                                single.open();
	                                break;
	                        case 'multi-pose':
	                                single.close();
	                                multi.open();
	                                break;
	                }
	        });
	};

	// es6 export
	var createDatGUI = mlPosenet$3.createDatGUI;

	var mlPosenet$4 = mlPosenet$4 || {};

	//////////////////////////////////////////////////////////////////////////////
	//		Code Separator
	//////////////////////////////////////////////////////////////////////////////
	var partsIndex = {};
	let partNamesInOrder = ["nose", "leftEye", "rightEye", "leftEar", "rightEar", "leftShoulder", "rightShoulder",
		"leftElbow", "rightElbow", "leftWrist", "rightWrist", "leftHip", "rightHip",
		"leftKnee", "rightKnee", "leftAnkle", "rightAnkle"];
	partNamesInOrder.forEach((partName, index) => {
		partsIndex[partName] = index;
	});

	//////////////////////////////////////////////////////////////////////////////
	//		Code Separator
	//////////////////////////////////////////////////////////////////////////////
	function computeMiddlePartsKeypoint(keypoints, partNameA, partNameB){
		let keypointA = keypoints[partsIndex[partNameA]];
		let keypointB = keypoints[partsIndex[partNameB]];
		console.assert(keypointA.part === partNameA);
		console.assert(keypointB.part === partNameB);
		let keypoint = {
			position : {
				x: (keypointA.position.x + keypointB.position.x)/2,
				y: (keypointA.position.y + keypointB.position.y)/2,					
			}
		};
		return keypoint
	}
	function computeDistanceBetweenParts(keypoints, partNameA, partNameB){
		let keypointA = keypoints[partsIndex[partNameA]];
		let keypointB = keypoints[partsIndex[partNameB]];
		return computeDistanceBetweenKeypoints(keypointA, keypointB)
	}
	function computeDistanceBetweenKeypoints(keypointA, keypointB){
		let deltaX = keypointA.position.x - keypointB.position.x;
		let deltaY = keypointA.position.y - keypointB.position.y;
		let distance = Math.sqrt( deltaX*deltaX + deltaY*deltaY);
		return distance
	}

	//////////////////////////////////////////////////////////////////////////////
	//		export
	//////////////////////////////////////////////////////////////////////////////
	mlPosenet$4.KeypointUtils = {
		partsIndex,
		partNamesInOrder,
		
		computeMiddlePartsKeypoint,
		computeDistanceBetweenParts,
		computeDistanceBetweenKeypoints,
	};

	// es6 export
	var KeypointUtils = mlPosenet$4.KeypointUtils;

	// es6 export
	var index = {
		Parameters: Parameters,
		Utils: Utils,
		ResultsViewer: ResultsViewer,
		createDatGUI: createDatGUI,
		KeypointUtils,
	};

	return index;

})));
