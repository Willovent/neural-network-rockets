export class Vector {

    constructor(public x: number, public y: number) { }

    static random(maxX?: number, maxY?: number, minX = 0, minY = 0): Vector {
        if (!maxX && !maxY) {
            var randAngle = Math.random() * 2 * Math.PI;
            return Vector.fromAngle(randAngle);
        }
        let x = Math.random() * (maxX + minY);
        let y = Math.random() * (maxY + minY);
        return new Vector(x, y).add(new Vector(minX * -1, minY - 1));
    }

    add(vector: Vector | number): Vector {
        if (typeof (vector) == 'number') {
            this.x += vector;
            this.y += vector;
        } else {
            this.x += vector.x;
            this.y += vector.y;
        }
        return this;
    }

    mult(fact: number): Vector {
        this.x *= fact;
        this.y *= fact;
        return this;
    }

    dist(vector: Vector): number {
        let one = Math.pow(this.x - vector.x, 2);
        let two = Math.pow(this.y - vector.y, 2);
        return Math.sqrt(one + two);
    }

    limit(max: number) {
        this.x = (Math.abs(this.x) > max) ? (this.x * 0.9) : this.x;
        this.y = (Math.abs(this.y) > max) ? (this.y * 0.9) : this.y;
    }

    getAngle(){
        return Math.atan2(this.y, this.x);
    }

    clone = (): Vector => new Vector(this.x, this.y);

    static fromAngle(angle: number): Vector {
        let x = Math.cos(angle);
        let y = Math.sin(angle);
        return new Vector(x, y);
    }
}
