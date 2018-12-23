import assert from 'assert';

import Genotype, { normalize } from './Genotype';
import GenotypeBlueprint from './GenotypeBlueprint';

const shuffleArray = arr => arr
  .map(a => [Math.random(), a])
  .sort((a, b) => a[0] - b[0])
  .map(a => a[1]);

class Population
{
    constructor(n, size) {
        this.genotypes = Genotype.createPopulation(n, size);
        this.generation = 0;
    }

    /**
     * Evaluate the whole population
     * @param {GenotypeBlueprint} blueprint 
     */
    evaluate(blueprint) {
        assert(blueprint instanceof GenotypeBlueprint, 'Blueprint must be an instanceof GenotypeBlueprint');

        const results = this.genotypes.map(genotype => genotype.evaluate(blueprint));
        // keep values in a range bewteen 0 - 1 so our fitness is relative to the whole population
        const normalizedResults = normalize(results);

        this.genotypes.forEach((genotype, i) => {
            genotype.score = results[i];
            genotype.fitness = normalizedResults[i];
        });
    }

    selectBestCandidates(threshold) {
        return this.genotypes.sort((a, b) => a.fitness - b.fitness).slice(0, threshold);
    }

    select(blueprint) {
        this.generation++;
        this.evaluate(blueprint);

        const selection = this.selectBestCandidates(Math.floor(this.size / 2));
        const target = this.hasTarget();

        // algorithm failed
        if (selection.length <= 0) throw new Error('no candidates selected');

        // return the genotype that match our blueprint if he exists
        if (target instanceof Genotype) return target;

        // children
        for (let i = 0, n = selection.length; i < n; i += 2) {
            if (selection[i] && selection[i + 1]) {
                const child = selection[i].crossWith(selection[i + 1]);
                selection.push(...child);
            }
        }

        // mutate
        this.genotypes = this.mutate(0.01, selection);

        return null;
    }

    mutate(ratio, selection) {
        return shuffleArray(selection).map(genotype => genotype.mutate(0.005));
    }

    hasTarget() {
        return this.genotypes.find(genotype => genotype.score === 0);
    }

    get size() {
        return this.genotypes.length;
    }
}

export default Population;