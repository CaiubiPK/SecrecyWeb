
window.Navigation = {
    IniciarJogo: function () {
        Utils.Log("Navigation.IniciarJogo");
        window.InicializarEstado();
        Utils.PlaySound(AudioConfig.CaminhoMusicaDeFundo, 0.2);
        UI.TrocarTela('tela-nome');
    },

    ConfirmarNome: function (nome) {
        if (!nome) return;
        EstadoDoJogo.jogadores[0].nome = nome;
        UI.TrocarTela('tela-campanha');
    },

    SelecionarFase: function (faseId) {
        EstadoDoJogo.faseAtual = faseId;
        this.MostrarHistoria(faseId);
    },

    MostrarHistoria: function (faseId) {
        const dados = BancoDeDados.Historias[faseId] || { titulo: "Desconhecido", texto: "..." };

        UI.Elementos.Historia.Titulo.textContent = dados.titulo;
        UI.Elementos.Historia.Subtitulo.textContent = dados.subtitulo || "";
        UI.Elementos.Historia.Texto.textContent = dados.texto;

        // Configura botão para ir ao próximo passo
        UI.Elementos.Historia.Botao.onclick = () => this.MostrarDialogo(faseId);

        UI.TrocarTela('tela-historia');
    },

    MostrarDialogo: function (faseId) {
        const configFase = BancoDeDados.Campanha[faseId];
        const imagem = configFase ? configFase.imagemInimigo : 'Images/FotoDr.jpeg';

        // Inicia o sistema de diálogo e passo o callback para iniciar combate
        window.Dialogo.Iniciar(faseId, imagem, () => {
            this.IniciarCombateFase(faseId);
        });
    },

    IniciarCombateFase: function (faseId) {
        Utils.Log(`IniciarCombateFase -> ${faseId}`);
        const configFase = BancoDeDados.Campanha[faseId];

        if (!configFase) {
            UI.ExibirMensagem("Fase não configurada no Banco de Dados!", "erro");
            return;
        }

        // Resetar jogadores para apenas o líder na Fase 1 (ou conforme necessidade)
        if (faseId === 1) {
            const lider = EstadoDoJogo.jogadores[0];
            EstadoDoJogo.jogadores = [lider];
        }

        // Construir lista de inimigos a partir dos dados
        let inimigos = [];
        configFase.inimigos.forEach(item => {
            if (item.tipo === 'Inimigo') {
                const base = BancoDeDados.Inimigos.find(i => i.nome === item.nome);
                if (base) inimigos.push({ ...base });
            } else if (item.tipo === 'Unidade') {
                const unidade = BancoDeDados.Unidades[item.raca][item.classe][item.nivel];
                if (unidade) inimigos.push({ ...unidade });
            }
        });

        // Adicionar aliados extras se houver
        if (configFase.aliadosExtras) {
            configFase.aliadosExtras.forEach(item => {
                const unidade = BancoDeDados.Unidades[item.raca][item.classe][item.nivel];
                if (unidade) EstadoDoJogo.jogadores.push({ ...unidade });
            });
        }

        Combate.Iniciar(inimigos);
        this.SetupEventListenersPersonagens();
    },

    SetupEventListenersPersonagens: function () {
        Utils.Log('Setup Listeners Personagens');

        // Event listeners para JOGADORES
        [1, 2, 3].forEach(num => {
            const el = document.getElementById(`jogador-${num}`);
            if (el) {
                el.onclick = () => {
                    const indice = num - 1;
                    // Se targeting ativo, tenta selecionar como alvo
                    if (Targeting.modoAtivo) {
                        Targeting.SelecionarAlvo('aliado', indice);
                    } else {
                        // Senão, seleciona para visualização
                        Targeting.SelecionarParaVisualizacao('aliado', indice);
                    }
                };
            }
        });

        // Event listeners para INIMIGOS
        [1, 2, 3].forEach(num => {
            const el = document.getElementById(`inimigo-${num}`);
            if (el) {
                el.onclick = () => {
                    const indice = num - 1;
                    // Se targeting ativo, tenta selecionar como alvo
                    if (Targeting.modoAtivo) {
                        Targeting.SelecionarAlvo('inimigo', indice);
                    } else {
                        // Senão, seleciona para visualização
                        Targeting.SelecionarParaVisualizacao('inimigo', indice);
                    }
                };
            }
        });
    },

    FinalizarCombate: function (vitoria) {
        if (vitoria) {
            UI.TrocarTela('tela-vitoria');
            // Logica de XP/Loot aqui
        } else {
            UI.TrocarTela('tela-derrota');
        }
    }
};

// Aliases
window.IniciarJogo = () => window.Navigation.IniciarJogo();
