import { DataReader } from '../interfaces/csvReader.interfaces';
import { FilePartData } from '../types/filePartData';
import { CsvFileReader } from './csvFileReader';

export class PartFileReader {
    static fromCsv(filename: string): PartFileReader {
        return new PartFileReader(new CsvFileReader(filename));
    }

    fileData: FilePartData[] = [];
    constructor(public reader: DataReader) {}

    load(): boolean {
        if ( this.reader.read() ) {
            this.fileData = this.reader.data
                .map((row: string[]): FilePartData => {
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
