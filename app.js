/* *********************************************************************** */
/*                                                                         */
/* OBJECTIVE : RL                          #####      ###    ###    #      */
/* AUTHOR :  VICTOR DALET                  #         #      #       #      */
/* CREATED : 22 04 2023                    ####      #      #  ##   #      */
/* UPDATE  : 23 04 2023                    #         #      #   #   #      */
/*                                         ####    ###      #####   #.fr   */
/* *********************************************************************** */



class Matrix {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.data = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
    }

    copy() {
        let m = new Matrix(this.rows, this.cols);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                m.data[i][j] = this.data[i][j];
            }
        }
        return m;
    }

    static fromArray(arr) {
        return new Matrix(arr.length, 1).map((e, i) => arr[i]);
    }

    toArray() {
        let arr = [];
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                arr.push(this.data[i][j]);
            }
        }
        return arr;
    }

    randomize() {
        return this.map(e => Math.random() * 2 - 1);
    }

    add(n) {
        if (n instanceof Matrix) {
            if (this.rows !== n.rows || this.cols !== n.cols) {
                return;
            }
            return this.map((e, i, j) => e + n.data[i][j]);
        } else {
            return this.map(e => e + n);
        }
    }


    static multiply(a, b) {
        if (a.cols !== b.rows) {
            return;
        }

        return new Matrix(a.rows, b.cols)
            .map((e, i, j) => {
                let sum = 0;
                for (let k = 0; k < a.cols; k++) {
                    sum += a.data[i][k] * b.data[k][j];
                }
                return sum;
            });
    }


    map(func) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                let val = this.data[i][j];
                this.data[i][j] = func(val, i, j);
            }
        }
        return this;
    }

}


/*------------------------------------------------------*/
class ActivationFunction {
    constructor(func, dfunc) {
        this.func = func;
        this.dfunc = dfunc;
    }
}

let sigmoid = new ActivationFunction(
    x => 1 / (1 + Math.exp(-x)),
    y => y * (1 - y)
);



class NeuralNetwork {
    constructor(a, b, c) {
        if (a instanceof NeuralNetwork) {
            this.input_nodes = a.input_nodes;
            this.hidden_nodes = a.hidden_nodes;
            this.output_nodes = a.output_nodes;

            this.weights_ih = a.weights_ih.copy();
            this.weights_ho = a.weights_ho.copy();

            this.bias_h = a.bias_h.copy();
            this.bias_o = a.bias_o.copy();
        } else {
            this.input_nodes = a;
            this.hidden_nodes = b;
            this.output_nodes = c;

            this.weights_ih = new Matrix(this.hidden_nodes, this.input_nodes);
            this.weights_ho = new Matrix(this.output_nodes, this.hidden_nodes);
            this.weights_ih.randomize();
            this.weights_ho.randomize();

            this.bias_h = new Matrix(this.hidden_nodes, 1);
            this.bias_o = new Matrix(this.output_nodes, 1);
            this.bias_h.randomize();
            this.bias_o.randomize();
        }

        this.setLearningRate();
        this.setActivationFunction();


    }

    predict(input_array) {

        let inputs = Matrix.fromArray(input_array);
        let hidden = Matrix.multiply(this.weights_ih, inputs);
        hidden.add(this.bias_h);
        hidden.map(this.activation_function.func);

        let output = Matrix.multiply(this.weights_ho, hidden);
        output.add(this.bias_o);
        output.map(this.activation_function.func);

        return output.toArray();
    }

    setLearningRate(learning_rate = 0.1) {
        this.learning_rate = learning_rate;
    }

    setActivationFunction(func = sigmoid) {
        this.activation_function = func;
    }

    copy() {
        return new NeuralNetwork(this);
    }

    mutate(rate) {
        function mutate(val) {
            if (Math.random() < rate) {
                return val + randomGaussian(0, 0.1);
            } else {
                return val;
            }
        }
        this.weights_ih.map(mutate);
        this.weights_ho.map(mutate);
        this.bias_h.map(mutate);
        this.bias_o.map(mutate);
    }
}

