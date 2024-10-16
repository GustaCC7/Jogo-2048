document.addEventListener('DOMContentLoaded', () => {
    const exibirGrade = document.querySelector('.grid')
    const exibirPontuação = document.getElementById('#score')
    const exibirResulatado = document.getElementById('#result')
    const width = 4
    const quadrados = []
    const pontuação = 0

    // Função recursiva para adicionar quadrados
    function criarTabuleiro(i = 0) {
    if (i >= width * width) return; // Condição de parada
    
    const quadrado = document.createElement('div');
    quadrado.innerHTML = 0;
    exibirGrade.appendChild(quadrado);
    quadrados.push(quadrado);

    // Chamada recursiva para o próximo índice
    criarTabuleiro(i + 1);
}

criarTabuleiro(); // Inicia a criação do tabuleiro

gerar();
gerar();


    //gerar número novo
    function gerar() {
        const numeroAleatorio = Math.floor(Math.random() * quadrados.length)
        console.log(numeroAleatorio)
        if (quadrados[numeroAleatorio].innerHTML == 0) {
            quadrados[numeroAleatorio].innerHTML = 2
            //verificarjogoacabou()
        } else gerar()
    }

    function moveRight(i = 0) {
        if (i >= 16) return; // Condição de parada
        
        if (i % 4 === 0) {
            const totalUm = quadrados[i].innerHTML;
            const totalDois = quadrados[i + 1].innerHTML;
            const totalTrês = quadrados[i + 2].innerHTML;
            const totalQuatro = quadrados[i + 3].innerHTML;
            const row = [parseInt(totalUm), parseInt(totalDois), parseInt(totalTrês), parseInt(totalQuatro)];
    
            const filtraLinhaVermelha = row.filter(num => num)
            const ausente = 4 - filtraLinhaVermelha.length
            const zeros = Array(ausente).fill(0)
            const novaLiha = zeros.concat(filtraLinhaVermelha)

            quadrados[i].innerHTML = novaLiha[0]
            quadrados[i+1].innerHTML = novaLiha[1]
            quadrados[i+2].innerHTML = novaLiha[2]
            quadrados[i+3].innerHTML = novaLiha[3]
        }
        // Chamada recursiva para o próximo índice
        moveRight(i + 1);
    }

    function conmbinarLinha() {
        for (let i = 0; i < 15; i++) {
            if (quadrados[i].innerHTML === quadrados[i+1].innerHTML){
                let totalCombinado = parseInt(quadrados[i].innerHTML) + parseInt(quadrados[i+1].innerHTML)
            quadrados[i].innerHTML = totalCombinado
            quadrados[i+1].innerHTML = 0
            pontuação += totalCombinado
            exibirPontuação.innerHTML = pontuação
            }
        }
        //verificar se ganhou()
    }

    // atribuir funções as teclas
    function controlar(e) {
        // Chamando as funções diretamente de acordo com a tecla pressionada
        const keyMap = {
            'ArrowLeft': keyLeft,
            'ArrowRight': keyRight
        };
    
        const action = keyMap[e.key];
        if (action) {
            action(); // Executa a ação correspondente
        }
    }
    
    document.addEventListener('keydown', controlar);
    
    function keyLeft() {
        // Executa as operações de forma encadeada
        moveLeft();
        conmbinarLinha();
        moveLeft();
        gerar();
    }
    
    function keyRight() {
        // Mesma estrutura que a esquerda
        moveRight();
        conmbinarLinha();
        moveRight();
        gerar();
    }
    

})