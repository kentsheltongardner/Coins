const MaxSize = 1024

export default class Timeline {
    public x: number[] = new Array<number>(MaxSize)
    public y: number[] = new Array<number>(MaxSize)
    public vx: number[] = new Array<number>(MaxSize)
    public vy: number[] = new Array<number>(MaxSize)

    public duration = 5.0

    add(x: number, y: number, vx: number, vy: number, time: number) {
        
    }

    update() {

    }


}