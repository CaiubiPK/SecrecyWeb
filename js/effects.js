
// ==========================================
// EFFECTS.JS - Sistema de Status e Efeitos
// ==========================================

window.Efeitos = {
    Adicionar: function (personagem, nomeEfeito, duracao, nivel, atualizarUI = true) {
        if (!personagem.efeitos) personagem.efeitos = [];

        const existente = personagem.efeitos.find(e => e.nome === nomeEfeito);

        if (existente) {
            if (nivel === existente.nivel) {
                // Sobe de nível
                existente.nivel = Math.min(3, existente.nivel + 1);
                existente.duracao = Math.max(existente.duracao, duracao);
            } else if (nivel < existente.nivel) {
                // Prolonga
                existente.duracao += Math.ceil(duracao / 2);
            } else {
                // Substitui (Upgrade direto)
                existente.nivel = nivel;
                existente.duracao = duracao;
            }
        } else {
            personagem.efeitos.push({ nome: nomeEfeito, duracao: duracao, nivel: nivel });
        }

        this.RecalcularAtributos(personagem);
        if (atualizarUI) UI.AtualizarInterface();
    },

    ProcessarTurno: function (personagem) {
        if (!personagem.efeitos || personagem.efeitos.length === 0) return;

        // Itera de trás para frente para segurança ao remover
        for (let i = personagem.efeitos.length - 1; i >= 0; i--) {
            const eff = personagem.efeitos[i];
            const defBase = BancoDeDados.Efeitos[eff.nome];
            if (!defBase) continue;

            const dadosNivel = defBase.niveis[eff.nivel];
            if (!dadosNivel) continue;

            // Processar DoT / HoT
            this.AplicarTick(personagem, eff, dadosNivel);

            // Reduz duração
            eff.duracao--;
            if (eff.duracao <= 0) {
                personagem.efeitos.splice(i, 1);
            }
        }

        this.RecalcularAtributos(personagem);
    },

    AplicarTick: function (personagem, efeitoDet, dados) {
        // Nota: 'efeitoDet' é a instância do efeito no personagem, 'dados' é a definição do banco de dados para aquele nível
        let dano = 0;
        let cura = 0;
        let manaRegen = 0;
        let energiaRegen = 0;

        if (dados.danoFixo || dados.danoPct) {
            dano = Math.floor((dados.danoFixo || 0) + (personagem.vidaMaxima * (dados.danoPct || 0)));
        }
        if (dados.curaPct) {
            cura = Math.floor(personagem.vidaMaxima * dados.curaPct);
        }

        // Novos tipos de regeneração
        if (dados.manaPct) {
            manaRegen = Math.floor(personagem.manaMaxima * dados.manaPct);
        }
        if (dados.energiaPct) {
            energiaRegen = Math.floor(personagem.energiaMaxima * dados.energiaPct);
        }

        const idVisual = this.ObterIdVisual(personagem);

        if (dano > 0) {
            personagem.vida = Math.max(0, personagem.vida - dano);
            if (idVisual) UI.MostrarIndicadorDano(idVisual, dano, 'dano');
        }
        if (cura > 0) {
            personagem.vida = Math.min(personagem.vidaMaxima, personagem.vida + cura);
            if (idVisual) UI.MostrarIndicadorDano(idVisual, cura, 'cura');
        }
        if (manaRegen > 0) {
            personagem.mana = Math.min(personagem.manaMaxima, personagem.mana + manaRegen);
            if (idVisual) UI.MostrarIndicadorDano(idVisual, manaRegen, 'mana'); // Precisa suportar tipo 'mana' na UI se possível, ou usa cura
        }
        if (energiaRegen > 0) {
            personagem.energia = Math.min(personagem.energiaMaxima, personagem.energia + energiaRegen);
            if (idVisual) UI.MostrarIndicadorDano(idVisual, energiaRegen, 'energia');
        }
    },

    RecalcularAtributos: function (personagem) {
        if (!personagem.baseStatus) return;

        // Reseta aos valores base
        personagem.vigor = personagem.baseStatus.vigor;
        personagem.ataque = personagem.baseStatus.ataque;
        personagem.precisao = personagem.baseStatus.precisao;
        personagem.armadura = personagem.baseStatus.armadura;
        // Resetar outros se necessário

        if (!personagem.efeitos) return;

        personagem.efeitos.forEach(eff => {
            const defBase = BancoDeDados.Efeitos[eff.nome];
            if (!defBase) return;
            const dados = defBase.niveis[eff.nivel];

            if (dados) {
                // Debuffs
                if (dados.redVigorPct) personagem.vigor = Math.floor(personagem.vigor * (1 - dados.redVigorPct));
                if (dados.redAtaquePct) personagem.ataque = Math.floor(personagem.ataque * (1 - dados.redAtaquePct));
                if (dados.redPrecisao) personagem.precisao = Math.max(0, personagem.precisao - dados.redPrecisao);

                // Buffs (Novos)
                if (dados.ataqueFixo) personagem.ataque += dados.ataqueFixo;
                if (dados.ataquePct) personagem.ataque += Math.floor(personagem.baseStatus.ataque * dados.ataquePct);

                if (dados.armaduraFixo) personagem.armadura += dados.armaduraFixo;
                if (dados.armaduraPct) personagem.armadura += Math.floor(personagem.baseStatus.armadura * dados.armaduraPct);
            }
        });

        // Garantir que não fica negativo
        personagem.ataque = Math.max(0, personagem.ataque);
        personagem.armadura = Math.max(0, personagem.armadura);
    },

    ObterIdVisual: function (personagem) {
        // Mapeia objeto personagem para ID do DOM ('jogador-1', 'inimigo-1')
        const idxJ = EstadoDoJogo.jogadores.indexOf(personagem);
        if (idxJ !== -1) return `jogador-${idxJ + 1}`;

        const idxI = EstadoDoJogo.inimigos.indexOf(personagem);
        if (idxI !== -1) return `inimigo-${idxI + 1}`;

        return null;
    },

    TemAtordoamento: function (personagem) {
        return personagem.efeitos && personagem.efeitos.some(e => e.nome === "Atordoamento");
    }
};

// Aliases Globais
window.AdicionarEfeito = (p, n, d, v, u) => window.Efeitos.Adicionar(p, n, d, v, u);
window.ProcessarEfeitosTurno = (p) => window.Efeitos.ProcessarTurno(p);
window.RecalcularAtributosComEfeitos = (p) => window.Efeitos.RecalcularAtributos(p);
