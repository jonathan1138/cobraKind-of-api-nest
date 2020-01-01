import { DataReader } from '../interfaces/csvReader.interfaces';
import { FileMarketData } from '../types/fileMarketData';
import { CsvFileReader } from './csvFileReader';

export class MarketFileReader {
    static fromCsv(filename: string): MarketFileReader {
        return new MarketFileReader(new CsvFileReader(filename));
    }

    fileData: FileMarketData[] = [];
    constructor(public reader: DataReader) {}

    load(): boolean {
        if ( this.reader.read() ) {
            this.fileData = this.reader.data
                .map((row: string[]): FileMarketData => {
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
