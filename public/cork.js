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
        if (this._x > this.canvas.width) {
            this._x = 0;
            this._y += this.opts.tileHeight;
        }

        // If past the bottom edge, mark as done.
        if (this._y > this.canvas.height) {
            this._done = true;
            return [this._done, null];
        }

        // Get tile bounds.
        let x0 = this._x;
        let x1 = Math.min(x0 + this.opts.tileWidth -1, this.canvas.width);
        let y0 = this._y;
        let y1 = y0 + Math.min(this.opts.tileHeight, this.canvas.height);

        // Get data for tile.
        let tileData = {
            x0: x0,
            x1: x1,
            y0: y0,
            y1: y1,
            data: []
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
