import { Dna } from './dna'
import { Vector } from '../physics/vector';
import * as Synaptic from 'synaptic';

export class NeuralDna implements Dna<Synaptic.Architect.Perceptron>{

    fitness: number;
    succeed = 1;
    constructor(public genes: Synaptic.Architect.Perceptron, private target: Vector, public position?: Vector) { }

    crossOver(element: Dna<Synaptic.Architect.Perceptron>): NeuralDna[] {
        let parentA = this.genes.toJSON();
        let parentB = element.genes.toJSON();
        var mid = Math.floor(Math.random() * parentA.neurons.length);
        for (var i = mid; i < parentA.neurons.length; i++) {
            var biasFromParentA = parentA.neurons[i]['bias'];
            parentA.neurons[i]['bias'] = parentB.neurons[i]['bias'];
            parentB.neurons[i]['bias'] = biasFromParentA;
        }
        let result: NeuralDna[] = [];
        this.genes = Synaptic.Network.fromJSON(parentA) as Synaptic.Architect.Perceptron;
        element.genes = Synaptic.Network.fromJSON(parentB) as Synaptic.Architect.Perceptron;
        result.push(this);
        result.push(element as any)
        return result;
    }

    mutate(): Synaptic.Architect.Perceptron {
        // return this.genes;
        let offspring = this.genes.toJSON();
        for (var i = 0; i < this.genes.neurons.length; i++) {
            offspring.neurons()[i]
            offspring.neurons[i]['bias'] = this.mutateGene(offspring.neurons[i]['bias']);
        }

        for (var i = 0; i < offspring.connections.length; i++) {
            offspring.connections[i]['weight'] = this.mutateGene(offspring.connections[i]['weight']);
        }
        this.genes =  Synaptic.Network.fromJSON(offspring) as Synaptic.Architect.Perceptron;
        return this.genes;
    }

    private mutateGene(gene) {
        if (Math.random() < 0.05) {
            var mutateFactor = 1 + ((Math.random() - 0.5) * 0.05);
            gene *= mutateFactor;
        }

        return gene;
    }

    evaluate(): number {
        return this.fitness = Math.pow(1 / (this.target.dist(this.position) + 1) * 1000, 3);
    }
}
