server:
	http-server -c-1

build:
	rollup src/index.js --file build/ml-posenet.js --format umd --name "mlPosenet"

.PHONY: build

minify:
	uglifyjs build/ml-posenet.js -o build/ml-posenet.min.js
