let flappyBird;
const tenHigher = JSON.parse(localStorage.getItem('tenHigher')) || Array.from({ length: 10 }, () => ({ playerName: "", score: 0 }));

function novoElemento(tagName, className) {
    const elem = document.createElement(tagName);
    elem.className = className;
    return elem;
}

function Barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira');

    const borda = novoElemento('div', 'borda');
    const corpo = novoElemento('div', 'corpo');
    this.elemento.appendChild(reversa ? corpo : borda);
    this.elemento.appendChild(reversa ? borda : corpo);

    this.setAltura = altura => corpo.style.height = `${altura}px`;
}

function ParDeBarreiras(altura, abertura, x) {
    this.elemento = novoElemento('div', 'par-de-barreiras');

    this.superior = new Barreira(true);
    this.inferior = new Barreira(false);

    this.elemento.appendChild(this.superior.elemento);
    this.elemento.appendChild(this.inferior.elemento);

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura);
        const alturaInferior = altura - abertura - alturaSuperior;
        this.superior.setAltura(alturaSuperior);
        this.inferior.setAltura(alturaInferior);
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0]);
    this.setX = x => this.elemento.style.left = `${x}px`;
    this.getLargura = () => this.elemento.clientWidth;

    this.sortearAbertura();
    this.setX(x);
}

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3;
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento);

            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length);
                par.sortearAbertura();
            }

            const meio = largura / 2;
            const cruzouOMeio = par.getX() + deslocamento >= meio && par.getX() < meio;
            if (cruzouOMeio) {
                notificarPonto();
            }
        });
    }
}

function Passaro(alturaJogo) {
    let voando = false;

    this.elemento = novoElemento('img', 'passaro');
    this.elemento.src = 'imgs/passaro.png';

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0]);
    this.setY = y => this.elemento.style.bottom = `${y}px`;

    window.onkeydown = e => voando = true;
    window.onkeyup = e => voando = false;

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5);
        const alturaMaxima = alturaJogo - this.elemento.clientHeight;

        if (novoY <= 0) {
            this.setY(0);
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima);
        } else {
            this.setY(novoY);
        }
    }

    this.setY(alturaJogo / 2);
}

function Progresso() {
    this.elemento = novoElemento('span', 'progresso');
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos;
    }
    this.atualizarPontos(0);
}

function estaoSobrepostos(elementoA, elementoB){
    const a = elementoA.getBoundingClientRect();
    const b = elementoB.getBoundingClientRect();

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left;
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top;

    return horizontal && vertical;
}

function colidiu(passaro, barreiras){
    let colidiu = false;
    barreiras.pares.forEach(parDeBarreiras => {
        if(!colidiu){
            const superior = parDeBarreiras.superior.elemento;
            const inferior = parDeBarreiras.inferior.elemento;
            colidiu = estaoSobrepostos(passaro.elemento, superior) || estaoSobrepostos(passaro.elemento, inferior);
        }
    });

    if (colidiu) {
        const nuvem = document.querySelector('.clouds');
        const nuvemBottom = document.querySelector('.bottom');
        nuvem.classList.add('clouds-stop');
        nuvemBottom.classList.add('clouds-stop');
    }

    return colidiu;
}

function FlappyBird() {
    
    let pontos = 0;

    const areaDoJogo = document.querySelector('[wm-flappy');
    const altura = areaDoJogo.clientHeight;
    const largura = areaDoJogo.clientWidth;

    const progresso = new Progresso();
    const barreiras = new Barreiras(altura, largura, 200, 400, () => progresso.atualizarPontos(++pontos));
    const passaro = new Passaro(altura);

    areaDoJogo.appendChild(progresso.elemento);
    areaDoJogo.appendChild(passaro.elemento);
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento));

    this.start = () => {
        const temporizador = setInterval(() => {
            barreiras.animar();
            passaro.animar();

            if(colidiu(passaro, barreiras)){
                clearInterval(temporizador);
            }
        }, 20);
    }

    this.stop = () => {
        areaDoJogo.removeChild(progresso.elemento);
        areaDoJogo.removeChild(passaro.elemento);
        barreiras.pares.forEach(par  => areaDoJogo.removeChild(par.elemento));
    }

}


if (tenHigher.length < 10) {
    const emptyEntries = 10 - tenHigher.length;
    for (let i = 0; i < emptyEntries; i++) {
        tenHigher.push({ playerName: "", score: 0 });
    }
}

function tenHigherPontuation(){
    const players = document.querySelector('.players');
    const scoreText = document.querySelector('.progresso').textContent;
    const playerName = document.getElementById('nome').value || `Player ${tenHigher.length + 1}`;
    let inserted = false;
    const score = parseInt(scoreText);

    for(let i = 0; i < tenHigher.length; i++){
        if(score > tenHigher[i].score){
            tenHigher.splice(i, 0, {playerName, score});
            inserted = true;
            break;
        }
    }

    if (!inserted && tenHigher.length < 10) {
        tenHigher.push({playerName, score});
    }

    if (tenHigher.length > 10) {
        tenHigher.pop();
    }

    players.innerHTML = '';

    tenHigher.forEach((entry, index) => {
        const pontoElemento = document.createElement('div');
        pontoElemento.textContent = `${index + 1}. ${entry.playerName} - ${entry.score}`;
        players.appendChild(pontoElemento);
    });

    localStorage.setItem('tenHigher', JSON.stringify(tenHigher));


}

function iniciarJogo(){

    if(flappyBird){
        tenHigherPontuation();
        stopGame();
    }
    
    flappyBird = new FlappyBird();
    flappyBird.start();    
}

function stopGame(){
    flappyBird.stop();
}
