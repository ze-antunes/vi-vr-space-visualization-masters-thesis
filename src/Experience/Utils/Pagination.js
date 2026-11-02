export function pageWindow(total, size, requested = 0) {
    const last = Math.max(0, Math.ceil(total / size) - 1) * size
    const start = Math.max(0, Math.min(last, Math.floor(requested / size) * size))
    return { start, end: Math.min(total, start + size), previous: start > 0, next: start + size < total }
}
