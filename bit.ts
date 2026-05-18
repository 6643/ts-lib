const ensureByte = (bits: Uint8Array, byteIndex: number): Uint8Array => {
    if (byteIndex < bits.length) return bits

    const expanded = new Uint8Array(byteIndex + 1)
    expanded.set(bits)
    return expanded
}

export const getBit = (bits: Uint8Array, index: number): 0 | 1 => {
    if (index < 0) return 0

    const byteIndex = Math.trunc(index / 8)
    if (byteIndex >= bits.length) return 0

    const byte = bits[byteIndex] ?? 0
    const bitIndex = index % 8
    return ((byte >> bitIndex) & 1) as 0 | 1
}

export const setBit = (bits: Uint8Array, index: number, value: 0 | 1): Uint8Array => {
    if (index < 0) return bits

    const byteIndex = Math.trunc(index / 8)
    const bitIndex = index % 8
    const nextBits = ensureByte(bits, byteIndex)
    const byte = nextBits[byteIndex] ?? 0

    nextBits[byteIndex] = value ? byte | (1 << bitIndex) : byte & ~(1 << bitIndex)
    return nextBits
}
