/* eslint-disable no-unused-vars */

'use strict';

const fs = require('fs');
const gulp = require('gulp');
const test = require('ava');
const del = require('del');
const squoosh = require('..');

const dirname = __dirname;
const dstdir = '_manytimes';

test.before(async t => {
	process.chdir(dirname);
	await del(dstdir);
});

test.after(async t => {
	await del(dstdir);
});

test.afterEach(async t => {
	await del(dstdir);
});

test.serial('run task many times', async t => {
	function image() {
		return gulp.src('80x80.png')
			.pipe(squoosh({
				encodeOptions: {
					avif: {},
					webp: {}
				},
				preprocessOptions: {
					resize: {
						enabled: true,
						width: 40
					}
				}
			}))
			.pipe(gulp.dest(dstdir));
	}

	for (let i = 0; i < 50; i++) {
		console.log(`manytimes: iter #${i}`);
		// eslint-disable-next-line no-await-in-loop
		await (new Promise((resolve, reject) => {
			gulp.series(image)(error => {
				if (error) {
					console.log('error:', error);
					reject(error);
					return;
				}

				t.true(fs.existsSync(`${dstdir}/80x80.webp`));
				t.true(fs.existsSync(`${dstdir}/80x80.avif`));
				resolve();
			});
		}));
	}
});
