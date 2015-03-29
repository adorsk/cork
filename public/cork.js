var outputCanvas = document.getElementById('myCanvas');
var outputCtx = canvas.getContext('2d');

/**
 * ImageIterator: takes an imageObject.
 * next() function returns rectangles of pixel
 * data, starting from the top-left, and going
 * left-to-right, top-to-bottom.
 * When image has been iterated through, next returns
 * null.
 */
function ImageIterator(imageObj) {
    this.imageObj = imageObj;

    // @TODO: hardcoded opts for now, 
    // take as options later.
    this.opts = {
        rectWidth: 20,
        rectHeight: 20
    };

    this._x = 0;
    this._y = 0;
};
ImageIterator.prototype.next = function() {
    // @TODO: check if past bounds.

    // Get rectangle bounds.
    var x0 = this._x;
    var x1 = Math.max(x0 + this.opts.rectWidth, this.imageObj.width);
    var y0 = this._y;
    var y1 = y0 + Math.max(this.opts.rectHeight, this.imageObj.height);

    // Get data for rectangle.
    var rectData = [];
    for (var x=x0; x <

    // Update current coords.
    this._x = x1 + 1;
    this._y = y1 + 1;
};

function getImageCanvas(imageObj) {
    var canvas = document.createElement('canvas');
    canvas.width = imageObj.width;
    canvas.height = imageObj.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(imageObj, 0, 0);
    return imgCanvas;
}

var imageObj = new Image();
imageObj.onload = function() {
    var canvas = getImageCanvas(this);
};
imageObj.src = '/testImages/testImage.jpg';
