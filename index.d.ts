export = squoosh;
/**
 * @typedef {Object} BoxSize
 * @property {number} width
 * @property {number} height
 */
/**
 * @typedef {Object} SquooshOptions
 * @property {EncodeOptions} encodeOptions
 * @property {PreprocessOptions} preprocessOptions
 */
/**
 * @callback SquooshCallback
 * @param {ImageSize} imageSize
 * @returns {BoxSize}
 */
/**
 * @typedef {Object} EncodeOptions
 * @property {Object} [mozjpeg]
 * @property {Object} [webp]
 * @property {Object} [avif]
 * @property {Object} [jxl]
 * @property {Object} [wp2]
 * @property {Object} [oxipng]
 */
/**
 * @typedef {Object} PreprocessOptions
 * @property {Object} [resize]
 * @property {Object} [quant]
 * @property {Object} [rotate]
 */
/**
 * Minify images with libSquoosh.
 * @param {(EncodeOptions|SquooshOptions|SquooshCallback)} [encodeOptions] - An object with encoders to use, and their settings.
 * @param {Object} [PreprocessOptions] - An object with preprocessors to use, and their settings.
 * @returns {NodeJS.ReadWriteStream}
 */
declare function squoosh(encodeOptions?: (EncodeOptions | SquooshOptions | SquooshCallback), preprocessOptions: any): NodeJS.ReadWriteStream;
declare namespace squoosh {
    export { ImageSize, BoxSize, SquooshOptions, SquooshCallback, EncodeOptions, PreprocessOptions };
}
type EncodeOptions = {
    mozjpeg?: any;
    webp?: any;
    avif?: any;
    jxl?: any;
    wp2?: any;
    oxipng?: any;
};
type SquooshOptions = {
    encodeOptions: EncodeOptions;
    preprocessOptions: PreprocessOptions;
};
type SquooshCallback = (imageSize: ImageSize) => BoxSize;
/**
 * @class
 * @param {Object} bitmap
 */
declare function ImageSize({ bitmap }: any): void;
declare class ImageSize {
    /**
     * @class
     * @param {Object} bitmap
     */
    constructor({ bitmap }: any);
    width: any;
    height: any;
    /**
     * Scale to keep its aspect ratio while fitting within the specified bounding box.
     * @param {number} targetWidth
     * @param {number} [targetHeight]
     * @returns {BoxSize}
     */
    contain(targetWidth: number, targetHeight?: number): BoxSize;
    /**
     * Acts like contain() but don't zoom if image is smaller than the specified bounding box.
     * @param {number} targetWidth
     * @param {number} [targetHeight]
     * @returns {BoxSize}
     */
    scaleDown(targetWidth: number, targetHeight?: number): BoxSize;
    /**
     * Scale to keep its aspect ratio while filling the specified bounding box.
     * This method is not usable because libSquoosh doesn't provide crop functionality.
     * @param {number} targetWidth
     * @param {number} [targetHeight]
     * @returns {BoxSize}
     */
    cover(targetWidth: number, targetHeight?: number): BoxSize;
}
type BoxSize = {
    width: number;
    height: number;
};
type PreprocessOptions = {
    resize?: any;
    quant?: any;
    rotate?: any;
};
