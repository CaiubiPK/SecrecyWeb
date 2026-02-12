
// ==========================================
// COMBAT.JS - Lógica de Batalha
// ==========================================

window.Combate = {
    Iniciar: function (inimigos) {
        Utils.Log("Combate.Iniciar");

        EstadoDoJogo.inimigos = inimigos.map(i => ({ ...i }));
        EstadoDoJogo.inimigoAtual = EstadoDoJogo.inimigos[0];
        EstadoDoJogo.inimigoFoco = 0;
        EstadoDoJogo.alvoSelecionado = 0;

        // Controle de Turno e Itens
        EstadoDoJogo.itensUsadosNoTurno = 0;
        EstadoDoJogo.facasGastas = 0;

        // Inicializar Log de Combate
        EstadoDoJogo.logCombate = [];
        UI.LimparLog();

        // Setup Inicial
        this.SnapshotAtributos();

        // MODO DEPURAÇÃO: Encher inventário com itens variados
        if (EstadoDoJogo.jogadores.length > 0 && BancoDeDados.Itens) {
            const lider = EstadoDoJogo.jogadores[0];
            if (!lider.inventario) lider.inventario = new Array(12).fill(null);

            // Itens para teste
            const itensTeste = [
                BancoDeDados.Itens.find(i => i.nome === "Poção de Vida Média"),
                BancoDeDados.Itens.find(i => i.nome === "Poção de Mana Média"),
                BancoDeDados.Itens.find(i => i.nome === "Poção de Energia Média"),
                BancoDeDados.Itens.find(i => i.nome === "Poção de Ataque Pequena"),
                BancoDeDados.Itens.find(i => i.nome === "Facas de Arremesso"),
                BancoDeDados.Itens.find(i => i.nome === "Óleo Rúnico"),
                BancoDeDados.Itens.find(i => i.nome === "Poção Misteriosa"),
                BancoDeDados.Itens.find(i => i.nome === "Poção de Veneno"),
                BancoDeDados.Itens.find(i => i.nome === "Poção de Defesa Pequena"),
                BancoDeDados.Itens.find(i => i.nome === "Poção de Vida Grande"),
                BancoDeDados.Itens.find(i => i.nome === "Poção de Ataque Grande"),
                BancoDeDados.Itens.find(i => i.nome === "Facas de Arremesso")
            ];

            lider.inventario = itensTeste.map(i => i ? { ...i } : null);
        }

        this.OcultarSlotsVazios();

        UI.AtualizarInterface();
        UI.TrocarTela('tela-jogo');

        // Resetar Turno
        this.IniciarTurnoJogador();
    },

    OcultarSlotsVazios: function () {
        Utils.Log('Combate.OcultarSlotsVazios');

        // Ocultar slots de jogadores não utilizados
        const totalJogadores = EstadoDoJogo.jogadores.length;
        for (let i = 1; i <= 3; i++) {
            const el = document.getElementById(`jogador-${i}`);
            if (el) {
                if (i <= totalJogadores) {
                    el.classList.remove('oculta');
                    // Configurar visual
                    const jogador = EstadoDoJogo.jogadores[i - 1];
                    const visual = el.querySelector('.visual-personagem');
                    const nome = el.querySelector('.nome-personagem');
                    if (visual) visual.style.backgroundImage = `url('${jogador.imagem || "Images/Personagens/Jogador.png"}')`;
                    if (nome) {
                        nome.textContent = jogador.ehPrincipal
                            ? jogador.nome
                            : `${jogador.nome} Nvl ${jogador.nivel || 1}`;
                    }
                } else {
                    el.classList.add('oculta');
                }
            }
        }

        // Ocultar slots de inimigos não utilizados
        const totalInimigos = EstadoDoJogo.inimigos.length;
        for (let i = 1; i <= 3; i++) {
            const el = document.getElementById(`inimigo-${i}`);
            if (el) {
                if (i <= totalInimigos) {
                    el.classList.remove('oculta');
                    // Configurar visual
                    const inimigo = EstadoDoJogo.inimigos[i - 1];
                    const visual = el.querySelector('.visual-personagem');
                    const nome = el.querySelector('.nome-personagem');
                    if (visual) visual.style.backgroundImage = `url('${inimigo.imagem || "Images/FotoDr.jpeg"}')`;
                    if (nome) {
                        nome.textContent = inimigo.ehPrincipal
                            ? inimigo.nome
                            : `${inimigo.nome} Nvl ${inimigo.nivel || 1}`;
                    }
                } else {
                    el.classList.add('oculta');
                }
            }
        }
    },

    SnapshotAtributos: function () {
        // Salva estado base para cálculos de buffs/debuffs
        // Jogadores
        EstadoDoJogo.jogadores.forEach(p => {
            p.efeitos = [];
            p.baseStatus = { ...p }; // Shallow copy das propriedades primitivas
        });
        // Inimigos
        EstadoDoJogo.inimigos.forEach(i => {
            i.efeitos = [];
            i.baseStatus = { ...i };
        });
    },

    IniciarTurnoJogador: function () {
        Utils.Log("Turno Jogador");
        EstadoDoJogo.turno = 0;
        EstadoDoJogo.itensUsadosNoTurno = 0; // Resetar contador de itens
        const lider = EstadoDoJogo.jogadores[0];

        // Regeneração
        const bonusVigor = (lider.vigor / 200) * 0.5; // Simplificado
        const regenVida = Math.floor(lider.regeneracaoVida * (1 + bonusVigor));

        lider.vida = Math.min(lider.vida + regenVida, lider.vidaMaxima);
        lider.energia = Math.min(lider.energia + Math.floor(lider.vigor * 0.1), lider.energiaMaxima);
        lider.mana = Math.min(lider.mana + lider.regeneracaoMana, lider.manaMaxima);

        if (regenVida > 0) UI.MostrarIndicadorDano('jogador-1', regenVida, 'cura');

        UI.ExibirMensagem("Seu Turno! Energias Recuperadas.");
        UI.AtualizarInterface();
    },

    UsarItem: function (indexItem) {
        // Verifica se é turno do jogador
        if (EstadoDoJogo.turno !== 0) {
            UI.ExibirMensagem("Não é seu turno!", "erro");
            return;
        }

        const jogador = EstadoDoJogo.jogadores[0];
        const item = jogador.inventario[indexItem];

        if (!item) return;

        // Regra: Pode usar até 2 itens sem passar a vez. O 3º item passa a vez automaticamente.
        if (EstadoDoJogo.itensUsadosNoTurno >= 3) {
            UI.ExibirMensagem("Você já usou muitos itens neste turno!", "erro");
            return;
        }

        // --- Lógica de Efeitos do Item ---
        let usouComSucesso = true;

        // 1. Itens Especiais com Lógica Customizada
        if (item.efeito && item.efeito.especial) {
            if (item.efeito.especial === "FacasArremesso") {
                // Ataca inimigo aleatório ou focado
                const alvo = EstadoDoJogo.inimigos.find(i => i.vida > 0); // Simplificado: Primeiro vivo
                if (alvo) {
                    // Dano: 90% a 125% do Ataque
                    const fator = 0.9 + (Math.random() * 0.35);
                    const dano = Math.floor(jogador.ataque * fator);
                    alvo.vida = Math.max(0, alvo.vida - dano);

                    const idAlvo = Efeitos.ObterIdVisual(alvo);
                    UI.AnimarAtaque('jogador-1', idAlvo);
                    UI.MostrarIndicadorDano(idAlvo, dano, 'dano');
                    UI.ExibirMensagem(`Arremessou faca em ${alvo.nome}!`);

                    // Chances de Sangramento
                    const chance = Math.random() * 100;
                    if (chance < 5) Efeitos.Adicionar(alvo, "Sangramento", 2, 3);
                    else if (chance < 8 + 5) Efeitos.Adicionar(alvo, "Sangramento", 2, 2);
                    else if (chance < 12 + 8 + 5) Efeitos.Adicionar(alvo, "Sangramento", 2, 1);

                    EstadoDoJogo.facasGastas++;
                } else {
                    UI.ExibirMensagem("Sem alvos!", "erro");
                    usouComSucesso = false;
                }
            }
            else if (item.efeito.especial === "OleoRunico") {
                const chance = Math.random() * 100;
                let nivel = 0;
                if (chance < 40) nivel = 1;
                else if (chance < 70) nivel = 2; // 40 + 30
                else if (chance < 85) nivel = 3; // 70 + 15

                if (nivel > 0) {
                    Efeitos.Adicionar(jogador, "ArmaCombustao", 3, nivel);
                    UI.ExibirMensagem(`Arma em chamas Nvl ${nivel}!`);
                } else {
                    UI.ExibirMensagem("O óleo falhou...", "erro");
                }
            }
            else if (item.efeito.especial === "PocaoVeneno") {
                const chance = Math.random() * 100;
                let nivel = 0;
                if (chance < 40) nivel = 1;
                else if (chance < 70) nivel = 2;
                else if (chance < 85) nivel = 3;

                if (nivel > 0) {
                    Efeitos.Adicionar(jogador, "ArmaEnvenenada", 3, nivel);
                    UI.ExibirMensagem(`Arma envenenada Nvl ${nivel}!`);
                } else {
                    UI.ExibirMensagem("O veneno falhou...", "erro");
                }
            }
            else if (item.efeito.especial === "PocaoMisteriosa") {
                const numEfeitos = 1 + Math.floor(Math.random() * 3); // 1 a 3
                const possiveis = [
                    { nome: "BuffDefesa", prob: 0.05, nivel: 1 },
                    { nome: "BuffDivino", prob: 0.05, nivel: 1 },
                    { nome: "BuffAtaque", nivel: 1 },
                    { nome: "Regeneracao", nivel: 1 },
                    { nome: "RegeneracaoMana", nivel: 1 },
                    { nome: "Envenenamento", nivel: 1 },
                    { nome: "Combustão", nivel: 1 }
                ];

                UI.ExibirMensagem("Bebendo poção misteriosa...");
                for (let i = 0; i < numEfeitos; i++) {
                    const sorteado = possiveis[Math.floor(Math.random() * possiveis.length)];
                    Efeitos.Adicionar(jogador, sorteado.nome, 2, sorteado.nivel);
                }
            }
        }
        // 2. Itens Padrão (Cura, Mana, Buffs)
        else {
            if (item.efeito && item.efeito.status) {
                Efeitos.Adicionar(jogador, item.efeito.status, item.efeito.duracao || 2, item.efeito.nivel || 1);
            }

            if (item.efeito && item.efeito.curaPct) {
                const valor = Math.floor(jogador.vidaMaxima * item.efeito.curaPct);
                jogador.vida = Math.min(jogador.vidaMaxima, jogador.vida + valor);
                UI.MostrarIndicadorDano('jogador-1', valor, 'cura');
            }
            if (item.efeito && item.efeito.manaPct) {
                const valor = Math.floor(jogador.manaMaxima * item.efeito.manaPct);
                jogador.mana = Math.min(jogador.manaMaxima, jogador.mana + valor);
                UI.MostrarIndicadorDano('jogador-1', valor, 'cura');
            }
            if (item.efeito && item.efeito.energiaPct) {
                const valor = Math.floor(jogador.energiaMaxima * item.efeito.energiaPct);
                jogador.energia = Math.min(jogador.energiaMaxima, jogador.energia + valor);
                UI.MostrarIndicadorDano('jogador-1', valor, 'cura');
            }

            // Descrição genérica
            UI.ExibirMensagem(`Usou ${item.nome}!`);
        }

        if (usouComSucesso) {
            // Consumir
            if (item.tipo === 'consumivel' || item.tipo === 'consumivel-dano') {
                jogador.inventario[indexItem] = null;
                UI.RenderizarInventario(); // Atualiza visual do inventário
                // Se o inventário estiver aberto, re-seleciona para limpar detalhes
                UI.SelecionarItemInventario(null, indexItem);
            }

            EstadoDoJogo.itensUsadosNoTurno++;

            // Verifica passiva de turno
            if (EstadoDoJogo.itensUsadosNoTurno >= 3) {
                UI.ExibirMensagem("Exaustão! Turno Encerrado.");
                this.PassarTurno();
            } else {
                UI.ExibirMensagem(`${3 - EstadoDoJogo.itensUsadosNoTurno} usos de itens restantes.`);
            }

            UI.AtualizarInterface();
        }
    },

    AplicarEfeitosOnHit: function (atacante, defensor) {
        if (!atacante.efeitos) return;

        atacante.efeitos.forEach(eff => {
            if (eff.nome === "ArmaCombustao") {
                const def = BancoDeDados.Efeitos.ArmaCombustao.niveis[eff.nivel];
                if (Math.random() < def.chanceAplicar) {
                    Efeitos.Adicionar(defensor, "Combustão", 3, def.nivelAplicar);
                    UI.ExibirMensagem("Inimigo incendiado!");
                }
            }
            if (eff.nome === "ArmaEnvenenada") {
                const def = BancoDeDados.Efeitos.ArmaEnvenenada.niveis[eff.nivel];
                if (Math.random() < def.chanceAplicar) {
                    Efeitos.Adicionar(defensor, "Envenenamento", 3, def.nivelAplicar);
                    UI.ExibirMensagem("Inimigo envenenado!");
                }
            }
        });
    },

    PassarTurno: function () {
        if (!confirm("Encerrar turno?")) return;

        // Processar efeitos Fim de Turno Jogador
        EstadoDoJogo.jogadores.forEach(j => {
            if (j.vida > 0) Efeitos.ProcessarTurno(j);
        });

        UI.AtualizarInterface();

        if (this.VerificarFimCombate()) return;

        EstadoDoJogo.turno = 1;
        setTimeout(() => this.TurnoInimigo(), 1000);
    },

    TurnoInimigo: function () {
        Utils.Log("Turno Inimigo");

        // Processar Efeitos Início Turno Inimigo
        EstadoDoJogo.inimigos.forEach(i => {
            if (i.vida > 0) Efeitos.ProcessarTurno(i);
        });

        // Filtrar ativos
        const ativos = EstadoDoJogo.inimigos.filter(i => i.vida > 0 && !Efeitos.TemAtordoamento(i));

        if (ativos.length === 0) {
            UI.ExibirMensagem("Inimigos atordoados ou mortos!");
            setTimeout(() => this.IniciarTurnoJogador(), 1000);
            return;
        }

        // Executar ataques em sequência
        let index = 0;
        const ExecutarProximo = () => {
            if (index >= ativos.length) {
                setTimeout(() => this.IniciarTurnoJogador(), 1000);
                return;
            }

            const inimigo = ativos[index];
            const alvo = EstadoDoJogo.jogadores[0]; // Simplificação: Foca no Líder

            if (alvo.vida > 0) {
                const idAtacante = Efeitos.ObterIdVisual(inimigo);
                const idAlvo = 'jogador-1';

                if (inimigo.ehPrincipal) {
                    UI.ExibirMensagem(`${inimigo.nome} prepara ataque!`);
                }

                UI.AnimarAtaque(idAtacante, idAlvo);

                setTimeout(() => {
                    const res = this.CalcularDano(inimigo, alvo, 1.0, false);
                    if (res.sucesso) {
                        UI.MostrarIndicadorDano(idAlvo, res.dano, res.critico ? 'critico' : 'dano');
                    }
                    UI.AtualizarInterface();

                    if (this.VerificarGameOver()) return;

                    index++;
                    setTimeout(ExecutarProximo, 1500);
                }, 500);
            } else {
                this.VerificarGameOver();
            }
        };

        ExecutarProximo();
    },

    RealizarAtaqueJogador: function (carta) {
        if (EstadoDoJogo.turno !== 0) return;

        const lider = EstadoDoJogo.jogadores[0];

        // Custo
        const custoE = carta.custoEnergia || 0;
        const custoM = carta.custoMana || 0;

        if (lider.energia < custoE || lider.mana < custoM) {
            UI.ExibirMensagem("Recursos Insuficientes!", "erro");
            return;
        }

        // Fecha menu de cartas
        document.getElementById('container-cartas').classList.add('oculta');

        // Ativa sistema de targeting
        Targeting.ConfigurarTargeting(carta);
    },

    // Método chamado pelo Targeting após seleção de alvo(s)
    ExecutarAcaoDoJogador: function (acao, alvos) {
        const lider = EstadoDoJogo.jogadores[0];

        // Guard Clause: Se sem alvos, tenta processar aliados se aplicável ou encerra
        if (!alvos || alvos.length === 0) {
            UI.ExibirMensagem("Sem alvos válidos!", "erro");
            // Se atacou o nada, talvez deva passar o turno ou cancelar? 
            // Vamos assumir que se chegou aqui, deve proceder para final do turno
            this.ProcessarAliados(null);
            return;
        }

        // Consumir recursos
        lider.energia -= (acao.custoEnergia || 0);
        lider.mana -= (acao.custoMana || 0);

        // Executar ação para cada alvo
        alvos.forEach((alvoInfo, index) => {
            setTimeout(() => {
                try {
                    const personagem = alvoInfo.tipo === 'aliado'
                        ? EstadoDoJogo.jogadores[alvoInfo.indice]
                        : EstadoDoJogo.inimigos[alvoInfo.indice];

                    if (!personagem) throw new Error("Alvo Inválido");

                    const idAtacante = 'jogador-1';
                    const idAlvo = alvoInfo.tipo === 'aliado'
                        ? `jogador-${alvoInfo.indice + 1}`
                        : `inimigo-${alvoInfo.indice + 1}`;

                    if (acao.alvoAliado) {
                        // Ação de suporte (cura, buff, etc)
                        this.AplicarSuporte(lider, personagem, acao, idAlvo);
                    } else {
                        // Ação de dano
                        UI.AnimarAtaque(idAtacante, idAlvo);
                        setTimeout(() => {
                            try {
                                const mult = acao.efeito?.danoMultiplicador || 1.0;
                                const res = this.CalcularDano(lider, personagem, mult, !!acao.custoMana);

                                if (res.sucesso) {
                                    UI.MostrarIndicadorDano(idAlvo, res.dano, res.critico ? 'critico' : 'dano');
                                    UI.ExibirMensagem(`Você usou ${acao.nome}!`);
                                }

                                UI.AtualizarInterface();
                            } catch (err) {
                                console.error("Erro no cálculo de dano:", err);
                            }

                            // Após último alvo, processa aliados ou fim de turno
                            if (index === alvos.length - 1) {
                                if (this.VerificarFimCombate()) return;
                                this.ProcessarAliados(personagem);
                            }
                        }, 300);
                    }
                } catch (error) {
                    console.error("Erro ao executar ação:", error);
                    // Garantir que o turno tente avançar no último item mesmo com erro
                    if (index === alvos.length - 1) {
                        this.ProcessarAliados(null);
                    }
                }
            }, index * 600); // Delay entre múltiplos alvos
        });
    },

    AplicarSuporte: function (lancador, alvo, acao, idAlvo) {
        // Cura
        if (acao.efeito?.cura) {
            const curaValor = acao.efeito.cura;
            alvo.vida = Math.min(alvo.vida + curaValor, alvo.vidaMaxima);
            UI.MostrarIndicadorDano(idAlvo, curaValor, 'cura');
            UI.ExibirMensagem(`${acao.nome} curou ${curaValor} HP!`);
        }

        // Buffs de atributos
        if (acao.efeito?.armaduraBonus) alvo.armadura += acao.efeito.armaduraBonus;
        if (acao.efeito?.protecaoMagicaBonus) alvo.protecaoMagica += acao.efeito.protecaoMagicaBonus;

        UI.AtualizarInterface();
    },

    ProcessarAliados: function (alvoOriginal) {
        const aliados = EstadoDoJogo.jogadores.slice(1);

        if (aliados.length === 0) {
            // Sem aliados, passa turno direto
            setTimeout(() => {
                if (this.VerificarFimCombate()) return;
                EstadoDoJogo.turno = 1;
                setTimeout(() => this.TurnoInimigo(), 1000);
            }, 500);
            return;
        }

        let delay = 500;
        aliados.forEach((aliado, idx) => {
            if (aliado.vida <= 0) return;

            setTimeout(() => {
                let alvo = (alvoOriginal && alvoOriginal.vida > 0) ? alvoOriginal : EstadoDoJogo.inimigos.find(i => i.vida > 0);
                if (!alvo) return;

                const idAliado = `jogador-${idx + 2}`;
                const idAlvo = Efeitos.ObterIdVisual(alvo);

                UI.AnimarAtaque(idAliado, idAlvo);
                const res = this.CalcularDano(aliado, alvo, 1.0, false);
                if (res.sucesso) UI.MostrarIndicadorDano(idAlvo, res.dano, 'dano');

                UI.AtualizarInterface();
                this.VerificarFimCombate();
            }, delay);
            delay += 800;
        });

        // Após todos os aliados atacarem, passa o turno
        setTimeout(() => {
            if (this.VerificarFimCombate()) return;
            EstadoDoJogo.turno = 1;
            setTimeout(() => this.TurnoInimigo(), 1000);
        }, delay + 300);
    },

    VerificarFimCombate: function () {
        const inimigosVivos = EstadoDoJogo.inimigos.some(i => i.vida > 0);
        if (!inimigosVivos) {
            EstadoDoJogo.turno = -1; // Fim
            UI.ExibirMensagem("VITÓRIA!", "vitoria");
            // Parar musica de combate se houver e tocar vitória
            Utils.PlaySound(AudioConfig.CaminhoMusicaVitoria, 0.6);

            // Facas de arremesso recuperação
            if (EstadoDoJogo.facasGastas > 0) {
                const jogador = EstadoDoJogo.jogadores[0];
                // 20% + Sorte 
                const chance = 20 + (jogador.sorte || 0);
                let recuperadas = 0;
                for (let i = 0; i < EstadoDoJogo.facasGastas; i++) {
                    if (Math.random() * 100 < chance) recuperadas++;
                }

                if (recuperadas > 0 && jogador.inventario) {
                    const itemFacas = BancoDeDados.Itens.find(it => it.nome === "Facas de Arremesso");
                    if (itemFacas) {
                        for (let i = 0; i < recuperadas; i++) {
                            const slot = jogador.inventario.findIndex(x => x === null);
                            if (slot !== -1) jogador.inventario[slot] = { ...itemFacas };
                        }
                        setTimeout(() => UI.ExibirMensagem(`Recuperou ${recuperadas} Facas!`), 1500);
                    }
                }
            }

            if (window.Navigation) window.Navigation.FinalizarCombate(true);
            return true;
        }
        return false;
    },

    VerificarGameOver: function () {
        const liderVivo = EstadoDoJogo.jogadores[0].vida > 0;
        if (!liderVivo) {
            EstadoDoJogo.turno = -1;
            UI.ExibirMensagem("DERROTA!", "derrota");
            Utils.PlaySound('Audio/Sons/Sons de interface/Fracasso.mp3', 0.8);
            setTimeout(() => location.reload(), 3000); // Reload simples
            return true;
        }
        return false;
    },

    CalcularDano: function (atacante, defensor, multiplicador, ehMagico) {
        // Esquiva
        const hitChance = atacante.precisao - defensor.esquiva;
        if (Math.random() * 100 > hitChance) {
            UI.ExibirMensagem("Errou!", "erro");
            Utils.PlaySound(AudioConfig.Sons.Desvio, 0.4);
            return { sucesso: false, tipo: 'esquiva' };
        }

        // Dano Base
        let danoBase = ehMagico ? atacante.ataqueMagico : atacante.ataque;
        danoBase *= multiplicador;

        // Crítico
        const critChance = atacante.chanceCritico; // + sorte?
        let isCrit = Math.random() * 100 < critChance;
        if (isCrit) danoBase *= (atacante.danoCritico / 100);

        // Defesa
        const reducao = ehMagico
            ? (defensor.protecaoMagica / (defensor.protecaoMagica + 100))
            : (defensor.armadura / (defensor.armadura + 100));

        let danoFinal = Math.floor(danoBase * (1 - reducao));
        danoFinal = Math.max(1, danoFinal); // Mínimo 1

        // Aplica
        defensor.vida = Math.max(0, defensor.vida - danoFinal);

        // Aplicar Efeitos OnHit (ex: arma com fogo/veneno)
        if (!ehMagico && window.Combate.AplicarEfeitosOnHit) {
            window.Combate.AplicarEfeitosOnHit(atacante, defensor);
        }

        return { sucesso: true, dano: danoFinal, critico: isCrit };
    },
};

// Aliases Globais
window.RealizarAtaqueJogador = (c) => window.Combate.RealizarAtaqueJogador(c);
window.PassarTurno = () => window.Combate.PassarTurno();
window.FecharMenuAtaque = () => { document.getElementById('container-cartas').classList.add('oculta'); }; // UI helper simples
