import Floor from './floor.js'
import Point from './point.js'
import Wall from './wall.js'

export default class Rectangle {
    public x: number
    public y: number
    public w: number
    public h: number

    constructor(x: number, y: number, w: number, h: number) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
    }

    contains(point: Point) {
        return point.x >= this.x 
            && point.y >= this.y 
            && point.x <= this.x + this.w 
            && point.y <= this.y + this.h
    }

    overlap(other: Rectangle) {
        return this.x          < other.x + other.w
            && this.x + this.w > other.x
            && this.y          < other.y + other.h
            && this.y + this.h > other.y
    }

    get right()     { return this.x + this.w    }
    get bottom()    { return this.y + this.h    }
    get left()      { return this.x             }
    get top()       { return this.y             }

    get cornerBottomRight():    Point { return { x: this.right, y: this.bottom  } }
    get cornerBottomLeft():     Point { return { x: this.left,  y: this.bottom  } }
    get cornerTopLeft():        Point { return { x: this.left,  y: this.top     } }
    get cornerTopRight():       Point { return { x: this.right, y: this.top     } }

    get floorBottom()   { return new Floor(this.bottom, this.left,  this.right)     }
    get floorTop()      { return new Floor(this.top,    this.left,  this.right)     }

    get wallRight()     { return new Wall(this.right,   this.top,   this.bottom)    }
    get wallLeft()      { return new Wall(this.left,    this.top,   this.bottom)    }
}