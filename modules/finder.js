const fs = require('fs');
const fsp = fs.promises;

async function findLine(fPath, lineIndex, lineLocalIndex, startOffset = 0) {

	let fhandle = null;
	try {
		// Allocating 10 Megabytes buffer, to contain the whole partition to make our task easier
		// --> here we assume that the partition is 10_000 lines with maximum 1000 characters per line.
		let buffer = Buffer.alloc(1024 * 1024 * 10);
		fhandle = await fsp.open(fPath, 'r+');
		
		let currentLine = 0;

		// Read the whole partition of data into the buffer for simplicity
		let result = await fhandle.read(buffer, 0, buffer.length, startOffset);
		if (result.bytesRead > 0) {

			let _start = 0;
			let _end = 0;
			let bufferString = buffer.slice(0, result.bytesRead).toString();
			while ( (_end = bufferString.indexOf('\n', _start)) !== -1) {
				
				if (lineLocalIndex === currentLine) {
					let data = bufferString.slice(_start, _end);
					return data;
				}

				currentLine++;
				// update _start for the next call to indexOf
				_start = _end + 1;
			}
		}

	} finally {
		if (fhandle) await fhandle.close();
	}

	// Returning null if the line is not found
	return null;
}

exports.findLine = findLine;