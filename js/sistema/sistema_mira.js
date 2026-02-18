/**
 * SISTEMA DE MIRA (TARGETING)
 * Gerencia a seleção de alvos para ações (Habilidades, Itens, Ataques).
 * Migrado de: targeting.js
 */

window.SistemaMira = {
    ModoAtivo: false,
    AcaoAtual: null,

    // Configuração
    AlvosPermitidos: [], // Índices
    TipoSelecao: 'unico', // 'unico', 'multi', 'area', 'todos'
    AlvosSelecionados: [],
    MaxAlvos: 1,

    /**
     * Inicia o modo de seleção de alvo
     * @param {Object} acao - Objeto da carta ou item
     * @param {Function} callbackSucesso - Função executada ao confirmar (alvos) => {}
     */
    IniciarSelecao: function (acao, callbackSucesso) {
        console.log("🎯 [MIRA] Iniciando seleção para:", acao.nome);

        this.AcaoAtual = acao;
        this.Callback = callbackSucesso;
        this.AlvosSelecionados = [];
        this.ModoAtivo = true;

        // 1. Determina Tipo de Seleção
        if (acao.alvoTodos) this.TipoSelecao = 'todos';
        else if (acao.alvoAreaInimigos || acao.alvoAreaAliados) this.TipoSelecao = 'area';
        else if (acao.multiAlvo) {
            this.TipoSelecao = 'multi';
            this.MaxAlvos = acao.maxAlvos || 2;
        } else {
            this.TipoSelecao = 'unico';
            this.MaxAlvos = 1;
        }

        // 2. Identifica Alvos Válidos
        this.IdentificarAlvosValidos(acao);

        // 3. Verifica Auto-Cast (Área/Todos)
        if (this.TipoSelecao === 'todos' || this.TipoSelecao === 'area') {
            this.ConfirmarSelecao(this.AlvosPermitidos); // Seleciona tudo que é permitido
            return;
        }

        // 4. Feedback Visual na Interface
        window.GerenciadorInterface.ExibirMensagem(
            `Selecione ${acao.alvoAliado ? 'um Aliado' : 'um Inimigo'}`,
            "atencao"
        );
        this.DestacarAlvosValidos();
    },

    IdentificarAlvosValidos: function (acao) {
        this.AlvosPermitidos = [];

        if (acao.alvoAliado) {
            // Aliados Vivos
            window.EstadoJogo.Jogadores.forEach((p, index) => {
                if (p.vida > 0) this.AlvosPermitidos.push({ tipo: 'aliado', indice: index });
            });
        } else {
            // Inimigos Vivos
            window.EstadoJogo.Inimigos.forEach((i, index) => {
                if (i.vida > 0) this.AlvosPermitidos.push({ tipo: 'inimigo', indice: index });
            });
        }
    },

    DestacarAlvosValidos: function () {
        // Adiciona classes CSS para brilho/cursor
        this.AlvosPermitidos.forEach(alvo => {
            const id = alvo.tipo === 'aliado' ? `jogador-${alvo.indice + 1}` : `inimigo-${alvo.indice + 1}`;
            const el = document.getElementById(id);
            if (el) {
                el.classList.add('targeting-valido');
                if (alvo.tipo === 'inimigo') el.classList.add('targeting-inimigo');
                else el.classList.add('targeting-aliado');
            }
        });
    },

    LimparDestaques: function () {
        document.querySelectorAll('.personagem').forEach(el => {
            el.classList.remove('targeting-valido', 'targeting-inimigo', 'targeting-aliado', 'targeting-selecionado');
        });
    },

    /**
     * Chamado quando o jogador clica em um personagem na tela
     */
    ProcessarCliquePersonagem: function (tipo, indice) {
        if (!this.ModoAtivo) {
            if (tipo === 'inimigo') {
                window.EstadoJogo.InimigoSelecionadoIndice = indice;
                window.SistemaCombate.AtualizarInterfaceCompleta();
                console.log(`🎯 [MIRA] Inimigo ${indice} selecionado para o HUD.`);
            }
            return;
        }

        // Verifica validade
        const ehValido = this.AlvosPermitidos.some(a => a.tipo === tipo && a.indice === indice);
        if (!ehValido) {
            window.GerenciadorInterface.ExibirMensagem("Alvo Inválido!", "erro");
            return;
        }

        const jaSelecionado = this.AlvosSelecionados.some(a => a.tipo === tipo && a.indice === indice);

        // Lógica de Seleção
        if (this.TipoSelecao === 'unico') {
            this.ConfirmarSelecao([{ tipo, indice }]);

        } else if (this.TipoSelecao === 'multi') {
            if (jaSelecionado) {
                // Remove
                this.AlvosSelecionados = this.AlvosSelecionados.filter(a => !(a.tipo === tipo && a.indice === indice));
                // Remove visual de seleção
                const id = tipo === 'aliado' ? `jogador-${indice + 1}` : `inimigo-${indice + 1}`;
                const el = document.getElementById(id);
                if (el) el.classList.remove('targeting-selecionado');
            } else if (this.AlvosSelecionados.length < this.MaxAlvos) {
                this.AlvosSelecionados.push({ tipo, indice });
                // Adiciona visual de seleção
                const id = tipo === 'aliado' ? `jogador-${indice + 1}` : `inimigo-${indice + 1}`;
                const el = document.getElementById(id);
                if (el) el.classList.add('targeting-selecionado');
                if (this.AlvosSelecionados.length === this.MaxAlvos) {
                    this.ConfirmarSelecao(this.AlvosSelecionados);
                }
            }
        }
    },

    ConfirmarSelecao: function (alvosFinais) {
        this.LimparDestaques();
        this.ModoAtivo = false;

        if (this.Callback) {
            this.Callback(alvosFinais);
        }
    },

    Cancelar: function () {
        this.LimparDestaques();
        this.ModoAtivo = false;
        window.GerenciadorInterface.ExibirMensagem("Seleção Cancelada.");
    }
};
