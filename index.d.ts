import { BigNumber } from 'bignumber.js';
export declare type AnyNumericInput = number | string | BigNumber;
export declare type AnyDateInput = number | string | Date;
export interface ILedgerEntry {
    readonly timestamp: string;
    readonly previous: number;
    readonly change: number;
    readonly current: number;
}
export declare function validateEntry(entry: ILedgerEntry, previousBalance?: AnyNumericInput, previousTimestamp?: AnyDateInput, verifyTimestamp?: boolean): boolean;
export declare class LedgerEntry implements ILedgerEntry {
    readonly timestamp: string;
    readonly previous: number;
    readonly change: number;
    readonly current: number;
    constructor(previous: AnyNumericInput, change: AnyNumericInput, current: AnyNumericInput, timestamp?: AnyDateInput);
}
export declare class Ledger {
    readonly entries: ReadonlyArray<ILedgerEntry>;
    readonly initialBalance: number;
    readonly initialTimestamp: string | undefined;
    readonly verifyTimestamp: boolean;
    constructor(entries?: ReadonlyArray<ILedgerEntry>, initialBalance?: number, initialTimestamp?: string | undefined, verifyTimestamp?: boolean);
    readonly length: number;
    readonly lastEntry: ILedgerEntry | undefined;
    readonly lastBalance: number;
    readonly lastChange: number;
    readonly lastTimestamp: string | undefined;
    readonly firstEntry: ILedgerEntry | undefined;
    change(change: AnyNumericInput, allowNegativeBalance?: boolean, timestamp?: AnyDateInput): Ledger;
    set(current: AnyNumericInput, allowNegativeBalance?: boolean, timestamp?: AnyDateInput): Ledger;
    validate(startAt?: number, previousBalance?: number, previousTimestamp?: string | undefined, verifyTimestamp?: boolean): number | true;
    protected static testNegative(current: AnyNumericInput, allowNegative?: boolean): void;
}
