/* eslint-disable no-unused-vars */

'use strict';

const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const test = require('ava');
const del = require('del');
const squoosh = require('..');

const dirname = __dirname;
const dstdir = '_test';

test.beforeEach(t => {
	process.chdir(__dirname);
	del.sync(dstdir);
});

test.afterEach(() => {
	del.sync(dstdir);
});

test.serial('basic usage', t => {
	return new Promise(resolve => {
		const file = '80x80.jpg';
		const stream = gulp.src(file)
			.pipe(squoosh())
			.pipe(gulp.dest(dstdir));
		stream.on('finish', () => {
			t.true(fs.existsSync(`${dstdir}/80x80.jpg`));
			t.false(fs.existsSync(`${dstdir}/80x80.webp`));
			resolve();
		});
	});
});

test.serial('array src', t => {
	return new Promise(resolve => {
		const stream = gulp.src(['80x80.png', 'cat_kotatsu_neko.png'])
			.pipe(squoosh())
			.pipe(gulp.dest(dstdir));
		stream.on('finish', () => {
			t.true(fs.existsSync(`${dstdir}/80x80.png`));
			t.true(fs.existsSync(`${dstdir}/cat_kotatsu_neko.png`));
			resolve();
		});
	});
});

test.serial('wildcard src', t => {
	return new Promise(resolve => {
		const stream = gulp.src(['*.png'])
			.pipe(squoosh())
			.pipe(gulp.dest(dstdir));
		stream.on('finish', () => {
			t.true(fs.existsSync(`${dstdir}/80x80.png`));
			t.true(fs.existsSync(`${dstdir}/cat_kotatsu_neko.png`));
			resolve();
		});
	});
});

test.serial('squoosh to same format', t => {
	return new Promise(resolve => {
		const file = '80x80.png';
		const stream = gulp.src(file)
			.pipe(squoosh({
				oxipng: {}
			}))
			.pipe(gulp.dest(dstdir));
		stream.on('finish', () => {
			t.true(fs.existsSync(`${dstdir}/80x80.png`));
			resolve();
		});
	});
});

test.serial('squoosh to webp, avif', t => {
	return new Promise(resolve => {
		const file = '80x80.png';
		const stream = gulp.src(file)
			.pipe(squoosh({
				avif: {},
				webp: {}
			}))
			.pipe(gulp.dest(dstdir));
		stream.on('finish', () => {
			t.true(fs.existsSync(`${dstdir}/80x80.avif`));
			t.true(fs.existsSync(`${dstdir}/80x80.webp`));
			t.false(fs.existsSync(`${dstdir}/80x80.png`));
			resolve();
		});
	});
});

test.serial('passthrough unsupported format', t => {
	return new Promise(resolve => {
		const file = '80x80.gif';
		const stream = gulp.src(file)
			.pipe(squoosh({
				avif: {},
				webp: {}
			}))
			.pipe(gulp.dest(dstdir));
		stream.on('finish', () => {
			t.true(fs.existsSync(`${dstdir}/80x80.gif`));
			t.false(fs.existsSync(`${dstdir}/80x80.avif`));
			t.false(fs.existsSync(`${dstdir}/80x80.webp`));
			resolve();
		});
	});
});

test.serial('quantize and rotate image', t => {
	return new Promise(resolve => {
		const base = 'cat_kotatsu_neko';
		const stream = gulp.src(`${base}.png`)
			.pipe(squoosh({
				oxipng: {
					level: 6
				},
				webp: {},
				avif: {}
			}, {
				quant: {
					enabled: true,
					numColors: 256
				},
				rotate: {
					enabled: true,
					numRotations: 1
				}
			}))
			.pipe(gulp.dest(dstdir));
		stream.on('finish', () => {
			t.true(fs.existsSync(`${dstdir}/${base}.png`));
			t.true(fs.existsSync(`${dstdir}/${base}.avif`));
			t.true(fs.existsSync(`${dstdir}/${base}.webp`));
			resolve();
		});
	});
});

