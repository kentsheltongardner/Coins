export default class Wall {
    x;
    y1;
    y2;
    constructor(x, y1, y2) {
        this.x = x;
        this.y1 = y1;
        this.y2 = y2;
    }
    isEndPoint(p) {
        return p.x === this.x && (p.y === this.y1 || p.y === this.y2);
    }
    intersectionY(p1, p2) {
        return p1.y + (p2.y - p1.y) * (this.x - p1.x) / (p2.x - p1.x);
    }
    isIntersectionInclusive(p1, p2) {
        // Handle parallel lines
        //if (p1.x === p2.x) return p1.x === this.x
        // Handle both points on on side
        if ((p1.x - this.x) * (p2.x - this.x) >= 0)
            return false;
        const y = this.intersectionY(p1, p2);
        return y >= this.y1 && y <= this.y2;
    }
    isExtensionIntersection(center, point) {
        if (center.x === point.x)
            return center.x === this.x;
        if ((point.x - center.x) * (this.x - center.x) <= 0)
            return false;
        const y = this.intersectionY(center, point);
        return y > this.y1 && y < this.y2;
    }
    isFloorIntersectionInclusive(floor) {
        return floor.x1 <= this.x
            && floor.x2 >= this.x
            && this.y1 <= floor.y
            && this.y2 >= floor.y;
    }
    isFloorIntersectionExclusive(floor) {
        return floor.x1 < this.x
            && floor.x2 > this.x
            && this.y1 < floor.y
            && this.y2 > floor.y;
    }
    floorIntersection(floor) {
        return { x: this.x, y: floor.y };
    }
}
