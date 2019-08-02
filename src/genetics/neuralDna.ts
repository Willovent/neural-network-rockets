import { Dna } from './dna';
import { Vector } from '../physics/vector';
import { Sequential, tensor, tidy, layers, sequential } from '@tensorflow/tfjs';

export class NeuralDna implements Dna<Sequential> {
  fitness: number;
  succeed = 1;
  constructor(public genes: Sequential, private target: Vector, public position?: Vector) {}

  crossOver(element: Dna<Sequential>): Dna<Sequential>[] {
    tidy(() => {
      const weightsA = this.genes.getWeights();
      const weightsB = element.genes.getWeights();
      const mutatedWeightsA = [];
      const mutatedWeightsB = [];
      var mid = Math.floor(Math.random() * weightsB.length);
      for (let i = 0; i < weightsA.length; i++) {
        let tensorA = weightsA[i];
        let tensorB = weightsB[i];
        let valuesA = tensorA.dataSync().slice();
        let valuesB = tensorB.dataSync().slice();
        let newTensorA = tensor(valuesA, tensorA.shape);
        let newTensorB = tensor(valuesB, tensorB.shape);
        if (i > mid) {
          mutatedWeightsA[i] = newTensorA;
          mutatedWeightsB[i] = newTensorB;
        } else {
          mutatedWeightsA[i] = newTensorB;
          mutatedWeightsB[i] = newTensorA;
        }
      }

      this.genes.setWeights(mutatedWeightsA);
      element.genes.setWeights(mutatedWeightsB);
    });
    let result: NeuralDna[] = [];
    result.push(this);
    result.push(element as any);
    return result;
  }

  mutate(): Sequential {
    tidy(() => {
      const weights = this.genes.getWeights();
      const mutatedWeights = [];
      for (let i = 0; i < weights.length; i++) {
        let tensorWeight = weights[i];
        let values = tensorWeight.dataSync().slice();
        for (let j = 0; j < values.length; j++) {
          if (Math.random() < 0.1) {
            values[j] *= 1 + (Math.random() - 0.5);
          }
        }
        let newTensor = tensor(values, tensorWeight.shape);
        mutatedWeights[i] = newTensor;
      }
      this.genes.setWeights(mutatedWeights);
    });
    return this.genes;
  }

  evaluate(): number {
    return (this.fitness = Math.pow((1 / (this.target.dist(this.position) + 1)) * 1000, 3));
  }

  copy(): Dna<Sequential> {
    const modelCopy = createModel();
    const weights = this.genes.getWeights();
    const weightCopies = [];
    for (let i = 0; i < weights.length; i++) {
      weightCopies[i] = weights[i].clone();
    }

    modelCopy.setWeights(weightCopies);
    return new NeuralDna(modelCopy, this.target);
  }
}

export function createModel(): Sequential {
  const hidden = layers.dense({
    units: 30,
    inputShape: [11],
    activation: 'sigmoid'
  });
  const output = layers.dense({
    units: 1,
    activation: 'sigmoid'
  });
  return sequential({
    layers: [hidden, output]
  });
}

let y2: number;
let previous = false;
function randomGaussian(mean?, sd?) {
  let y1: number, x1: number, x2: number, w: number;
  if (previous) {
    y1 = y2;
    previous = false;
  } else {
    do {
      x1 = Math.random() * 2 - 1;
      x2 = Math.random() * 2 - 1;
      w = x1 * x1 + x2 * x2;
    } while (w >= 1);
    w = Math.sqrt((-2 * Math.log(w)) / w);
    y1 = x1 * w;
    y2 = x2 * w;
    previous = true;
  }

  let m = mean || 0;
  let s = sd || 1;
  return y1 * s + m;
}
