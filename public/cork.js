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
        let x0 = this._x;
        let x1 = Math.min(x0 + this.opts.tileWidth - 1, this.canvas.width);
        let y0 = this._y;
        let y1 = Math.min(y0 + this.opts.tileHeight - 1, this.canvas.height);

        var curTileHeight = x1 - x0;
        var curTileWidth = y1 - y0;

        // Get data for tile.
        let pixelData = this.ctx.getImageData(x0, y0, curTileWidth, curTileHeight).data;
        let pixelIdx = 0;
        let rows = [];
        for (let y=y0; y < y1; y++ ){
            let row = [];
            for (let x=x0; x < x1; x++) {
                var rgba = [];
                for (var i=0; i<4; i++) {
                    rgba.push(pixelData[pixelIdx+i]);
                }
                row.push(rgba);
                pixelIdx += 4;
            }
            rows.push(row);
        }

        // Package tile data.
        let tileData = {
            x0: x0,
            x1: x1,
            y0: y0,
            y1: y1,
            data: rows
        };

        // Update current coords.
        this._x = x1 + 1;

        return [this._done, tileData];

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
    var canvas = getImageCanvas(this);
    document.body.appendChild(canvas);

    var canvasIterator = new CanvasIterator(canvas);
    while(true) {
        let [done, tileData] = canvasIterator.next();
        if (done) {
            console.log('done');
            break;
        }
        console.log('td', tileData);
    }
};
imageObj.src = '/testImages/testImage.jpg';
