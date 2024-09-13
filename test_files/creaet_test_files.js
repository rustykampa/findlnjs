const fs = require('fs');
const { Readable } = require('stream');

class TextGenerator extends Readable {
    constructor(totalLines, lineLength) {
        super();
        this._currentLine = 0;
        this._totalLines = totalLines;
        this._lineLength = lineLength;
    }

    _read(size) {
        if (this._currentLine <= this._totalLines) {
            this.push(`(${this._currentLine})->${this.generateRandomString(this._lineLength)}<-(${this._currentLine})\n`);
            this._currentLine++;
        } else {
            this.push(null);
        }
    }

    // Generates a random length line with maximum length equals to maxLen 
    generateRandomString(maxLen) {
        const characters = ' ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;
        const len = Math.floor(Math.random() * maxLen);

        for (let i = 0; i < len; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}

function createTestFile(testName, totalLines, lineLength) {
    const fileName = `${testName}_${lineLength}_${totalLines}.txt`;
    const timeLabel = `${fileName} is written. Total writing time is`;
    const fsStream = fs.createWriteStream('./' + fileName);
    const generator = new TextGenerator(totalLines, lineLength);

    console.time(timeLabel);
    generator.pipe(fsStream).on('close', () => {
        console.timeEnd(timeLabel);
    });
}

const args = process.argv;
let testName =  args[2]; 
let totalLines =  parseInt(args[3]); 
let lineLength = parseInt(args[4]);

createTestFile(testName, totalLines, lineLength);