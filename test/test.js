/* eslint-disable no-unused-vars */

'use strict';

const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const test = require('ava');
const del = require('del');
const assert = require('stream-assert');
const squoosh = require('..');

test.beforeEach(t => {
	process.chdir(__dirname);
	del.sync(path.join(__dirname, 'tmp'));
});

test('squoosh to same format', t => {
	return new Promise(resolve => {
		const file = '1x1.png';
		const stream = gulp.src(file)
			.pipe(squoosh({
				oxipng: {}
			}))
			.pipe(gulp.dest('tmp'));
		stream.on('end', () => {
			t.notThrows(() => {
				fs.accessSync('tmp/1x1.png');
			});
			resolve();
		});
	});
});

test('squoosh to webp, avif', t => {
	return new Promise(resolve => {
		const file = '1x1.png';
		const stream = gulp.src(file)
			.pipe(squoosh({
				avif: {},
				webp: {}
			}))
			.pipe(gulp.dest('tmp'));
		stream.on('end', () => {
			t.notThrows(() => {
				fs.accessSync('tmp/1x1.avif');
				fs.accessSync('tmp/1x1.webp');
			});
			resolve();
		});
	});
});

test('passthrough unsupported format', t => {
	return new Promise(resolve => {
		const file = '1x1.gif';
		const stream = gulp.src(file)
			.pipe(squoosh({
				avif: {},
				webp: {}
			}))
			.pipe(gulp.dest('tmp'));
		stream.on('end', () => {
			t.notThrows(() => {
				fs.accessSync('tmp/1x1.gif');
			});
			resolve();
		});
	});
});

test('quantize and rotate image', t => {
	return new Promise(resolve => {
		const file = 'cat_kotatsu_neko.png';
		const stream = gulp.src(file)
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
			.pipe(gulp.dest('tmp'));
		stream.on('end', () => {
			t.notThrows(() => {
				fs.accessSync('tmp/cat_kotatsu_neko.png');
				fs.accessSync('tmp/cat_kotatsu_neko.avif');
				fs.accessSync('tmp/cat_kotatsu_neko.webp');
			});
			resolve();
		});
	});
});

test('object argument', t => {
	return new Promise(resolve => {
		const file = '1x1.png';
		const stream = gulp.src(file)
			.pipe(squoosh({
				encodeOptions: {
					oxipng: {}
				},
				preprocessOptions: {}
			}))
			.pipe(gulp.dest('tmp'));
		stream.on('end', () => {
			t.notThrows(() => {
				fs.accessSync('tmp/1x1.png');
			});
			resolve();
		});
	});
});
