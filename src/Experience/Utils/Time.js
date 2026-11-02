export default class Time {
    constructor() { this.elapsed = 0; this.delta = 0 }
    update(elapsed, delta) { this.elapsed = elapsed; this.delta = delta }
}
