import Floor from './floor.js'
import Point from './point.js'
import Rectangle from './rectangle.js'
import Wall from './wall.js'

enum Extend {
    First, Last, None
}

enum Direction {
    NW, N, NE, W, C, E, SW, S, SE, None
}

class VisionPoint {
    x: number
    y: number
    extend: Extend
    constructor(point: Point, extend: Extend) {
        this.x = point.x
        this.y = point.y
        this.extend = extend
    }
}



export default class Vision {

    public center: Point
    public bounds: Rectangle
    public walls        = new Array<Wall>()
    public floors       = new Array<Floor>()

    public points       = new Array<VisionPoint>()
    public perimeter    = new Array<Point>()

    constructor(center: Point, blocks: Rectangle[], bounds: Rectangle) {
        this.center     = center
        this.bounds     = bounds

        this.addBoundsCornersAndSides()
        this.addBlockCornersAndSides(blocks)
        this.addIntersections()
        this.removeObstructedPoints()
        this.orderPoints()
        this.extendPoints()
    }

    octant(point: Point) {
        const octantX = Math.sign(point.x - this.center.x) + 1
        const octantY = Math.sign(point.y - this.center.y) + 1
        return 3 * octantY + octantX
    }

    extendType(point: Point, corner: Direction) {
        const octant = this.octant(point)

        if (corner === octant) return Extend.None

        switch (octant) {
            case Direction.W: {
                switch (corner) {
                    case Direction.SE: return Extend.First
                    case Direction.NE: return Extend.Last
                }
            }
            case Direction.E: {
                switch (corner) {
                    case Direction.SW: return Extend.Last
                    case Direction.NW: return Extend.First
                }
            }
            case Direction.S: {
                switch (corner) {
                    case Direction.NW: return Extend.Last
                    case Direction.NE: return Extend.First
                }
            }
            case Direction.N: {
                switch (corner) {
                    case Direction.SE: return Extend.Last
                    case Direction.SW: return Extend.First
                }
            }
            case Direction.SE:
                switch (corner) {
                    case Direction.NE: return Extend.First
                    case Direction.SW: return Extend.Last
                }
            break
            case Direction.SW:
                switch (corner) {
                    case Direction.SE: return Extend.First
                    case Direction.NW: return Extend.Last
                }
            break
            case Direction.NW:
                switch (corner) {
                    case Direction.SW: return Extend.First
                    case Direction.NE: return Extend.Last
                }
            break
            case Direction.NE:
                switch (corner) {
                    case Direction.NW: return Extend.First
                    case Direction.SE: return Extend.Last
                }
            break
        }
        return Extend.None
    }

    addBoundsCornersAndSides() {
        this.points.push(new VisionPoint(this.bounds.cornerBottomRight, Extend.None))
        this.points.push(new VisionPoint(this.bounds.cornerBottomLeft, Extend.None))
        this.points.push(new VisionPoint(this.bounds.cornerTopLeft, Extend.None))
        this.points.push(new VisionPoint(this.bounds.cornerTopRight, Extend.None))

        this.floors.push(this.bounds.floorBottom)
        this.floors.push(this.bounds.floorTop)
        this.walls.push(this.bounds.wallRight)
        this.walls.push(this.bounds.wallLeft)
    }
    addBlockCornersAndSides(blocks: Rectangle[]) {
        for (const block of blocks) {
            if (!this.bounds.overlap(block)) continue

            const bottomRight           = block.cornerBottomRight
            const bottomLeft            = block.cornerBottomLeft
            const topLeft               = block.cornerTopLeft
            const topRight              = block.cornerTopRight

            const containsBottomRight   = this.bounds.contains(bottomRight)
            const containsBottomLeft    = this.bounds.contains(bottomLeft)
            const containsTopLeft       = this.bounds.contains(topLeft)
            const containsTopRight      = this.bounds.contains(topRight)

            if (containsBottomRight || containsBottomLeft)  this.floors.push(block.floorBottom)
            if (containsTopLeft     || containsTopRight)    this.floors.push(block.floorTop)
            if (containsBottomRight || containsTopRight)    this.walls.push(block.wallRight)
            if (containsBottomLeft  || containsTopLeft)     this.walls.push(block.wallLeft)

            if (containsBottomRight)    this.points.push(new VisionPoint(bottomRight, this.extendType(bottomRight, Direction.SE)))
            if (containsBottomLeft)     this.points.push(new VisionPoint(bottomLeft, this.extendType(bottomLeft, Direction.SW)))
            if (containsTopLeft)        this.points.push(new VisionPoint(topLeft, this.extendType(topLeft, Direction.NW)))
            if (containsTopRight)       this.points.push(new VisionPoint(topRight, this.extendType(topRight, Direction.NE)))
        }
    }
    addIntersections() {
        for (const wall of this.walls) {
            for (const floor of this.floors) {
                if (wall.isFloorIntersectionExclusive(floor)) {
                    const intersectionPoint = wall.floorIntersection(floor)
                    const visionPoint = new VisionPoint(intersectionPoint, Extend.None)
                    this.points.push(visionPoint)
                }
            }
        }
    }

