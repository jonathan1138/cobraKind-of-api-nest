import { DataReader } from '../interfaces/csvReader.interfaces';
import { FileCategoryData } from '../types/fileCategoryData';
import { CsvFileReader } from './csvFileReader';

export class CategoryFileReader {
    static fromCsv(filename: string): CategoryFileReader {
        return new CategoryFileReader(new CsvFileReader(filename));
    }

    fileData: FileCategoryData[] = [];
    constructor(public reader: DataReader) {}

    load(): boolean {
        if ( this.reader.read() ) {
            this.fileData = this.reader.data
                .map((row: string[]): FileCategoryData => {
                    return [
                        row[0],
                        row[1],
                        row[2],
                    ];
                },
            );
            return true;
        } else {
            return false;
        }
    }
}
