document.addEventListener('DOMContentLoaded', () => {
    const TAMANHO_GRADE = 4 //define o tamanho da grade (4x4)
    const PEÇAS_TABULEIRO = 2 //quantidade de peças iniciais no tabuleiro

    const elementoGrade = document.querySelector('.grade') //elemento HTML onde os quadrados serão renderizados
    const elementoPontuacao = document.getElementById('pontuação') //elemento HTML onde a pontuação será renderizada

    // inicializa o estado do jogo (grade, pontuação e status de fim de jogo)
    const inicializar = () => {
        const grade = Array.from({ length: PEÇAS_TABULEIRO }).reduce(
            (acc) => adicionaBlocoAleatorio(acc),
            criarGradeVazia()
        )
        return Object.freeze({
            grade, //grade inicia com as peças posicionadas aleatoriamente
            pontuacao: 0, //pontuação inicial
            fimDeJogo: false, //o jogo começa sem estar finalizado
        })
    }

    // cria uma grade vazia (4x4) preenchida com zeros
    const criarGradeVazia = () =>
        Object.freeze([...Array(TAMANHO_GRADE)].map(() => Array(TAMANHO_GRADE).fill(0)))

    // adiciona uma peça (2 ou 4) em uma posição aleatória na grade
    const adicionaBlocoAleatorio = (grade) => {
        const célulasVazias = obterCélulasVazias(grade) //pega todas as células vazias
        if (célulasVazias.length === 0) return grade //se não houver células vazias, retorne grade

        const célulasAleatorias = célulasVazias[Math.floor(Math.random() * célulasVazias.length)]
        const novaGrade = grade.map((row, rowIndex) =>
            row.map((cell, colIndex) =>
                rowIndex === célulasAleatorias.row && colIndex === célulasAleatorias.col
                    ? Math.random() > 0.1 ? 2 : 4 //adiciona 2 (90%) ou 4 (10%) na célula escolhida
                    : cell
            )
        )
        return Object.freeze(novaGrade) //retorna uma grade imutável
    }

    // encontra todas as células vazias na grade
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

    // função para combinar os blocos iguais e calcular a pontuação
    const juntarBlocos = (row) => {
        const { juntar, pontuacao } = row.reduce(
            (acc, cell) => {
                if (cell !== 0) {
                    if (acc.juntar.length > 0 && acc.juntar[acc.juntar.length - 1] === cell) {
                        acc.juntar[acc.juntar.length - 1] *= 2 //dobra o valor do bloco se for igual ao anterior
                        acc.pontuacao += acc.juntar[acc.juntar.length - 1] //atualiza a pontuação com o valor combinado
                    } else {
                        acc.juntar.push(cell) //caso contrário, apenas move o bloco para frente
                    }
                }
                return acc
            },
            { juntar: [], pontuacao: 0 } //inicializa uma lista para blocos combinados e a pontuação
        )
        return {
            juntar: [...juntar, ...Array(TAMANHO_GRADE - juntar.length).fill(0)], //preenche o restante com zero
            pontuacao,
        }
    }

    // função para mover as peças na direção especificada
    const mover = (grade, direcao) => {
        const novaGrade = [...grade]
        const resultado = Array.from({ length: TAMANHO_GRADE }).reduce(
            (acc, _, i) => {
                const row = direcao === 'left' || direcao === 'right' ? grade[i] : grade.map((row) => row[i]) //movimentos horizontais ou verticais
                const rowInvertida = direcao === 'right' || direcao === 'down' ? row.reverse() : row //reverte se estiver indo para a direita ou para baixo
                const { juntar, pontuacao } = juntarBlocos(rowInvertida) //combina as peças e obtém a nova linha e pontuação
                const finalRow = direcao === 'right' || direcao === 'down' ? juntar.reverse() : juntar //reverte a linha se necessário

                const mudou = finalRow.every((val, index) => val === row[index]) //verifica se a linha mudou após a movimentação

                if (direcao === 'left' || direcao === 'right') {
                    novaGrade[i] = finalRow //atualiza a linha inteira para movimentos horizontais
                } else {
                    finalRow.forEach((val, idx) => (novaGrade[idx][i] = val)) //atualiza as colunas para movimentos verticais
                }

                acc.movimento = acc.movimento || !mudou //define se houve alguma movimentação
                acc.pontuacao += pontuacao //acumula a pontuação
                return acc
            },
            { movimento: false, pontuacao: 0 } //inicializa os acumuladores de movimento e pontuação
        )

        return { grade: Object.freeze(novaGrade), pontuacao: resultado.pontuacao, movimento: resultado.movimento } //retorna a nova grade imutável
    }

    // atualiza o estado do jogo e verifica o status de fim de jogo
    const atualizarEstado = (novoEstado) => {
        // cria um novo estado imutável, sem modificar o original diretamente
        const atualizarEstado = Object.freeze({
            grade: novoEstado.grade, //atualiza a grade com o novo estado
            pontuacao: novoEstado.pontuacao + (novoEstado.pontuacao || 0), // atualiza a pontuação acumulada
            fimDeJogo: checarFimDeJogo(novoEstado.grade), //verifica se o jogo acabou
        })

        // atualiza os elementos de interface de usuário (UI)
        elementoPontuacao.textContent = atualizarEstado.pontuacao //exibe a nova pontuação
        rederizaGrade(atualizarEstado.grade) //renderiza a nova grade na interface

        // verifica se o jogo acabou e exibe a mensagem de fim de jogo
        if (atualizarEstado.fimDeJogo) {
            document.getElementById('resultado').textContent = 'Fim de jogo! Reinicie o jogo para tentar novamente.'
        }

        // retorna o novo estado atualizado, para que possa ser reutilizado
        return atualizarEstado
    }

    // renderiza a grade no HTML
    const rederizaGrade = (grade) => {
        elementoGrade.innerHTML = '' //limpa a grade anterior
        grade.forEach((row) =>
            row.forEach((cell) => {
                const peças = document.createElement('div')
                peças.classList.add('peças')
                peças.textContent = cell !== 0 ? cell : '' //adiciona o valor da célula ou vazio se for 0
                elementoGrade.appendChild(peças) //adiciona a célula ao DOM
            })
        )
    }

    // verifica se o jogo acabou (não há mais movimentos possíveis)
    const checarFimDeJogo = (grade) => {
        if (obterCélulasVazias(grade).length > 0) return false //se houver células vazias, o jogo continua

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

        let novoEstado
        switch (e.key) {
            case 'ArrowUp':
                novoEstado = mover(estado.grade, 'up')
                break
            case 'ArrowDown':
                novoEstado = mover(estado.grade, 'down')
                break
            case 'ArrowLeft':
                novoEstado = mover(estado.grade, 'left')
                break
            case 'ArrowRight':
                novoEstado = mover(estado.grade, 'right')
                break
            default:
                return // Ignora se não for uma tecla válida
        }

        // Verifica se houve alguma mudança no tabuleiro
        if (novoEstado.movimento) {
            const gradeAtualizada = adicionaBlocoAleatorio(novoEstado.grade) // Adiciona uma nova peça aleatória
            estado = atualizarEstado({ grade: gradeAtualizada, pontuacao: novoEstado.pontuacao }) // Atualiza o estado do jogo
        }
    })

    let estado = inicializar() // Inicializa o estado do jogo
    rederizaGrade(estado.grade) // Renderiza a grade inicial
})
