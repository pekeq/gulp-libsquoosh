const {src, dest, parallel} = require('gulp');
const squoosh = require('..');

function sample1() {
	return src('*.png')
		.pipe(squoosh())
		.pipe(dest('output/sample1'));
}

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

function sample3() {
	return src('*.gif')
		.pipe(squoosh({
			encodeOptions: {
				avif: {}
			}
		}))
		.pipe(dest('output/sample3'));
}

exports.sample1 = sample1;
exports.sample2 = sample2;
exports.sample3 = sample3;
exports.default = parallel(sample1, sample2, sample3);
