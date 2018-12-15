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
'use strict';

var mlPosenet = mlPosenet || {}

import Parameters from './ml-posenet-parameters.js';



mlPosenet.Utils = (function(){

        async function warmUp(posenetModel) {
        	let canvasEl = document.createElement('canvas')
        	canvasEl.width = 224
        	canvasEl.height = 224
        	await mlPosenet.Utils.estimatePoses(canvasEl, posenetModel, Parameters.Sample);
        }

        async function estimatePoses(sourceEl, net, parameters, flipHorizontal){
                // handle arguments default values
                if( flipHorizontal === undefined ){
                        flipHorizontal = sourceEl instanceof HTMLVideoElement ? true : false
                }

		switch (parameters.algorithm) {
			case 'single-pose':
			const pose = await net.estimateSinglePose(
				sourceEl, +parameters.input.imageScaleFactor, flipHorizontal, +parameters.input.outputStride
			);
			var poses = [pose]
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
                                console.assert(false, `unknown algorithm ${parameters.algorithm}`)
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

        /**
        * Draw the bounding box of a pose. For example, for a whole person standing
        * in an image, the bounding box will begin at the nose and extend to one of
        * ankles
        */
        function drawBoundingBox(keypoints, ctx) {
                const boundingBox = posenet.getBoundingBox(keypoints);

                ctx.rect(boundingBox.minX, boundingBox.minY,
                        boundingBox.maxX - boundingBox.minX, boundingBox.maxY - boundingBox.minY
                );

                ctx.stroke();
        }

        /**
        * Converts an arary of pixel data into an ImageData object
        */
        async function renderToCanvas(a, ctx) {
                const [height, width] = a.shape;
                const imageData = new ImageData(width, height);

                const data = await a.data();

                for (let i = 0; i < height * width; ++i) {
                        const j = i * 4;
                        const k = i * 3;

                        imageData.data[j + 0] = data[k + 0];
                        imageData.data[j + 1] = data[k + 1];
                        imageData.data[j + 2] = data[k + 2];
                        imageData.data[j + 3] = 255;
                }

                ctx.putImageData(imageData, 0, 0);
        }

        /**
        * Draw an image on a canvas
        */
        function renderImageToCanvas(image, size, canvas) {
                canvas.width = size[0];
                canvas.height = size[1];
                const ctx = canvas.getContext('2d');

                ctx.drawImage(image, 0, 0);
        }

        /**
        * Draw heatmap values, one of the model outputs, on to the canvas
        * Read our blog post for a description of PoseNet's heatmap outputs
        * https://medium.com/tensorflow/real-time-human-pose-estimation-in-the-browser-with-tensorflow-js-7dd0bc881cd5
        */
        function drawHeatMapValues(heatMapValues, outputStride, canvas) {
                const ctx = canvas.getContext('2d');
                const radius = 5;
                const scaledValues = heatMapValues.mul(tf.scalar(outputStride, 'int32'));

                drawPoints(ctx, scaledValues, radius, color);
        }

        /**
        * Used by the drawHeatMapValues method to draw heatmap points on to
        * the canvas
        */
        function drawPoints(ctx, points, radius, color) {
                const data = points.buffer().values;

                for (let i = 0; i < data.length; i += 2) {
                        const pointY = data[i];
                        const pointX = data[i + 1];

                        if (pointX !== 0 && pointY !== 0) {
                                ctx.beginPath();
                                ctx.arc(pointX, pointY, radius, 0, 2 * Math.PI);
                                ctx.fillStyle = color;
                                ctx.fill();
                        }
                }
        }

        /**
        * Draw offset vector values, one of the model outputs, on to the canvas
        * Read our blog post for a description of PoseNet's offset vector outputs
        * https://medium.com/tensorflow/real-time-human-pose-estimation-in-the-browser-with-tensorflow-js-7dd0bc881cd5
        */
        function drawOffsetVectors(heatMapValues, offsets, outputStride, scale = 1, ctx) {
                const offsetPoints = posenet.singlePose.getOffsetPoints(
                        heatMapValues, outputStride, offsets
                );

                const heatmapData = heatMapValues.buffer().values;
                const offsetPointsData = offsetPoints.buffer().values;

                for (let i = 0; i < heatmapData.length; i += 2) {
                        const heatmapY = heatmapData[i] * outputStride;
                        const heatmapX = heatmapData[i + 1] * outputStride;
                        const offsetPointY = offsetPointsData[i];
                        const offsetPointX = offsetPointsData[i + 1];

                        drawSegment([heatmapY, heatmapX], [offsetPointY, offsetPointX],
                                color, scale, ctx
                        );
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
                                reject(new Error(myException.message))
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

})()


// es6 export
export default mlPosenet.Utils
