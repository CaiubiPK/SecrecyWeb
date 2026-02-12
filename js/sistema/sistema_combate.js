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

        window.GerenciadorInterface.ExibirMensagem("Combate Iniciado!", "normal");
        this.AtualizarInterfaceCompleta();
        window.GerenciadorInterface.TrocarTela('tela-jogo');
    },

    ComprarMao: function () {
        // Lógica simplificada: Pega 5 cartas aleatórias do "Deck" do jogador
        // Idealmente: Deck > Cemitério > Embaralhar
        const deck = window.BancoDeDados.Cartas; // Todo: Usar deck personalizado do jogador
        window.EstadoJogo.Mao = [];
        for (let i = 0; i < 5; i++) {
            const carta = deck[Math.floor(Math.random() * deck.length)];
            window.EstadoJogo.Mao.push(JSON.parse(JSON.stringify(carta)));
        }
        window.GerenciadorInterface.RenderizarMao();
    },

    /**
     * Tenta usar uma carta da mão
     */
    TentarUsarCarta: function (indiceCarta) {
        if (window.EstadoJogo.Turno !== 0) {
            window.GerenciadorInterface.ExibirMensagem("Aguarde seu turno!", "erro");
            return;
        }

        const carta = window.EstadoJogo.Mao[indiceCarta];
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
        window.GerenciadorAudio.TocarEfeito('AtaqueBasico');

        // Delay Impacto
        setTimeout(() => {
            alvos.forEach(alvoDef => {
                const alvo = alvoDef.tipo === 'inimigo'
                    ? window.EstadoJogo.Inimigos[alvoDef.indice]
                    : window.EstadoJogo.Jogadores[alvoDef.indice];

                if (alvo.vida <= 0) return; // Ignora mortos

                // Lógica de Efeito da Carta
                if (carta.efeito.danoMultiplicador) {
                    const resultado = this.CalcularDano(jogador, alvo, carta.efeito.danoMultiplicador, !!carta.custoMana);
                    if (resultado.sucesso) {
                        alvo.vida = Math.max(0, alvo.vida - resultado.dano);
                        window.GerenciadorInterface.MostrarIndicadorFlutuante(
                            alvoDef.tipo === 'inimigo' ? `inimigo-${alvoDef.indice + 1}` : `jogador-${alvoDef.indice + 1}`,
                            resultado.dano,
                            resultado.critico ? 'critico' : 'dano'
                        );
                    }
                }

                // Aplica Status (Ex: Atordoamento, Veneno)
                if (carta.efeito.status) {
                    window.SistemaEfeitos.Adicionar(alvo, carta.efeito.status, carta.efeito.duracao || 2, 1);
                    window.GerenciadorInterface.ExibirMensagem(`Aplicou ${carta.efeito.status}!`);
                }
            });

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

        window.GerenciadorInterface.ExibirMensagem("Turno do Inimigo...");
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
                    window.GerenciadorInterface.ExibirMensagem(`${inimigo.nome} está atordoado!`);
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
                    window.GerenciadorInterface.ExibirMensagem(`${inimigo.nome} Ataca!`);
                    window.GerenciadorInterface.AnimarAtaque(`inimigo-${window.EstadoJogo.Inimigos.indexOf(inimigo) + 1}`, 'jogador-1');

                    setTimeout(() => {
                        const res = this.CalcularDano(inimigo, jogador, 1.0, false);
                        if (res.sucesso) {
                            jogador.vida = Math.max(0, jogador.vida - res.dano);
                            window.GerenciadorInterface.MostrarIndicadorFlutuante('jogador-1', res.dano, 'dano');
                        } else {
                            window.GerenciadorInterface.ExibirMensagem("Errou!");
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

        window.EstadoJogo.Inimigos.forEach((inimigo, idx) => {
            if (inimigo.vida > 0) {
                window.GerenciadorInterface.AtualizarStatus('inimigo', inimigo); // TODO: Suportar múltiplos HUDS
            }
        });

        window.GerenciadorInterface.RenderizarPersonagens(window.EstadoJogo.Jogadores, window.EstadoJogo.Inimigos);
    },

    VerificarFimCombate: function () {
        const inimigosVivos = window.EstadoJogo.Inimigos.some(i => i.vida > 0);
        if (!inimigosVivos) {
            window.EstadoJogo.Turno = -1;
            window.GerenciadorInterface.ExibirMensagem("VITÓRIA!", "vitoria");
            window.GerenciadorAudio.TocarMusica(window.BancoDeDados.Audio.Musicas.Vitoria);

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
        window.GerenciadorAudio.TocarEfeito('Fracasso');
        setTimeout(() => location.reload(), 3000);
    }
};
