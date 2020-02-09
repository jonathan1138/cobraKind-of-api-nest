import { CsvFileReader } from './csvFileReader';
import { FileSubItemData } from '../types/fileSubItemData';
import { DataReader } from '../interfaces/csvReader.interfaces';

export class SubItemFileReader {
    static fromCsv(filename: string): SubItemFileReader {
        return new SubItemFileReader(new CsvFileReader(filename));
    }

    fileData: FileSubItemData[] = [];
    constructor(public reader: DataReader) {}

    load(): boolean {
        if ( this.reader.read() ) {
            this.fileData = this.reader.data
                .map((row: string[]): FileSubItemData => {
                    return [
                        row[0],
                        row[1],
                        row[2],
                        row[3],
                        row[4],
                        row[5],
                        row[6],
                    ];
                },
            );
            return true;
        } else {
            return false;
        }
    }
}
