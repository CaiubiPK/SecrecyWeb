
// ==========================================
// UI.JS - Gerenciamento da Interface
// ==========================================

window.UI = {
    Elementos: {}, // Cache DOM

    Init: function () {
        Utils.Log("UI.Init", "Mapeando elementos...");

        this.Elementos = {
            Telas: {
                Inicial: document.getElementById('tela-inicial'),
                Jogo: document.getElementById('tela-jogo'),
                Nome: document.getElementById('tela-nome'),
                Campanha: document.getElementById('tela-campanha'),
                Vitoria: document.getElementById('tela-vitoria'),
                Talentos: document.getElementById('menu-talentos'),
                DialogoCombate: document.getElementById('tela-dialogo-combate'),
                Historia: document.getElementById('tela-historia'),
                MapaCampanha: document.getElementById('tela-mapa-campanha')
            },
            HUD: {
                Jogador: this.MapearHUD('jogador'),
                Inimigo: this.MapearHUD('inimigo')
            },
            Mensagens: {
                Display: document.getElementById('display-mensagens'),
                Texto: document.getElementById('texto-mensagem')
            },
            Modais: {
                Atributos: document.getElementById('modal-atributos'),
                Baralho: document.getElementById('modal-baralho'),
                Config: document.getElementById('modal-config'),
                Inventario: document.getElementById('modal-inventario')
            },
            Historia: {
                Titulo: document.getElementById('historia-titulo'),
                Subtitulo: document.getElementById('historia-subtitulo'),
                Texto: document.getElementById('historia-texto'),
                Botao: document.getElementById('btn-iniciar-historia')
            }
        };

        // Event Listeners para botões de detalhes
        document.querySelectorAll('.botao-info-stats').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Evita triggar click no pai
                const alvoTipo = e.target.dataset.alvo;
                const indice = alvoTipo === 'jogador'
                    ? (EstadoDoJogo.jogadorFoco || 0)
                    : (EstadoDoJogo.inimigoFoco || 0);

                const personagem = alvoTipo === 'jogador'
                    ? EstadoDoJogo.jogadores[indice]
                    : EstadoDoJogo.inimigos[indice];

                if (personagem) this.MostrarDetalhesAtributos(personagem);
            });
        });

        // Configuração do Modal de Atributos
        window.FecharDetalhesAtributos = () => {
            document.getElementById('modal-atributos').classList.add('oculta');
        };

        window.FecharInventario = () => {
            this.FecharInventario();
        };

        // Expor para compatibilidade com código legado se necessário
        window.ElementosUI = this.Elementos;
    },

    MapearHUD: function (tipo) {
        return {
            Nome: document.getElementById(tipo === 'jogador' ? 'nome-jogador-hud' : 'nome-inimigo-hud'), // Ajustar ID no HTML se precisar
            VidaTexto: document.getElementById(`texto-vida-${tipo}`),
            VidaBarra: document.getElementById(`barra-vida-${tipo}`),
            EnergiaTexto: document.getElementById(`texto-energia-${tipo}`),
            EnergiaBarra: document.getElementById(`barra-energia-${tipo}`),
            ManaTexto: document.getElementById(`texto-mana-${tipo}`),
            ManaBarra: document.getElementById(`barra-mana-${tipo}`),
            AtkValor: document.getElementById(`atk-${tipo}`),
            Def: document.getElementById(`def-${tipo}`),
            Vigor: document.getElementById(`vigor-${tipo}`),
            Roubo: document.getElementById(`roubo-${tipo}`),
            Crit: document.getElementById(`crit-${tipo}`),
            Pen: document.getElementById(`pen-${tipo}-abs`),
            Det: document.getElementById(`det-${tipo}`),
            // Flexibilidade para inputs específicos do jogador
            AtkLabel: tipo === 'jogador' ? document.getElementById('label-ataque-jogador') : null
        };
    },

    TrocarTela: function (idTela) {
        Utils.Log(`UI.TrocarTela -> ${idTela}`);
        const telas = this.Elementos.Telas;

        Object.values(telas).forEach(tela => {
            if (tela) tela.classList.add('oculta');
            if (tela) tela.classList.remove('ativa');
        });

        const telaAlvo = document.getElementById(idTela); // Busca direto ou usa cache
        if (telaAlvo) {
            telaAlvo.classList.remove('oculta');
            telaAlvo.classList.add('ativa');
        }
    },

    AtualizarInterface: function () {
        if (!EstadoDoJogo.jogadores[0]) return;

        // Atualiza Jogador Principal (Foco)
        const jogador = EstadoDoJogo.jogadores[EstadoDoJogo.jogadorFoco || 0];
        this.AtualizarUnitHUD(this.Elementos.HUD.Jogador, jogador, true);

        // Atualiza Inimigo Principal (Foco)
        const inimigo = EstadoDoJogo.inimigos[EstadoDoJogo.inimigoFoco || 0];
        if (inimigo) {
            this.AtualizarUnitHUD(this.Elementos.HUD.Inimigo, inimigo, false);
            // Atualiza Nome (caso tenha mudado)
            const nomeEl = document.getElementById('nome-inimigo-hud');
            if (nomeEl) {
                nomeEl.textContent = inimigo.ehPrincipal
                    ? inimigo.nome
                    : `${inimigo.nome} (Nvl ${inimigo.nivel || 1})`;
            }
        } else {
            // Limpa HUD Inimigo ou esconde
            const nomeEl = document.getElementById('nome-inimigo-hud');
            if (nomeEl) nomeEl.textContent = "Nenhum Inimigo";
        }
    },

    AtualizarUnitHUD: function (hud, dados, ehJogador) {
        if (!hud || !dados) return;

        // Barras
        this.SetBarra(hud.VidaBarra, hud.VidaTexto, dados.vida, dados.vidaMaxima);
        this.SetBarra(hud.EnergiaBarra, hud.EnergiaTexto, dados.energia, dados.energiaMaxima);
        this.SetBarra(hud.ManaBarra, hud.ManaTexto, dados.mana, dados.manaMaxima);

        // Atributos
        if (hud.AtkValor) hud.AtkValor.textContent = (ehJogador && dados.classe === "Mago") ? dados.ataqueMagico : dados.ataque;
        if (hud.AtkLabel && ehJogador) hud.AtkLabel.textContent = (dados.classe === "Mago") ? "MATK" : "ATK";

        if (hud.Def) hud.Def.textContent = dados.armadura;
        if (hud.Vigor) hud.Vigor.textContent = dados.vigor;
        if (hud.Roubo) hud.Roubo.textContent = `${dados.rouboVida}%`;
        if (hud.Crit) hud.Crit.textContent = `${dados.chanceCritico}%`;
        if (hud.Det) hud.Det.textContent = Math.floor(dados.determinacao);

        const pen = (ehJogador && dados.classe === "Mago") ? dados.penetracaoMagica : dados.penetracaoArmadura;
        if (hud.Pen) hud.Pen.textContent = pen;

        // Atualiza Lista de Efeitos
        this.AtualizarEfeitosVisuais(dados, ehJogador);
    },

    SetBarra: function (barra, texto, atual, max) {
        if (texto) texto.textContent = `${Math.floor(atual)}/${max}`;
        if (barra) barra.style.width = `${Math.max(0, Math.min(100, (atual / max) * 100))}%`;
    },

    AtualizarEfeitosVisuais: function (dados, ehJogador) {
        const container = document.getElementById(ehJogador ? 'efeitos-jogador' : 'efeitos-inimigo');
        if (!container) return;

        container.innerHTML = '';
        if (dados.efeitos && dados.efeitos.length > 0) {
            dados.efeitos.forEach(eff => {
                const def = BancoDeDados.Efeitos[eff.nome];
                const nivelInfo = def && def.niveis ? def.niveis[eff.nivel] : {};
                const icone = nivelInfo.icone || "❓"; // Fallback

                const el = document.createElement('div');
                el.className = 'efeito-icone';
                el.innerHTML = `${icone} <div class="efeito-turnos">${eff.duracao}</div> <div class="efeito-stack">${eff.nivel}</div>`;
                el.title = `${eff.nome} Nvl ${eff.nivel} (${eff.duracao} turnos)`;

                // Clique para abrir menu de detalhes
                el.onclick = () => this.AbrirMenuEfeitos(dados);

                container.appendChild(el);
            });
        }
    },

    AbrirMenuEfeitos: function (personagem) {
        Utils.Log(`UI.AbrirMenuEfeitos -> ${personagem.nome}`);
        const modal = document.getElementById('modal-efeitos');
        const lista = document.getElementById('lista-efeitos-detalhada');
        const titulo = document.getElementById('titulo-modal-efeitos');

        if (!modal || !lista) return;

        titulo.textContent = `Efeitos: ${personagem.nome}`;
        lista.innerHTML = '';

        if (!personagem.efeitos || personagem.efeitos.length === 0) {
            lista.innerHTML = '<p class="placeholder">Nenhum efeito ativo no momento.</p>';
        } else {
            personagem.efeitos.forEach(eff => {
                const def = BancoDeDados.Efeitos[eff.nome];
                const nivelInfo = def && def.niveis ? def.niveis[eff.nivel] : {};
                const icone = nivelInfo.icone || "❓";
                const desc = nivelInfo.descricao || "Sem descrição disponível.";

                const item = document.createElement('div');
                item.className = 'item-efeito-detalhe';
                item.innerHTML = `
                    <div class="item-efeito-icone">${icone}</div>
                    <div class="item-efeito-corpo">
                        <div class="item-efeito-nome">
                            ${eff.nome}
                            <span class="item-efeito-nvl">Nível ${eff.nivel}</span>
                        </div>
                        <div class="item-efeito-desc">${desc}</div>
                        <div class="item-efeito-duracao">Faltam ${eff.duracao} turnos</div>
                    </div>
                `;
                lista.appendChild(item);
            });
        }

        modal.classList.remove('oculta');
    },

    FecharMenuEfeitos: function () {
        const modal = document.getElementById('modal-efeitos');
        if (modal) modal.classList.add('oculta');
    },

    ExibirMensagem: function (texto, tipo = "") {
        Utils.Log(`Msg: ${texto}`);
        const display = this.Elementos.Mensagens.Display;
        const txtEl = this.Elementos.Mensagens.Texto;

        if (EstadoDoJogo.timerMensagem) clearTimeout(EstadoDoJogo.timerMensagem);

        if (!display || !txtEl) return;

        txtEl.textContent = texto;
        display.className = "display-mensagens"; // Reset
        if (tipo) display.classList.add(`mensagem-${tipo}`);

        display.classList.remove('oculta');

        // Sons de feedback
        if (tipo === 'erro') Utils.PlaySound(AudioConfig.Interface.Erro, 0.5);
        if (tipo === 'vitoria' || tipo === 'sucesso') Utils.PlaySound(AudioConfig.Interface.Sucesso, 0.5);

        EstadoDoJogo.timerMensagem = setTimeout(() => {
            display.classList.add('oculta');
        }, 3000);

        // ADICIONAR TAMBÉM AO LOG DE COMBATE
        this.AdicionarAoLog(texto, tipo);
    },

    // ==========================================
    // SISTEMA DE LOG DE COMBATE
    // ==========================================

    AdicionarAoLog: function (mensagem, tipo = 'sistema') {
        // Inicializa log se não existir
        if (!EstadoDoJogo.logCombate) EstadoDoJogo.logCombate = [];

        // Adiciona timestamp
        const entrada = {
            mensagem: mensagem,
            tipo: tipo, // 'jogador', 'inimigo', 'sistema'
            timestamp: Date.now()
        };

        EstadoDoJogo.logCombate.push(entrada);

        // Limita a 100 entradas para evitar overflow de memória
        if (EstadoDoJogo.logCombate.length > 100) {
            EstadoDoJogo.logCombate.shift();
        }

        // Atualiza visual do log recente
        this.AtualizarLogRecente();
    },

    AtualizarLogRecente: function () {
        const container = document.getElementById('lista-log-recente');
        if (!container) return;

        // Pega as últimas 3 mensagens
        const mensagensRecentes = EstadoDoJogo.logCombate.slice(-3).reverse();

        container.innerHTML = '';

        mensagensRecentes.forEach(entrada => {
            const item = document.createElement('div');
            item.className = `item-log ${entrada.tipo}`;
            item.textContent = entrada.mensagem;
            container.appendChild(item);
        });
    },

    AbrirLogCompleto: function () {
        const modal = document.getElementById('modal-log-completo');
        const conteudo = document.getElementById('conteudo-log-completo');

        if (!modal || !conteudo) return;

        conteudo.innerHTML = '';

        if (!EstadoDoJogo.logCombate || EstadoDoJogo.logCombate.length === 0) {
            conteudo.innerHTML = '<p class="placeholder">Nenhuma ação registrada ainda.</p>';
        } else {
            // Mostra todas as entradas, mais recentes primeiro
            const todasMensagens = [...EstadoDoJogo.logCombate].reverse();

            todasMensagens.forEach(entrada => {
                const item = document.createElement('div');
                item.className = `item-log ${entrada.tipo}`;
                item.textContent = entrada.mensagem;
                conteudo.appendChild(item);
            });
        }

        modal.classList.remove('oculta');
    },

    FecharLogCompleto: function () {
        const modal = document.getElementById('modal-log-completo');
        if (modal) modal.classList.add('oculta');
    },

    LimparLog: function () {
        EstadoDoJogo.logCombate = [];
        this.AtualizarLogRecente();
    },

    MostrarIndicadorDano: function (slotId, valor, tipo) { // slotId: 'jogador-1', 'inimigo-1'
        const el = document.getElementById(`indicador-dano-${slotId}`);
        if (!el) return;

        el.textContent = tipo === 'cura' ? `+${valor}` : `-${valor}`;
        el.className = `indicador-flutuante indicador-${tipo === 'cura' ? 'cura' : 'dano'}`;

        if (tipo === 'critico') {
            el.classList.add('indicador-critico'); // Usar CSS classe para estilo
        }

        // Resetar animação
        el.classList.remove('animar-indicador');
        void el.offsetWidth; // Trigger reflow
        el.classList.add('animar-indicador');

        setTimeout(() => el.classList.remove('animar-indicador'), 1200);
    },

    AnimarAtaque: function (idAtacante, idAlvo) {
        const elAtacante = document.getElementById(idAtacante);
        const elAlvo = document.getElementById(idAlvo);

        let classeAnim = idAtacante.includes('jogador') ? 'ataque-dash-jogador' : 'ataque-dash-inimigo';

        if (elAtacante) {
            elAtacante.classList.add(classeAnim);
            setTimeout(() => elAtacante.classList.remove(classeAnim), 500);
        }
        if (elAlvo) {
            setTimeout(() => {
                elAlvo.classList.add('tomar-dano');
                setTimeout(() => elAlvo.classList.remove('tomar-dano'), 400);
                // Som de impacto centralizado
                Utils.PlaySound(AudioConfig.Sons.HitEspada, 0.5);
            }, 250);
        }
    },

    MostrarDetalhesAtributos: function (personagem) {
        const modal = document.getElementById('modal-atributos');
        const lista = document.getElementById('lista-atributos-detalhada');
        const imagem = document.getElementById('imagem-atributo-destaque');
        const titulo = document.getElementById('titulo-modal-atributos');

        if (!modal || !lista) return;

        // Configurar Imagem e Título
        if (imagem) imagem.style.backgroundImage = `url('${personagem.imagem || "Images/Personagens/Jogador.png"}')`;
        if (titulo) {
            titulo.textContent = personagem.ehPrincipal
                ? personagem.nome
                : `${personagem.nome} (Nvl ${personagem.nivel || 1})`;
        }

        // Gerar Lista de Atributos
        lista.innerHTML = '';

        // Estilo para grade de duas colunas
        lista.style.display = 'grid';
        lista.style.gridTemplateColumns = 'repeat(2, 1fr)';
        lista.style.gap = '10px';
        lista.style.padding = '10px';

        const atributosParaMostrar = [
            { label: "Vida Máx", valor: personagem.vidaMaxima, icone: "❤️" },
            { label: "Energia Máx", valor: personagem.energiaMaxima, icone: "⚡" },
            { label: "Mana Máx", valor: personagem.manaMaxima, icone: "🔹" },
            { label: "Atk Físico", valor: personagem.ataque, icone: "⚔️" },
            { label: "Atk Mágico", valor: personagem.ataqueMagico, icone: "🔮" },
            { label: "Armadura", valor: personagem.armadura, icone: "🛡️" },
            { label: "Prot Mágica", valor: personagem.protecaoMagica, icone: "🧿" },
            { label: "Vigor", valor: personagem.vigor, icone: "💪" },
            { label: "Determinação", valor: personagem.determinacao, icone: "✨" },
            { label: "Chance Crit", valor: `${personagem.chanceCritico}%`, icone: "🎯" },
            { label: "Dano Crit", valor: `${personagem.danoCritico}%`, icone: "💥" },
            { label: "Roubo Vida", valor: `${personagem.rouboVida}%`, icone: "🩸" },
            { label: "Esquiva", valor: `${personagem.esquiva}%`, icone: "💨" },
            { label: "Precisão", valor: `${personagem.precisao}%`, icone: "👁️" },
            { label: "Pen Armad", valor: personagem.penetracaoArmadura, icone: "🔨" },
            { label: "Pen Mágica", valor: personagem.penetracaoMagica, icone: "🔥" }
        ];

        atributosParaMostrar.forEach(attr => {
            const item = document.createElement('div');
            item.className = 'item-atributo-detalhe';

            item.style.display = 'flex';
            item.style.flexDirection = 'column'; // Vertical para compactar e caber em colunas
            item.style.padding = '8px';
            item.style.background = 'rgba(255,255,255,0.05)';
            item.style.borderRadius = '5px';
            item.style.border = '1px solid rgba(255,255,255,0.1)';
            item.style.color = '#eee';
            item.style.fontSize = '0.9rem';

            item.innerHTML = `
                <div style="display:flex; align-items:center; gap:5px; color:#aaa; font-size:0.8rem; margin-bottom:3px;">
                    <span>${attr.icone}</span> <span>${attr.label}</span>
                </div>
                <div style="font-weight:bold; color:var(--cor-destaque); text-align:right;">${attr.valor}</div>
            `;
            lista.appendChild(item);
        });

        // Mostrar Modal
        modal.classList.remove('oculta');
    },

    AbrirInventario: function () {
        this.RenderizarInventario();
        document.getElementById('modal-inventario').classList.remove('oculta');
    },

    FecharInventario: function () {
        const modal = document.getElementById('modal-inventario');
        if (modal) modal.classList.add('oculta');
    },

    RenderizarInventario: function () {
        const grid = document.getElementById('grid-inventario');
        if (!grid) return;
        grid.innerHTML = '';

        const jogador = EstadoDoJogo.jogadores[0];
        // Ensure inventario exists
        if (!jogador.inventario) jogador.inventario = new Array(12).fill(null);

        jogador.inventario.forEach((item, index) => {
            const slot = document.createElement('div');
            slot.className = item ? 'inventario-slot slot-cheio' : 'inventario-slot slot-vazio';
            slot.onclick = () => this.SelecionarItemInventario(item, index);

            if (item) {
                const img = document.createElement('img');
                img.src = item.imagem || "Images/Itens/PocaoDeVida.png"; // Fallback
                slot.appendChild(img);
            }

            grid.appendChild(slot);
        });
    },

    SelecionarItemInventario: function (item, index) {
        const detalhes = document.getElementById('inventario-detalhes');
        if (!detalhes) return;

        if (!item) {
            detalhes.innerHTML = '<p class="placeholder">Espaço vazio.</p>';
            return;
        }

        detalhes.innerHTML = `
            <div style="display:flex; gap:10px; align-items:center; width:100%;">
                <div style="flex:1;">
                    <strong style="color:var(--cor-destaque)">${item.nome}</strong>
                    <p style="color:#aaa; font-size:0.8rem;">${item.descricao || "Sem descrição."}</p>
                </div>
                <button class="botao-acao" style="padding:5px 10px; font-size:0.8rem;" onclick="UI.UsarItem(${index})">Usar</button>
            </div>
        `;
    },

    UsarItem: function (index) {
        const jogador = EstadoDoJogo.jogadores[0];
        const item = jogador.inventario[index];
        if (!item) return;

        // Se estiver em combate, delega para o sistema de combate que gerencia turnos
        if (EstadoDoJogo.turno === 0 || EstadoDoJogo.turno === 1) { // 0=Jogador, 1=Inimigo
            Combate.UsarItem(index);
        } else {
            // Uso fora de combate (Cura livre, Mana livre)
            let usou = false;
            if (item.efeito) {
                if (item.efeito.curaPct) {
                    const valor = Math.floor(jogador.vidaMaxima * item.efeito.curaPct);
                    if (jogador.vida < jogador.vidaMaxima) {
                        jogador.vida = Math.min(jogador.vidaMaxima, jogador.vida + valor);
                        UI.ExibirMensagem(`Recuperou ${valor} de Vida!`);
                        usou = true;
                    } else {
                        UI.ExibirMensagem("Vida já está cheia!");
                    }
                }
                else if (item.efeito.manaPct) {
                    const valor = Math.floor(jogador.manaMaxima * item.efeito.manaPct);
                    if (jogador.mana < jogador.manaMaxima) {
                        jogador.mana = Math.min(jogador.manaMaxima, jogador.mana + valor);
                        UI.ExibirMensagem(`Recuperou ${valor} de Mana!`);
                        usou = true;
                    } else {
                        UI.ExibirMensagem("Mana já está cheia!");
                    }
                }
                else {
                    UI.ExibirMensagem("Este item só pode ser usado em combate.");
                }
            }

            if (usou && (item.tipo === 'consumivel' || item.tipo === 'consumivel-dano')) {
                jogador.inventario[index] = null;
                this.RenderizarInventario();
                this.SelecionarItemInventario(null, index);
                UI.AtualizarInterface();
            }
        }
    }
};

// Aliases Globais para facilitar migração
window.AtualizarInterface = () => window.UI.AtualizarInterface();
window.ExibirMensagem = (t, tp) => window.UI.ExibirMensagem(t, tp);
window.MostrarIndicadorDano = (id, v, t) => window.UI.MostrarIndicadorDano(id, v, t);
