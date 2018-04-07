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

    dot(vector: Vector) {
        return Math.abs(this.x * vector.x + this.y * vector.y);
    }

    getAngle() {
        return Math.atan2(this.y, this.x);
    }

    static interception(position: Vector, direction: Vector, position2: Vector, direction2: Vector): Vector {
        let end1 = position.clone().add(direction);
        let end2 = position2.clone().add(direction2);
        let a, b;
        let dem = ((end2.y - position2.y) * (end1.x - position.x)) - ((end2.x - position2.x) * (end1.y - position.y));
        if (dem == 0) {
            return null;
        }
        a = position.y - position2.y;
        b = position.x - position2.x;
        let numerator1 = ((end2.x - position2.x) * a) - ((end2.y - position2.y) * b);
        let numerator2 = ((end1.x - position.x) * a) - ((end1.y - position.y) * b);
        a = numerator1 / dem;
        b = numerator2 / dem;
    
        // if we cast these lines infinitely in both directions, they intersect here:
        if (b > 0 && b < 1 && a > 0) {
            let x = position.x + (a * (end1.x - position.x));
            let y = position.y + (a * (end1.y - position.y));
            return new Vector(x, y);
        } else {
            return null;
        }
    }

    clone = (): Vector => new Vector(this.x, this.y);

    static fromAngle(angle: number): Vector {
        let x = Math.cos(angle);
        let y = Math.sin(angle);
        return new Vector(x, y);
    }
}
