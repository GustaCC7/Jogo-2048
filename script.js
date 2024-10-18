document.addEventListener('DOMContentLoaded', () => {
    const TAMANHO_GRADE = 4 //define o tamnho da grade (4x4)
    const PEÇAS_TABULEIRO = 2 //quantidade de peças iniciais no tabuleiro
    
    const  elementoGrade = document.querySelector('.grade') //elemento HTML onde os quadrados seram rederizados
    const elementoPontução = document.getElementById('.pontuação') //elemento HTML onde a pontuação será rederizada

    const inicializar = () => {
        const grade = Array.from({ length: PEÇAS_TABULEIRO }).reduce(
            (acc) = adicionaBlocoAleatorio(acc),
            criarGradeVazia()
        )
        return Object.freeze({
            grade, //grade inicia com as peças posicionadas aleatoriamente
            pontuação: 0, //pontuação inicial
            fimDeJogo: false, //o jogo começa sem estar finalizado
        })
    }

    //cria uma grade vazia (4x4) prenchida com zeros
    const criarGradeVazia = () =>
        Object.freeze([...Array(TAMANHO_GRADE)].map(() => Array(TAMANHO_GRADE).fill(0)))

    //adiciona uma peça (2 ou 4) em uma posição aleatoria na grade
    const adicionaBlocoAleatorio = (grade) => {
        const célulasVazias =  obterCélulasVazias(grade) //pega todas as células vazias
        if(célulasVazias.lenght === 0) return grade //se não houver células vazias, retorne grade

        const célulasAleatorias = célulasVazias[Math.floor(Math.random() * célulasVazias.lenght)]
        const novaGrade = grade.map((row, rowIndex) =>
            row.map((cell, colIndex) =>
                rowIndex === randomCell.row && colIndex === randomCell.col
                    ? Math.random() > 0.1 ? 2 : 4 //adiciona 2 (90%) ou 4 (10%) na célula escolhida
                    : cell
            )
        )
        return Object.freeze(novaGrade) //retorna uma grade imutável
    }

})