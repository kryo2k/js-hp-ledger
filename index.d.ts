import { BigNumber } from 'bignumber.js';
export declare type AnyDateInput = number | string | Date;
/**
* A basic ledger entry (readonly)
*/
export interface ILedgerEntry {
    readonly timestamp: string;
    readonly previous: number;
    readonly change: number;
    readonly current: number;
}
/**
* Validation function for checking compatability of an entry with previous ledger state.
*/
export declare function validateEntry(entry: ILedgerEntry, previousBalance?: BigNumber.Value, previousTimestamp?: AnyDateInput, verifyTimestamp?: boolean): boolean;
export declare class LedgerEntry implements ILedgerEntry {
    readonly timestamp: string;
    readonly previous: number;
    readonly change: number;
    readonly current: number;
    /**
    * Construct a new ledger entry object
    */
    constructor(previous: BigNumber.Value, change: BigNumber.Value, current: BigNumber.Value, timestamp?: AnyDateInput);
}
/**
* Main ledger class
*/
export declare class Ledger {
    readonly entries: ReadonlyArray<ILedgerEntry>;
    readonly initialBalance: number;
    readonly initialTimestamp: string | undefined;
    readonly verifyTimestamp: boolean;
    /**
    * Construct a new ledger object
    */
    constructor(entries?: ReadonlyArray<ILedgerEntry>, initialBalance?: number, initialTimestamp?: string | undefined, verifyTimestamp?: boolean);
    /**
    * The number of entries in this ledger.
    */
    readonly length: number;
    /**
    * The last entry or undefined if no change has been made.
    */
    readonly lastEntry: ILedgerEntry | undefined;
    /**
    * The last balance since construction
    */
    readonly lastBalance: number;
    /**
    * The last change amount or ZERO if no change has been made.
    */
    readonly lastChange: number;
    /**
    * Returns the last timestamp from entries or initial timestamp from construction.
    */
    readonly lastTimestamp: string | undefined;
    /**
    * Perform a change to the current balance. This change amount is added to the last balance and a new entry is created.
    * Returns a modified ledger containing the new entry.
    */
    change(change: BigNumber.Value, allowNegativeBalance?: boolean, timestamp?: AnyDateInput): Ledger;
    /**
    * Sets the current balance to the amount provided. Returns a modified ledger containing the new entry.
    */
    set(current: BigNumber.Value, allowNegativeBalance?: boolean, timestamp?: AnyDateInput): Ledger;
    /**
    * Validates the current state of the ledger. Returns TRUE if state is valid, or returns the entry index that broke validity.
    */
    validate(startAt?: number, previousBalance?: number, previousTimestamp?: string | undefined, verifyTimestamp?: boolean): number | true;
    /**
    * Asserts that a number provided is not negative unless allowed. Also does checks to see if is NaN or not finite.
    */
    protected assertNotNegative(current: BigNumber.Value, allowNegative?: boolean): void;
}
