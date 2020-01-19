import { DataReader } from '../interfaces/csvReader.interfaces';
import { FileExchangeData } from '../types/fileExchangeData';
import { CsvFileReader } from './csvFileReader';

export class ExchangeFileReader {
    static fromCsv(filename: string): ExchangeFileReader {
        return new ExchangeFileReader(new CsvFileReader(filename));
    }

    fileData: FileExchangeData[] = [];
    constructor(public reader: DataReader) {}

    load(): boolean {
        if ( this.reader.read() ) {
            this.fileData = this.reader.data
                .map((row: string[]): FileExchangeData => {
                    return [
                        row[0],
                        row[1],
                        row[2],
                        row[3],
                        row[4],
                    ];
                },
            );
            return true;
        } else {
            return false;
        }
    }
}
