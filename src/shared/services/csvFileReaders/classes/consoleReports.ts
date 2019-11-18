import { FileOutputTarget } from '../interfaces/csvReader.interfaces';
import { Logger } from '@nestjs/common';

export class FileConsoleReport implements FileOutputTarget {
    print(report: string): void {
        Logger.log(report);
    }
}
