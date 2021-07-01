# gulp-libsquoosh

Minify images with [libsquoosh](https://github.com/GoogleChromeLabs/squoosh/tree/dev/libsquoosh).

## Install

```
$ npm install --save-dev gulp-libsquoosh
```

## Usage

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

// minify png into png, webp, avif format
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
      null,
      {
        resize: {
          enabled: true,
          width: 200,  // specify either width or height
                       // when you specify width and height, image resized to exact size
        },
      }))
    .pipe(dest('dist/thumbnail'));
}

exports.images = images;
```
