/* eslint-disable no-unused-vars */

'use strict';

const fs = require('fs');
const gulp = require('gulp');
const test = require('ava');
const del = require('del');
const squoosh = require('..');

const dirname = __dirname;
const basedir = '_parallel';

test.before(t => {
	process.chdir(dirname);
	del.sync(basedir);
	fs.mkdirSync(basedir);
	fs.copyFileSync('80x80.jpg', `${basedir}/test1.jpg`);
	fs.copyFileSync('80x80.png', `${basedir}/test2.png`);
});

test.after(t => {
	del.sync(basedir);
});

test.serial('run parallel to check "out of memory" error', t => {
	return new Promise((resolve, reject) => {
		let job = 1;
		function images() {
			const thisjob = job++;
			return gulp.src([`${basedir}/test1.jpg`, `${basedir}/test2.png`])
				.pipe(squoosh(
					{mozjpeg: {}, webp: {}, oxipng: {}, avif: {}},
					{
						resize: {
							enabled: true,
							// Specify either width or height
							// When you specify width and height, image resized to exact size you specified
							width: 20
						}
					}
				))
				.pipe(gulp.dest(`${basedir}/${thisjob}`));
		}

		gulp.parallel(
			images, images, images, images, images, images, images, images, images, images,
			images, images, images, images, images, images, images, images, images, images
		)(error => {
			if (error) {
				reject(error);
			}

			t.true(fs.existsSync(`${basedir}/20/test1.jpg`));
			t.true(fs.existsSync(`${basedir}/20/test1.png`));
			t.true(fs.existsSync(`${basedir}/20/test1.webp`));
			t.true(fs.existsSync(`${basedir}/20/test1.avif`));
			t.true(fs.existsSync(`${basedir}/20/test2.jpg`));
			t.true(fs.existsSync(`${basedir}/20/test2.png`));
			t.true(fs.existsSync(`${basedir}/20/test2.webp`));
			t.true(fs.existsSync(`${basedir}/20/test2.avif`));
			resolve();
		});
	});
});
