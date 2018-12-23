class GenotypeBlueprint
{
    constructor() {
        this.genes = [];
        this.model = null;
    }

    addTrait(name, size, type, value, transform = null) {
        let target = new Uint8Array(size).fill(0);

        if (type === GenotypeBlueprint.INTEGER) {
            const data = GenotypeBlueprint.convertIntegerToBinaryArray(value);
            
            for (let i = data.length; i >= 0; --i) {
                target[size - (data.length - i)] = data[i];
            }
        }

        this.genes.push({ name, size, type, target, transform });
        this.updateTargetModel();
    }

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

    decode(genotype) {
        const out = {};

        let index = 0;

        for (let i = 0; i < this.genes.length; i++) {
            let value = genotype.data.slice(index, index + this.genes[i].size);

            // convert raw binary values
            if (this.genes[i].type === GenotypeBlueprint.INTEGER) {
                value = GenotypeBlueprint.convertBinaryArrayToInteger(value);
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

    get size() {
        return this.genes.reduce((value, gene) => value + gene.size, 0);
    }

    static convertBinaryArrayToInteger(data) {
        return parseInt(data.join(''), 2);
    }
    
    static convertIntegerToBinaryArray(value) {
        return Number(value).toString(2).split('').map(str => parseInt(str, 10));
    }
}

GenotypeBlueprint.INTEGER = 0;

export default GenotypeBlueprint;