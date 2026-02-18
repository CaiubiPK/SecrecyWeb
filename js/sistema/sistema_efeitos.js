/**
 * SISTEMA DE EFEITOS (Status, Buffs, Debuffs)
 * Gerencia adição, remoção, processamento de turnos e recálculo de atributos.
 * Migrado de: effects.js
 */

window.SistemaEfeitos = {

    /**
     * Adiciona ou atualiza um efeito em um personagem
     * @param {Object} personagem - Alvo do efeito
     * @param {string} nomeEfeito - Chave no BancoDeDados.Efeitos
     * @param {number} duracao - Turnos
     * @param {number} nivel - Nível de potência (1-3)
     */
    Adicionar: function (personagem, nomeEfeito, duracao, nivel) {
        if (!personagem.efeitos) personagem.efeitos = [];

        // Verifica se já possui o efeito
        const existente = personagem.efeitos.find(e => e.nome === nomeEfeito);

        if (existente) {
            // Regra de Stack: Mesmo nível -> aumenta nível ou duração
            const defEfeito = window.BancoDeDados.Efeitos[nomeEfeito];
            let maxNivel = 3; // Padrão

            // Verifica se o efeito tem mais níveis definidos no banco
            if (defEfeito && defEfeito.niveis) {
                // Obtém o maior nível definido nas chaves do objeto niveis
                const niveisDefinidos = Object.keys(defEfeito.niveis).map(Number);
                if (niveisDefinidos.length > 0) {
                    maxNivel = Math.max(...niveisDefinidos);
                }
            }

            if (nivel >= existente.nivel) {
                existente.nivel = Math.min(maxNivel, Math.max(existente.nivel + 1, nivel)); // Aumenta até o limite definido
                // Se a duração nova for -1 (infinito), torna o efeito infinito
                if (duracao === -1) existente.duracao = -1;
                else if (existente.duracao !== -1) existente.duracao = Math.max(existente.duracao, duracao);
            } else {
                // Nível menor -> Apenas estende duração parcial (se não for infinito)
                if (existente.duracao !== -1 && duracao !== -1) {
                    existente.duracao += Math.ceil(duracao / 2);
                }
            }
        } else {
            personagem.efeitos.push({ nome: nomeEfeito, duracao: duracao, nivel: nivel });
        }

        this.RecalcularAtributos(personagem);
        window.GerenciadorInterface.AtualizarStatus(personagem.ehPrincipal ? 'jogador' : 'inimigo', personagem);
    },

    /**
     * Processa os efeitos no final do turno (DoT, HoT, redução de duração)
     */
    ProcessarTurno: function (personagem) {
        if (!personagem.efeitos || personagem.efeitos.length === 0) return;

        // Itera reverso para permitir remoção segura
        for (let i = personagem.efeitos.length - 1; i >= 0; i--) {
            const eff = personagem.efeitos[i];
            const defBase = window.BancoDeDados.Efeitos[eff.nome];

            if (!defBase) continue;

            const dadosNivel = defBase.niveis[eff.nivel];
            if (!dadosNivel) continue;

            // Aplica Efeitos por Turno (DoT/HoT)
            this.AplicarTick(personagem, eff, dadosNivel);

            // Reduz Duração (se não for infinita = -1)
            if (eff.duracao !== -1) {
                eff.duracao--;
                if (eff.duracao <= 0) {
                    personagem.efeitos.splice(i, 1);
                }
            }
        }

        this.RecalcularAtributos(personagem);
    },

    /**
     * Aplica o efeito imediato do turno (Dano, Cura, Regeneração)
     */
    AplicarTick: function (personagem, instanciaEfeito, dadosNivel) {
        let dano = 0;
        let cura = 0;
        let manaRegen = 0;
        let energiaRegen = 0;

        // Cálculo de Valores
        if (dadosNivel.danoFixo || dadosNivel.danoPct) {
            dano = Math.floor((dadosNivel.danoFixo || 0) + (personagem.vidaMaxima * (dadosNivel.danoPct || 0)));
        }
        if (dadosNivel.curaPct) {
            cura = Math.floor(personagem.vidaMaxima * dadosNivel.curaPct);
        }
        if (dadosNivel.curaManaPct) {
            manaRegen = Math.floor(personagem.manaMaxima * dadosNivel.curaManaPct);
        }

        // Aplicação
        const idVisual = personagem.ehPrincipal ? 'jogador-1' : 'inimigo-1'; // Simplificação, idealmente buscar ID dinâmico

        if (dano > 0) {
            personagem.vida = Math.max(0, personagem.vida - dano);
            window.GerenciadorInterface.MostrarIndicadorFlutuante(idVisual, dano, 'dano');
        }
        if (cura > 0) {
            personagem.vida = Math.min(personagem.vidaMaxima, personagem.vida + cura);
            window.GerenciadorInterface.MostrarIndicadorFlutuante(idVisual, cura, 'cura');
        }
        if (manaRegen > 0) {
            personagem.mana = Math.min(personagem.manaMaxima, personagem.mana + manaRegen);
            window.GerenciadorInterface.MostrarIndicadorFlutuante(idVisual, manaRegen, 'mana');
        }
    },

    /**
     * Recalcula atributos derivados baseados nos efeitos ativos e equipamentos
     * (Buffs/Debuffs de status)
     */
    RecalcularAtributos: function (personagem) {
        // Inicializa atributosBase se não existir (Backup dos status iniciais)
        if (!personagem.atributosBase) {
            personagem.atributosBase = {
                ataque: personagem.ataque,
                armadura: personagem.armadura,
                protecaoMagica: personagem.protecaoMagica || 0,
                precisao: personagem.precisao,
                vigor: personagem.vigor || 0
            };
        }

        // Reseta para valores base
        personagem.ataque = personagem.atributosBase.ataque;
        personagem.armadura = personagem.atributosBase.armadura;
        personagem.protecaoMagica = personagem.atributosBase.protecaoMagica;
        personagem.precisao = personagem.atributosBase.precisao;
        personagem.vigor = personagem.atributosBase.vigor;

        // Acumuladores de Modificadores (Aditivos)
        // Ex: +10% + 40% = +50% (multiplicador 0.5)
        let modAtaquePct = 0;
        let modArmaduraPct = 0;
        let modProtMagicaPct = 0;
        let modVigorPct = 0;

        let bonusAtaqueFlat = 0;
        let bonusArmaduraFlat = 0;
        let redPrecisaoFlat = 0;

        // Itera Efeitos
        if (personagem.efeitos) {
            personagem.efeitos.forEach(eff => {
                const def = window.BancoDeDados.Efeitos[eff.nome];
                if (!def) return;
                const dados = def.niveis[eff.nivel];
                if (!dados) return;

                // Valores Fixos
                if (dados.ataqueBonus) bonusAtaqueFlat += dados.ataqueBonus;
                if (dados.armaduraBonus) bonusArmaduraFlat += dados.armaduraBonus;
                if (dados.redPrecisao) redPrecisaoFlat += dados.redPrecisao;

                // Porcentagens (Aditivas ao valor base)
                // Reduções são negativas, aumentos positivos
                if (dados.redAtaquePct) modAtaquePct -= dados.redAtaquePct;
                if (dados.redVigorPct) modVigorPct -= dados.redVigorPct;

                // Rachadura (Reduz defesas)
                if (dados.reducaoResistenciasPct) {
                    modArmaduraPct -= dados.reducaoResistenciasPct;
                    modProtMagicaPct -= dados.reducaoResistenciasPct;
                }

                // Fortificação (Aumenta defesas)
                if (dados.aumentoResistenciasPct) {
                    modArmaduraPct += dados.aumentoResistenciasPct;
                    modProtMagicaPct += dados.aumentoResistenciasPct;
                }
            });
        }

        // Aplicação Final: Base * (1 + SomaPorcentagens) + Flat
        // Ataque
        personagem.ataque = Math.floor(personagem.atributosBase.ataque * (1 + modAtaquePct)) + bonusAtaqueFlat;

        // Defesas
        personagem.armadura = Math.floor(personagem.atributosBase.armadura * (1 + modArmaduraPct)) + bonusArmaduraFlat;
        personagem.protecaoMagica = Math.floor(personagem.atributosBase.protecaoMagica * (1 + modProtMagicaPct));

        // Vigor
        personagem.vigor = Math.floor(personagem.atributosBase.vigor * (1 + modVigorPct));

        // Precisão (Geralmente é subtração direta de %)
        personagem.precisao = personagem.atributosBase.precisao - redPrecisaoFlat;

        // Clamp (sem negativos)
        personagem.ataque = Math.max(0, personagem.ataque);
        personagem.armadura = Math.max(0, personagem.armadura);
        personagem.precisao = Math.max(0, personagem.precisao);
    },

    TemAtordoamento: function (personagem) {
        return personagem.efeitos && personagem.efeitos.some(e => e.nome === "Atordoamento");
    }
};
