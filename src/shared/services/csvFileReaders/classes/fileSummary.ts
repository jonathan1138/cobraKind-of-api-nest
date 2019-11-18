import { FileExchangeData } from '../types/fileExchangeData';
import { FileConsoleReport } from './consoleReports';
import { WinsAnalysis } from './fileCategoryAnalyzers';
import { FileCategoryAnalyzer, FileOutputTarget } from '../interfaces/csvReader.interfaces';

export class FileSummary {

    static winsAnalysisWithReport(team: string): FileSummary {
        return new FileSummary (
            new WinsAnalysis(team),
            new FileConsoleReport(),
        );
    }

    constructor(
        public analyzer: FileCategoryAnalyzer,
        public outputTarget: FileOutputTarget ) {}

    buildAndPrintReport(exchanges: FileExchangeData[]): void {
        const output = this.analyzer.run(exchanges);
        this.outputTarget.print(output);
    }
}