test.serial('object argument - encodeOptions only', t => {
	return new Promise(resolve => {
		const file = '80x80.png';
		const stream = gulp.src(file)
			.pipe(squoosh({
				encodeOptions: {
					webp: {}
				}
			}))
			.pipe(gulp.dest(dstdir));
		stream.on('finish', () => {
			t.true(fs.existsSync(`${dstdir}/80x80.webp`));
			resolve();
		});
	});
});

test.serial('object argument - preprocessOptions only', t => {
	return new Promise(resolve => {
		const base = 'cat_kotatsu_neko';
		const stream = gulp.src(`${base}.png`)
			.pipe(squoosh({
				preprocessOptions: {
					rotate: {
						enabled: true,
						numRotations: 2
					}
				}
			}))
			.pipe(gulp.dest(dstdir));
		stream.on('finish', () => {
			t.true(fs.existsSync(`${dstdir}/${base}.png`));
			resolve();
		});
	});
});

test.serial('object argument - both encodeOptions,preprocessOptions', t => {
	return new Promise(resolve => {
		const base = '80x80';
		const stream = gulp.src(`${base}.png`)
			.pipe(squoosh({
				encodeOptions: {
					avif: {},
					webp: {}
				},
				preprocessOptions: {
					rotate: {
						enabled: true,
						numRotations: 2
					}
				}
			}))
			.pipe(gulp.dest(dstdir));
		stream.on('finish', () => {
			t.true(fs.existsSync(`${dstdir}/${base}.avif`));
			t.true(fs.existsSync(`${dstdir}/${base}.webp`));
			resolve();
		});
	});
});

test.serial('function argument contain', t => {
	return new Promise(resolve => {
		const base = 'cat_kotatsu_neko';
		const stream = gulp.src(`${base}.png`)
			.pipe(squoosh(src => ({
				preprocessOptions: {
					resize: {
						enabled: true,
						...src.contain(200)
					}
				}
			})))
			.pipe(gulp.dest(dstdir));
		stream.on('finish', () => {
			t.true(fs.existsSync(`${dstdir}/${base}.png`));
			resolve();
		});
	});
});

test.serial('function argument cover', t => {
	return new Promise(resolve => {
		const base = 'cat_kotatsu_neko';
		const stream = gulp.src(`${base}.png`)
			.pipe(squoosh(src => ({
				preprocessOptions: {
					resize: {
						enabled: true,
						...src.cover(200)
					}
				}
			})))
			.pipe(gulp.dest(dstdir));
		stream.on('finish', () => {
			t.true(fs.existsSync(`${dstdir}/${base}.png`));
			resolve();
		});
	});
});

test.serial('more complex', t => {
	return new Promise(resolve => {
		const base = 'cat_kotatsu_neko';
		const stream = gulp.src(['*.png', '*.jpg'])
			.pipe(squoosh(src => {
				const extname = path.extname(src.path);
				const options = {
					encodeOptions: squoosh.DefaultEncodeOptions[extname]
				};
				if (extname === '.jpg') {
					options.encodeOptions = {jxl: {}};
				}

				if (extname === '.png') {
					options.encodeOptions = {avif: {}};
					options.preprocessOptions = {
						quant: {
							enabled: true,
							numColors: 16
						}
					};
				}

				return options;
			}))
			.pipe(gulp.dest(dstdir));
		stream.on('finish', () => {
			t.false(fs.existsSync(`${dstdir}/${base}.png`));
			t.true(fs.existsSync(`${dstdir}/${base}.avif`));
			t.false(fs.existsSync(`${dstdir}/80x80.png`));
			t.true(fs.existsSync(`${dstdir}/80x80.avif`));
			t.true(fs.existsSync(`${dstdir}/80x80.jxl`));
			resolve();
		});
	});
});
