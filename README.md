# Find Line

Find Line (or `findln.js`) is a program that can be used to get and print out specific line index from a text file. It indexes the text file in order to make searching for the line goes faster. 

## Usage
The entry of the program is the script `findln.js`. In order to run it you can use the command:
```
node findln.js <path-to-text-file> <line-index>
```

Based on the size of the input file, the first run of the program may take some time, this is becuase during the first run the program runs in the index building mode where it build an index file to make next queries to the same data file run faster.

## How it works?
The program has two modes of running, the index building mode and the query mode.

### Index building mode
In  this mode the program does a full file scan, for this we utilize the node.js streaming piping techniques which makes the full file scan goes faster and without consuming a lot of memeory. This process is done by piping 3 types of streams:

#### ToLine stream:
A `Transform` stream that takes an input of text and start pushing it to the next piped stream one line at a time.

#### Indexer stream:
The `Indexer` is mainly  a pass through `Transform` stream, used for indexing the lines it recieves from the `ToLine` stream. It also has another role for getting the parition id of the requested line from the index file.

#### LineCount stream:
A `Writable` stream that do nothing other than counting the lines it recieves from the `Indexer` and when its internal line counter reaches the number of the requested file, it stores for being outputed later to the user.

This is how the piping mechanism look in the code:
```javascript
readStream
        .pipe(toLine)
        .pipe(indexer)
        .pipe(lineCounter)
        .on('close', () => printResult(lineCounter.matchedLine, indexBuildTime));
```

### Query mode
Everytime the program starts it checks if the index file already exists for the text data file and if it can successfully load it. If the index is loaded successfuly it means that the index was already built in a previous run of the program, and so the program works in the query mode so it ask the index object to get the nearst location where the requested line should exist. This nearest location is the start of the partition in the data file where the line belongs. Then the program starts reading from the data file starting from the partition start location. It loads the whole partition into memory (for simplicity of this project we assume that it shouldn't exceed 10 Megabytes) and then get the requested line from the loaded partition and print it out to the user.

## Testing
For testing the program we have the script `create_test_files.js` that generate random text files to use in our tests. The script accepts 3 parameters, first is the name of the test file (used for naming the test file), the second is number of lines in the test file, and the third is for the maximum length of each line. 

For example:
```powershell
PS> node creaet_test_files.js VeryBigFile 10000000 100
```

For testing purpose each line generated follows this pattern `(line-index)->the-line-text<-(line-index)` where each line has the number of the line in front and end of it. This pattern should make it easy to verify the output by just looking at it.

Below is an example of the output of different runs of the `findln` program against a big file with 10 million lines.

The first run, index is not built yet and a full scan of the file is done. So, in this run it took around 13 seconds to build the index and print out the result:
```powershell
PS> node .\findln.js .\test_files\VeryBig_100_10000000.txt 25000
Found: (25000)->yEFUeSDSCuroBSXlQL M7Wa4BUlosU9snZan2EiGr2oIFDdecynWIWX<-(25000)
Index build time: 13.522s
```

The second run, this time the index is already built, so it took only around 17 milliseconds to get the line:
```powershell
PS> node .\findln.js .\test_files\VeryBig_100_10000000.txt 25000
Found: (25000)->yEFUeSDSCuroBSXlQL M7Wa4BUlosU9snZan2EiGr2oIFDdecynWIWX<-(25000)
Execution time: 17.731ms
```

A third run with a different line after building the index, it took around 17 milliseconds:
```powershell
PS> node .\findln.js .\test_files\VeryBig_100_10000000.txt 2500032
Found: (2500032)->w5AFUhyEVPteJiP X Qi6rLfJvQzX48DH5UlsXZlkdGzCz9XvJWhsBf0QsogN QGSMLNC<-(2500032)
Execution time: 17.482ms
```