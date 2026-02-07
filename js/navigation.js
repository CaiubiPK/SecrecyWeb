
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

    MostrarMapaCampanha: function () {
        Utils.Log("Navigation.MostrarMapaCampanha");

        // Atualiza visual dos nodes baseado no progresso
        const desbloqueadas = EstadoDoJogo.fasesDesbloqueadas || 1;

        for (let i = 1; i <= 7; i++) {
            const node = document.getElementById(`node-${i}`);
            if (node) {
                if (i <= desbloqueadas) {
                    node.classList.remove('bloqueado');
                    node.classList.add('ativo');
                } else {
                    node.classList.add('bloqueado');
                    node.classList.remove('ativo');
                }
            }
        }

        // Posiciona o marcador no nível mais avançado desbloqueado
        this.AtualizarMarcadorMapa(desbloqueadas);

        UI.TrocarTela('tela-mapa-campanha');
    },

    AtualizarMarcadorMapa: function (faseId) {
        const node = document.getElementById(`node-${faseId}`);
        const marcador = document.getElementById('marcador-jogador');

        if (node && marcador) {
            setTimeout(() => {
                const centerX = node.offsetLeft + (node.offsetWidth / 2);
                const topY = node.offsetTop;

                marcador.style.left = centerX + 'px';
                marcador.style.top = topY + 'px';
            }, 300);
        }
    },

    SelecionarFaseMapa: function (faseId) {
        if (faseId > (EstadoDoJogo.fasesDesbloqueadas || 1)) {
            UI.ExibirMensagem("Esta fase ainda está bloqueada!", "erro");
            return;
        }

        Utils.Log(`Navigation.SelecionarFaseMapa -> ${faseId}`);

        // Move o marcador para a fase clicada antes de iniciar
        this.AtualizarMarcadorMapa(faseId);

        EstadoDoJogo.faseAtual = faseId;

        // Pequeno delay visual antes de trocar de tela
        setTimeout(() => {
            this.MostrarHistoria(faseId);
        }, 400);
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
            // Se venceu a fase atual e era a última desbloqueada, desbloqueia a próxima
            if (EstadoDoJogo.faseAtual === (EstadoDoJogo.fasesDesbloqueadas || 1) && (EstadoDoJogo.fasesDesbloqueadas || 1) < 7) {
                EstadoDoJogo.fasesDesbloqueadas = (EstadoDoJogo.fasesDesbloqueadas || 1) + 1;
            }

            UI.TrocarTela('tela-vitoria');

            // Configura botão de continuar para levar ao mapa
            const btnVitoria = document.getElementById('btn-vitoria-continuar');
            if (btnVitoria) {
                btnVitoria.onclick = () => this.MostrarMapaCampanha();
            }
        } else {
            UI.TrocarTela('tela-derrota');
        }
    }
};

// Aliases
window.IniciarJogo = () => window.Navigation.IniciarJogo();
