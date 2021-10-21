export default class Utils {
     static clampValue(v: number, min: number, max: number) {
        if (v < min)
            return min
        if (v > max)
            return max
        return v
    }
    static wrapValue(v: number, min: number, max: number) {
         return (v + max) % max
    }
}