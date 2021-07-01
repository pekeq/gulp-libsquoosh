'use strict';

const through = require('through2');
const PluginError = require('plugin-error');
const squoosh = require('@squoosh/lib');

const PLUGIN_NAME = 'gulp-squoosh';

// By default, encode to same image type.
const DefaultEncodeOptions = Object.fromEntries(
	Object.entries(squoosh.encoders).map(([key, encoder]) => {
		const extension = `.${encoder.extension}`;
		return [extension, Object.fromEntries([[key, {}]])];
	})
);

/**
 * Minify images with libSquoosh.
 * @function
 * @param {object} [encodeOptions] - An object with encoders to use, and their settings.
 * @param {object} [preprocessOptions] - An object with preprocessors to use, and their settings.
 * @returns {NodeJS.ReadWriteStream}
 */
module.exports = function (encodeOptions, preprocessOptions) {
	if (typeof encodeOptions === 'object' &&
		typeof preprocessOptions === 'undefined' &&
		typeof encodeOptions.encodeOptions !== 'undefined' &&
		typeof encodeOptions.preprocessOptions !== 'undefined') {
		preprocessOptions = encodeOptions.preprocessOptions;
		encodeOptions = encodeOptions.encodeOptions;
	}

	const transform = async function (file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
			return;
		}

		// Is file supported by libsquoosh?
		if (!Object.keys(DefaultEncodeOptions).includes(file.extname)) {
			cb(null, file);
			return;
		}

		encodeOptions = encodeOptions ? encodeOptions : DefaultEncodeOptions[file.extname];

		try {
			const imagePool = new squoosh.ImagePool();
			const image = imagePool.ingestImage(file.contents);
			await image.decoded;

			if (preprocessOptions) {
				await image.preprocess(preprocessOptions);
			}

			await image.encode(encodeOptions);

			const tasks = Object.values(image.encodedWith).map(async encoder => {
				const encodedImage = await encoder;
				const newfile = file.clone({contents: false});
				newfile.contents = Buffer.from(encodedImage.binary);
				newfile.extname = `.${encodedImage.extension}`;
				this.push(newfile);
			});
			await Promise.all(tasks);

			await imagePool.close();
		} catch (error) {
			cb(new PluginError(PLUGIN_NAME, error, {filename: file.path}));
			return;
		}

		cb();
	};

	return through.obj(transform);
};
