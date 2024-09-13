const fs = require('fs');
const { Transform, Writable } = require('stream');

// This is a pass through Transform stream, used for indexing the lines 
// while going through it. It also has another role for getting the parition
// id of the r equested line from the index file.
class Indexer extends Transform {
    constructor(indexFile, partitionSize = 10_000, startingOffset = 0, startingLine = 0) {
        super();
        
        this.indexFile = indexFile;
        this.partitionSize = partitionSize;
        this.startingOffset = startingOffset;
        this.startingLine = startingLine;
        this.index = [0];
        this.isBuilt = true;
        this._loadIndexFile();
        this._indexWriter = null;
    }

    getOffsetForLine(lineNumber) {
        let partitionId = parseInt(lineNumber / this.partitionSize);
        
        if (partitionId < this.index.length) {
            return {
                partitionId: partitionId,
                offset: this.index[partitionId],
            };
        } else {

            // if paritionId is not in the index, return the 
            // last offset stored in the index
            return {
                partitionId: this.index.length - 1,
                offset: this.index[this.index.length - 1],
            };
        }
    }

    _transform(line, encoding, callback) {
        if (this._indexWriter === null) {
            this._indexWriter = fs.createWriteStream(this.indexFile);
            // write the first offset in the index file.
            this._indexWriter.write('0');
        }
        
        if (this.startingLine % this.partitionSize === 0) {

            // store new partition start position/offset
            if (this.index.indexOf(this.startingOffset) === -1) {
                this.index.push(this.startingOffset);
                this._indexWriter.write(`,${this.startingOffset}`);
            }
        }

        this.startingLine++;
        this.startingOffset += line.length + 1;

        // push the line to the next stream in the pipeline.
        this.push(line);

        if (callback) {
            callback();
        }
    }

    _loadIndexFile() {
        try {

            // We read the index file synchronously for simpliciy.
            let data = fs.readFileSync(this.indexFile);        
            this.index = JSON.parse(`[${data}]`);
        }
        catch {

            // if file is not found, this means that the
            // index wasn't built so we set the isBuilt
            // flag to false to give the user a hint that 
            // it wasn't built.
            this.isBuilt = false;
        }
    }
}

exports.Indexer = Indexer;