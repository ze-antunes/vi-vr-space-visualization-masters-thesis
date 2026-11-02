export function advancePlayback(time, delta, halfWindow, loop) {
    const next = time + delta
    if (!loop) return { time: Math.max(-halfWindow, Math.min(halfWindow, next)), playing: next > -halfWindow && next < halfWindow }
    const duration = halfWindow * 2
    return { time: ((next + halfWindow) % duration + duration) % duration - halfWindow, playing: true }
}
