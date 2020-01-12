import assert from "assert";
import GenotypeBlueprint from "./GenotypeBlueprint";

class Genotype {
  /**
   * Genotype constructor
   * @param {Uint8Array} data Genotype bits
   */
  constructor(data) {
    this.data = data;
    this.fitness = -1;
    this.score = -1;
  }

  /**
   * Mutate genotypes
   * @param {number} p Mutation chance
   * @return {Genotype} mutated phenotype
   */
  mutate(p) {
    const temp = new Uint8Array(this.data).map(bit => {
      if (Math.random() >= 1 - p) return bit === 1 ? 0 : 1;
      return bit;
    });

    return new Genotype(temp);
  }

  /**
   * Crossover 2 genotypes
   * @param {Genotype} genotype
   * @return {Array<Genotype>} Siblings
   */
  crossWith(genotype) {
    assert(
      genotype instanceof Genotype,
      "You must provide a genotype to cross with"
    );
    assert(this.data.length === genotype.data.length, "Incompatible genotypes");

    const index = Math.floor(Math.random() * this.data.length);

    const out = new Array(2);
    out[0] = new Genotype(
      Uint8Array.from([
        ...this.data.slice(0, index),
        ...genotype.data.slice(index)
      ])
    );
    out[1] = new Genotype(
      Uint8Array.from([
        ...genotype.data.slice(0, index),
        ...this.data.slice(index)
      ])
    );

    return out;
  }

  /**
   * Evaluation fitness of a phenotype
   * @param {GenotypeBlueprint} blueprint
   * @return {number} fitness score
   */
  evaluate(blueprint) {
    assert(
      blueprint instanceof GenotypeBlueprint,
      "Blueprint must be an instanceof GenotypeBlueprint"
    );
    assert(this.data.length === blueprint.model.length, "Incompatible model");

    return blueprint.model.reduce(
      (acc, val, i) => acc + (this.data[i] !== val ? 0 : 1),
      0
    );
  }

  /**
   * Copy a genotype
   * @return Genotype
   */
  clone() {
    return new Genotype(Uint8Array.from([...this.data]));
  }

  /**
   * Creates a random genotype
   * @param {number} size Number of bits
   * @return {Genotype}
   */
  static create(size) {
    return new Genotype(Genotype.createRandomData(size).next().value);
  }

  /**
   * Creates a random genotype data set
   * @param {number} size Number of bits
   * @return {IterableIterator<Uint8Array>}
   */
  static *createRandomData(size) {
    yield new Uint8Array(size).map(() => (Math.random() > 0.5 ? 0 : 1));
  }

  /**
   * Create a whole population of genotypes
   * @param {number} n
   * @param {number} size
   * @return {Array<Genotype>}
   */
  static createPopulation(n, size) {
    return new Array(n).fill(null).map(() => Genotype.create(size));
  }

  /**
   * Normalize dataset
   * @param {Array} dataset
   * @return {Array}
   */
  static normalize(dataset) {
    const min = dataset.reduce((a, b) => Math.min(a, b));
    const max = dataset.reduce((a, b) => Math.max(a, b));

    return dataset.map(val => (val - min) / (max - min));
  }
}

export default Genotype;
