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
            tileWidth: 20,
            tileHeight: 20
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
    while(true) {
        var [done, tileData] = canvasIterator.next();
        if (done) {
            break;
        }
        // @TODO: do processing here.
        copyTile(tgtCtx, tileData);
    }
};
imageObj.src = '/testImages/testImage.jpg';
