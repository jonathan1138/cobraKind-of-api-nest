import { FileCategoryAnalyzer } from '../../interfaces/csvReader.interfaces';
import { FileCategoryData } from '../../types/fileCategoryData';
import { ExchangeResult } from '../../../../enums/exchange-data.enum';

export class WinsAnalysis implements FileCategoryAnalyzer {
    constructor(public team: string) {}

    run(categories: FileCategoryData[]): string {
        let wins = 0;

        for (const match of categories) {
            if (match[1] === 'Man United' && match[2] === ExchangeResult.HomeWin) {
                wins++;
            } else if (match[2] === 'Man United' && match[0] === ExchangeResult.AwayWin) {
                wins++;
            }
        }

        return `Team ${this.team} won ${wins} games`;
    }
}
