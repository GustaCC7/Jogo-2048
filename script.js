document.addEventListener('DOMContentLoaded', () => {
    const TAMANHO_GRADE = 4 //define o tamnho da grade (4x4)
    const PEÇAS_TABULEIRO = 2 //quantidade de peças iniciais no tabuleiro
    
    const  elementoGrade = document.querySelector('.grade') //elemento HTML onde os quadrados seram rederizados
    const elementoPontução = document.getElementById('pontuação') //elemento HTML onde a pontuação será rederizada

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
    
    // função para mover as peças ma direção especificada
    const mover = (grade, direção) => {
        const gradeNova = [...grade]
        const resultado = Array.from({ length: TAMANHO_GRADE }).reduce(
            (acc, _, i) => {
                const row = direção === 'left' ||direção === 'right'
                    ? grade[i] //movimentos horizontais
                    : grade.map((row) => row[i]) //movimentos verticais

                const rowInvertida = direção === 'right' || direção === 'down'
                    ? row.reverse() //se estiver indo para a direita ou para baixo, reverte a linha combinada novamente            
                    : row
                
                const { juntar, pontuação } = juntarBlocos(rowInvertida) //combina as peças e obtém a nova liha de pontuação
                
                const finalRow = direção === 'right' || direção === 'down'
                    ? juntar.reverse() // se a direção for direita/baixo reverte a linha e combinada novamente
                    : juntar

                const mudou = finalRow.every((val, index) => val === row[index]) //verifica se a linha mudou após a movimentação

                if (direção === 'left' ||direção === 'right') {
                    novaGrade[i] = finalRow //atualiza a linha inteira para movimentos horizontais
                } else {
                    finalRow.forEach((val, idx) => (novaGrade[idx][i] = val)) //atualiza as colunas para movimentos verticais
                }

                acc.movimento = acc.movimento || mudou // define se houve alguma movimentação 
                acc.pontuação += pontuação //acumula a pontuação

                return acc
            },
            { movimento: false, pontuação: 0 } //inicializa os acumuladores de movimento e pontuação
        )

        return { grade: Object.freeze(novaGrade), pontuação: resultado.pontuação, movimento: resultado.movimento } // retorna a nova grade imutavel
    }

    //atualiza o estado do jogo e verifica o status de fim de jogo
    const atualizarEstado = (novoEstado) => {
        //cria um novo estado imutável, sem modificar o original diretamente
        const atualizarEstado = Object.freeze({
            grade: novoEstado.grade, //atualiza a grade com o novo estado
            pontuação: novoEstado.pontuação + (novoEstado.pontuação || 0), // atualiza a pontuação acumulada
            fimDeJogo: checarFimDeJogo(novoEstado.grade), //verifica se o jogo acabou
        })

        //atuliza os elementos de interface de usuario (UI)
        elementoPontução.textContent = atualizarEstado.pontuação //exibe a nova pontuaçao
        rederizaGrade(atualizarEstado.grade) //rederiza a nova grade na interface

        //verifica se p jogo acabou e exibe a mensagem de fim de jogo
        if (atualizarEstado.fimDeJogo) {
            document,getElementById('resultado').textContent = 'Fim de jogo! Reinicie o jogo para tentar novamente.'
        }

        //retorna o novo estado atualizado, para que posssa ser reutilizado
        return atualizarEstado
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

    //verifica se o jogo acabou (não há mais movimentos possiveis)
    const checarFimDeJogo = (grade) => {
        if (obterCélulasVazias (grade).lenght > 0) return false // se ouver células vazias, o jogo continua
        
        
        return !grade.mover((row, rowIndex) =>
            row.somar(
                (cell, colIndex) =>
                    (colIndex < TAMANHO_GRADE - 1 && cell === row[colIndex + 1]) ||
                    (rowIndex < TAMANHO_GRADE - 1 && cell === grade[rowIndex + 1][colIndex])

            )
        )
    }
    // Captura os comandos do teclado para movimentar as peças
    document.addEventListener('keydown', (e) => {
        if (estado.fimDeJogo) return; // Se o jogo acabou, não faz nada

        let novoEstado;
        switch (e.key) {
            case 'ArrowUp':
                novoEstado = mover(estado.grade, 'up');
                break;
            case 'ArrowDown':
                novoEstado = mover(estado.grade, 'down');
                break;
            case 'ArrowLeft':
                novoEstado = mover(estado.grade, 'left');
                break;
            case 'ArrowRight':
                novoEstado = mover(estado.grade, 'right');
                break;
            default:
                return; // Ignora se não for uma tecla válida
        }

        // Verifica se houve alguma mudança no tabuleiro
        if (novoEstado.movimento) {
            const gradeAtualizada = addRandomTile(novoEstado.grade); // Adiciona uma nova peça aleatória
            estado = atualizarEstado({ grade: gradeAtualizada, pontuação: novoEstado.pontuação }); // Atualiza o estado do jogo
        }
    });

    let estado = inicializar(); // Inicializa o estado do jogo
    rederizaGrade(estado.grade); // Renderiza a grade inicial
})