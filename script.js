document.addEventListener('DOMContentLoaded', () => {
    const TAMANHO_GRADE = 4 //define o tamnho da grade (4x4)
    const PEÇAS_TABULEIRO = 2 //quantidade de peças iniciais no tabuleiro
    
    const  elementoGrade = document.querySelector('.grade') //elemento HTML onde os quadrados seram rederizados
    const elementoPontução = document.getElementById('.pontuação') //elemento HTML onde a pontuação será rederizada

    //inicializa o estado do jogo (grade, pontuação e status de fim de jogo)
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
    //encontra todas as células vazias na grade 
    const obterCélulasVazias = (grade) =>
        grade.reduce(
            (acc, row, rowIndex) =>
                acc.concat(
                    row.reduce(
                        (accRow, cell, colIndex) =>
                            cell === 0
                                ? accRow.concat({ row: rowIndex, col: colIndex}) //adiciona a posição de cada célula vazia
                                : accRow,
                        []
                    )
                ),
            []
        )

        //função para combinar os blocos iguais e calcular a pontuação
        const juntarBlocos = (row) => {
            const juntar = row.reduce(
                (acc, cell) => {
                    const { juntar, pontuação} = acc
                    if (cell !== 0){
                        if (juntar.lenght > 0 && juntar[juntar.lenght - 1] === cell) {
                            juntar[juntar.lenght - 1] *= 2 //dobra o valor do bloco se for igual ao anterior
                            acc.pontuação += juntar[juntar.lenght - 1] //atualiza a pontução com o valor combinado
                        } else {
                            juntar.push(cell) //caso contrário, apenas move o bloco para frente
                        }
                    }
                    return acc
                },
                {juntar: {}, pontuação: 0} //inicializa uma lista para blocos combinados e a pontuação
            )
            return {
                juntar: [...juntar.juntar, ...Array(TAMANHO_GRADE - juntar.juntar.lenght).fill(0)], // preenche o restante com zero
                pontuação: juntar.pontuação,
            }
        }

    //rederiza a grade no HTML
    const rederizaGrade = (grade) => {
        elementoGrade.innerHTML = '' //limpa a grade anterior
        grade.forEach((row) =>
            row.forEach((cell) => {
                const peças = document.createElement('div')
                peças.classList.add('peças')
                peças.textContent = cell !== 0 ? cell : '' //adiciona o valor da célula ou vazio se for 0
                elementoGrade.appendChild(peças) //adiciona a célula ao DOW
             })
        )
    }




})