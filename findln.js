const fs = require('fs');
const { ToLine } = require('./modules/toline');
const { LineCounter } = require('./modules/linecount');
const { Indexer } = require('./modules/indexer');
const { findLine } = require('./modules/finder');

const args = process.argv;
let filePath =  args[2]; 
let requestedLine = parseInt(args[3]);

const toLine = new ToLine();
const indexer = new Indexer(`${filePath}.idx`);
const lineCounter = new LineCounter(requestedLine);

if (indexer.isBuilt) {
    
    // index was already build, so we go get our
    // line directly from it's partition
    const findExecTime = 'Execution time';
    console.time(findExecTime);
    let partition = indexer.getOffsetForLine(requestedLine);
    let localLineNumber = requestedLine - (partition.partitionId * indexer.partitionSize);
    findLine(filePath, requestedLine, localLineNumber, partition.offset)
        .then(line => printResult(line, findExecTime));

} else {

    // do a full scan on the file to build the index
    const indexBuildTime = 'Index build time';
    console.time(indexBuildTime);
    const readStream = fs.createReadStream(filePath);

    // scanning is done by piping the file stream through
    // the toLine strean, and then to the indexer stream, then 
    // eventually to the lineCounter stream to get the needed 
    // line. This last stream is used just for printing the line 
    // when we are in the scanning mode of the program.
    readStream
        .pipe(toLine)
        .pipe(indexer)
        .pipe(lineCounter)
        .on('close', () => printResult(lineCounter.matchedLine, indexBuildTime));
}

function printResult(line, executionTimeLabel) {
    if (line) {
        console.log(`Found: ${line}`);
    } else {
        console.log(`Line number ${requestedLine} is not found`);
    }
    console.timeEnd(executionTimeLabel);
}