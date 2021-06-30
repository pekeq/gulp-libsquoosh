/* eslint-disable no-unused-vars */

'use strict';

const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const test = require('ava');
const assert = require('stream-assert');
const squoosh = require('..');

test.beforeEach(t => {
	process.chdir(__dirname);
	fs.rmSync(path.join(__dirname, 'tmp'), {force: true, recursive: true});
});

test('squoosh to same format', t => {
	return new Promise(resolve => {
		const file = '1x1.png';
		const stream = gulp.src(file)
			.pipe(squoosh({
				oxipng: {},
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