/*--------------------------*/
/*--------------------------*/
/*--------------------------*/
class Bird {
    constructor(brain) {
        this.y = height / 2;
        this.x = 64;

        this.gravity = 0.8;
        this.lift = -12;
        this.velocity = 0;


        this.score = 0;
        this.fitness = 0;
        if (brain) {
            this.brain = brain.copy();
        } else {
            this.brain = new NeuralNetwork(5, 8, 2);
        }

    }

    show() {
        stroke(255);
        fill(255, 100);
        ellipse(this.x, this.y, 32, 32);
    }

    up() {
        this.velocity += this.lift;
    }

    mutate() {
        this.brain.mutate(0.1);
    }

    think(pipes) {

        let closest = null;
        let closestD = Infinity;
        for (let i = 0; i < pipes.length; i++) {
            let d = (pipes[i].x + pipes[i].w) - this.x;
            if (d < closestD && d > 0) {
                closest = pipes[i];
                closestD = d;
            }
        }


        let inputs = [];
        inputs[0] = this.y / height;
        inputs[1] = closest.top / height;
        inputs[2] = closest.bottom / height;
        inputs[3] = closest.x / width;
        inputs[4] = this.velocity / 10;
        let output = this.brain.predict(inputs);
        if (output[0] > output[1]) {
            this.up();
        }

    }

    offScreen() {
        return (this.y > height || this.y < 0);
    }

    update() {
        this.score++;
        this.velocity += this.gravity;
        this.y += this.velocity;
    }

}

/*-----------------------------------------------*/

class Pipe {

    constructor() {
        this.spacing = 125;
        this.top = random(height / 6, 3 / 4 * height);
        this.bottom = height - (this.top + this.spacing);
        this.x = width;
        this.w = 80;
        this.speed = 6;
    }

    hits(bird) {
        if (bird.y < this.top || bird.y > height - this.bottom) {
            if (bird.x > this.x && bird.x < this.x + this.w) {
                return true;
            }
        }
        return false;
    }

    show() {
        fill(255);
        rectMode(CORNER);
        rect(this.x, 0, this.w, this.top);
        rect(this.x, height - this.bottom, this.w, this.bottom);
    }

    update() {
        this.x -= this.speed;
    }

    offscreen() {
        if (this.x < -this.w) {
            return true;
        } else {
            return false;
        }
    }
}


/*-----------------------------------------------*/

function nextGeneration() {
    console.log('NEXT');
    calculateFitness();
    for (let i = 0; i < TOTAL; i++) {
        birds[i] = pickOne();
    }
    savedBirds = [];
}

function pickOne() {
    let index = 0;
    let r = Math.random();
    while (r > 0) {
        r = r - savedBirds[index].fitness;
        index++;
    }
    index--;
    let bird = savedBirds[index];
    let child = new Bird(bird.brain);
    child.mutate();
    return child;
}

function calculateFitness() {
    let sum = 0;
    for (let bird of savedBirds) {
        sum += bird.score;
    }
    for (let bird of savedBirds) {
        bird.fitness = bird.score / sum;
    }
}

/*-----------------------------------------------*/

const TOTAL = 100;
let birds = [];
let savedBirds = [];
let pipes = [];
let counter = 0;
let slider;


function setup() {
    createCanvas(640, 480);
    slider = createSlider(1, 10, 1);
    for (let i = 0; i < TOTAL; i++) {
        birds[i] = new Bird();
    }
}

function draw() {
    for (let n = 0; n < slider.value(); n++) {
        if (counter % 75 == 0) {
            pipes.push(new Pipe());
        }
        counter++;

        for (let i = pipes.length - 1; i >= 0; i--) {
            pipes[i].update();

            for (let j = birds.length - 1; j >= 0; j--) {
                if (pipes[i].hits(birds[j])) {
                    savedBirds.push(birds.splice(j, 1)[0]);
                }
            }

            if (pipes[i].offscreen()) {
                pipes.splice(i, 1);
            }
        }

        for (let i = birds.length - 1; i >= 0; i--) {
            if (birds[i].offScreen()) {
                savedBirds.push(birds.splice(i, 1)[0]);
            }
        }

        for (let bird of birds) {
            bird.think(pipes);
            bird.update();
        }

        if (birds.length === 0) {
            counter = 0;
            nextGeneration();
            pipes = [];
        }
    }

    background(0);

    for (let bird of birds) {
        bird.show();
    }

    for (let pipe of pipes) {
        pipe.show();
    }
}


