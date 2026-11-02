export function utcDate(value) {
    const date = new Date(value)
    return Number.isFinite(date.getTime()) ? `${date.toISOString().replace('T', ' ').replace('Z', '')} UTC` : 'Not available'
}

export function number(value, digits = 1) {
    return Number.isFinite(value) ? value.toLocaleString('en-GB', { maximumFractionDigits: digits }) : 'Not available'
}

export function probability(value) {
    return Number.isFinite(value) ? value.toExponential(2) : 'Not available'
}

export function signed(value, scientific = false) {
    if (!Number.isFinite(value)) return 'Not available'
    return `${value > 0 ? '+' : ''}${scientific ? value.toExponential(2) : number(value)}`
}
