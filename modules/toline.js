
const { Transform } = require('stream');

class ToLine extends Transform {
    constructor() {
        super();
        this.buffer = '';
        this.start = 0;
    }

    _transform(chunk, encoding, callback) {
        let _start = 0;
        let _end = 0;
        while ( (_end = chunk.indexOf('\n', _start)) !== -1) {
            let data = chunk.slice(_start, _end);
            this.push(this.buffer + data);

            // clear the buffer as it's not needed anymore
            this.buffer = '';
            
            // update _start for the next call to indexOf
            _start = _end + 1;

            // update teh global start of the line
            //startsAt += _end + 1;
    
        }

        // keep the remaining of the chunk (if any) to be used 
        // when the next chunk is recieved.
        this.buffer = chunk.slice(_start);

        if (callback) {
            callback();
        }

    }
}

exports.ToLine = ToLine;