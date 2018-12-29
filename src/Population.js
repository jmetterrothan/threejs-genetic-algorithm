import assert from 'assert';

import Utility from './utility';
import Genotype from './Genotype';
import GenotypeBlueprint from './GenotypeBlueprint';

class Population
{
    /**
     * Population constructor
     * @param {number} n Number of base organisms
     * @param {number} size Number of bits that code for the genotype of the population
     * @param {number} mutationRate Mutation rate
     */
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

    /**
     * Sort genotypes by their fitness
     * @param {number} threshold 
     * @return {Array<Genotype>} Sorted genotypes
     */
    selectBestCandidates(threshold) {
        return this.genotypes.sort((a, b) => a.fitness - b.fitness).slice(0, threshold);
    }

    /**
     * Breed a next generation of the population
     * @param {GenotypeBlueprint} blueprint 
     * @return {Array<Genotype>} Genotypes that match the blueprint for the current generation
     */
    breed(blueprint) {
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

    /**
     * Mutate a group of genotypes
     * @param {number} ratio Mutation ratio
     * @param {Array<Genotype>} selection Population to mutate
     * @return {Array<Genotype>}
     */
    mutate(ratio, selection) {
        return Utility.shuffleArray(selection).map(genotype => genotype.mutate(ratio));
    }

    /**
     * Check for genotypes with a perfect score in the population
     * @return {Array<Genotype>}
     */
    hasTargets() {
        return this.genotypes.filter(genotype => genotype.score === 0);
    }

    /**
     * @return {number}
     */
    get size() {
        return this.genotypes.length;
    }
}

export default Population;