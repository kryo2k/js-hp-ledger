import { BigNumber } from 'bignumber.js';

export type AnyNumericInput = number|string|BigNumber;
export type AnyDateInput    = number|string|Date;

const
DEFAULT_VERIFY_TIMESTAMP = true,
DEFAULT_ALLOW_NEG_BALANCE = false,
DEBUG = false;

function inputBigNumber(num : AnyNumericInput) : BigNumber {
  return new BigNumber(num);
};

function inputNumber(num : AnyNumericInput) : number {
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
    if(isNaN(date) || isFinite(date))
      throw new SyntaxError('Date number format is not valid.');
    return new Date(date);
  }

  throw new TypeError('Invalid type of date input was provided.');
};

export interface ILedgerEntry {
  readonly timestamp : string;
  readonly previous  : number;
  readonly change    : number;
  readonly current   : number;
};

export function validateEntry (entry : ILedgerEntry, previousBalance : AnyNumericInput = 0, previousTimestamp ?: AnyDateInput, verifyTimestamp : boolean = DEFAULT_VERIFY_TIMESTAMP) : boolean {

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

  constructor(
    previous : AnyNumericInput,
    change: AnyNumericInput,
    current: AnyNumericInput,
    timestamp: AnyDateInput = new Date()
  ) {
    this.previous = inputNumber(previous);
    this.change = inputNumber(change);
    this.current = inputNumber(current);
    this.timestamp = inputDate(timestamp).toISOString();
  }
};

export class Ledger {

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

  get length () : number {
    return this.entries.length;
  }

  get lastEntry () : ILedgerEntry|undefined {
    const entries = this.entries;
    return entries[entries.length - 1];
  }

  get lastBalance () : number {
    const last = this.lastEntry;

    if(typeof last === 'undefined')
      return this.initialBalance;

    return last.current;
  }

  get lastChange () : number {
    const last = this.lastEntry;

    if(typeof last === 'undefined')
      return 0;

    return last.change;
  }

  get lastTimestamp () : string|undefined {
    const last = this.lastEntry;

    if(typeof last === 'undefined')
      return this.initialTimestamp;

    return last.timestamp;

  }

  get firstEntry () : ILedgerEntry|undefined {
    return this.entries[0];
  }

  change(change : AnyNumericInput, allowNegativeBalance ?: boolean, timestamp ?: AnyDateInput) : Ledger {
    change = inputBigNumber(change);

    const
    previous = inputBigNumber(this.lastBalance),
    current = previous.plus(change);

    Ledger.testNegative(current, allowNegativeBalance);

    return new Ledger(this.entries.concat([ new LedgerEntry(previous, change, current, timestamp) ]), this.initialBalance);
  }

  set(current : AnyNumericInput, allowNegativeBalance ?: boolean, timestamp ?: AnyDateInput) : Ledger {
    current = inputBigNumber(current);

    const
    previous = this.lastBalance,
    change   = current.minus(previous);

    Ledger.testNegative(current, allowNegativeBalance);

    return new Ledger(this.entries.concat([ new LedgerEntry(previous, change, current, timestamp) ]), this.initialBalance);
  }

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

  protected static testNegative(current : AnyNumericInput, allowNegative : boolean = DEFAULT_ALLOW_NEG_BALANCE) : void {
    current = inputBigNumber(current);

    if(current.isNaN() || !current.isFinite())
      throw new RangeError(`Change produces an invalid balance number.`);

    if(!allowNegative && current.isNegative())
      throw new RangeError(`Change produces a negative balance (${current.toString(10)}), and this is not allowed.`);
  }
};
