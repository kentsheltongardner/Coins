import Floor from './floor.js'
import Point from './point.js'

export default class Wall {
    public x: number
    public y1: number
    public y2: number
    constructor(x: number, y1: number, y2: number) {
        this.x = x
        this.y1 = y1
        this.y2 = y2
    }

    isEndPoint(p: Point) {
        return p.x === this.x && (p.y === this.y1 || p.y === this.y2)
    }

    intersectionY(p1: Point, p2: Point) {
        return p1.y + (p2.y - p1.y) * (this.x - p1.x) / (p2.x - p1.x)
    }
    isIntersectionInclusive(p1: Point, p2: Point) {
        // Handle parallel lines
        if (p1.x === p2.x) return p1.x === this.x

        // Handle both points on on side
        if ((p1.x - this.x) * (p2.x - this.x) >= 0) return false

        const y = this.intersectionY(p1, p2)
        return y >= this.y1 && y <= this.y2
    }

    isExtensionIntersection(center: Point, point: Point) {
        if (center.x === point.x) return center.x === this.x

        if ((point.x - center.x) * (this.x - center.x) <= 0) return false

        const y = this.intersectionY(center, point)
        return y >= this.y1 && y <= this.y2
    }

    isFloorIntersectionInclusive(floor: Floor) {
        return floor.x1 <= this.x 
            && floor.x2 >= this.x
            && this.y1 <= floor.y
            && this.y2 >= floor.y
    }
    isFloorIntersectionExclusive(floor: Floor) {
        return floor.x1 < this.x 
            && floor.x2 > this.x
            && this.y1 < floor.y
            && this.y2 > floor.y
    }
    floorIntersection(floor: Floor): Point {
        return { x: this.x, y: floor.y }
    }
}