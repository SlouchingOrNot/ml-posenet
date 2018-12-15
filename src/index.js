import Parameters from '../src/ml-posenet-parameters.js';
import Utils from '../src/ml-posenet-utils.js';
import ResultsViewer from '../src/ml-posenet-resultsviewer.js';
import createDatGUI from '../src/ml-posenet-gui.js'
import KeypointUtils from '../src/ml-posenet-keypointutils.js'

// es6 export
export default {
	Parameters: Parameters,
	Utils: Utils,
	ResultsViewer: ResultsViewer,
	createDatGUI: createDatGUI,
	KeypointUtils,
}
