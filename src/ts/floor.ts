import Point from './point.js'
import Wall from './wall.js'

export default class Floor {
    public y: number
    public x1: number
    public x2: number
    constructor(y: number, x1: number, x2: number) {
        this.y = y
        this.x1 = x1
        this.x2 = x2
    }

    isEndPoint(p: Point) {
        return p.y === this.y && (p.x === this.x1 || p.x === this.x2)
    }

    intersectionX(p1: Point, p2: Point) {
        return p1.x + (p2.x - p1.x) * (this.y - p1.y) / (p2.y - p1.y)
    }
    isIntersectionInclusive(p1: Point, p2: Point) {
        // Handle parallel lines
        //if (p1.y === p2.y) return p1.y === this.y

        // Handle both points on one side
        if ((p1.y - this.y) * (p2.y - this.y) >= 0) return false

        const x = this.intersectionX(p1, p2)
        return x >= this.x1 && x <= this.x2
    }

    isExtensionIntersection(center: Point, point: Point) {
        if (center.y === point.y) return center.y === this.y

        if ((point.y - center.y) * (this.y - center.y) <= 0) return false

        const x = this.intersectionX(center, point)
        return x > this.x1 && x < this.x2
    }


    isWallIntersectionInclusive(wall: Wall) {
        return wall.y1 <= this.y 
            && wall.y2 >= this.y
            && this.x1 <= wall.x
            && this.x2 >= wall.x
    }
    wallIntersection(wall: Wall): Point {
        return { x: wall.x, y: this.y }
    }
}
