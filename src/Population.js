import assert from 'assert';

import Genotype, { normalize } from './Genotype';
import GenotypeBlueprint from './GenotypeBlueprint';

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
        // this.genotypes.filter(genotype => genotype.fitness <= threshold);
    }

    hasTarget(blueprint) {
        assert(blueprint instanceof GenotypeBlueprint, 'Blueprint must be an instanceof GenotypeBlueprint');

        return this.genotypes.map(genotype => genotype.evaluate(blueprint)).filter(score => score === 0).length;
    }

    size() {
        return this.genotypes.length;
    }
}

export default Population;