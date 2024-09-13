// a stream that takes lines, count them, and print out the requested line.
// it may also fire some events for the indexing purpose.

const { Writable } = require('stream');

class LineCounter extends Writable {
    constructor(requestedLine) {
        super();
        this.requestedLine = requestedLine;
        this.current = 0;
        this.matchedLine = '';
    }

    _write(line, encoding, callback) {
        if (this.current === this.requestedLine) {
            
            // set the line value here to be retreived later by the client 
            this.matchedLine = line;

            // stop writing to this stream.
            //this.destroy();
        }

        this.current++;

        if (callback) {
            callback();
        }
    }
}

exports.LineCounter = LineCounter;