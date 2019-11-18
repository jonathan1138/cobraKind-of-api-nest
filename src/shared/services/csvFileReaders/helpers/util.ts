export const dateStringToDate = (dateString: string): Date => {
    const dateParts = dateString
        .split('/')
        .map((value: string): number => {
            // tslint:disable-next-line: radix
            return parseInt(value);
    });

    return new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
};