    removeObstructedPoints() {
        const unobstructedPoints = new Array<VisionPoint>()
        for (const point of this.points) {
            let keep = true
            for (let i = 0; keep && i < this.walls.length; i++) {
                const wall = this.walls[i]
                if (wall.isEndPoint(point)) continue

                if (wall.isIntersectionInclusive(point, this.center)) {
                    keep = false
                }
            }
            for (let i = 0; keep && i < this.floors.length; i++) {
                const floor = this.floors[i]
                if (floor.isEndPoint(point)) continue

                if (floor.isIntersectionInclusive(point, this.center)) {
                    keep = false
                }
            }
            if (keep) {
                unobstructedPoints.push(point)
            }
        }
        this.points = unobstructedPoints
    }

    // If a ray through a midpoint intersects further than midpoint
    extendPoints() {
        for (let i = 0; i < this.points.length; i++) {
            const visionPoint = this.points[i]
            const point = { x: visionPoint.x, y: visionPoint.y }
            switch (visionPoint.extend) {
                case Extend.First:
                    this.perimeter.push(this.extendedPoint(point))
                    this.perimeter.push(point)
                break
                case Extend.Last:
                    this.perimeter.push(point)
                    this.perimeter.push(this.extendedPoint(point))
                break
                case Extend.None:
                    this.perimeter.push(point)
                break
            }
        }
    }

    extendedPoint(point: Point) {
        let extendDistanceSquared = Number.MAX_SAFE_INTEGER
        const extendPoint = { x: 0, y: 0 }

        for (const wall of this.walls) {
            if (wall.isEndPoint(point)) continue
            if (!wall.isExtensionIntersection(this.center, point)) continue

            const x = wall.x
            const y = wall.intersectionY(this.center, point)
            const dx = x - this.center.x
            const dy = y - this.center.y
            const distanceSquared = dx * dx + dy * dy

            if (distanceSquared < extendDistanceSquared) {
                extendPoint.x = x
                extendPoint.y = y
                extendDistanceSquared = distanceSquared
            }
        }
        for (const floor of this.floors) {
            if (floor.isEndPoint(point)) continue

            if (floor.isEndPoint(point)) continue
            if (!floor.isExtensionIntersection(this.center, point)) continue

            const x = floor.intersectionX(this.center, point)
            const y = floor.y
            const dx = x - this.center.x
            const dy = y - this.center.y
            const distanceSquared = dx * dx + dy * dy

            if (distanceSquared < extendDistanceSquared) {
                extendPoint.x = x
                extendPoint.y = y
                extendDistanceSquared = distanceSquared
            }
        }

        if (extendPoint.x === 0 && extendPoint.y === 0) {
            console.log(point)
        }

        return extendPoint
    }


    orderPoints() {
        this.points.sort((a, b) => Math.atan2(this.center.y - a.y, this.center.x - a.x) - Math.atan2(this.center.y - b.y, this.center.x - b.x))
    }

}