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
            if (nivel >= existente.nivel) {
                existente.nivel = Math.min(3, Math.max(existente.nivel + 1, nivel)); // Tenta aumentar, cap em 3
                existente.duracao = Math.max(existente.duracao, duracao);
            } else {
                // Nível menor -> Apenas estende duração parcial
                existente.duracao += Math.ceil(duracao / 2);
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

            // Reduz Duração
            eff.duracao--;
            if (eff.duracao <= 0) {
                personagem.efeitos.splice(i, 1);
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
        // Assume que existe um 'baseStatus' salvo no EstadoJogo ou clonado inicialmente
        // Como o EstadoJogo clona do BancoDeDados, precisamos ter cuidado para não degradar os stats base permanentemente.
        // A estratégia aqui será: Sempre resetar para o valor do BancoDeDados (se possível) ou 
        // assumir que os valores atuais PODEM ter sido alterados permanentemente por itens, 
        // então buffs temporários devem ser calculados à parte.

        // Melhor abordagem para RPG: Atributo Atual = (Base + Equipamento) * Multiplicadores
        // Pela simplicidade atual, vamos aplicar modificadores sobre os valores atuais, 
        // mas idealmente deveríamos ter 'atributosBase' separados.

        // POG de Segurança: Se não tem backup, cria
        if (!personagem.atributosBase) {
            personagem.atributosBase = {
                ataque: personagem.ataque,
                armadura: personagem.armadura,
                precisao: personagem.precisao,
                vigor: personagem.vigor
            };
        }

        // Reseta
        personagem.ataque = personagem.atributosBase.ataque;
        personagem.armadura = personagem.atributosBase.armadura;
        personagem.precisao = personagem.atributosBase.precisao;
        personagem.vigor = personagem.atributosBase.vigor;

        // Aplica Modificadores
        if (personagem.efeitos) {
            personagem.efeitos.forEach(eff => {
                const def = window.BancoDeDados.Efeitos[eff.nome];
                if (!def) return;
                const dados = def.niveis[eff.nivel];
                if (!dados) return;

                if (dados.ataqueBonus) personagem.ataque += dados.ataqueBonus;
                if (dados.armaduraBonus) personagem.armadura += dados.armaduraBonus;

                if (dados.redAtaquePct) personagem.ataque = Math.floor(personagem.ataque * (1 - dados.redAtaquePct));
                if (dados.redVigorPct) personagem.vigor = Math.floor(personagem.vigor * (1 - dados.redVigorPct));
                if (dados.redPrecisao) personagem.precisao -= dados.redPrecisao;
            });
        }

        // Clamp (sem negativos)
        personagem.ataque = Math.max(0, personagem.ataque);
        personagem.armadura = Math.max(0, personagem.armadura);
        personagem.precisao = Math.max(0, personagem.precisao);
    },

    TemAtordoamento: function (personagem) {
        return personagem.efeitos && personagem.efeitos.some(e => e.nome === "Atordoamento");
    }
};
