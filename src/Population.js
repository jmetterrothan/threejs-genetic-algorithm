import assert from "assert";

import Utility from "./utility";
import Genotype from "./Genotype";
import GenotypeBlueprint from "./GenotypeBlueprint";

export const SelectionMethods = {
  TOURNAMENT: 1,
  TRUNCATION: 2
};

class Population {
  /**
   * Population constructor
   * @param {Array<Genotype>} genotypes Pool of genotypes
   * @param {number} mutationRate Mutation rate
   */
  constructor(genotypes, mutationRate, generation = 0) {
    this.genotypes = genotypes;
    this.mutationRate = mutationRate;
    this.generation = generation;
  }

  /**
   * Evaluate the whole population
   * @param {GenotypeBlueprint} blueprint
   */
  evaluate(blueprint) {
    assert(
      blueprint instanceof GenotypeBlueprint,
      "Blueprint must be an instanceof GenotypeBlueprint"
    );

    const results = this.genotypes.map(genotype =>
      genotype.evaluate(blueprint)
    );
    // keep values in a range bewteen 0 - 1 so our fitness is relative to the whole population
    const normalizedResults = Genotype.normalize(results);

    this.genotypes.forEach((genotype, i) => {
      genotype.score = results[i] / blueprint.size;
      genotype.fitness = normalizedResults[i];
    });
  }

  /**
   * Sort genotypes by their fitness
   * @param {number} threshold
   * @param {number} method
   * @return {Array<Genotype>} Sorted genotypes
   */
  selectBestCandidates(threshold, method = SelectionMethods.TRUNCATION) {
    if (method === SelectionMethods.TRUNCATION) {
      return this.genotypes
        .sort((a, b) => b.fitness - a.fitness)
        .slice(0, threshold)
        .map(genotype => genotype.clone());
    } else if (method === SelectionMethods.TOURNAMENT) {
      const output = [];

      while (output.length < threshold) {
        const selected = Utility.shuffleArray(this.genotypes).slice(0, 4);
        output.push(
          selected.reduce((acc, element) => {
            if (!acc || acc.fitness < element.fitness) {
              return element;
            }
            return acc;
          }, null)
        );
      }

      return output;
    }

    throw new Error("Invalid selection method");
  }

  /**
   * Breed a next generation of the population
   * @return {Population}
   */
  breed() {
    const selection = this.selectBestCandidates(Math.floor(this.size / 2));

    // algorithm failed
    if (selection.length <= 0) throw new Error("no candidates selected");

    // children
    for (let i = 0, n = selection.length; i < n; i += 2) {
      if (selection[i] && selection[i + 1]) {
        const child = selection[i].crossWith(selection[i + 1]);
        selection.push(...child);
      }
    }

    // mutate
    const genotypes = this.mutate(this.mutationRate, selection);

    return new Population(genotypes, this.mutationRate, this.generation + 1);
  }

  /**
   * Mutate a group of genotypes
   * @param {number} ratio Mutation ratio
   * @param {Array<Genotype>} selection Population to mutate
   * @return {Array<Genotype>}
   */
  mutate(ratio, selection) {
    return Utility.shuffleArray([...selection]).map(genotype =>
      genotype.mutate(ratio)
    );
  }

  /**
   * Check for genotypes with a perfect score in the population
   * @return {Array<Genotype>}
   */
  hasTargets() {
    return this.genotypes.filter(genotype => genotype.score === 1);
  }

  /**
   * Population constructor
   * @param {number} n Number of base organisms
   * @param {number} mutationRate Mutation rate
   * @param {GenotypeBlueprint} blueprint
   * @return {Population}
   */
  static create(n, mutationRate, blueprint) {
    const population = new Population(
      Genotype.createPopulation(n, blueprint.size),
      mutationRate
    );
    population.evaluate(blueprint);
    return population;
  }

  /**
   * @return {number}
   */
  get size() {
    return this.genotypes.length;
  }
}

export default Population;
