'use strict';

const os = require('os');
const through = require('through2');
const PluginError = require('plugin-error');
const libSquoosh = require('@squoosh/lib');

const PLUGIN_NAME = 'gulp-libsquoosh';

/**
 * @type {libSquoosh.ImagePool}
 */
let imagePool;

const NUM_PARALLEL = os.cpus().length > 1 ? 2 : 1;
const queue = [];
let running = 0;

/**
 * @typedef { import('vinyl') } File
 */

/**
 * By default, encode to same image type.
 * @typedef {[extension:string]: Object}
 */
const DefaultEncodeOptions = Object.fromEntries(
	Object.entries(libSquoosh.encoders).map(([key, encoder]) => {
		const extension = `.${encoder.extension}`;
		return [extension, Object.fromEntries([[key, {}]])];
	})
);

/**
 * @typedef {Object} BoxSize
 * @property {number} width
 * @property {number} height
 */
/**
 * @typedef {Object} SquooshOptions
 * @property {EncodeOptions} encodeOptions
 * @property {PreprocessOptions} preprocessOptions
 */
/**
 * @callback SquooshCallback
 * @param {ImageSize} imageSize
 * @returns {BoxSize}
 */

/* The following two options are as of libSquoosh's commit #955b2ac. */
/**
 * @typedef {Object} EncodeOptions
 * @property {Object} [mozjpeg]
 * @property {Object} [webp]
 * @property {Object} [avif]
 * @property {Object} [jxl]
 * @property {Object} [wp2]
 * @property {Object} [oxipng]
 */
/**
 * @typedef {Object} PreprocessOptions
 * @property {Object} [resize]
 * @property {Object} [quant]
 * @property {Object} [rotate]
 */

/**
 * Minify images with libSquoosh.
 * @param {(EncodeOptions|SquooshOptions|SquooshCallback)} [encodeOptions] - An object with encoders to use, and their settings.
 * @param {Object} [PreprocessOptions] - An object with preprocessors to use, and their settings.
 * @returns {NodeJS.ReadWriteStream}
 */
function squoosh(encodeOptions, preprocessOptions) {
	if (typeof encodeOptions === 'object' && typeof preprocessOptions === 'undefined') {
		if (typeof encodeOptions.preprocessOptions !== 'undefined') {
			preprocessOptions = encodeOptions.preprocessOptions;
			delete encodeOptions.preprocessOptions;
		}

		if (typeof encodeOptions.encodeOptions !== 'undefined') {
			encodeOptions = encodeOptions.encodeOptions;
		}
	}

	/**
	 * @param {File} file
	 * @returns {File[]}
	 */
	const encode = async function (file) {
		if (!imagePool) {
			imagePool = new libSquoosh.ImagePool(NUM_PARALLEL);
		}

		let currentEncodeOptions = encodeOptions;
		let currentPreprocessOptions = preprocessOptions;

		const image = imagePool.ingestImage(file.contents);
		const decoded = await image.decoded;

		if (typeof encodeOptions === 'function') {
			/** @type {SquooshCallback} */
			const callback = encodeOptions;
			const result = callback(new ImageSize(decoded, file.path));
			currentEncodeOptions = result.encodeOptions || null;
			currentPreprocessOptions = result.preprocessOptions || null;
		}

		currentEncodeOptions = (currentEncodeOptions && Object.keys(currentEncodeOptions).length > 0) ? currentEncodeOptions : DefaultEncodeOptions[file.extname];

		if (currentPreprocessOptions) {
			await image.preprocess(currentPreprocessOptions);
		}

		await image.encode(currentEncodeOptions);

		const encodedFiles = [];
		const tasks = Object.values(image.encodedWith).map(async encoder => {
			const encodedImage = await encoder;
			const newfile = file.clone({contents: false});
			newfile.contents = Buffer.from(encodedImage.binary);
			newfile.extname = `.${encodedImage.extension}`;
			encodedFiles.push(newfile);
		});
		await Promise.all(tasks);

		await imagePool.close();
		imagePool = null;

		return encodedFiles;
	};

	/**
	 * @type { import('through2').TransformFunction }
	 * @param {File} file
	 */
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

		queue.push([this, file, cb]);

		if (running < 1) {
			running++;
			for (let args; (args = queue.shift());) {
				const [self, file, cb] = args;
				try {
					// eslint-
					const encoded = await encode(file); // eslint-disable-line no-await-in-loop
					for (const f of encoded) {
						self.push(f);
					}

					cb();
				} catch (error) {
					cb(new PluginError(PLUGIN_NAME, error, {filename: file.path}));
				}
			}

			running--;
		}
	};

	return through.obj(transform);
}

/**
 * @class
 * @param {Object} bitmap
 * @param {string} path - The full path to the file.
 */
function ImageSize({bitmap}, path) {
	/** @type {number} */
	this.width = bitmap.width;

	/** @type {number} */
	this.height = bitmap.height;

	this.path = path;
}

/**
 * Scale to keep its aspect ratio while fitting within the specified bounding box.
 * @param {number} targetWidth
 * @param {number} [targetHeight]
 * @returns {BoxSize}
 */
ImageSize.prototype.contain = function (targetWidth, targetHeight) {
	if (typeof targetHeight === 'undefined') {
		targetHeight = targetWidth;
	}

	const {width, height} = this;

	const scaleW = targetWidth / width;
	const scaleH = targetHeight / height;
	const scale = (scaleW > scaleH) ? scaleH : scaleW;

	return {
		width: Math.round(width * scale),
		height: Math.round(height * scale)
	};
};

/**
 * Acts like contain() but don't zoom if image is smaller than the specified bounding box.
 * @param {number} targetWidth
 * @param {number} [targetHeight]
 * @returns {BoxSize}
 */
ImageSize.prototype.scaleDown = function (targetWidth, targetHeight) {
	if (typeof targetHeight === 'undefined') {
		targetHeight = targetWidth;
	}

	const {width, height} = this;

	if (targetWidth > width && targetHeight > height) {
		return {width, height};
	}

	return this.contain(targetWidth, targetHeight);
};

/**
 * Scale to keep its aspect ratio while filling the specified bounding box.
 * This method is not usable because libSquoosh doesn't provide crop functionality.
 * @param {number} targetWidth
 * @param {number} [targetHeight]
 * @returns {BoxSize}
 */
ImageSize.prototype.cover = function (targetWidth, targetHeight) {
	if (typeof targetHeight === 'undefined') {
		targetHeight = targetWidth;
	}

	const {width, height} = this;

	const scaleW = targetWidth / width;
	const scaleH = targetHeight / height;
	const scale = (scaleW > scaleH) ? scaleW : scaleH;

	return {
		width: Math.round(width * scale),
		height: Math.round(height * scale)
	};
};

squoosh.DefaultEncodeOptions = DefaultEncodeOptions;
squoosh.ImageSize = ImageSize;

module.exports = squoosh;
