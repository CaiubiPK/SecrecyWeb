/**
 * SISTEMA DE COMBATE (COMPLETO)
 * Núcleo lógico das batalhas. Integra Mira, Efeitos, Inventário e UI.
 */

window.SistemaCombate = {

    Iniciar: function (inimigos) {
        console.log("✅ [COMBATE] Iniciando Batalha Completa...");

        try {
            window.EstadoJogo.Inimigos = inimigos.map(i => JSON.parse(JSON.stringify(i)));
        } catch (e) { console.error("Erro clone inimigos:", e); }

        window.EstadoJogo.Turno = 0;
        window.EstadoJogo.ItensUsadosNoTurno = 0;

        // Inicializa Baralho de Combate (5 cartas aleatórias do deck)
        this.ComprarMao();

        window.EstadoJogo.LogCombate = [];
        window.EstadoJogo.InimigoSelecionadoIndice = 0;

        this.AtualizarInterfaceCompleta();
        window.GerenciadorInterface.TrocarTela('tela-jogo');
    },

    ComprarMao: function () {
        // Inicializa Baralho de Combate com a lista solicitada pelo usuário
        if (!window.EstadoJogo.Deck || window.EstadoJogo.Deck.length === 0) {
            window.EstadoJogo.Deck = [];
            const cartasDB = window.BancoDeDados.Cartas;

            // Função helper para adicionar cartas por ID
            const addCartas = (id, qtd) => {
                const carta = cartasDB.find(c => c.id === id);
                if (carta) {
                    for (let i = 0; i < qtd; i++) window.EstadoJogo.Deck.push(JSON.parse(JSON.stringify(carta)));
                } else {
                    console.error(`Carta ID ${id} não encontrada!`);
                }
            };

            // Deck Inicial Solicitado (20 cartas)
            addCartas(1, 4); // Ataque Básico
            addCartas(2, 4); // Ataque Certeiro
            addCartas(3, 4); // Ataque Defensivo
            addCartas(4, 2); // Ataque Defensivo II
            addCartas(5, 2); // Erguer Escudo
            addCartas(6, 2); // Ataque Pesado
            addCartas(7, 1); // Ataque Preciso
            addCartas(8, 1); // Defesa Esmagadora
        }

        window.EstadoJogo.Mao = [];
        const deck = window.EstadoJogo.Deck;

        // Compra 5 cartas aleatórias DO DECK
        for (let i = 0; i < 5; i++) {
            if (deck.length === 0) break; // Deck acabou
            const randomIdx = Math.floor(Math.random() * deck.length);
            window.EstadoJogo.Mao.push(deck[randomIdx]);
            // Nota: Em um TCG real removeríamos do deck, mas aqui é simplificado
        }

        window.GerenciadorInterface.RenderizarMao();
    },

    /**
     * Tenta usar uma carta da mão
     */
    TentarUsarCarta: function (indiceCarta) {
        if (window.EstadoJogo.Turno !== 0) return;

        const carta = window.EstadoJogo.Mao[indiceCarta];
        if (!carta) return; // Proteção contra índice inválido

        const jogador = window.EstadoJogo.Jogadores[0];

        // 1. Verifica Custos
        if (jogador.energia < (carta.custoEnergia || 0) || jogador.mana < (carta.custoMana || 0)) {
            window.GerenciadorInterface.ExibirMensagem("Sem recursos!", "erro");
            return;
        }

        // 2. Inicia Mira (Targeting)
        window.SistemaMira.IniciarSelecao(carta, (alvos) => {
            // Callback Sucesso: Executa a ação
            this.ExecutarCarta(carta, alvos);

            // Remove da mão e descarta
            window.EstadoJogo.Mao.splice(indiceCarta, 1);
            window.GerenciadorInterface.RenderizarMao();
        });
    },

    ExecutarCarta: function (carta, alvos) {
        const jogador = window.EstadoJogo.Jogadores[0];

        // Consome recursos
        jogador.energia -= (carta.custoEnergia || 0);
        jogador.mana -= (carta.custoMana || 0);

        // Animação
        alvos.forEach(a => {
            const idAlvo = a.tipo === 'inimigo' ? `inimigo-${a.indice + 1}` : `jogador-${a.indice + 1}`;
            window.GerenciadorInterface.AnimarAtaque('jogador-1', idAlvo);
        });

        //Colocarsom - Som do Ataque ou Habilidade usada (INÍCIO DA AÇÃO)
        const somCast = carta.somCast || 'Audio/Combate/Ataque_Basico.mp3';
        window.GerenciadorAudio.TocarEfeito(somCast);

        // Delay Impacto
        setTimeout(() => {
            alvos.forEach(alvoDef => {
                const alvo = alvoDef.tipo === 'inimigo'
                    ? window.EstadoJogo.Inimigos[alvoDef.indice]
                    : window.EstadoJogo.Jogadores[alvoDef.indice];

                if (alvo.vida <= 0) return; // Ignora mortos

                // --- Lógica de Som Avançada (Impacto) ---
                let somImpacto = null;
                const materialAlvo = (alvo.sons && alvo.sons.material) ? alvo.sons.material : 'Carne';
                const vozAlvo = (alvo.sons && alvo.sons.voz) ? alvo.sons.voz : null;

                // Verifica Erro/Esquiva
                // (Para simplificar, vamos assumir que o cálculo de dano determina o resultado final,
                // mas idealmente saberíamos se errou antes. Aqui usamos o log de dano depois.)

                // Lógica de Efeito da Carta
                if (carta.efeito.danoMultiplicador) {
                    const chEhMagico = (carta.custoMana > 0);
                    // Suporte a Precisão Fixa (ex: Ataque Pesado tem 75% chance)
                    const precisaoOriginal = jogador.precisao;
                    if (carta.efeito.precisaoFixa) jogador.precisao = carta.efeito.precisaoFixa;

                    const resultado = this.CalcularDano(jogador, alvo, carta.efeito.danoMultiplicador, chEhMagico);

                    // Restaura Precisão
                    if (carta.efeito.precisaoFixa) jogador.precisao = precisaoOriginal;
                    if (resultado.sucesso) {
                        alvo.vida = Math.max(0, alvo.vida - resultado.dano);
                        window.GerenciadorInterface.MostrarIndicadorFlutuante(
                            alvoDef.tipo === 'inimigo' ? `inimigo-${alvoDef.indice + 1}` : `jogador-${alvoDef.indice + 1}`,
                            resultado.dano,
                            resultado.critico ? 'critico' : 'dano'
                        );

                        // --- SOM DE IMPACTO (DANO) ---
                        // 1. Som do material recebendo o golpe (Carne, Metal, etc.)
                        const tipoDano = carta.tipoDano || 'Corte'; // Pode vir da carta
                        if (tipoDano === 'Contusao' && materialAlvo === 'Metal') {
                            window.GerenciadorAudio.TocarEfeito('Impactos.Metal');
                        } else {
                            window.GerenciadorAudio.TocarEfeito(`Impactos.${materialAlvo}`);
                        }

                        // 2. Voz de Dor (se houver e tiver dano relevante)
                        if (vozAlvo && resultado.dano > 0) {
                            // Chance de gritar (não grita sempre para não poluir)
                            if (Math.random() > 0.3) window.GerenciadorAudio.TocarEfeito(`Vozes.${vozAlvo}.Dano`);
                        }

                        // 3. Som de Morte (se morreu)
                        if (alvo.vida <= 0 && vozAlvo) {
                            setTimeout(() => window.GerenciadorAudio.TocarEfeito(`Vozes.${vozAlvo}.Morte`), 200);
                        }

                        // Log de Ação
                        const nomeAlvo = alvo.nome || "Alvo";
                        const criticoTexto = resultado.critico ? " CRÍTICO" : "";
                        window.GerenciadorInterface.AdicionarAoLog(
                            `${jogador.nome} atacou ${nomeAlvo} com ${carta.nome}, causando ${resultado.dano}${criticoTexto} de dano`,
                            resultado.critico ? 'critico' : 'acao'
                        );
                    } else {
                        // --- SOM DE FALHA (ESQUIVA) ---
                        window.GerenciadorAudio.TocarEfeito('Impactos.Esquiva');
                        window.GerenciadorInterface.AdicionarAoLog(`${jogador.nome} errou o ataque em ${alvo.nome}!`, 'aviso');
                    }
                }

                // Aplica Status (Ex: Sangramento, Concussão, Rachadura)
                if (carta.efeito.status) {
                    // Normaliza para array para lidar com múltiplos status
                    const statusList = Array.isArray(carta.efeito.status) ? carta.efeito.status : [carta.efeito.status];
                    const niveisList = Array.isArray(carta.efeito.nivelStatus) ? carta.efeito.nivelStatus : [carta.efeito.nivelStatus || 1];
                    const duracaoList = Array.isArray(carta.efeito.duracaoStatus) ? carta.efeito.duracaoStatus : [carta.efeito.duracaoStatus || 2];

                    statusList.forEach((statusNome, idx) => {
                        const nivel = niveisList[idx] || 1; // Se array for menor, pega ultimo ou 1? Aqui assumo indices batem.
                        const duracao = duracaoList[idx] || 2;
                        const chance = carta.efeito.chanceAplicarStatus || 1.0; // Chance global por enquanto

                        // Verifica Chance
                        if (Math.random() <= chance) {
                            window.SistemaEfeitos.Adicionar(alvo, statusNome, duracao, nivel);
                            window.GerenciadorInterface.AdicionarAoLog(
                                `${jogador.nome} aplicou ${statusNome} (${nivel}) em ${alvo.nome}`,
                                'acao'
                            );
                        }
                    });
                }
            });

            // Lógica de Auto-Buff (Ex: Ataque Defensivo, Erguer Escudo)
            // Aplica no JOGADOR (ou quem usou a carta)
            if (carta.efeito.autoBuff) {
                const status = carta.efeito.autoBuff;
                const nivel = carta.efeito.nivelAutoBuff || 1;
                const duracao = carta.efeito.duracaoAutoBuff || 2;

                // Se tiver ValorAutoBuffExtra, teríamos que passar isso pro sistema de efeitos,
                // mas o sistema atual é baseado em NÍVEIS fixos no banco.
                // Para 'Erguer Escudo' que pediu boost extra, vamos confiar no nível definido ou criar um efeito novo se precisar.
                // O Nível 10 da Defesa é +45%. Se precisar de mais, aumente o nível no banco.

                window.SistemaEfeitos.Adicionar(jogador, status, duracao, nivel);
                window.GerenciadorInterface.AdicionarAoLog(
                    `${jogador.nome} ganhou ${status} (${nivel})`,
                    'buff'
                );
            }

            // Bônus Diretos (Cura ou Armadura imediata que não é status)
            if (carta.efeito.armaduraBonus || carta.efeito.protecaoMagicaBonus) {
                // Como sistema de RPG geralmente armadura é atributo base, isso seria um buff temporário?
                // Se for permanente na batalha, ok. Se for buff, deveria ser status.
                // Vou assumir que 'Erguer Escudo' dá status Fortificação E TAMBÉM um ganho temporário se fosse um escudo de HP,
                // mas a descrição diz "+15 Armadura". Vou aplicar como buff infinito até fim de combate se não tiver duração.
                // Mas pera, o sistema de recalculo Reseta atributos. Então tem que ser via EFEITO.
                // A carta 'Erguer Escudo' já tem 'AumentoDefesa'. O Texto "+15 Armadura" pode ser o efeito do nível 1.
                // Se for bônus, só funciona se o sistema de efeitos suportar modificadores arbitrários.
                // Por hora, vou ignorar bônus flat direto exceto se for cura.
            }

            if (carta.efeito.cura) {
                jogador.vida = Math.min(jogador.vidaMaxima, jogador.vida + carta.efeito.cura);
                window.GerenciadorInterface.MostrarIndicadorFlutuante('jogador-1', carta.efeito.cura, 'cura');
            }

            this.AtualizarInterfaceCompleta();
            const alguemGanhou = this.VerificarFimCombate();

            // Se a carta NÃO indica que mantém o turno, passa o turno automaticamente
            if (!carta.mantemTurno && window.EstadoJogo.Turno === 0 && !alguemGanhou) {
                setTimeout(() => this.PassarTurno(), 800);
            }
        }, 400);
    },

    CalcularDano: function (atacante, defensor, multiplicador, ehMagico) {
        // Lógica de Atributos Recalculados
        window.SistemaEfeitos.RecalcularAtributos(atacante);
        window.SistemaEfeitos.RecalcularAtributos(defensor);

        const chanceAcerto = (atacante.precisao || 100) - (defensor.esquiva || 0);
        if (Math.random() * 100 > chanceAcerto) return { sucesso: false };

        let danoBase = ehMagico ? (atacante.ataqueMagico || 0) : (atacante.ataque || 0);
        danoBase = Math.floor(danoBase * multiplicador);

        const chanceCrit = (atacante.chanceCritico || 5) + (atacante.sorte || 0);
        let critico = Math.random() * 100 < chanceCrit;
        if (critico) danoBase = Math.floor(danoBase * ((atacante.danoCritico || 150) / 100));

        const defesa = ehMagico ? (defensor.protecaoMagica || 0) : (defensor.armadura || 0);
        const redutora = defesa / (defesa + 100);

        let danoFinal = Math.floor(danoBase * (1 - redutora));
        danoFinal = Math.max(1, danoFinal);

        return { sucesso: true, dano: danoFinal, critico: critico };
    },

    PassarTurno: function () {
        if (window.EstadoJogo.Turno !== 0) return;

        // Fim do Turno do Jogador: Processa DoTs
        window.SistemaEfeitos.ProcessarTurno(window.EstadoJogo.Jogadores[0]);
        this.AtualizarInterfaceCompleta();

        if (window.EstadoJogo.Jogadores[0].vida <= 0) {
            this.GameOver();
            return;
        }

        window.EstadoJogo.Turno = 1;

        setTimeout(() => this.ExecutarTurnoInimigo(), 1000);
    },

    ExecutarTurnoInimigo: function () {
        const inimigosVivos = window.EstadoJogo.Inimigos.filter(i => i.vida > 0);

        if (inimigosVivos.length === 0) {
            this.VerificarFimCombate();
            return;
        }

        let delayTotal = 0;

        inimigosVivos.forEach((inimigo, index) => {
            // Verifica Atordoamento
            if (window.SistemaEfeitos.TemAtordoamento(inimigo)) {
                setTimeout(() => {
                    window.GerenciadorInterface.AdicionarAoLog(`${inimigo.nome} está atordoado e não pode agir`, 'status');
                    window.SistemaEfeitos.ProcessarTurno(inimigo);
                    this.AtualizarInterfaceCompleta();
                }, delayTotal);
                delayTotal += 1000;
                return;
            }

            // Ação normal
            setTimeout(() => {
                if (inimigo.vida > 0) {
                    const jogador = window.EstadoJogo.Jogadores[0];
                    window.GerenciadorInterface.AnimarAtaque(`inimigo-${window.EstadoJogo.Inimigos.indexOf(inimigo) + 1}`, 'jogador-1');

                    setTimeout(() => {
                        // Determina se é ataque mágico ou físico
                        const ehMagico = (inimigo.ataqueMagico || 0) > (inimigo.ataque || 0);
                        const res = this.CalcularDano(inimigo, jogador, 1.0, ehMagico);

                        if (res.sucesso) {
                            jogador.vida = Math.max(0, jogador.vida - res.dano);
                            window.GerenciadorInterface.MostrarIndicadorFlutuante('jogador-1', res.dano, res.critico ? 'critico' : 'dano');

                            //Colocarsom - Jogador Recebendo Dano / Dor
                            window.GerenciadorAudio.TocarEfeito('Audio/Combate/Jogador_Dano.mp3');

                            const criticoTexto = res.critico ? " CRÍTICO" : "";
                            window.GerenciadorInterface.AdicionarAoLog(
                                `${inimigo.nome} atacou ${jogador.nome}, causando ${res.dano}${criticoTexto} de dano`,
                                res.critico ? 'critico' : 'inimigo'
                            );
                        } else {
                            window.GerenciadorInterface.AdicionarAoLog(`${inimigo.nome} errou o ataque`, 'inimigo');
                        }

                        window.SistemaEfeitos.ProcessarTurno(inimigo); // Processa DoTs do inimigo
                        this.AtualizarInterfaceCompleta();

                        if (jogador.vida <= 0) this.GameOver();

                    }, 500);
                }
            }, delayTotal);

            delayTotal += 1500;
        });

        // Devolve turno após todos agirem
        setTimeout(() => {
            if (window.EstadoJogo.Jogadores[0].vida > 0) {
                window.EstadoJogo.Turno = 0;
                window.EstadoJogo.ItensUsadosNoTurno = 0;
                this.RegenerarRecursosJogador();
                this.ComprarMao(); // Repõe mão
                window.GerenciadorInterface.ExibirMensagem("Seu Turno!");
            }
        }, delayTotal + 500);
    },

    RegenerarRecursosJogador: function () {
        const p = window.EstadoJogo.Jogadores[0];
        p.energia = Math.min(p.energia + (p.regeneracaoEnergia || 5), p.energiaMaxima);
        p.mana = Math.min(p.mana + (p.regeneracaoMana || 2), p.manaMaxima);
        this.AtualizarInterfaceCompleta();
    },

    AtualizarInterfaceCompleta: function () {
        if (!window.GerenciadorInterface) return;

        const jogador = window.EstadoJogo.Jogadores[0];
        window.GerenciadorInterface.AtualizarStatus('jogador', jogador);

        // Atualiza apenas o inimigo selecionado no HUD
        const inimigoSel = window.EstadoJogo.Inimigos[window.EstadoJogo.InimigoSelecionadoIndice];
        if (inimigoSel && inimigoSel.vida > 0) {
            window.GerenciadorInterface.AtualizarStatus('inimigo', inimigoSel);
        } else {
            // Se o selecionado estiver morto, tenta pegar o primeiro vivo
            const primeiroVivo = window.EstadoJogo.Inimigos.find(i => i.vida > 0);
            if (primeiroVivo) {
                window.EstadoJogo.InimigoSelecionadoIndice = window.EstadoJogo.Inimigos.indexOf(primeiroVivo);
                window.GerenciadorInterface.AtualizarStatus('inimigo', primeiroVivo);
            }
        }

        window.GerenciadorInterface.RenderizarPersonagens(window.EstadoJogo.Jogadores, window.EstadoJogo.Inimigos);
    },

    VerificarFimCombate: function () {
        const inimigosVivos = window.EstadoJogo.Inimigos.some(i => i.vida > 0);
        if (!inimigosVivos) {
            window.EstadoJogo.Turno = -1;
            window.GerenciadorInterface.ExibirMensagem("VITÓRIA!", "vitoria");

            //Colocarsom - Música de Vitória
            window.GerenciadorAudio.TocarMusica(window.BancoDeDados.Audio.Musicas.Vitoria || 'Audio/Musicas/Vitoria.mp3');

            // Recompensa (Loot Simples)
            window.EstadoJogo.Jogadores[0].ouro += 50;

            setTimeout(() => {
                window.GerenciadorInterface.MostrarTelaVitoria({
                    ouro: 50,
                    xp: 100
                });
            }, 2000);
            return true;
        }
        return false;
    },

    ClicarAtacar: function () {
        window.GerenciadorInterface.AbrirSelecaoCartas('atacar');
    },

    ClicarHabilidade: function () {
        window.GerenciadorInterface.AbrirSelecaoCartas('habilidade');
    },

    GameOver: function () {
        window.EstadoJogo.Turno = -1;
        window.GerenciadorInterface.ExibirMensagem("DERROTA...", "erro");

        //Colocarsom - Som de Derrota / Game Over
        window.GerenciadorAudio.TocarEfeito('Audio/Sons/Interface/Fracasso.mp3');
        setTimeout(() => location.reload(), 3000);
    }
};
