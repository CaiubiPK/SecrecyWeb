/**
 * GERENCIADOR DE INTERFACE (UI)
 * Responsável por todas as manipulações do DOM e interação com o usuário.
 * Versão Completa com Modais, Telas Especiais e Configurações.
 */

window.GerenciadorInterface = {
    CacheDOM: {},

    Inicializar: function () {
        console.log("✅ [UI] Interface Completa Inicializada.");
        this.CacheDOM = {};
        this.ConfigurarEventosGlobais();
        this.ConfigurarSlotsPersonagens();
    },

    ObterElemento: function (id) {
        if (!this.CacheDOM[id]) {
            const el = document.getElementById(id);
            if (el) this.CacheDOM[id] = el;
            // else console.warn(`⚠️ Elemento UI não encontrado: #${id}`); // Silenciado para não poluir
        }
        return this.CacheDOM[id];
    },

    ConfigurarEventosGlobais: function () {
        // Botões de Info (Atributos)
        document.querySelectorAll('.botao-info-stats').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const tipo = btn.dataset.alvo; // 'jogador' ou 'inimigo'
                // Por enquanto assume índice 0 (Principal)
                const alvo = tipo === 'jogador'
                    ? window.EstadoJogo.Jogadores[0]
                    : window.EstadoJogo.Inimigos.find(i => i.vida > 0); // Pega o primeiro vivo ou o principal

                if (alvo) this.AbrirModalAtributos(alvo);
            };
        });

        // Configurações e Menus
        const btnConfig = document.getElementById('btn-config');
        if (btnConfig) btnConfig.onclick = () => this.AbrirModalConfig();

        window.FecharMenuConfig = () => this.FecharModal('modal-config');
        window.FecharDetalhesAtributos = () => this.FecharModal('modal-atributos');
        window.FecharModalBaralho = () => this.FecharModal('modal-baralho');
        window.UI = this; // Alias reverso para compatibilidade de onClick no HTML
    },

    ConfigurarSlotsPersonagens: function () {
        for (let i = 1; i <= 3; i++) {
            const elJ = document.getElementById(`jogador-${i}`);
            if (elJ) elJ.onclick = () => window.SistemaMira.ProcessarCliquePersonagem('aliado', i - 1);

            const elI = document.getElementById(`inimigo-${i}`);
            if (elI) elI.onclick = () => window.SistemaMira.ProcessarCliquePersonagem('inimigo', i - 1);
        }
    },

    TrocarTela: function (idTela) {
        document.querySelectorAll('.tela, .tela-especial').forEach(t => {
            t.classList.add('oculta');
            t.classList.remove('ativa');
        });

        const tela = this.ObterElemento(idTela);
        if (tela) {
            tela.classList.remove('oculta');
            tela.classList.add('ativa');
            this.AtualizarMusicaPorTela(idTela);
        }
    },

    AtualizarMusicaPorTela: function (idTela) {
        if (idTela === 'tela-inicial') window.GerenciadorAudio.TocarMusica(window.BancoDeDados.Audio.Musicas.Fundo);
        else if (idTela === 'tela-jogo') window.GerenciadorAudio.TocarMusica(window.BancoDeDados.Audio.Musicas.BatalhaSimples);
        else if (idTela === 'tela-vitoria') window.GerenciadorAudio.TocarMusica(window.BancoDeDados.Audio.Musicas.Vitoria);
    },

    FecharModal: function (idModal) {
        const modal = this.ObterElemento(idModal);
        if (modal) modal.classList.add('oculta');
    },

    FecharInventario: function () {
        this.FecharModal('modal-inventario');
    },

    AbrirModal: function (idModal) {
        const modal = this.ObterElemento(idModal);
        if (modal) modal.classList.remove('oculta');
    },

    // =========================================================================
    // MODAL DE ATRIBUTOS
    // =========================================================================
    AbrirModalAtributos: function (personagem) {
        const modal = this.ObterElemento('modal-atributos');
        const lista = this.ObterElemento('lista-atributos-detalhada');
        const imagem = this.ObterElemento('imagem-atributo-destaque');
        const titulo = this.ObterElemento('titulo-modal-atributos');

        if (!modal || !lista) return;

        if (imagem) imagem.style.backgroundImage = `url('${personagem.imagem || "Images/Personagens/Jogador.png"}')`;
        if (titulo) titulo.innerText = personagem.nome;

        lista.innerHTML = '';
        lista.style.display = 'grid';
        lista.style.gridTemplateColumns = 'repeat(2, 1fr)';
        lista.style.gap = '10px';

        const atributos = [
            { label: "Vida Máx", valor: personagem.vidaMaxima, icone: "❤️" },
            { label: "Energia Máx", valor: personagem.energiaMaxima, icone: "⚡" },
            { label: "Mana Máx", valor: personagem.manaMaxima, icone: "🔹" },
            { label: "Ataque", valor: personagem.ataque, icone: "⚔️" },
            { label: "Atk Mágico", valor: personagem.ataqueMagico, icone: "🔮" },
            { label: "Armadura", valor: personagem.armadura, icone: "🛡️" },
            { label: "Prot Mágica", valor: personagem.protecaoMagica, icone: "🧿" },
            { label: "Vigor", valor: personagem.vigor || 0, icone: "💪" },
            { label: "Crítico", valor: `${personagem.chanceCritico}%`, icone: "🎯" },
            { label: "Esquiva", valor: `${personagem.esquiva || 0}%`, icone: "💨" },
        ];

        atributos.forEach(attr => {
            const item = document.createElement('div');
            item.className = 'item-atributo-detalhe';
            item.style.padding = '8px';
            item.style.background = 'rgba(255,255,255,0.05)';
            item.style.borderRadius = '5px';
            item.innerHTML = `
                <div style="font-size:0.8rem; color:#aaa;">${attr.icone} ${attr.label}</div>
                <div style="font-weight:bold; color:#fff; text-align:right;">${attr.valor}</div>
            `;
            lista.appendChild(item);
        });

        modal.classList.remove('oculta');
    },

    // =========================================================================
    // MODAL DE CONFIGURAÇÕES
    // =========================================================================
    AbrirModalConfig: function () {
        this.AbrirModal('modal-config');
    },

    AlternarAudio: function () {
        const estado = window.GerenciadorAudio.ToggleMute();
        const btn = document.getElementById('btn-audio-toggle');
        if (btn) btn.innerText = estado ? "Desabilitar Áudio" : "Habilitar Áudio";
    },

    DesistirCombate: function () {
        if (confirm("Tem certeza que deseja desistir?")) {
            location.reload();
        }
    },

    // =========================================================================
    // MODAL DE VITÓRIA
    // =========================================================================
    MostrarTelaVitoria: function (recompensas) {
        const tela = this.ObterElemento('tela-vitoria');
        const resumo = this.ObterElemento('vitoria-resumo');

        if (!tela) return;

        if (resumo) {
            resumo.innerHTML = `
                <div class="item-recompensa">💰 ${recompensas.ouro || 0} Ouro</div>
                <div class="item-recompensa">✨ ${recompensas.xp || 0} XP</div>
            `;
        }

        const btnContinuar = document.getElementById('btn-vitoria-continuar');
        if (btnContinuar) {
            btnContinuar.onclick = () => {
                if (window.Navigation) {
                    window.Navigation.FinalizarCombate(true);
                } else {
                    this.TrocarTela('tela-campanha');
                }
            };
        }

        this.TrocarTela('tela-vitoria');
        window.GerenciadorAudio.TocarMusica(window.BancoDeDados.Audio.Musicas.Vitoria);
    },

    // =========================================================================
    // HUD E INTERFACE DE COMBATE
    // =========================================================================
    ExibirMensagem: function (texto, tipo = 'normal') {
        const display = this.ObterElemento('display-mensagens');
        const paragrafo = this.ObterElemento('texto-mensagem');

        if (!display || !paragrafo) return;

        paragrafo.innerText = texto;
        display.className = 'display-mensagens';
        display.classList.add('animacao-entrada');

        if (tipo === 'erro') paragrafo.style.color = '#ff5555';
        else if (tipo === 'critico') paragrafo.style.color = '#ffcc00';
        else if (tipo === 'cura') paragrafo.style.color = '#55ff55';
        else if (tipo === 'vitoria') paragrafo.style.color = '#55ffff';
        else paragrafo.style.color = '#fff';

        display.classList.remove('oculta');

        if (this._timeoutMensagem) clearTimeout(this._timeoutMensagem);
        this._timeoutMensagem = setTimeout(() => {
            display.classList.add('oculta');
        }, 2500);

        this.AdicionarAoLog(texto, tipo);
    },

    AdicionarAoLog: function (texto, tipo) {
        const lista = this.ObterElemento('lista-log-recente');
        if (lista) {
            const item = document.createElement('div');
            item.className = `item-log ${tipo}`;
            item.innerText = `> ${texto}`;
            lista.prepend(item);
            if (lista.children.length > 6) lista.lastChild.remove();
        }
    },

    AtualizarStatus: function (idPrefixo, estadoAtual) {
        // Vida
        const barraVida = this.ObterElemento(`barra-vida-${idPrefixo}`);
        const textoVida = this.ObterElemento(`texto-vida-${idPrefixo}`);
        if (barraVida && textoVida) {
            const pct = Math.max(0, Math.min(100, (estadoAtual.vida / estadoAtual.vidaMaxima) * 100));
            barraVida.style.width = `${pct}%`;
            textoVida.innerText = `${Math.floor(estadoAtual.vida)}/${estadoAtual.vidaMaxima}`;
        }

        // Energia
        const barraEnergia = this.ObterElemento(`barra-energia-${idPrefixo}`);
        const textoEnergia = this.ObterElemento(`texto-energia-${idPrefixo}`);
        if (barraEnergia && textoEnergia) {
            const pct = Math.max(0, Math.min(100, (estadoAtual.energia / estadoAtual.energiaMaxima) * 100));
            barraEnergia.style.width = `${pct}%`;
            textoEnergia.innerText = `${Math.floor(estadoAtual.energia)}/${estadoAtual.energiaMaxima}`;
        }

        // Mana
        const barraMana = this.ObterElemento(`barra-mana-${idPrefixo}`);
        const textoMana = this.ObterElemento(`texto-mana-${idPrefixo}`);
        if (barraMana && textoMana) {
            const pct = Math.max(0, Math.min(100, (estadoAtual.mana / estadoAtual.manaMaxima) * 100));
            barraMana.style.width = `${pct}%`;
            textoMana.innerText = `${Math.floor(estadoAtual.mana)}/${estadoAtual.manaMaxima}`;
        }

        // Atualizar Grid de Atributos do Jogador Principal
        if (idPrefixo === 'jogador') {
            this.AtualizarTexto('atk-jogador', estadoAtual.ataque);
            this.AtualizarTexto('def-jogador', estadoAtual.armadura);
            this.AtualizarTexto('vigor-jogador', estadoAtual.vigor || 0);
            this.AtualizarTexto('crit-jogador', (estadoAtual.chanceCritico || 0) + '%');
            this.AtualizarTexto('roubo-jogador', (estadoAtual.rouboVida || 0) + '%');
            this.AtualizarTexto('pen-jogador-abs', estadoAtual.penetracaoArmadura || 0);
            this.AtualizarTexto('det-jogador', Math.floor(estadoAtual.determinacao || 0));
        }

        this.AtualizarIconesEfeitos(idPrefixo, estadoAtual.efeitos);
    },

    AtualizarHUDCompleto: function () {
        if (window.SistemaCombate) {
            window.SistemaCombate.AtualizarInterfaceCompleta();
        }
    },

    AtualizarTexto: function (id, texto) {
        const el = this.ObterElemento(id);
        if (el) el.innerText = texto;
    },

    AtualizarIconesEfeitos: function (idPrefixo, efeitos) {
        const container = document.getElementById(`efeitos-${idPrefixo}`);
        if (!container) return;

        container.innerHTML = '';
        if (efeitos && efeitos.length > 0) {
            efeitos.forEach(eff => {
                const def = window.BancoDeDados.Efeitos[eff.nome];
                const nivelInfo = def && def.niveis ? def.niveis[eff.nivel] : {};
                const icone = nivelInfo.icone || "❓";

                const el = document.createElement('div');
                el.className = 'efeito-icone';
                el.innerHTML = `${icone} <small>${eff.duracao}</small>`;
                el.title = `${eff.nome}: ${eff.duracao} turnos`;
                container.appendChild(el);
            });
        }
    },

    RenderizarMao: function () {
        const container = document.getElementById('mao-cartas');
        if (!container) return;

        container.innerHTML = '';
        const mao = window.EstadoJogo.Mao || [];

        mao.forEach((carta, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'carta-jogo';
            if (carta.raridade) cardEl.classList.add(`raridade-${carta.raridade.toLowerCase()}`);

            cardEl.innerHTML = `
                <div class="carta-custo">${carta.custoEnergia || 0}⚡</div>
                <div class="carta-nome">${carta.nome}</div>
                <div class="carta-imagem" style="background-image: url('${carta.imagem || ""}')"></div>
                <div class="carta-descricao">${carta.descricao}</div>
            `;

            cardEl.onclick = () => window.SistemaCombate.TentarUsarCarta(index);
            container.appendChild(cardEl);
        });
    },

    MostrarIndicadorFlutuante: function (idAlvo, valor, tipo) {
        const el = this.ObterElemento(`indicador-dano-${idAlvo}`);
        if (!el) return;

        const prefixo = tipo === 'cura' ? '+' : (tipo === 'dano' || tipo === 'critico' ? '-' : '');
        el.innerText = `${prefixo}${valor}`;
        el.className = 'indicador-flutuante';

        requestAnimationFrame(() => {
            el.classList.add('animar-subir');
            if (tipo === 'cura') el.style.color = '#00ff00';
            else if (tipo === 'critico') {
                el.style.color = '#ffcc00';
                el.innerText = `💥 ${valor}`;
            }
            else el.style.color = '#ff3333';
        });

        setTimeout(() => {
            el.classList.remove('animar-subir');
            el.innerText = '';
        }, 1200);
    },

    AnimarAtaque: function (idAtacante, idAlvo) {
        const elAtacante = document.getElementById(idAtacante);
        if (!elAtacante) return;

        const animClass = idAtacante.includes('jogador') ? 'ataque-dash-jogador' : 'ataque-dash-inimigo';
        elAtacante.classList.add(animClass);

        setTimeout(() => {
            elAtacante.classList.remove(animClass);
        }, 500);

        const elAlvo = document.getElementById(idAlvo);
        if (elAlvo) {
            setTimeout(() => {
                elAlvo.classList.add('tomar-dano');
                setTimeout(() => elAlvo.classList.remove('tomar-dano'), 400);
            }, 250);
        }
    },

    RenderizarPersonagens: function (jogadores, inimigos) {
        for (let i = 0; i < 3; i++) {
            const el = document.getElementById(`jogador-${i + 1}`);
            if (!el) continue;

            const dados = jogadores[i];
            if (dados && dados.vida > 0) {
                el.classList.remove('oculta');
                el.classList.remove('personagem-morto');
                const visual = el.querySelector('.visual-personagem');
                const nome = el.querySelector('.nome-personagem');

                if (visual) visual.style.backgroundImage = `url('${dados.imagem}')`;
                if (nome) nome.innerText = dados.nome;
            } else if (dados && dados.vida <= 0) {
                el.classList.add('personagem-morto');
            } else {
                el.classList.add('oculta');
            }
        }

        for (let i = 0; i < 3; i++) {
            const el = document.getElementById(`inimigo-${i + 1}`);
            if (!el) continue;

            const dados = inimigos[i];
            if (dados && dados.vida > 0) {
                el.classList.remove('oculta');
                const visual = el.querySelector('.visual-personagem');
                const nome = el.querySelector('.nome-personagem');

                if (visual) visual.style.backgroundImage = `url('${dados.imagem}')`;
                if (nome) nome.innerText = dados.nome;
            } else {
                el.classList.add('oculta');
            }
        }
    },

    AbrirInventario: function () {
        this.AbrirModal('modal-inventario');
        this.RenderizarInventario();
    },

    RenderizarInventario: function () {
        const grid = this.ObterElemento('grid-inventario');
        if (!grid) return;

        grid.innerHTML = '';
        if (!window.EstadoJogo.Jogadores[0].inventario) {
            window.SistemaInventario.Inicializar();
        }

        const inventario = window.EstadoJogo.Jogadores[0].inventario;

        inventario.forEach((item, index) => {
            const slot = document.createElement('div');
            slot.className = item ? 'inventario-slot slot-cheio' : 'inventario-slot slot-vazio';

            if (item) {
                const img = document.createElement('img');
                img.src = item.imagem || "Images/Itens/PocaoDeVida.png";
                slot.appendChild(img);
                slot.title = item.nome;
                slot.onclick = () => window.SistemaInventario.UsarItem(index);
            }

            grid.appendChild(slot);
        });

        const detalhes = this.ObterElemento('inventario-detalhes');
        if (detalhes) detalhes.innerText = "Clique em um item para usar.";
    },

    // =========================================================================
    // MODAL DE BARALHO (DECK)
    // =========================================================================
    AbrirModalBaralho: function () {
        this.AbrirModal('modal-baralho');
        const grid = this.ObterElemento('deck-grid');
        if (!grid) return;

        grid.innerHTML = '';
        // Mostra todas as cartas disponíveis no banco (simulação de coleção)
        // Idealmente usaria window.EstadoJogo.Deck ou similar
        const cartas = window.BancoDeDados.Cartas;

        cartas.forEach(carta => {
            const el = document.createElement('div');
            el.className = 'carta-miniatura';
            el.innerHTML = `
                <div class="carta-nome-mini">${carta.nome}</div>
                <div class="carta-custo-mini">${carta.custoEnergia || 0}⚡</div>
            `;
            if (carta.raridade) el.classList.add(`raridade-${carta.raridade.toLowerCase()}`);
            el.title = `${carta.nome}: ${carta.descricao}`;
            grid.appendChild(el);
        });
    },

    // Alias para HTML onclicks legados
    MenuDesistir: function () {
        this.DesistirCombate();
    },

    AbrirBaralhoViaConfig: function () {
        this.FecharModal('modal-config');
        this.AbrirModalBaralho();
    },

    ToggleAudio: function () {
        this.AlternarAudio();
    },

    FecharPrograma: function () {
        if (confirm("Deseja fechar o jogo?")) {
            window.close(); // Pode não funcionar em todos os navegadores por segurança
            location.href = "about:blank";
        }
    },

    // =========================================================================
    // SELEÇÃO DE CARTAS (NOVO INTERFACE)
    // =========================================================================
    AbrirSelecaoCartas: function (tipo) {
        const overlay = this.ObterElemento('container-cartas');
        const wrapper = this.ObterElemento('cartas-wrapper-overlay');
        const titulo = this.ObterElemento('titulo-selecao-cartas');

        if (!overlay || !wrapper) return;

        titulo.innerText = tipo === 'atacar' ? "Selecione seu Ataque" : "Selecione uma Habilidade";
        wrapper.innerHTML = '';

        // Filtra a mão ou mostra toda a mão com destaque?
        // O usuário pediu "as cartas devem aparecer", então vamos mostrar o overlay.
        const mao = window.EstadoJogo.Mao || [];

        mao.forEach((carta, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'carta';
            if (carta.raridade) cardEl.classList.add(`raridade-${carta.raridade.toLowerCase()}`);

            // Adiciona tipo para visual (opcional)
            const ehHabilidade = carta.custoMana > 0;
            const corBorda = ehHabilidade ? '#3498db' : '#d4af37';
            cardEl.style.borderColor = corBorda;

            cardEl.innerHTML = `
                <div class="tag-raridade raridade-${carta.raridade.toLowerCase()}">${carta.raridade}</div>
                <div class="carta-imagem" style="background-image: url('${carta.imagem || ""}')"></div>
                <div class="info-carta">
                    <div class="nome-carta">${carta.nome}</div>
                    <div class="custo-carta">${carta.custoEnergia ? carta.custoEnergia + '⚡' : ''} ${carta.custoMana ? carta.custoMana + '🔹' : ''}</div>
                    <p style="font-size: 0.8rem; opacity: 0.8;">${carta.descricao || ''}</p>
                </div>
            `;

            cardEl.onclick = () => {
                this.FecharSelecaoCartas();
                window.SistemaCombate.TentarUsarCarta(index);
            };
            wrapper.appendChild(cardEl);
        });

        overlay.classList.remove('oculta');
    },

    FecharSelecaoCartas: function () {
        this.FecharModal('container-cartas');
    }
};

// Aliases Globais Finais para garantir compatibilidade com index.html
window.MenuDesistir = () => window.GerenciadorInterface.MenuDesistir();
window.AbrirBaralhoViaConfig = () => window.GerenciadorInterface.AbrirBaralhoViaConfig();
window.ToggleAudio = () => window.GerenciadorInterface.ToggleAudio();
window.FecharPrograma = () => window.GerenciadorInterface.FecharPrograma();
window.AbrirMenuConfig = () => window.GerenciadorInterface.AbrirModalConfig();

