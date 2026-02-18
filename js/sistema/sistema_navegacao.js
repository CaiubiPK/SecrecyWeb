/**
 * SISTEMA DE NAVEGAÇÃO E CAMPANHA
 * Gerencia a progressão do jogador entre mapas, história, diálogos e batalhas.
 */

window.SistemaNavegacao = {

    MostrarMapaCampanha: function () {
        console.log("🗺️ [NAVEGACAO] Abrindo Mapa...");
        const desbloqueadas = window.EstadoJogo.FasesDesbloqueadas || 1;

        // Atualiza visual e visibilidade dos nós
        for (let i = 1; i <= 7; i++) {
            const node = document.getElementById(`node-${i}`);
            if (node) {
                // Lógica da última fase oculta (Gromn)
                if (i === 7) {
                    if (desbloqueadas >= 7) node.classList.remove('oculta');
                    else node.classList.add('oculta');
                }

                if (i <= desbloqueadas) {
                    node.classList.remove('bloqueado');
                    node.classList.add('ativo');
                } else {
                    node.classList.add('bloqueado');
                    node.classList.remove('ativo');
                }
            }
        }

        // Atualiza marcador COM animação (força reposição)
        this.AtualizarMarcadorMapa(window.EstadoJogo.FaseAtual || desbloqueadas, true);

        // Pequeno delay para garantir que o layout renderizou antes de desenhar as linhas
        setTimeout(() => {
            this.DesenharLinhasConexao();
        }, 200);

        window.GerenciadorInterface.TrocarTela('tela-mapa-campanha');

        //Colocarsom - Música de Fundo do Mapa
        window.GerenciadorAudio.TocarMusica('Audio/Musicas/DurianSlowed.mp4');
    },

    DesenharLinhasConexao: function () {
        const path = document.getElementById('path-conexoes');
        if (!path) return;

        // Sequência de conexão visual (conforme a imagem)
        const sequencia = [1, 7, 2, 3, 4, 5, 6];
        let d = "";

        const view = document.querySelector('.mapa-caminho');
        if (!view) return;

        sequencia.forEach((id, index) => {
            const node = document.getElementById(`node-${id}`);
            if (node && !node.classList.contains('oculta')) {
                const x = node.offsetLeft + (node.offsetWidth / 2);
                const y = node.offsetTop + (node.offsetHeight / 2);

                if (d === "") d += `M ${x} ${y}`;
                else d += ` L ${x} ${y}`;
            }
        });

        path.setAttribute('d', d);
    },

    AtualizarMarcadorMapa: function (faseId, instantaneo = false) {
        const node = document.getElementById(`node-${faseId}`);
        const marcador = document.getElementById('marcador-jogador');

        if (node && marcador) {
            const x = node.offsetLeft + (node.offsetWidth / 2) - (marcador.offsetWidth / 2);
            const y = node.offsetTop - (marcador.offsetHeight) + 10;

            if (instantaneo) {
                marcador.style.transition = 'none';
                marcador.style.left = x + 'px';
                marcador.style.top = y + 'px';
                // Força reflow para aplicar o estilo sem animação
                marcador.offsetHeight;
                marcador.style.transition = '';
            } else {
                marcador.style.left = x + 'px';
                marcador.style.top = y + 'px';
            }
        }
    },

    SelecionarFaseMapa: function (faseId) {
        if (faseId > (window.EstadoJogo.FasesDesbloqueadas || 1)) {
            //Colocarsom - Som de Bloqueio / Correntes
            window.GerenciadorAudio.TocarEfeito('Audio/Interface/Bloqueado.mp3');
            window.GerenciadorInterface.ExibirMensagem("Esta fase ainda está bloqueada!", "erro");
            return;
        }

        //Colocarsom - Som de Passos / Movimento no Mapa
        window.GerenciadorAudio.TocarEfeito('Audio/Interface/Passos_Mapa.mp3');

        window.EstadoJogo.FaseAtual = faseId;

        console.log(`🏃 [NAVEGACAO] Movendo personagem para fase ${faseId}...`);
        this.AtualizarMarcadorMapa(faseId);

        // Espera a animação de movimento (1.5s no CSS) terminar para abrir o menu
        setTimeout(() => {
            this.AbrirMenuDetalhesFase(faseId);
        }, 1500);
    },

    AbrirMenuDetalhesFase: function (faseId) {
        const campanha = window.BancoDeDados.Campanhas.Castelo;
        const dadosNivel = campanha.niveis[faseId];

        if (!dadosNivel) return;

        console.log(`📜 [NAVEGACAO] Abrindo detalhes da fase ${faseId}`);

        // Preenche o modal com as informações da fase
        document.getElementById('fase-detalhe-titulo').innerText = dadosNivel.historia.titulo || `Fase ${faseId}`;
        document.getElementById('fase-detalhe-subtitulo').innerText = dadosNivel.nome || dadosNivel.historia.subtitulo || "";
        document.getElementById('fase-detalhe-descricao').innerText = dadosNivel.historia.texto;
        document.getElementById('fase-detalhe-imagem').src = dadosNivel.cenario;

        // Configura o botão de LUTAR
        const btnLutar = document.getElementById('btn-confirmar-luta');
        if (btnLutar) {
            btnLutar.onclick = () => {
                window.GerenciadorInterface.FecharModal('modal-detalhes-fase');
                this.MostrarHistoria(faseId);
            };
        }

        window.GerenciadorInterface.AbrirModal('modal-detalhes-fase');
    },

    MostrarHistoria: function (faseId) {
        const campanha = window.BancoDeDados.Campanhas.Castelo;
        const dadosNivel = campanha.niveis[faseId];

        if (!dadosNivel || !dadosNivel.historia) {
            this.MostrarDialogo(faseId);
            return;
        }

        document.getElementById('historia-titulo').innerText = dadosNivel.historia.titulo;
        document.getElementById('historia-subtitulo').innerText = dadosNivel.historia.subtitulo || "";
        document.getElementById('historia-texto').innerText = dadosNivel.historia.texto;

        const btn = document.getElementById('btn-iniciar-historia');
        if (btn) btn.onclick = () => this.MostrarDialogo(faseId);

        window.GerenciadorInterface.TrocarTela('tela-historia');
    },

    MostrarDialogo: function (faseId) {
        window.SistemaDialogo.Iniciar(faseId, () => {
            this.IniciarCombateFase(faseId);
        });
    },

    IniciarCombateFase: function (faseId) {
        const dadosFase = window.BancoDeDados.Campanhas.Castelo.niveis[faseId];
        if (!dadosFase) return;

        const inimigosInstanciados = [];
        dadosFase.inimigos.forEach(def => {
            let template = null;
            if (def.tipo === 'Unidade') {
                try {
                    template = window.BancoDeDados.Unidades[def.raca][def.classe].find(u => u.nivel === (def.nivel || 1));
                } catch (e) { }
            } else if (def.tipo === 'Chefe') {
                template = window.BancoDeDados.Chefes.find(c => c.id === def.id);
            } else if (def.tipo === 'Aleatorio') {
                const pool = [];
                const racas = def.raca ? [def.raca] : ['Orcs', 'Humanos'];
                racas.forEach(r => {
                    if (window.BancoDeDados.Unidades[r]) {
                        Object.values(window.BancoDeDados.Unidades[r]).forEach(cl => {
                            const u = cl.find(unit => unit.nivel === (def.nivel || 1));
                            if (u) pool.push(u);
                        });
                    }
                });
                template = pool[Math.floor(Math.random() * pool.length)];
            }

            if (template) inimigosInstanciados.push(JSON.parse(JSON.stringify(template)));
        });

        if (inimigosInstanciados.length > 0) {
            const telaJogo = document.getElementById('tela-jogo');
            if (telaJogo && dadosFase.cenario) telaJogo.style.backgroundImage = `url('${dadosFase.cenario}')`;
            window.SistemaCombate.Iniciar(inimigosInstanciados);
        } else {
            this.MostrarMapaCampanha();
        }
    },

    FinalizarCombate: function (vitoria) {
        if (vitoria) {
            if (window.EstadoJogo.FaseAtual === window.EstadoJogo.FasesDesbloqueadas) {
                window.EstadoJogo.FasesDesbloqueadas++;
            }
            const btn = document.getElementById('btn-vitoria-continuar');
            if (btn) btn.onclick = () => this.MostrarMapaCampanha();
        }
    }
};

window.Navigation = window.SistemaNavegacao;
