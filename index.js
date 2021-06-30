'use strict';

const through = require('through2');
const PluginError = require('plugin-error');
const squoosh = require('@squoosh/lib');

const PLUGIN_NAME = 'gulp-squoosh';

// By default, encode to same image type.
const DefaultEncodeOptions = {
	'.jpg': {
		mozjpeg: {}
	},
	'.web': {
		webp: {}
	},
	'.avif': {
		avif: {}
	},
	'.jxl': {
		jxl: {}
	},
	'.wp2': {
		wp2: {}
	},
	'.png': {
		oxipng: {}
	}
};

module.exports = function (options) {
	const DefaultOptions = {
		preprocessOptions: null,
		encodeOptions: null
	};

	options = options || DefaultOptions;
	const transform = async function (file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		// Is file supported by libsquoosh?
		if (!Object.keys(DefaultEncodeOptions).includes(file.extname)) {
			cb(null, file);
			return;
		}

		try {
			const imagePool = new squoosh.ImagePool();
			const image = imagePool.ingestImage(file.contents);
			await image.decoded;

			if (options.preprocessOptions) {
				await image.preprocess(options.preprocessOptions);
			}

			const encodeOptions = options.encodeOptions ? options.encodeOptions : DefaultEncodeOptions[file.extname];
			await image.encode(encodeOptions);

			for (const encodedImagePromise of Object.values(image.encodedWith)) {
				// eslint-disable-next-line no-await-in-loop
				const encodedImage = await encodedImagePromise;
				const newfile = file.clone();
				newfile.contents = Buffer.from(encodedImage.binary);
				newfile.extname = `.${encodedImage.extension}`;
				this.push(newfile);
			}

			await imagePool.close();

			cb();
		} catch (error) {
			cb(new PluginError(PLUGIN_NAME, error, {filename: file.path}));
			// eslint-disable-next-line no-useless-return
			return;
		}
	};

	return through.obj(transform);
};
