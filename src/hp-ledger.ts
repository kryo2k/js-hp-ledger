import { BigNumber } from 'bignumber.js';

export type AnyDateInput = number|string|Date;

const
DEFAULT_VERIFY_TIMESTAMP = true,
DEFAULT_ALLOW_NEG_BALANCE = false,
DEBUG = false;

function inputBigNumber(num : BigNumber.Value) : BigNumber {
  return new BigNumber(num);
};

function inputNumber(num : BigNumber.Value) : number {
  return new BigNumber(num).toNumber();
};

function inputDate(date : AnyDateInput) : Date {
  if(date instanceof Date)
    return date;

  if(typeof date === 'string') {
    const parsed = Date.parse(date);
    if(isNaN(parsed))
      throw new SyntaxError('Date string format is not readable.');
    return new Date(parsed);
  }

  if(typeof date === 'number') {
    if(isNaN(date) || !isFinite(date))
      throw new SyntaxError('Date number format is not valid.');
    return new Date(date);
  }

  throw new TypeError('Invalid type of date input was provided.');
};

/**
* A basic ledger entry (readonly)
*/
export interface ILedgerEntry {
  readonly timestamp : string;
  readonly previous  : number;
  readonly change    : number;
  readonly current   : number;
};

/**
* Validation function for checking compatability of an entry with previous ledger state.
*/
export function validateEntry (entry : ILedgerEntry, previousBalance : BigNumber.Value = 0, previousTimestamp ?: AnyDateInput, verifyTimestamp : boolean = DEFAULT_VERIFY_TIMESTAMP) : boolean {

  if(typeof previousTimestamp === 'undefined' && verifyTimestamp)
    throw new TypeError('Previous timestamp was not provided, and is required.');

  const
  bneprev = inputBigNumber(entry.previous),
  bnecurr = inputBigNumber(entry.current);

  let
  dateTimestamp : Date|undefined,
  prevTimestamp : Date|undefined;

  try {
    if(entry.timestamp)   dateTimestamp = inputDate(entry.timestamp);
    if(previousTimestamp) prevTimestamp = inputDate(previousTimestamp);
  }
  catch(e) {}; // ignore errors here (leave dateTimestamp = null)

  if(verifyTimestamp && (!dateTimestamp || !prevTimestamp || prevTimestamp > dateTimestamp))
    return false; // illegible date string.

  return bneprev.isEqualTo(previousBalance)
      && bnecurr.isEqualTo(bneprev.plus(entry.change));
};

export class LedgerEntry implements ILedgerEntry {

  readonly timestamp : string;
  readonly previous  : number;
  readonly change    : number;
  readonly current   : number;

  /**
  * Construct a new ledger entry object
  */
  constructor(
    previous : BigNumber.Value,
    change: BigNumber.Value,
    current: BigNumber.Value,
    timestamp: AnyDateInput = new Date()
  ) {
    this.previous = inputNumber(previous);
    this.change = inputNumber(change);
    this.current = inputNumber(current);
    this.timestamp = inputDate(timestamp).toISOString();
  }
};

/**
* Main ledger class
*/
export class Ledger {

  /**
  * Construct a new ledger object
  */
  constructor (
    public readonly entries : ReadonlyArray<ILedgerEntry> = [],
    public readonly initialBalance : number = 0,
    public readonly initialTimestamp ?: string,
    public readonly verifyTimestamp : boolean = DEFAULT_VERIFY_TIMESTAMP
  ) {
    const validation = this.validate();

    if(typeof validation === 'number')
      throw new Error(`Entry validation failed at cursor index (${validation}).`);
  }

  /**
  * The number of entries in this ledger.
  */
  get length () : number {
    return this.entries.length;
  }

  /**
  * The last entry or undefined if no change has been made.
  */
  get lastEntry () : ILedgerEntry|undefined {
    const entries = this.entries;
    return entries[entries.length - 1];
  }

  /**
  * The last balance since construction
  */
  get lastBalance () : number {
    const last = this.lastEntry;

    if(typeof last === 'undefined')
      return this.initialBalance;

    return last.current;
  }

  /**
  * The last change amount or ZERO if no change has been made.
  */
  get lastChange () : number {
    const last = this.lastEntry;

    if(typeof last === 'undefined')
      return 0;

    return last.change;
  }

  /**
  * Returns the last timestamp from entries or initial timestamp from construction.
  */
  get lastTimestamp () : string|undefined {
    const last = this.lastEntry;

    if(typeof last === 'undefined')
      return this.initialTimestamp;

    return last.timestamp;

  }

  /**
  * Perform a change to the current balance. This change amount is added to the last balance and a new entry is created.
  * Returns a modified ledger containing the new entry.
  */
  change(change : BigNumber.Value, allowNegativeBalance ?: boolean, timestamp ?: AnyDateInput) : Ledger {
    change = inputBigNumber(change);

    const
    previous = inputBigNumber(this.lastBalance),
    current = previous.plus(change);

    this.assertNotNegative(current, allowNegativeBalance);

    return new Ledger(
      this.entries.concat([ new LedgerEntry(previous, change, current, timestamp) ]),
      this.initialBalance,
      this.initialTimestamp,
      this.verifyTimestamp
    );
  }

  /**
  * Sets the current balance to the amount provided. Returns a modified ledger containing the new entry.
  */
  set(current : BigNumber.Value, allowNegativeBalance ?: boolean, timestamp ?: AnyDateInput) : Ledger {
    current = inputBigNumber(current);

    const
    previous = this.lastBalance,
    change   = current.minus(previous);

    this.assertNotNegative(current, allowNegativeBalance);

    return new Ledger(
      this.entries.concat([ new LedgerEntry(previous, change, current, timestamp) ]),
      this.initialBalance,
      this.initialTimestamp,
      this.verifyTimestamp
    );
  }

  /**
  * Validates the current state of the ledger. Returns TRUE if state is valid, or returns the entry index that broke validity.
  */
  validate (startAt : number = 0, previousBalance : number = this.initialBalance, previousTimestamp : string|undefined = this.initialTimestamp, verifyTimestamp : boolean = this.verifyTimestamp) : number|true {
    const entries = this.entries, length = entries.length;
    if(length === 0)
      return true;
    if(!entries.hasOwnProperty(startAt))
      startAt = 0;

    let
    cursor = startAt,
    lastBalance   : number = previousBalance,
    lastTimestamp : string|undefined = (startAt === 0 && previousTimestamp === undefined)
      ? entries[0].timestamp
      : previousTimestamp;

    while(cursor < length) {
      const entry = entries[cursor];

      if(DEBUG) process.stdout.write(`(${cursor}) : ${JSON.stringify(entry)} => `);

      if(!validateEntry(entry, lastBalance, lastTimestamp, verifyTimestamp)) {
        if(DEBUG) process.stdout.write('FAIL\n');
        return cursor;
      }

      if(DEBUG) process.stdout.write('OK\n');

      lastBalance   = entry.current;
      lastTimestamp = entry.timestamp;
      cursor++;
    }

    return true;
  }

  /**
  * Asserts that a number provided is not negative unless allowed. Also does checks to see if is NaN or not finite.
  */
  protected assertNotNegative(current : BigNumber.Value, allowNegative : boolean = DEFAULT_ALLOW_NEG_BALANCE) : void {
    current = inputBigNumber(current);

    if(current.isNaN() || !current.isFinite())
      throw new RangeError(`Change produces an invalid balance number.`);

    if(!allowNegative && current.isNegative())
      throw new RangeError(`Change produces a negative balance (${current.toString(10)}), and this is not allowed.`);
  }
};
