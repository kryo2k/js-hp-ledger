"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
require("mocha");
const hp_ledger_1 = require("./hp-ledger");
describe('Ledger', () => {
    const TIMESTAMP_1 = '2018-01-01T00:00:00.000Z', TIMESTAMP_2 = '2018-01-01T00:00:00.001Z';
    it('should create an empty ledger.', () => {
        const ledger = new hp_ledger_1.Ledger();
        chai_1.expect(ledger.length).to.eq(0);
        chai_1.expect(ledger.lastBalance).to.eq(0);
        chai_1.expect(ledger.lastChange).to.eq(0);
        chai_1.expect(ledger.lastTimestamp).to.eq(undefined);
    });
    it('should update balance correctly with one entry (0 change)', () => {
        const ledger = new hp_ledger_1.Ledger([
            new hp_ledger_1.LedgerEntry(0, 0, 0, TIMESTAMP_1)
        ]);
        chai_1.expect(ledger.length).to.eq(1);
        chai_1.expect(ledger.lastBalance).to.eq(0);
        chai_1.expect(ledger.lastChange).to.eq(0);
        chai_1.expect(ledger.lastTimestamp).to.eq(TIMESTAMP_1);
    });
    it('should update balance correctly with one entry (5 change)', () => {
        const ledger = new hp_ledger_1.Ledger([
            new hp_ledger_1.LedgerEntry(0, 5, 5, TIMESTAMP_1)
        ]);
        chai_1.expect(ledger.length).to.eq(1);
        chai_1.expect(ledger.lastBalance).to.eq(5);
        chai_1.expect(ledger.lastChange).to.eq(5);
        chai_1.expect(ledger.lastTimestamp).to.eq(TIMESTAMP_1);
    });
    it('should update balance correctly with one entry (0.00005 change)', () => {
        const ledger = new hp_ledger_1.Ledger([
            new hp_ledger_1.LedgerEntry(0, 0.00005, 0.00005, TIMESTAMP_1)
        ]);
        chai_1.expect(ledger.length).to.eq(1);
        chai_1.expect(ledger.lastBalance).to.eq(0.00005);
        chai_1.expect(ledger.lastChange).to.eq(0.00005);
        chai_1.expect(ledger.lastTimestamp).to.eq(TIMESTAMP_1);
    });
    it('should update balance correctly with two entries (0 change)', () => {
        const ledger = new hp_ledger_1.Ledger([
            new hp_ledger_1.LedgerEntry(0, 0, 0, TIMESTAMP_1),
            new hp_ledger_1.LedgerEntry(0, 0, 0, TIMESTAMP_2)
        ]);
        chai_1.expect(ledger.length).to.eq(2);
        chai_1.expect(ledger.lastBalance).to.eq(0);
        chai_1.expect(ledger.lastChange).to.eq(0);
        chai_1.expect(ledger.lastTimestamp).to.eq(TIMESTAMP_2);
    });
    it('should update balance correctly with two entries (+/- change)', () => {
        const ledger = new hp_ledger_1.Ledger([
            new hp_ledger_1.LedgerEntry(0, 5.0, 5.0, TIMESTAMP_1),
            new hp_ledger_1.LedgerEntry(5, -2.5, 2.5, TIMESTAMP_2)
        ]);
        chai_1.expect(ledger.length).to.eq(2);
        chai_1.expect(ledger.lastBalance).to.eq(2.5);
        chai_1.expect(ledger.lastChange).to.eq(-2.5);
        chai_1.expect(ledger.lastTimestamp).to.eq(TIMESTAMP_2);
    });
});
//# sourceMappingURL=hp-ledger.spec.js.map