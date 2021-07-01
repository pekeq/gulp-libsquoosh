# gulp-libsquoosh

Minify images with [libSquoosh](https://github.com/GoogleChromeLabs/squoosh/tree/dev/libsquoosh).

## Install

```
$ npm install --save-dev gulp-libsquoosh
```

## Usage

Detailed description can be found in [libSquoosh README](https://github.com/GoogleChromeLabs/squoosh/tree/dev/libsquoosh).

### Basic

```js
const { src, dest } = require('gulp');
const squoosh = require('gulp-libsquoosh');

// minify image into same format
function images() {
  return src('src/images/**')
    .pipe(squoosh())
    .pipe(dest('dist/images'));
}

exports.images = images;
```

### Convert to multiple image formats

```js
const { src, dest } = require('gulp');
const squoosh = require('gulp-libsquoosh');

// minify png into png, webp and avif format
function images() {
  return src('src/images/**/*.png')
    .pipe(squoosh({
      oxipng: {},
      webp: {},
      avif: {},
    }))
    .pipe(dest('dist/images'));
}

exports.images = images;
```

### Resize image

```js
const { src, dest } = require('gulp');
const squoosh = require('gulp-libsquoosh');

// resize image to width 200px with keeping aspect ratio.
function images() {
  return src('src/thumbnail/*.png')
    .pipe(squoosh(
      null, // use default
      {
        resize: {
          enabled: true,
          width: 200,  // specify either width or height
                       // when you specify width and height, image resized to exact size you specified
        },
      }))
    .pipe(dest('dist/thumbnail'));
}

exports.images = images;
```

### Quantize, Rotate image

```js
const { src, dest } = require('gulp');
const squoosh = require('gulp-libsquoosh');

// quantize, rotate and minify png into png, webp and avif format
function images() {
  return src('src/images/**/*.png')
    .pipe(squoosh(
      {
        oxipng: {
          level: 6 // slower but more compression
        },
        webp: {},
        avif: {}
      },
      {
        // quantize images
        quant: {
          enabled: true,
          numColors: 256 // default=255
        },
        // rotate images
        rotate: {
          enabled: true,
          numRotations: 1 // (numRotations * 90) degrees
        }
      }
    ))
    .pipe(dest('dist/images'));
}

exports.images = images;
```

## API

### squoosh(encodeOptions?, preprocessOptions?)

Description of the options can be found in [libSquoosh README](https://github.com/GoogleChromeLabs/squoosh/tree/dev/libsquoosh#preprocessing-and-encoding-images).

## License

MIT License

Copyright (c) 2021 Hideo Matsumoto
