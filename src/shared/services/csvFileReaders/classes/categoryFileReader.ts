import { DataReader } from '../interfaces/csvReader.interfaces';
import { FileCategoryData } from '../types/fileCategoryData';
import { ExchangeResult } from '../../../enums/exchange-data.enum';
import { dateStringToDate } from '../helpers/util';
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
                        dateStringToDate(row[0]),
                        row[1],
                        row[2],
                        // tslint:disable-next-line: radix
                        parseInt(row[3]),
                        // tslint:disable-next-line: radix
                        parseInt(row[4]),
                        row[5] as ExchangeResult,
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
