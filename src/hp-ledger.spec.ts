import { BigNumber } from 'bignumber.js';
import { expect } from 'chai';
import 'mocha';

import { Ledger, LedgerEntry } from './hp-ledger';

describe('Ledger', () => {

  const
  TIMESTAMP_1 = '2018-01-01T00:00:00.000Z',
  TIMESTAMP_2 = '2018-01-01T00:00:00.001Z';

  it('should create an empty ledger.', () => {
    const ledger = new Ledger();
    expect(ledger.length).to.eq(0);
    expect(ledger.lastBalance).to.eq(0);
    expect(ledger.lastChange).to.eq(0);
    expect(ledger.lastTimestamp).to.eq(undefined);
  });

  it('should update balance correctly with one entry (0 change)', () => {
    const ledger = new Ledger([
      new LedgerEntry(0,0,0,TIMESTAMP_1)
    ]);

    expect(ledger.length).to.eq(1);
    expect(ledger.lastBalance).to.eq(0);
    expect(ledger.lastChange).to.eq(0);
    expect(ledger.lastTimestamp).to.eq(TIMESTAMP_1);
  });

  it('should update balance correctly with one entry (5 change)', () => {
    const ledger = new Ledger([
      new LedgerEntry(0,5,5,TIMESTAMP_1)
    ]);

    expect(ledger.length).to.eq(1);
    expect(ledger.lastBalance).to.eq(5);
    expect(ledger.lastChange).to.eq(5);
    expect(ledger.lastTimestamp).to.eq(TIMESTAMP_1);
  });

  it('should update balance correctly with one entry (0.00005 change)', () => {
    const ledger = new Ledger([
      new LedgerEntry(0,0.00005,0.00005,TIMESTAMP_1)
    ]);

    expect(ledger.length).to.eq(1);
    expect(ledger.lastBalance).to.eq(0.00005);
    expect(ledger.lastChange).to.eq(0.00005);
    expect(ledger.lastTimestamp).to.eq(TIMESTAMP_1);
  });

  it('should update balance correctly with two entries (0 change)', () => {
    const ledger = new Ledger([
      new LedgerEntry(0,0,0,TIMESTAMP_1),
      new LedgerEntry(0,0,0,TIMESTAMP_2)
    ]);

    expect(ledger.length).to.eq(2);
    expect(ledger.lastBalance).to.eq(0);
    expect(ledger.lastChange).to.eq(0);
    expect(ledger.lastTimestamp).to.eq(TIMESTAMP_2);
  });

  it('should update balance correctly with two entries (+/- change)', () => {
    const ledger = new Ledger([
      new LedgerEntry(0,  5.0,  5.0, TIMESTAMP_1),
      new LedgerEntry(5, -2.5,  2.5, TIMESTAMP_2)
    ]);

    expect(ledger.length).to.eq(2);
    expect(ledger.lastBalance).to.eq(2.5);
    expect(ledger.lastChange).to.eq(-2.5);
    expect(ledger.lastTimestamp).to.eq(TIMESTAMP_2);
  });
});
