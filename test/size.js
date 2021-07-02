'use strict';

const test = require('ava');
const squoosh = require('..');

test('contain 1', t => {
	const image = new squoosh.ImageSize({bitmap: {width: 200, height: 200}});
	let size;

	size = image.contain(100, 100);
	t.is(size.width, 100);
	t.is(size.height, 100);

	size = image.contain(500, 500);
	t.is(size.width, 500);
	t.is(size.height, 500);

	size = image.contain(10, 10);
	t.is(size.width, 10);
	t.is(size.height, 10);

	size = image.contain(200, 100);
	t.is(size.width, 100);
	t.is(size.height, 100);

	size = image.contain(100, 200);
	t.is(size.width, 100);
	t.is(size.height, 100);
});

test('contain 2', t => {
	const image = new squoosh.ImageSize({bitmap: {width: 400, height: 200}});
	let size;

	size = image.contain(100, 100);
	t.is(size.width, 100);
	t.is(size.height, 50);

	size = image.contain(800, 800);
	t.is(size.width, 800);
	t.is(size.height, 400);

	size = image.contain(10, 10);
	t.is(size.width, 10);
	t.is(size.height, 5);

	size = image.contain(200, 100);
	t.is(size.width, 200);
	t.is(size.height, 100);

	size = image.contain(100, 200);
	t.is(size.width, 100);
	t.is(size.height, 50);
});

test('contain 3', t => {
	const image = new squoosh.ImageSize({bitmap: {width: 200, height: 400}});
	let size;

	size = image.contain(100, 100);
	t.is(size.width, 50);
	t.is(size.height, 100);

	size = image.contain(800, 800);
	t.is(size.width, 400);
	t.is(size.height, 800);

	size = image.contain(10, 10);
	t.is(size.width, 5);
	t.is(size.height, 10);

	size = image.contain(200, 100);
	t.is(size.width, 50);
	t.is(size.height, 100);

	size = image.contain(100, 200);
	t.is(size.width, 100);
	t.is(size.height, 200);
});

test('scaleDown 1', t => {
	const image = new squoosh.ImageSize({bitmap: {width: 200, height: 400}});
	let size;

	size = image.scaleDown(100, 100);
	t.is(size.width, 50);
	t.is(size.height, 100);

	size = image.scaleDown(800, 800);
	t.is(size.width, 200);
	t.is(size.height, 400);

	size = image.scaleDown(10, 10);
	t.is(size.width, 5);
	t.is(size.height, 10);

	size = image.scaleDown(200, 100);
	t.is(size.width, 50);
	t.is(size.height, 100);

	size = image.scaleDown(100, 200);
	t.is(size.width, 100);
	t.is(size.height, 200);
});

test('cover 1', t => {
	const image = new squoosh.ImageSize({bitmap: {width: 200, height: 200}});
	let size;

	size = image.cover(100, 100);
	t.is(size.width, 100);
	t.is(size.height, 100);

	size = image.cover(500, 500);
	t.is(size.width, 500);
	t.is(size.height, 500);

	size = image.cover(10, 10);
	t.is(size.width, 10);
	t.is(size.height, 10);

	size = image.cover(200, 100);
	t.is(size.width, 200);
	t.is(size.height, 200);

	size = image.cover(100, 200);
	t.is(size.width, 200);
	t.is(size.height, 200);
});

test('cover 2', t => {
	const image = new squoosh.ImageSize({bitmap: {width: 400, height: 200}});
	let size;

	size = image.cover(100, 100);
	t.is(size.width, 200);
	t.is(size.height, 100);

	size = image.cover(500, 500);
	t.is(size.width, 1000);
	t.is(size.height, 500);

	size = image.cover(10, 10);
	t.is(size.width, 20);
	t.is(size.height, 10);

	size = image.cover(200, 100);
	t.is(size.width, 200);
	t.is(size.height, 100);

	size = image.cover(100, 200);
	t.is(size.width, 400);
	t.is(size.height, 200);
});
