# gulp-libsquoosh

Minify images with [libsquoosh](https://github.com/GoogleChromeLabs/squoosh/tree/dev/libsquoosh)

## Install

```
$ npm install --save-dev gulp-libsquoosh
```

## Usage

### Basic

This code will minify image into same format.

```js
const { src, dest } = require('gulp');
const squoosh = require('gulp-libsquoosh');

function images() {
  return src('src/images/**')
    .pipe(squoosh())
    .pipe(dest('dist/images'));
}

exports.images = images;
```

### Convert to multiple image formats

This code will minify png into png, webp, avif format.

```js
const { src, dest } = require('gulp');
const squoosh = require('gulp-libsquoosh');

function images() {
  return src('src/images/**/*.png')
    .pipe(squoosh(
      encodeOptions: {
        oxipng: {},
        webp: {},
        avif: {},
      }    
    ))
    .pipe(dest('dist/images'));
}

exports.images = images;
```
