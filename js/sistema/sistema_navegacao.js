/**
 * SISTEMA DE NAVEGAÇÃO E CAMPANHA
 * Gerencia a progressão do jogador entre mapas, história, diálogos e batalhas.
 */

window.SistemaNavegacao = {

    MostrarMapaCampanha: function () {
        console.log("[NAVEGACAO] Mostrar Mapa");
        const desbloqueadas = window.EstadoJogo.FasesDesbloqueadas || 1;

        // Atualiza visual dos nós no mapa
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

        this.AtualizarMarcadorMapa(window.EstadoJogo.FaseAtual || 1);
        window.GerenciadorInterface.TrocarTela('tela-mapa-campanha');
    },

    AtualizarMarcadorMapa: function (faseId) {
        const node = document.getElementById(`node-${faseId}`);
        const marcador = document.getElementById('marcador-jogador');

        if (node && marcador) {
            // Pequeno delay para garantir que a tela esteja visível para cálculo de posição
            setTimeout(() => {
                const rect = node.getBoundingClientRect();
                const containerRect = document.querySelector('.mapa-wrapper').getBoundingClientRect();

                // Cálculo relativo ao container do mapa
                const left = (node.offsetLeft + (node.offsetWidth / 2)) - (marcador.offsetWidth / 2);
                const top = node.offsetTop - (marcador.offsetHeight);

                marcador.style.left = left + 'px';
                marcador.style.top = top + 'px';
            }, 100);
        }
    },

    SelecionarFaseMapa: function (faseId) {
        if (faseId > (window.EstadoJogo.FasesDesbloqueadas || 1)) {
            window.GerenciadorInterface.ExibirMensagem("Esta fase ainda está bloqueada!", "erro");
            return;
        }

        console.log(`[NAVEGACAO] Selecionar Fase: ${faseId}`);
        window.EstadoJogo.FaseAtual = faseId;
        this.AtualizarMarcadorMapa(faseId);

        // Transição para história
        setTimeout(() => {
            this.MostrarHistoria(faseId);
        }, 500);
    },

    MostrarHistoria: function (faseId) {
        // Pega a primeira campanha disponível (Castelo)
        const campanha = window.BancoDeDados.Campanhas.Castelo;
        const dadosNivel = campanha.niveis[faseId];

        if (!dadosNivel || !dadosNivel.historia) {
            this.MostrarDialogo(faseId);
            return;
        }

        const historia = dadosNivel.historia;
        document.getElementById('historia-titulo').innerText = historia.titulo;
        document.getElementById('historia-subtitulo').innerText = historia.subtitulo || "";
        document.getElementById('historia-texto').innerText = historia.texto;

        const btn = document.getElementById('btn-iniciar-historia');
        if (btn) {
            btn.onclick = () => this.MostrarDialogo(faseId);
        }

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

        console.log(`[NAVEGACAO] Iniciando combate do nível ${faseId}...`);

        // Converte inimigos do banco para instâncias de combate
        const inimigosInstanciados = [];
        dadosFase.inimigos.forEach(def => {
            let template = null;
            if (def.tipo === 'Unidade') {
                try {
                    template = window.BancoDeDados.Unidades[def.raca][def.classe].find(u => u.nivel === (def.nivel || 1));
                } catch (e) { console.error("Erro template unidade:", e); }
            } else if (def.tipo === 'Chefe') {
                template = window.BancoDeDados.Chefes.find(c => c.id === def.id);
            } else if (def.tipo === 'Aleatorio') {
                // Seleção Aleatória de Unidade ou Boss do tipo "Lacaio"
                const pool = [];
                const racasParaIncluir = def.raca ? [def.raca] : ['Orcs', 'Humanos'];

                racasParaIncluir.forEach(racaNome => {
                    const raca = window.BancoDeDados.Unidades[racaNome];
                    if (raca) {
                        Object.values(raca).forEach(classe => {
                            const u = classe.find(unit => unit.nivel === (def.nivel || 1));
                            if (u) pool.push(u);
                        });
                    }
                });

                // Adiciona Cavaleiro Esquecido (se for aleatório global e chance rara)
                if (!def.raca && Math.random() > 0.8) {
                    pool.push(window.BancoDeDados.Chefes.find(c => c.id === 5));
                }

                template = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
            }

            if (template) {
                // Deep clone do template
                inimigosInstanciados.push(JSON.parse(JSON.stringify(template)));
            }
        });

        if (inimigosInstanciados.length > 0) {
            // Aplica cenário se houver
            const telaJogo = document.getElementById('tela-jogo');
            if (telaJogo && dadosFase.cenario) {
                telaJogo.style.backgroundImage = `url('${dadosFase.cenario}')`;
            }

            window.SistemaCombate.Iniciar(inimigosInstanciados);
        } else {
            alert("Erro crítico: Nenhuma unidade inimiga carregada.");
            this.MostrarMapaCampanha();
        }
    },

    FinalizarCombate: function (vitoria) {
        if (vitoria) {
            // Desbloqueia próxima fase
            if (window.EstadoJogo.FaseAtual === window.EstadoJogo.FasesDesbloqueadas) {
                window.EstadoJogo.FasesDesbloqueadas++;
            }

            // Vai para tela de vitória que o combate já chamou
            // O botão de continuar na tela de vitória deve chamar MostrarMapaCampanha
            const btnContinuar = document.getElementById('btn-vitoria-continuar');
            if (btnContinuar) {
                btnContinuar.onclick = () => this.MostrarMapaCampanha();
            }
        } else {
            // Combate já lida com derrota (recarrega ou tela derrota)
        }
    }
};

// Global alias for compatibility with index.html
window.Navigation = window.SistemaNavegacao;
