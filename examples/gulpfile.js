const {src, dest, parallel} = require('gulp');
const squoosh = require('..');

// minify to same format
function sample1() {
	return src('*.png')
		.pipe(squoosh())
		.pipe(dest('output/sample1'));
}

// minify to multiple formats
function sample2() {
	return src('*.png')
		.pipe(squoosh({
			encodeOptions: {
				mozjpeg: {},
				oxipng: {}
			}
		}))
		.pipe(dest('output/sample2'));
}

// passthrough unsupported format
function sample3() {
	return src('*.gif')
		.pipe(squoosh({
			encodeOptions: {
				avif: {}
			}
		}))
		.pipe(dest('output/sample3'));
}

// resize
function sample4() {
	return src('*.png')
		.pipe(squoosh({
			preprocessOptions: {
				resize: {
					enabled: true,
					width: 200,
					height: 200
				},
			},
			encodeOptions: {
				avif: {}
			}
		}))
		.pipe(dest('output/sample4'));
}

exports.sample1 = sample1;
exports.sample2 = sample2;
exports.sample3 = sample3;
exports.sample4 = sample4;
exports.default = parallel(sample1, sample2, sample3, sample4);
