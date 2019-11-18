import { FileCategoryData } from '../types/fileCategoryData';

export interface DataReader {
    read(): boolean;
    data: string[][];
}

export interface FileCategoryAnalyzer {
    run(categories: FileCategoryData[]): string;
}

export interface FileOutputTarget {
    print(report: string): void;
}
