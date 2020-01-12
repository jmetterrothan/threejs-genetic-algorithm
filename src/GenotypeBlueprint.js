import Genotype from './Genotype';

class GenotypeBlueprint
{
    /**
     * GenotypeBlueprint constructor
     */
    constructor() {
        this.genes = [];
        this.model = null;
    }

    /**
     * Adds a trait
     * @param {string} name Trait name (used as data key)
     * @param {number} min Range min value
     * @param {number} max Range max value
     * @param {number} type 
     * @param {number} value Default value
     */
    addTrait(name, min, max, type, value) {
        const size = Math.floor(Math.log2(max - min)) + 1;
        const target = new Uint8Array(size).fill(0);

        const transform = (x) => {
            const n = 2**size - 1;
            return x * (max - min) / n + min;
        };

        if (type === GenotypeBlueprint.INTEGER) {
            const data = GenotypeBlueprint.convertIntegerToBinaryArray(value);
            
            for (let i = data.length; i >= 0; --i) {
                target[size - (data.length - i)] = data[i];
            }
        }

        this.genes.push({ name, min, max, size, type, target, transform });
        this.updateTargetModel();
    }

    /**
     * Update the blueprint model
     */
    updateTargetModel() {
        const model = new Uint8Array(this.size).fill(0);

        let index = 0;
        this.genes.forEach(gene => {
            for (let k = 0; k < gene.size; k++) {
                model[index + k] = gene.target[k];
            }
            index += gene.size;
        });

        this.model = model;
    }

    /**
     * Decode a given genotype
     * @param {Genotype} genotype
     * @return {Object} Decoded genotype
     */
    decode(genotype) {
        const out = {};
        let index = 0;

        for (let i = 0; i < this.genes.length; i++) {
            let value;
            let temp = genotype.data.slice(index, index + this.genes[i].size);

            // convert raw binary values
            if (this.genes[i].type === GenotypeBlueprint.INTEGER) {
                value = GenotypeBlueprint.convertBinaryArrayToInteger(temp);
            }

            // transform values
            if (typeof this.genes[i].transform === 'function') {
                value = this.genes[i].transform(value);
            }

            out[this.genes[i].name] = value;
            index += this.genes[i].size;
        }
        
        return out;
    }

    /**
     * @return {number}
     */
    get size() {
        return this.genes.reduce((value, gene) => value + gene.size, 0);
    }

    /**
     * Uint8Array conversion to number
     * @param {Uint8Array} data
     * @return {number}
     */
    static convertBinaryArrayToInteger(data) {
        return parseInt(data.join(''), 2);
    }
    
    /**
     * Number conversion to Uint8Array
     * @param {number} value 
     * @return {Uint8Array}
     */
    static convertIntegerToBinaryArray(value) {
        return Uint8Array.from(Number(value).toString(2).split('').map(str => parseInt(str, 10)));
    }
}

GenotypeBlueprint.INTEGER = 1;

export default GenotypeBlueprint;