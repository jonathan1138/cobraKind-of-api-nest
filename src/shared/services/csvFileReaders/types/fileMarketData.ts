import { ExchangeResult } from '../../../enums/exchange-data.enum';

export type FileMarketData = [
    Date,
    string,
    string,
    number,
    number,
    ExchangeResult,
    string
];
