import * as fs from 'fs';
import * as path from 'path';
import { bool } from 'aws-sdk/clients/signer';

export class CsvFileReader {
    data: string[][] = [];

    constructor(public filename: string) {}
  
    read(): boolean {
        if(!fs.existsSync(path.resolve('./uploads', this.filename))) {
            return false;
        }
          // The file *does* exist
        else {
            this.data = fs.readFileSync(
                path.resolve('./uploads', this.filename), {
                encoding: 'utf-8',
            })
            .split('\n')
            .map(
                (row: string): string[] => {
                    return row.split(',');
                },
            );
            return true;
        }
    }
}
