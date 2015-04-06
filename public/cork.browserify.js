var FastSimplexNoise = require('fast-simplex-noise');

var TILE_WIDTH = 5;
var TILE_HEIGHT = 5;

/**
* CanvasIterator: takes a canvas.
* next() function returns tiles of pixel
* data, starting from the top-left, and going
* left-to-right, top-to-bottom.
* When canvas has been iterated through, next returns
* 'true' for first value.
* Otherwise, returns 'false' and a matrix of pixel data
* for the current tile.
*/
class CanvasIterator {
    constructor(canvas, opts) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');

        // @TODO: hardcoded opts for now, 
        // take as options later.
        this.opts = {
            tileWidth: TILE_WIDTH,
            tileHeight: TILE_HEIGHT
        };

        this._x = 0;
        this._y = 0;
        this._done = false;
    }

    next() {
        if (this._done) {
            return [this._done, null];
        }

        // Move to next row if past the edge.
        if (this._x >= this.canvas.width) {
            this._x = 0;
            this._y += this.opts.tileHeight;
        }

        // If past the bottom edge, mark as done.
        if (this._y >= this.canvas.height) {
            this._done = true;
            return [this._done, null];
        }

        // Get tile bounds.
        var x0 = this._x;
        var x1 = Math.min(x0 + this.opts.tileWidth - 1, this.canvas.width);
        var y0 = this._y;
        var y1 = Math.min(y0 + this.opts.tileHeight - 1, this.canvas.height);

        // Get data for tile.
        var pixelData = this.ctx.getImageData(x0, y0, (x1 - x0 + 1), (y1 - y0 + 1)).data;
        var pixelIdx = 0;
        var pixels = [];
        for (var y=y0; y <= y1; y++ ){
            for (var x=x0; x <= x1; x++) {
                var rgba = [];
                for (var i=0; i<4; i++) {
                    rgba.push(pixelData[pixelIdx+i]);
                }
                pixels.push([[x,y],rgba]);
                pixelIdx += 4;
            }
        }

        // Package tile data.
        var tileData = {
            x0: x0,
            x1: x1,
            y0: y0,
            y1: y1,
            pixels: pixels
        };

        // Update current coords.
        this._x = x1 + 1;

        return [this._done, tileData];

    }
}

/**
 * Copy tile data to a canvas context.
**/

function copyTile(ctx, tileData) {
    for (var i=0; i<tileData.pixels.length; i++) {
        // Get pixel data.
        var pixel = tileData.pixels[i];
        var [x,y] = pixel[0];

        // Copy pixel data.
        var imgData = ctx.createImageData(1,1);
        for (var j=0; j < 4; j++) {
            imgData.data[j] = pixel[1][j];
        }
        ctx.putImageData(imgData,x,y);
    }
}

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Copy tile as if it was stamped on via cork stamp.
**/
function corkifyTile(ctx, tileData) {
    // Get average luminosity of tile.
    var totalLuminosity = 0;
    for (var i=0; i<tileData.pixels.length; i++) {
        // Get pixel data.
        var pixel = tileData.pixels[i];
        var [h,s,l] = rgbToHsl.apply(null, pixel[1]);
        totalLuminosity += l;
    }
    var avgLuminosity = totalLuminosity/tileData.pixels.length;

    // Generate noise with that luminosity.
    // @TODO: setup noise parameters for luminosity.
    var noiseGen = new FastSimplexNoise({
    });
    for (var i=0; i<tileData.pixels.length; i++) {
        var pixel = tileData.pixels[i];
        var [x,y] = pixel[0];
        var noise = (noiseGen.get2DNoise(x, y)+1)/2;
        var rgba = hslToRgb(0,0,noise*avgLuminosity).concat([255]);

        var imgData = ctx.createImageData(1,1);
        for (var j=0; j < 4; j++) {
            imgData.data[j] = rgba[j];
        }
        ctx.putImageData(imgData,x,y);
    }
    
}

function grayifyTile(ctx, tileData) {
    for (var i=0; i<tileData.pixels.length; i++) {
        var pixel = tileData.pixels[i];
        var [x,y] = pixel[0];
        var rgba = pixel[1];

        var gray = (rgba[0]* 0.3) + (rgba[1]* 0.59) + (rgba[2]* .11);  

        // Copy pixel data.
        var imgData = ctx.createImageData(1,1);
        for (var j=0; j < 3; j++) {
            imgData.data[j] = gray;
        }
        imgData.data[3] = 255;
        ctx.putImageData(imgData,x,y);
    }
}

function getImageCanvas(imageObj) {
    var canvas = document.createElement('canvas');
    canvas.width = imageObj.width;
    canvas.height = imageObj.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(imageObj, 0, 0);
    return canvas;
}

var imageObj = new Image();
imageObj.onload = function() {
    var srcCanvas = getImageCanvas(this);
    document.body.appendChild(srcCanvas);

    var tgtCanvas = document.createElement('canvas');
    var tgtCtx = tgtCanvas.getContext('2d');
    tgtCanvas.width = srcCanvas.width;
    tgtCanvas.height = srcCanvas.height;
    document.body.appendChild(tgtCanvas);

    var canvasIterator = new CanvasIterator(srcCanvas);
    function processTile() {
        var [done, tileData] = canvasIterator.next();
        if (done) {
            console.log('done');
        } else{
            //console.log('processing tile', tileData.x0, tileData.y0);
            // @TODO: do processing here.
            //copyTile(tgtCtx, tileData);
            //corkifyTile(tgtCtx, tileData);
            grayifyTile(tgtCtx, tileData);
            setTimeout(processTile, 5);
        }
    }

    processTile();
};
imageObj.width = 300;
imageObj.src = '/testImages/testImage.jpg';
