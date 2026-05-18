import { expect, test } from "bun:test";
import { getBit, setBit } from "./bit";

test("setBit and getBit address bit indexes inside the first byte", () => {
    const bits = setBit(new Uint8Array(1), 3, 1);
    expect(bits[0]).toBe(8);
    expect(getBit(bits, 3)).toBe(1);
    expect(getBit(bits, 2)).toBe(0);
});

test("setBit expands storage for higher bit indexes", () => {
    const bits = setBit(new Uint8Array(1), 9, 1);
    expect(bits.length).toBe(2);
    expect(bits[1]).toBe(2);
    expect(getBit(bits, 9)).toBe(1);
});
