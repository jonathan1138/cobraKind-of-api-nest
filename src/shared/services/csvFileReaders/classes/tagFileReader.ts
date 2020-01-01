import { DataReader } from '../interfaces/csvReader.interfaces';
import { FileTagData } from '../types/fileTagData';
import { CsvFileReader } from './csvFileReader';

export class TagFileReader {
    static fromCsv(filename: string): TagFileReader {
        return new TagFileReader(new CsvFileReader(filename));
    }

    fileData: FileTagData[] = [];
    constructor(public reader: DataReader) {}

    load(): boolean {
        if ( this.reader.read() ) {
            this.fileData = this.reader.data
                .map((row: string[]): FileTagData => {
                    return [
                        row[0],
                        row[1],
                    ];
                },
            );
            return true;
        } else {
            return false;
        }
    }
}
