// ==========================================
// TARGETING.JS - Sistema de Seleção de Alvos
// ==========================================

window.Targeting = {
    modoAtivo: false, // true quando está esperando seleção de alvo para ação
    acaoAtual: null, // Carta/habilidade/item sendo usado
    alvosPermitidos: [], // Array de índices válidos
    tipoAlvo: 'single', // 'single', 'multi', 'area-enemy', 'area-ally', 'all'
    alvosSelecionados: [], // Para ações multi-alvo

    // Configurações de targeting baseado no tipo de ação
    ConfigurarTargeting: function (acao) {
        Utils.Log('Targeting.ConfigurarTargeting', acao.nome);
        this.acaoAtual = acao;
        this.alvosSelecionados = [];

        // Determinar tipo de targeting baseado na carta/ação
        if (acao.alvoTodos) {
            this.tipoAlvo = 'all';
            this.ExecutarAcaoSemSelecao();
            return;
        } else if (acao.alvoAreaInimigos) {
            this.tipoAlvo = 'area-enemy';
            this.ExecutarAcaoSemSelecao();
            return;
        } else if (acao.alvoAreaAliados) {
            this.tipoAlvo = 'area-ally';
            this.ExecutarAcaoSemSelecao();
            return;
        } else if (acao.multiAlvo) {
            this.tipoAlvo = 'multi';
            this.maxAlvos = acao.maxAlvos || 2;
        } else {
            this.tipoAlvo = 'single';
        }

        // Identificar alvos válidos
        this.IdentificarAlvosValidos(acao);

        // Ativar modo targeting
        this.modoAtivo = true;
        this.DestacarAlvosValidos();

        // Mensagem para o jogador
        const tipoMsg = acao.alvoAliado ? "aliado" : "inimigo";
        const multiMsg = this.tipoAlvo === 'multi' ? ` (${this.maxAlvos} alvos)` : "";
        UI.ExibirMensagem(`Selecione seu ${tipoMsg}${multiMsg}!`, "atencao");
    },

    IdentificarAlvosValidos: function (acao) {
        this.alvosPermitidos = [];

        if (acao.alvoAliado) {
            // Ação em aliados (cura, buff, etc)
            EstadoDoJogo.jogadores.forEach((j, idx) => {
                if (j.vida > 0) this.alvosPermitidos.push({ tipo: 'aliado', indice: idx });
            });
        } else {
            // Ação em inimigos (dano, debuff, etc)
            EstadoDoJogo.inimigos.forEach((i, idx) => {
                if (i.vida > 0) this.alvosPermitidos.push({ tipo: 'inimigo', indice: idx });
            });
        }
    },

    DestacarAlvosValidos: function () {
        Utils.Log('Targeting.DestacarAlvosValidos');

        // Remove destaques antigos
        this.LimparDestaques();

        this.alvosPermitidos.forEach(alvo => {
            const id = alvo.tipo === 'aliado'
                ? `jogador-${alvo.indice + 1}`
                : `inimigo-${alvo.indice + 1}`;

            const el = document.getElementById(id);
            if (el) {
                el.classList.add('targeting-valido');
                if (alvo.tipo === 'aliado') {
                    el.classList.add('targeting-aliado'); // Verde
                } else {
                    el.classList.add('targeting-inimigo'); // Vermelho
                }

                // Adiciona cursor pointer para feedback visual
                el.style.cursor = 'pointer';
            }
        });
    },

    LimparDestaques: function () {
        document.querySelectorAll('.personagem').forEach(el => {
            el.classList.remove('targeting-valido', 'targeting-aliado', 'targeting-inimigo', 'targeting-selecionado', 'foco-visualizacao');
            el.style.cursor = '';
        });
    },

    SelecionarAlvo: function (tipo, indice) {
        if (!this.modoAtivo) return false;

        Utils.Log(`Targeting.SelecionarAlvo`, `${tipo} ${indice}`);

        // Verifica se é um alvo válido
        const alvoValido = this.alvosPermitidos.find(a => a.tipo === tipo && a.indice === indice);
        if (!alvoValido) {
            UI.ExibirMensagem("Alvo inválido para esta ação!", "erro");
            return false;
        }

        if (this.tipoAlvo === 'single') {
            // Seleção única - executa imediatamente
            this.ExecutarAcao([{ tipo, indice }]);
            this.Cancelar();
        } else if (this.tipoAlvo === 'multi') {
            // Seleção múltipla
            const jaSelecionado = this.alvosSelecionados.findIndex(a => a.tipo === tipo && a.indice === indice);

            if (jaSelecionado >= 0) {
                // Remove se já estava selecionado (toggle)
                this.alvosSelecionados.splice(jaSelecionado, 1);
                const id = tipo === 'aliado' ? `jogador-${indice + 1}` : `inimigo-${indice + 1}`;
                document.getElementById(id)?.classList.remove('targeting-selecionado');
            } else if (this.alvosSelecionados.length < this.maxAlvos) {
                // Adiciona à seleção
                this.alvosSelecionados.push({ tipo, indice });
                const id = tipo === 'aliado' ? `jogador-${indice + 1}` : `inimigo-${indice + 1}`;
                document.getElementById(id)?.classList.add('targeting-selecionado');

                // Se atingiu o máximo, executa automaticamente
                if (this.alvosSelecionados.length === this.maxAlvos) {
                    setTimeout(() => {
                        this.ExecutarAcao(this.alvosSelecionados);
                        this.Cancelar();
                    }, 300);
                }
            } else {
                UI.ExibirMensagem(`Máximo de ${this.maxAlvos} alvos!`, "erro");
            }
        }

        return true;
    },

    ExecutarAcaoSemSelecao: function () {
        Utils.Log('Targeting.ExecutarAcaoSemSelecao');

        let alvos = [];
        if (this.tipoAlvo === 'area-enemy') {
            EstadoDoJogo.inimigos.forEach((i, idx) => {
                if (i.vida > 0) alvos.push({ tipo: 'inimigo', indice: idx });
            });
        } else if (this.tipoAlvo === 'area-ally') {
            EstadoDoJogo.jogadores.forEach((j, idx) => {
                if (j.vida > 0) alvos.push({ tipo: 'aliado', indice: idx });
            });
        } else if (this.tipoAlvo === 'all') {
            EstadoDoJogo.inimigos.forEach((i, idx) => {
                if (i.vida > 0) alvos.push({ tipo: 'inimigo', indice: idx });
            });
            EstadoDoJogo.jogadores.forEach((j, idx) => {
                if (j.vida > 0) alvos.push({ tipo: 'aliado', indice: idx });
            });
        }

        this.ExecutarAcao(alvos);
    },

    ExecutarAcao: function (alvos) {
        Utils.Log('Targeting.ExecutarAcao', alvos.length + ' alvos');

        // Delega para o sistema de combate
        if (window.Combate && window.Combate.ExecutarAcaoDoJogador) {
            window.Combate.ExecutarAcaoDoJogador(this.acaoAtual, alvos);
        }
    },

    Cancelar: function () {
        Utils.Log('Targeting.Cancelar');
        this.modoAtivo = false;
        this.acaoAtual = null;
        this.alvosPermitidos = [];
        this.alvosSelecionados = [];
        this.LimparDestaques();
    },

    // ===== Sistema de Visualização (Seleção Passiva) =====
    SelecionarParaVisualizacao: function (tipo, indice) {
        if (this.modoAtivo) return; // Não permite visualização durante targeting

        Utils.Log(`Targeting.SelecionarParaVisualizacao`, `${tipo} ${indice}`);

        if (tipo === 'aliado') {
            EstadoDoJogo.jogadorFoco = indice;
            // Remove foco visual anterior
            document.querySelectorAll('.personagem.jogador').forEach(el => el.classList.remove('foco-visualizacao'));
            // Adiciona novo foco
            const el = document.getElementById(`jogador-${indice + 1}`);
            if (el) el.classList.add('foco-visualizacao');
        } else {
            EstadoDoJogo.inimigoFoco = indice;
            // Remove foco visual anterior
            document.querySelectorAll('.personagem.inimigo').forEach(el => el.classList.remove('foco-visualizacao'));
            // Adiciona novo foco
            const el = document.getElementById(`inimigo-${indice + 1}`);
            if (el) el.classList.add('foco-visualizacao');
        }

        // Atualiza interface para mostrar stats do personagem focado
        UI.AtualizarInterface();
    }
};

// Alias Global
window.SelecionarAlvo = (tipo, indice) => window.Targeting.SelecionarAlvo(tipo, indice);
window.SelecionarParaVisualizacao = (tipo, indice) => window.Targeting.SelecionarParaVisualizacao(tipo, indice);
