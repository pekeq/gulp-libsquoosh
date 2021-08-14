/* eslint-disable no-unused-vars */

'use strict';

const fs = require('fs');
const gulp = require('gulp');
const test = require('ava');
const del = require('del');
const squoosh = require('..');

const dirname = __dirname;

test.before(t => {
	process.chdir(dirname);
	fs.copyFileSync('80x80.jpg', 'test1.jpg');
	fs.copyFileSync('80x80.png', 'test2.png');
});

test.after(t => {
	del('test1.jpg');
	del('test2.png');
	del('tmp');
});

test.serial('run parallel to check "out of memory" error', t => {
	return new Promise((resolve, reject) => {
		function images() {
			return gulp.src(['test1.jpg', 'test2.png'])
				.pipe(squoosh({mozjpeg: {}, webp: {}, oxipng: {}, avif: {}}))
				.pipe(gulp.dest('tmp'));
		}

		gulp.parallel(
			images, images, images, images, images, images, images, images, images, images, images, images, images
		)(error => {
			if (error) {
				reject(error);
			}

			t.true(fs.existsSync('tmp/test1.jpg'));
			t.true(fs.existsSync('tmp/test1.png'));
			t.true(fs.existsSync('tmp/test1.webp'));
			t.true(fs.existsSync('tmp/test1.avif'));
			t.true(fs.existsSync('tmp/test2.jpg'));
			t.true(fs.existsSync('tmp/test2.png'));
			t.true(fs.existsSync('tmp/test2.webp'));
			t.true(fs.existsSync('tmp/test2.avif'));
			resolve();
		});
	});
});
