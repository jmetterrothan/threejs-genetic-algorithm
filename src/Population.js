import assert from 'assert';

import Utility from './utility';
import Genotype from './Genotype';
import GenotypeBlueprint from './GenotypeBlueprint';

class Population
{
    constructor(n, size, mutationRate) {
        this.genotypes = Genotype.createPopulation(n, size);
        this.mutationRate = mutationRate;
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
        const normalizedResults = Genotype.normalize(results);

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
        const targets = this.hasTargets();

        // algorithm failed
        if (selection.length <= 0) throw new Error('no candidates selected');

        // return the genotype that match our blueprint if he exists
        if (targets.length >= 1) return targets;

        // children
        for (let i = 0, n = selection.length; i < n; i += 2) {
            if (selection[i] && selection[i + 1]) {
                const child = selection[i].crossWith(selection[i + 1]);
                selection.push(...child);
            }
        }

        // mutate
        this.genotypes = this.mutate(this.mutationRate, selection);

        return [];
    }

    mutate(ratio, selection) {
        return Utility.shuffleArray(selection).map(genotype => genotype.mutate(ratio));
    }

    hasTargets() {
        return this.genotypes.filter(genotype => genotype.score === 0);
    }

    get size() {
        return this.genotypes.length;
    }
}

export default Population;