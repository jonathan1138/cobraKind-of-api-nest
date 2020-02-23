import { DataReader } from '../interfaces/csvReader.interfaces';
import { FilePostData } from '../types/filePostData';
import { CsvFileReader } from './csvFileReader';

export class PostFileReader {
    static fromCsv(filename: string): PostFileReader {
        return new PostFileReader(new CsvFileReader(filename));
    }

    fileData: FilePostData[] = [];
    constructor(public reader: DataReader) {}

    load(): boolean {
        if ( this.reader.read() ) {
            this.fileData = this.reader.data
                .map((row: string[]): FilePostData => {
                    return [
                        row[0],
                        row[1],
                        row[2],
                        row[3],
                        row[4],
                        row[5],
                        row[6],
                        row[7],
                    ];
                },
            );
            return true;
        } else {
            return false;
        }
    }
}
