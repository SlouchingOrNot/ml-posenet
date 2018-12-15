var mlPosenet = mlPosenet || {}

//////////////////////////////////////////////////////////////////////////////
//		Code Separator
//////////////////////////////////////////////////////////////////////////////
var partsIndex = {}
let partNamesInOrder = ["nose", "leftEye", "rightEye", "leftEar", "rightEar", "leftShoulder", "rightShoulder",
	"leftElbow", "rightElbow", "leftWrist", "rightWrist", "leftHip", "rightHip",
	"leftKnee", "rightKnee", "leftAnkle", "rightAnkle"]
partNamesInOrder.forEach((partName, index) => {
	partsIndex[partName] = index
})

//////////////////////////////////////////////////////////////////////////////
//		Code Separator
//////////////////////////////////////////////////////////////////////////////
function computeMiddlePartsKeypoint(keypoints, partNameA, partNameB){
	let keypointA = keypoints[partsIndex[partNameA]]
	let keypointB = keypoints[partsIndex[partNameB]]
	console.assert(keypointA.part === partNameA)
	console.assert(keypointB.part === partNameB)
	let keypoint = {
		position : {
			x: (keypointA.position.x + keypointB.position.x)/2,
			y: (keypointA.position.y + keypointB.position.y)/2,					
		}
	}
	return keypoint
}
function computeDistanceBetweenParts(keypoints, partNameA, partNameB){
	let keypointA = keypoints[partsIndex[partNameA]]
	let keypointB = keypoints[partsIndex[partNameB]]
	return computeDistanceBetweenKeypoints(keypointA, keypointB)
}
function computeDistanceBetweenKeypoints(keypointA, keypointB){
	let deltaX = keypointA.position.x - keypointB.position.x
	let deltaY = keypointA.position.y - keypointB.position.y
	let distance = Math.sqrt( deltaX*deltaX + deltaY*deltaY)
	return distance
}

//////////////////////////////////////////////////////////////////////////////
//		export
//////////////////////////////////////////////////////////////////////////////
mlPosenet.KeypointUtils = {
	partsIndex,
	partNamesInOrder,
	
	computeMiddlePartsKeypoint,
	computeDistanceBetweenParts,
	computeDistanceBetweenKeypoints,
}

// es6 export
export default mlPosenet.KeypointUtils
