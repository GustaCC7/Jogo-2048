document.addEventListener('DOMContentLoaded', () => {
    const TAMANHO_GRADE = 4 // Define o tamanho da grade (4x4)
    const PEÇAS_TABULEIRO = 2 // Quantidade de peças iniciais no tabuleiro

    const elementoGrade = document.querySelector('.grade') // Elemento HTML onde os quadrados serão renderizados
    const elementoPontuacao = document.getElementById('pontuação') // Elemento HTML onde a pontuação será renderizada

    // Inicializa o estado do jogo (grade, pontuação e status de fim de jogo)
    const inicializar = () => {
        const grade = Array.from({ length: PEÇAS_TABULEIRO }).reduce(
            (acc) => adicionaBlocoAleatorio(acc),
            criarGradeVazia()
        )
        return Object.freeze({
            grade, // Grade inicia com as peças posicionadas aleatoriamente
            pontuacao: 0, // Pontuação inicial
            fimDeJogo: false, // O jogo começa sem estar finalizado
        })
    }

    // Cria uma grade vazia (4x4) preenchida com zeros
    const criarGradeVazia = () =>
        Object.freeze([...Array(TAMANHO_GRADE)].map(() => Array(TAMANHO_GRADE).fill(0)))

    // Adiciona uma peça (2 ou 4) em uma posição aleatória na grade
    const adicionaBlocoAleatorio = (grade) => {
        const célulasVazias = obterCélulasVazias(grade) // Pega todas as células vazias
        if (célulasVazias.length === 0) return grade // Se não houver células vazias, retorne grade

        const célulasAleatorias = célulasVazias[Math.floor(Math.random() * célulasVazias.length)]
        const novaGrade = grade.map((row, rowIndex) =>
            row.map((cell, colIndex) =>
                rowIndex === célulasAleatorias.row && colIndex === célulasAleatorias.col
                    ? Math.random() > 0.1 ? 2 : 4 // Adiciona 2 (90%) ou 4 (10%) na célula escolhida
                    : cell
            )
        )
        return Object.freeze(novaGrade) // Retorna uma grade imutável
    }

    // Encontra todas as células vazias na grade
    const obterCélulasVazias = (grade) =>
        grade.reduce(
            (acc, row, rowIndex) =>
                acc.concat(
                    row.reduce(
                        (accRow, cell, colIndex) =>
                            cell === 0 ? accRow.concat({ row: rowIndex, col: colIndex }) : accRow,
                        []
                    )
                ),
            []
        )

    // Função para combinar os blocos iguais e calcular a pontuação
    const juntarBlocos = (row) => {
        const { juntar, pontuacao } = row.reduce(
            (acc, cell) => {
                if (cell !== 0) {
                    if (acc.juntar.length > 0 && acc.juntar[acc.juntar.length - 1] === cell) {
                        acc.juntar[acc.juntar.length - 1] *= 2 // Dobra o valor do bloco se for igual ao anterior
                        acc.pontuacao += acc.juntar[acc.juntar.length - 1] // Atualiza a pontuação com o valor combinado
                    } else {
                        acc.juntar.push(cell) // Caso contrário, apenas move o bloco para frente
                    }
                }
                return acc
            },
            { juntar: [], pontuacao: 0 } // Inicializa uma lista para blocos combinados e a pontuação
        )
        return {
            juntar: [...juntar, ...Array(TAMANHO_GRADE - juntar.length).fill(0)], // Preenche o restante com zero
            pontuacao,
        }
    }

    // Função para mover as peças na direção especificada e acumular a pontuação corretamente
    const mover = (grade, direcao) => {
        const novaGrade = grade.map((row) => [...row]) // Cópia da grade para trabalhar nela
        const resultado = Array.from({ length: TAMANHO_GRADE }).reduce(
            (acc, _, i) => {
                const row = direcao === 'left' || direcao === 'right' ? novaGrade[i] : novaGrade.map((row) => row[i])
                const rowInvertida = direcao === 'right' || direcao === 'down' ? row.reverse() : row
                const { juntar, pontuacao } = juntarBlocos(rowInvertida)

                const finalRow = direcao === 'right' || direcao === 'down' ? juntar.reverse() : juntar
                const mudou = finalRow.some((val, index) => val !== row[index]) // Verifica se a linha mudou

                if (direcao === 'left' || direcao === 'right') {
                    novaGrade[i] = finalRow // Atualiza a linha inteira para movimentos horizontais
                } else {
                    finalRow.forEach((val, idx) => (novaGrade[idx][i] = val)) // Atualiza as colunas para movimentos verticais
                }

                acc.movimento = acc.movimento || mudou // Define se houve movimentação
                acc.pontuacao += pontuacao // Acumula a pontuação corretamente
                return acc
            },
            { movimento: false, pontuacao: 0 } // Inicializa os acumuladores de movimento e pontuação
        )

        return { grade: Object.freeze(novaGrade), pontuacao: resultado.pontuacao, movimento: resultado.movimento }
    }

    // Atualiza o estado do jogo, garantindo a pontuação e fim de jogo
    const atualizarEstado = (novoEstado) => {
        const estadoAtualizado = Object.freeze({
            grade: novoEstado.grade,
            pontuacao: estado.pontuacao + novoEstado.pontuacao, // Somando a pontuação corretamente
            fimDeJogo: checarFimDeJogo(novoEstado.grade), // Verifica se o jogo terminou
        })

        elementoPontuacao.textContent = estadoAtualizado.pontuacao // Exibe a nova pontuação
        rederizaGrade(estadoAtualizado.grade) // Renderiza a nova grade

        if (estadoAtualizado.fimDeJogo) {
            document.getElementById('resultado').textContent = 'Fim de jogo! Reinicie o jogo para tentar novamente.'
        }

        return estadoAtualizado
    }

    const coresPecas = {
        2: '#eee4da',
        4: '#ede0c8',
        8: '#f2b179',
        16: '#f59563',
        32: '#f67c5f',
        64: '#f65e3b',
        128: '#edcf72',
        256: '#edcc61',
        512: '#edc850',
        1024: '#edc53f',
        2048: '#edc22e',
        maior: '#3c3a32' // Cor para valores maiores que 2048
    }
    
    // Renderiza a grade no HTML
    const rederizaGrade = (grade) => {
        elementoGrade.innerHTML = '' // Limpa a grade anterior
        grade.forEach((row) =>
            row.forEach((cell) => {
                const peças = document.createElement('div')
    
                // Adiciona a cor correspondente ao valor da célula
                if (cell !== 0) {
                    peças.textContent = cell // Adiciona o valor da célula
                    peças.style.backgroundColor = coresPecas[cell] || coresPecas.maior // Aplica a cor conforme o valor, usa "maior" para valores > 2048
                    peças.style.color = cell > 4 ? 'white' : '#776e65' // Cor do texto, branco para valores maiores
                } else {
                    peças.textContent = '' // Celula vazia
                    peças.style.backgroundColor = '#cdc1b4' // Cor padrão para células vazias
                }
    
                peças.style.borderRadius = '5px' // Aplicando estilo básico
                peças.style.display = 'flex'
                peças.style.justifyContent = 'center'
                peças.style.alignItems = 'center'
                peças.style.fontSize = '30px'
                peças.style.fontWeight = 'bold'
                peças.style.width = '100px'
                peças.style.height = '100px'
    
                elementoGrade.appendChild(peças) // Adiciona a célula ao DOM
            })
        )
    }
    

    // Verifica se o jogo acabou (não há mais movimentos possíveis)
    const checarFimDeJogo = (grade) => {
        if (obterCélulasVazias(grade).length > 0) return false // Se houver células vazias, o jogo continua

        return !grade.some((row, rowIndex) =>
            row.some(
                (cell, colIndex) =>
                    (colIndex < TAMANHO_GRADE - 1 && cell === row[colIndex + 1]) ||
                    (rowIndex < TAMANHO_GRADE - 1 && cell === grade[rowIndex + 1][colIndex])
            )
        )
    }

    // Captura os comandos do teclado para movimentar as peças
    document.addEventListener('keydown', (e) => {
        if (estado.fimDeJogo) return // Se o jogo acabou, não faz nada

        const novoEstado = e.key === 'ArrowUp'
            ? mover(estado.grade, 'up')
            : e.key === 'ArrowDown'
            ? mover(estado.grade, 'down')
            : e.key === 'ArrowLeft'
            ? mover(estado.grade, 'left')
            : e.key === 'ArrowRight'
            ? mover(estado.grade, 'right')
            : null

        if (novoEstado && novoEstado.movimento) {
            const gradeAtualizada = adicionaBlocoAleatorio(novoEstado.grade) // Adiciona uma nova peça aleatória
            estado = atualizarEstado({ grade: gradeAtualizada, pontuacao: novoEstado.pontuacao }) // Atualiza o estado do jogo
        }
    })

    estado = inicializar() // Inicializa o estado do jogo
    rederizaGrade(estado.grade) // Renderiza a grade inicial
})
