import { Dna } from './dna'
import { Vector } from '../physics/vector'

export class VectorDna implements Dna<Vector[]>{

    fitness: number;
    succeed = 1;
    constructor(public genes: Vector[], private target: Vector, public position?: Vector) { }

    crossOver(element: VectorDna):VectorDna[] {
        let result = [];
        var mid = Math.floor(Math.random() * this.genes.length);
        result.push(new VectorDna([...this.genes.slice(0, mid),...element.genes.slice(mid)], this.target));
        result.push(new VectorDna([...element.genes.slice(0, mid),...this.genes.slice(mid)], this.target));
        return result;
    }

    mutate(): Vector[] {
        for (var i = 0; i < this.genes.length; i++) {
            if (Math.random() < 0.001) {
                this.genes[i] = Vector.random().mult(.2);
            }
        }
        return this.genes;
    }

    evaluate(): number {
        return this.fitness = Math.pow(1 / (this.target.dist(this.position) + 1) * 1000, 3) * Math.pow(this.succeed, 7);
    }

}
