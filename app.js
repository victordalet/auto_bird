class Map {
    constructor() {
        document.querySelector('body').style.margin = '0';
        const _ = 0
        this.map = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,1,1,1,1,1,_,_,_,_,1,1,1,1,1,1,_,_,_,_,_,_,_,_,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,1,1,1,_,_,_,_,_,_,_,_,_,_,_,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,_,_,_,_,_,_,1,_,_,_,_,1,_,_,1,_,_,_,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,_,_,_,_,_,_,1,1,1,_,_,_,_,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,_,_,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,_,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];
    }

    display_map() {
        const container  = document.createElement('div');
        container.style.display = 'grid';
        for (let i = 0 ; i < this.map.length ; i++) {
            const big_div = document.createElement('div')
            big_div.style.display = 'inline-flex';
            for (let j = 0 ; j < this.map[i].length ; j++) {
                const div = document.createElement('div');
                div.style.width = "20px";
                div.style.height = "20px";
                if (this.map[i][j] === 0 ) {
                    div.style.background = 'grey';
                }
                else {
                    div.style.background  = 'green';
                }
                big_div.appendChild(div);
            }
            container.appendChild(big_div);
        }

        document.querySelector('body').appendChild(container);
    }


    get_map() {
        return this.map;
    }
}

class Car {
    constructor(map) {
        this.map = map;
        this.x = 1;
        this.y = 1;
        this.display_car();
        this.create_btn_reset();
        this.q_table = [];
        for (let i = 0 ; i < 5*5 ; i++) {
            this.q_table.push([0,0])
        }
        this.exploration = 1;
        this.alpha = 1;
        this.gamma = 1;
        this.cooling_rate = 0.99;
        this.table_case = [];
        this.score = 0;
    }


    display_car() {
        this.car = document.createElement('div');
        this.car.style.width = "15px";
        this.car.style.height = "15px";
        this.car.style.background = "black";
        this.car.style.position = 'absolute';
        this.car.style.zIndex = "2";
        this.car.style.top = '20px';
        this.car.style.left = "20px";
        document.querySelector('body').appendChild(this.car);
        return this.car;
    }

    get_information_captor() {
        let lst_captor = [];
        lst_captor.push(this.map[this.x+1][this.y])
        lst_captor.push(this.map[this.x-1][this.y])
        lst_captor.push(this.map[this.x-1][this.y+1])
        lst_captor.push(this.map[this.x][this.y+1])
        lst_captor.push(this.map[this.x+1][this.y+1])
        return lst_captor;
    }

    get_state() {
        return (this.map[this.y][this.x] === 0 ? 1 : -1);
    }

    up_x() {
        this.x++;
        this.car.style.left = (this.x * 20).toString() + 'px';
        this.reset_car();
    }

    up_y() {
        this.y++;
        this.car.style.top = (this.y * 20).toString() + 'px';
        this.reset_car();
    }

    down_y() {
        this.y--;
        this.car.style.top = (this.y * 20).toString() + 'px';
        this.reset_car();
    }


    best_action() {
        if (Math.random() < this.exploration) {
            this.exploration *= this.cooling_rate;
            return (Math.random() < 5) ? 1 : 0;
        }

    }


    reset_car() {
        if (this.get_state() === -1) {
            this.x = 1;
            this.y = 1;
            this.car.style.left = (this.x * 20).toString() + 'px';
            this.car.style.top = (this.y * 20).toString() + 'px';
            this.table_case.pop();
            this.q_table.push(this.table_case);
            this.table_case = [];
            this.exploration -= .1;
            this.score = 0;
        }
    }

    somme_state(env) {
        let somme = 0;
        for (let i = 0 ; i < env.length ; i++) {
            somme += env[i];
        }
        return somme;
    }

    create_btn_reset() {
        const btn_reset = document.createElement('button');
        btn_reset.innerHTML = 'reset';
        btn_reset.onclick = () => {
            this.x = 0;
            this.y = 0;
            this.up_x();
        }
        document.querySelector('body').appendChild(btn_reset);
    }


    max_table(table) {
        let max = table[0];
        for (let i = 0 ; i < table.length ; i++) {
            if (max < table[i]) {
                max = table[i];
            }
        }
        return max;
    }

    train() {
        setInterval(() => {
            this.up_x();
            const action = this.best_action();
            const env = this.get_information_captor()
            const state = this.somme_state(env);
            const reward = (this.get_state() === 1) ? self.score : -1;
            const maxQ = this.max_table(this.q_table[state]);
            this.q_table[state][action] += this.alpha * (reward + this.gamma * maxQ - this.q_table[this.q_table[state][action]])
            //(action === 0) ? this.down_y() : this.up_y();
        },100)

    }


}



/*------------------------MAIN------------------------*/
const creator = new Map();
creator.display_map();
const car = new Car(creator.get_map());
car.train();

