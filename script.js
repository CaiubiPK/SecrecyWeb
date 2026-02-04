document.addEventListener('DOMContentLoaded', () => {
    // ===== FUNÇÃO DE DEBUG =====
    // Função auxiliar para logar a execução de funções
    function LogDebug(nomeFuncao) {
        console.log(`%c▶ Executando: ${nomeFuncao}`, 'color: #4CAF50; font-weight: bold; font-size: 12px;');
    }

    // Elementos da Interface (DOM) - Cache Global de Elementos
    const ElementosUI = {
        Telas: {
            Inicial: document.getElementById('tela-inicial'),
            Jogo: document.getElementById('tela-jogo'),
            Nome: document.getElementById('tela-nome'),
            Campanha: document.getElementById('tela-campanha'),
            // Mapa removido: linear progression
            Vitoria: document.getElementById('tela-vitoria'),
            Talentos: document.getElementById('menu-talentos')
        },
        Botoes: {
            Iniciar: document.getElementById('botao-iniciar'),
            Acao: document.querySelectorAll('.botao-acao'),
            ContinuarVitoria: document.getElementById('btn-vitoria-continuar')
        },
        HUD: {
            Jogador: {
                VidaTexto: document.getElementById('texto-vida-jogador'),
                VidaBarra: document.getElementById('barra-vida-jogador'),
                EnergiaTexto: document.getElementById('texto-energia-jogador'),
                EnergiaBarra: document.getElementById('barra-energia-jogador'),
                ManaTexto: document.getElementById('texto-mana-jogador'),
                ManaBarra: document.getElementById('barra-mana-jogador'),
                Nome: document.querySelector('.personagem.jogador.principal .nome-personagem'),
                AtkLabel: document.getElementById('label-ataque-jogador'),
                AtkValor: document.getElementById('atk-jogador'),
                Def: document.getElementById('def-jogador'),
                Vigor: document.getElementById('vigor-jogador'),
                Roubo: document.getElementById('roubo-jogador'),
                Crit: document.getElementById('crit-jogador'),
                Pen: document.getElementById('pen-jogador-abs'),
                Det: document.getElementById('det-jogador')
            },
            Inimigo: {
                Nome: document.getElementById('nome-inimigo-hud'),
                VidaTexto: document.getElementById('texto-vida-inimigo'),
                VidaBarra: document.getElementById('barra-vida-inimigo'),
                EnergiaTexto: document.getElementById('texto-energia-inimigo'),
                EnergiaBarra: document.getElementById('barra-energia-inimigo'),
                ManaTexto: document.getElementById('texto-mana-inimigo'),
                ManaBarra: document.getElementById('barra-mana-inimigo'),
                AtkValor: document.getElementById('atk-inimigo'),
                Def: document.getElementById('def-inimigo'),
                Vigor: document.getElementById('vigor-inimigo'),
                Roubo: document.getElementById('roubo-inimigo'),
                Crit: document.getElementById('crit-inimigo'),
                Pen: document.getElementById('pen-inimigo-abs'),
                Det: document.getElementById('det-inimigo')
            }
        }
    };

    const TelaInicial = ElementosUI.Telas.Inicial;
    const TelaDeJogo = ElementosUI.Telas.Jogo;
    const BotaoIniciar = ElementosUI.Botoes.Iniciar;
    const BotoesDeAcao = ElementosUI.Botoes.Acao;

    // Dados dos Inimigos são carregados do arquivo dados.js
    // Acessados via: BancoDeDados.Inimigos

    // Estado do Jogo
    const EstadoDoJogo = {
        jogadores: [{ ...BancoDeDados.JogadorBase }], // Array de jogadores
        jogadorFoco: 0, // Índice do jogador cujos atributos estão sendo exibidos
        inimigos: [], // Array de inimigos na batalha (max 3)
        inimigoFoco: 0, // Índice do inimigo focado no HUD
        alvoSelecionado: 0, // Índice do inimigo que receberá o ataque
        turno: 0,
        fasesDesbloqueadas: 1,
        baralhoPersonalizado: [],
        timerMensagem: null,
        indiceDialogo: 0,
        dialogoAtual: [],
        audioHabilitado: true,
        faseAtual: 1,
        carregandoFase: false // Flag para evitar cliques duplos
    };

    // Inicializar baralho com 20 cartas (exemplo: Bronze e Prata misturadas)
    function InicializarBaralho() {
        LogDebug('InicializarBaralho');
        const colecao = BancoDeDados.CartasColecao;

        // Encontra os modelos das cartas
        const ataqueBasico = colecao.find(c => c.nome === "Ataque Básico");
        const ataquePreciso = colecao.find(c => c.nome === "Ataque Preciso");

        // Adiciona 15 Ataques Básicos
        for (let i = 0; i < 15; i++) {
            if (ataqueBasico) EstadoDoJogo.baralhoPersonalizado.push({ ...ataqueBasico });
        }

        // Adiciona 5 Ataques Precisos
        for (let i = 0; i < 5; i++) {
            if (ataquePreciso) EstadoDoJogo.baralhoPersonalizado.push({ ...ataquePreciso });
        }
    }

    // Expor funções globais
    window.AbrirModalBaralho = AbrirModalBaralho;
    window.FecharModalBaralho = FecharModalBaralho;
    window.AbrirDetalhesAtributos = AbrirDetalhesAtributos;
    window.FecharDetalhesAtributos = FecharDetalhesAtributos;

    // Guardar atributos base para comparação visual (Destaque Verde/Vermelho)
    let AtributosBaseJogador = {};
    let AtributosBaseInimigo = {};

    // --- Configuração de Áudio ---
    // Edite os caminhos abaixo para apontar para seus arquivos de áudio
    const AudioConfig = {
        CaminhoMusicaDeFundo: 'Audio/Musicas/Musica de fundo.mp3',
        CaminhoSomGirarRoleta: 'Audio/Sons/spin.mp3',
        CaminhoSomConfirmarSelecao: 'Audio/Sons/spin.mp3',
        CaminhoSomContagemRegressiva: 'Audio/Sons/spin.mp3',
        CaminhoSomInicioCombate: 'Audio/Sons/spin.mp3',
        CaminhoSomCura: 'Audio/Sons/Curando.mp3',
        CaminhoMusicaVitoria: 'Audio/Musicas/vitória.mp3'
    };

    // Expor funções para o HTML
    window.RealizarAtaqueJogador = RealizarAtaqueJogador;
    window.FecharMenuAtaque = FecharMenuAtaque;
    window.VoltarAoMapa = VoltarAoMapa;
    window.SelecionarTalento = SelecionarTalento;
    window.MaximizarPrograma = MaximizarPrograma;

    function MaximizarPrograma() {
        LogDebug('MaximizarPrograma');
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(e => {
                console.log("Tela cheia recusada:", e);
                ExibirMensagem("Pressione F11 para tela cheia", "erro");
            });
        }
    }

    document.getElementById('btn-vitoria-continuar').onclick = () => {
        if (EstadoDoJogo.jogadores[0].pontosHabilidade > 0) {
            AbrirMenuTalentos();
        } else {
            VoltarAoMapa();
        }
    };

    let MusicaCombate = null;
    let MusicaVitoria = null;

    // Ouvintes de Eventos
    BotaoIniciar.addEventListener('click', IniciarJogo);

    BotoesDeAcao.forEach(botao => {
        botao.addEventListener('click', (evento) => {
            const acao = evento.currentTarget.dataset.acao;
            LidarComAcaoDoJogador(acao);
        });
    });

    document.querySelectorAll('.fase').forEach(fase => {
        fase.addEventListener('click', (e) => {
            if (EstadoDoJogo.carregandoFase) return; // Bloqueia se já estiver carregando
            const numeroFase = parseInt(e.currentTarget.dataset.fase);
            ClicarFase(numeroFase);
        });
    });

    // Eventos de Detalhes de Atributos
    document.querySelectorAll('.botao-info-stats').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar cliques indesejados
            const alvo = btn.getAttribute('data-alvo');
            console.log("Clicou em detalhes:", alvo);
            AbrirDetalhesAtributos(alvo);
        });
    });

    // --- Gerenciamento de Telas ---
    // --- Gerenciamento de Telas ---
    function TrocarTela(idTelaAtiva) {
        LogDebug(`TrocarTela -> ${idTelaAtiva}`);

        // Mapeamento ID -> Elemento do Cache
        const mapaTelas = {
            'tela-inicial': ElementosUI.Telas.Inicial,
            'tela-nome': ElementosUI.Telas.Nome,
            'tela-campanha': ElementosUI.Telas.Campanha,
            'tela-mapa': ElementosUI.Telas.Mapa,
            'tela-jogo': ElementosUI.Telas.Jogo,
            'tela-vitoria': ElementosUI.Telas.Vitoria,
            'menu-talentos': ElementosUI.Telas.Talentos
        };

        Object.keys(mapaTelas).forEach(chave => {
            const el = mapaTelas[chave];
            if (el) {
                if (chave === idTelaAtiva) {
                    el.classList.remove('oculta');
                    el.classList.add('ativa');
                } else {
                    el.classList.remove('ativa');
                    el.classList.add('oculta');
                }
            }
        });
    }

    // --- Funções Principais ---

    function IniciarJogo() {
        LogDebug('IniciarJogo');
        // Tenta colocar em tela cheia (exige interação do usuário, que é este clique)
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(e => console.log("Tela cheia negada ou não suportada"));
        }

        InicializarBaralho();
        AtributosBaseJogador = { ...EstadoDoJogo.jogadores[0] }; // Salva base

        // Agora vai para a Tela de Nome
        TrocarTela('tela-nome');
    }

    // Lógica da Tela de Nome
    document.getElementById('botao-confirmar-nome').addEventListener('click', ConfirmarNome);
    document.getElementById('input-nome').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') ConfirmarNome();
    });

    function ConfirmarNome() {
        LogDebug('ConfirmarNome');
        const inputNome = document.getElementById('input-nome');
        const nome = inputNome.value.trim();

        if (nome === "") {
            ExibirMensagem("Por favor, digite seu nome desafiante!", "erro");
            return;
        }

        EstadoDoJogo.jogadores[0].nome = nome;

        // Atualizar nome na interface (HUD)
        document.querySelector('.personagem.jogador .nome-personagem').textContent = nome;

        // Ir para Seleção de Campanha
        TrocarTela('tela-campanha');
    }

    // Lógica da Tela de Campanha
    document.getElementById('campanha-castelo').addEventListener('click', () => {
        IniciarPrimeiraFase();
    });

    function IniciarPrimeiraFase() {
        LogDebug('IniciarPrimeiraFase');
        EstadoDoJogo.faseAtual = 1;
        CarregarFase(1);
    }

    // Função Unificada para Carregar Fases (Substitui ClicarFase)
    function CarregarFase(numeroDaFase) {
        LogDebug(`CarregarFase -> Fase ${numeroDaFase}`);

        if (EstadoDoJogo.carregandoFase) return;

        EstadoDoJogo.carregandoFase = true;
        EstadoDoJogo.faseAtual = numeroDaFase;

        // Exibir mensagem de carregamento
        ExibirMensagem(`Iniciando Fase ${numeroDaFase}... Preparando campo de batalha.`);

        setTimeout(() => {
            // Sequência de chefes e inimigos
            const inimigosNoBanco = BancoDeDados.Inimigos;
            const inimigosFase = [];

            if (numeroDaFase === 1) {
                // Primeira fase: Igvuld + 2 Aleatórios
                const igvuld = inimigosNoBanco.find(i => i.nome === "Igvuld");
                if (igvuld) inimigosFase.push({ ...igvuld });

                for (let i = 0; i < 2; i++) {
                    const randomIdx = Math.floor(Math.random() * inimigosNoBanco.length);
                    inimigosFase.push({ ...inimigosNoBanco[randomIdx] });
                }

                // Garante aliados na primeira vez
                if (EstadoDoJogo.jogadores.length < 3) {
                    EstadoDoJogo.jogadores.push({ ...BancoDeDados.JogadorBase, nome: "Aliado 1" });
                    EstadoDoJogo.jogadores.push({ ...BancoDeDados.JogadorBase, nome: "Aliado 2" });
                }
            } else {
                // Outras fases: Chefe Específico ou Aleatório
                const nomesChefes = { 2: "Durotan", 3: "Zirgur", 4: "Gromn" };
                const nomeChefe = nomesChefes[numeroDaFase];

                if (nomeChefe) {
                    const chefe = inimigosNoBanco.find(i => i.nome === nomeChefe);
                    if (chefe) inimigosFase.push({ ...chefe });
                    else inimigosFase.push({ ...inimigosNoBanco[Math.floor(Math.random() * inimigosNoBanco.length)] });
                } else {
                    // Fases genéricas infinitas (ex: 5+)
                    inimigosFase.push({ ...inimigosNoBanco[Math.floor(Math.random() * inimigosNoBanco.length)] });
                }
            }

            PrepararCenaCombate(inimigosFase);
            ComecarCombateReal();
            EstadoDoJogo.carregandoFase = false;
        }, 1000);
    }



    function ComecarCombateReal() {
        LogDebug('ComecarCombateReal');
        try {
            TrocarTela('tela-jogo'); // Garante que apenas a tela de jogo está ativa
            const elJogo = ElementosUI.Telas.Jogo;
            elJogo.classList.remove('modo-selecao');

            // Validação de Segurança do Banco de Dados
            if (!BancoDeDados || !BancoDeDados.Cenarios) {
                throw new Error("Banco de dados de cenários não carregado.");
            }

            // Atualizar Cenário de Fundo com base na Fase
            const fase = EstadoDoJogo.faseAtual;
            const imagemCenario = BancoDeDados.Cenarios[fase] || "Images/Cenarios/CampoDeBatalha.png";

            elJogo.style.backgroundImage = `url('${imagemCenario}')`;
            elJogo.style.backgroundSize = "cover";
            elJogo.style.backgroundPosition = "center";

            // Tocar música de fundo
            if (MusicaCombate) MusicaCombate.pause();
            MusicaCombate = new Audio(AudioConfig.CaminhoMusicaDeFundo);
            MusicaCombate.loop = true;
            MusicaCombate.volume = 0.5;
            MusicaCombate.play().catch(erro => console.log("Erro ao tocar música:", erro));

            LogDebug("Combate Real Iniciado com sucesso!");
            EstadoDoJogo.turno = 0; // Turno do Jogador
        } catch (erro) {
            console.error("ERRO FATAL ao iniciar combate:", erro);
            ExibirMensagem("Erro ao carregar o campo de batalha. Retornando ao mapa...", "erro");
            // Fallback seguro
            setTimeout(() => {
                TrocarTela('tela-mapa');
                EstadoDoJogo.carregandoFase = false;
            }, 2000);
        }
    }

    function PrepararCenaCombate(inimigos) {
        LogDebug('PrepararCenaCombate');
        if (!inimigos || inimigos.length === 0) {
            console.error("Nenhum inimigo fornecido para o combate!");
            return;
        }

        EstadoDoJogo.inimigos = inimigos.map(i => ({ ...i }));
        EstadoDoJogo.inimigoAtual = EstadoDoJogo.inimigos[0];
        EstadoDoJogo.inimigoFoco = 0;
        EstadoDoJogo.alvoSelecionado = 0;

        // Configura o visual de todos os inimigos
        EstadoDoJogo.inimigos.forEach((inimigo, index) => {
            const el = document.getElementById(`inimigo-${index + 1}`);
            if (el) {
                el.classList.remove('oculta');
                el.querySelector('.visual-personagem').style.backgroundImage = `url('${inimigo.imagem}')`;
                el.querySelector('.nome-personagem').textContent = inimigo.nome;

                // Adiciona evento de clique
                el.onclick = () => {
                    // Se há uma carta selecionada, executa o ataque
                    if (EstadoDoJogo.cartaSelecionada) {
                        EstadoDoJogo.alvoSelecionado = index;
                        RealizarAtaqueJogador(EstadoDoJogo.cartaSelecionada);
                    } else {
                        // Caso contrário, apenas foca no inimigo
                        FocarInimigo(index);
                    }
                };
            }
        });

        // Esconde slots extras se houverem menos de 3 inimigos
        for (let i = EstadoDoJogo.inimigos.length + 1; i <= 3; i++) {
            const el = document.getElementById(`inimigo-${i}`);
            if (el) el.classList.add('oculta');
        }

        // Configura o visual de todos os jogadores
        EstadoDoJogo.jogadores.forEach((jogador, index) => {
            const el = document.getElementById(`jogador-${index + 1}`);
            if (el) {
                el.classList.remove('oculta');
                el.querySelector('.visual-personagem').style.backgroundImage = `url('${jogador.imagem || 'Images/Personagens/Jogador.png'}')`;
                el.querySelector('.nome-personagem').textContent = jogador.nome;

                // Adiciona evento de clique para focar
                el.onclick = () => FocarJogador(index);
            }
        });

        AtualizarInterface();
        document.getElementById('nome-inimigo-hud').textContent = EstadoDoJogo.inimigos[0].nome;
    }

    function IniciarRoletaDeInimigos() {
        LogDebug('IniciarRoletaDeInimigos');
        // Função mantida mas não mais chamada diretamente para permitir diálogos
        console.warn("Roleta desativada em favor do sistema de diálogos.");
    }

    function FinalizarSelecaoDeInimigo(InimigoSelecionado) {
        LogDebug(`FinalizarSelecaoDeInimigo -> ${InimigoSelecionado.nome}`);
        // Som de Seleção
        const somSelecao = new Audio(AudioConfig.CaminhoSomConfirmarSelecao);
        somSelecao.play().catch(e => { });

        // Copia os dados do inimigo para o estado do jogo
        EstadoDoJogo.inimigoAtual = { ...InimigoSelecionado };
        AtributosBaseInimigo = { ...InimigoSelecionado }; // Salva base para comparação

        // Atualiza a Interface de Atributos do Inimigo
        document.getElementById('texto-vida-inimigo').textContent = `${EstadoDoJogo.inimigoAtual.vida}/${EstadoDoJogo.inimigoAtual.vidaMaxima}`;
        document.getElementById('texto-energia-inimigo').textContent = `${EstadoDoJogo.inimigoAtual.energia}/${EstadoDoJogo.inimigoAtual.energiaMaxima}`;
        document.getElementById('texto-mana-inimigo').textContent = `${EstadoDoJogo.inimigoAtual.mana}/${EstadoDoJogo.inimigoAtual.manaMaxima}`;

        // Atualiza novos atributos (Ataque/Defesa/Velocidade/Vigor/Nome HUD)
        document.getElementById('atk-inimigo').textContent = EstadoDoJogo.inimigoAtual.ataque || 0;
        document.getElementById('def-inimigo').textContent = EstadoDoJogo.inimigoAtual.armadura || 0;
        document.getElementById('det-inimigo').textContent = EstadoDoJogo.inimigoAtual.determinacao || 0;
        document.getElementById('nome-inimigo-hud').textContent = EstadoDoJogo.inimigoAtual.nome;

        // Prepara o container (não visível ainda devido ao modo-selecao)
        const ContainerAtributosInimigo = document.getElementById('status-inimigo');
        ContainerAtributosInimigo.style.opacity = '1';

        console.log(`Inimigo selecionado: ${InimigoSelecionado.nome}`);

        // Agora inicia a contagem regressiva para o combate
        IniciarContagem();
    }

    function LidarComAcaoDoJogador(acao) {
        LogDebug(`LidarComAcaoDoJogador -> ${acao}`);
        if (EstadoDoJogo.turno !== 0) return; // Bloqueia se não for turno do jogador

        const BotaoClicado = document.querySelector(`.botao-acao.${acao}`);
        if (BotaoClicado) {
            BotaoClicado.style.transform = 'scale(0.95)';
            setTimeout(() => BotaoClicado.style.transform = '', 100);
        }

        switch (acao) {
            case 'atacar':
                AbrirMenuAtaque();
                break;
            case 'habilidade':
                alert("Menu de habilidades...");
                break;
            case 'passar-turno': // Atualizado de 'descansar'
                PassarTurno();
                break;
            case 'mochila':
                alert("Abrindo mochila...");
                break;
            case 'desistir':
                if (confirm("Tem certeza que deseja desistir?")) {
                    location.reload();
                }
                break;
        }
    }

    // --- Sistema de Combate ---

    function AbrirMenuAtaque() {
        LogDebug('AbrirMenuAtaque');
        const containerCartas = document.getElementById('container-cartas');
        const wrapper = containerCartas.querySelector('.cartas-wrapper');

        // Limpar cartas anteriores
        wrapper.innerHTML = '';

        // Selecionar 3 cartas aleatórias do BARALHO do jogador
        const cartasNoBaralho = [...EstadoDoJogo.baralhoPersonalizado];
        const cartasSorteadas = [];

        for (let i = 0; i < 3; i++) {
            if (cartasNoBaralho.length === 0) break;
            const indice = Math.floor(Math.random() * cartasNoBaralho.length);
            const carta = cartasNoBaralho.splice(indice, 1)[0];
            cartasSorteadas.push(carta);
        }

        // Criar elementos das cartas
        cartasSorteadas.forEach(carta => {
            const cartaEl = document.createElement('div');
            cartaEl.className = 'carta';
            cartaEl.style.backgroundImage = `url('${carta.imagem}')`;

            cartaEl.innerHTML = `
                <div class="tag-raridade raridade-${carta.raridade.toLowerCase()}">${carta.tipo}</div>
                <div class="info-carta">
                    <div class="nome-carta">${carta.nome}</div>
                    <div class="custo-carta">${carta.custoEnergia || carta.custoMana} ${carta.custoEnergia ? 'Energia' : 'Mana'}</div>
                </div>
            `;

            cartaEl.onclick = () => {
                // Salva a carta temporariamente para ser usada ao clicar no inimigo
                EstadoDoJogo.cartaSelecionada = carta;

                // Esconde o container de cartas
                containerCartas.classList.add('oculta');

                // Exibe mensagem
                ExibirMensagem("Selecione seu alvo clicando no inimigo!", "atencao");

                // Adiciona classe de destaque aos inimigos vivos (vermelho)
                document.querySelectorAll('.personagem.inimigo').forEach((el, idx) => {
                    const inimigo = EstadoDoJogo.inimigos[idx];
                    if (inimigo && inimigo.vida > 0) {
                        el.classList.add('selecionavel', 'destaque-inimigo');
                    }
                });

                // Adiciona classe de destaque aos aliados (verde)
                document.querySelectorAll('.personagem.jogador').forEach((el, idx) => {
                    const jogador = EstadoDoJogo.jogadores[idx];
                    if (jogador && jogador.vida > 0) {
                        el.classList.add('destaque-aliado');
                    }
                });
            };
            wrapper.appendChild(cartaEl);
        });

        document.querySelector('.controles').classList.add('oculta');
        containerCartas.classList.remove('oculta');
    }

    function FecharMenuAtaque() {
        LogDebug('FecharMenuAtaque');
        document.getElementById('container-cartas').classList.add('oculta');
        document.querySelector('.controles').classList.remove('oculta');

        // Limpar estados de seleção dos inimigos
        document.querySelectorAll('.personagem.inimigo').forEach(el => {
            el.classList.remove('selecionavel', 'foco-alvo', 'destaque-inimigo');
        });

        // Limpar estados de destaque dos aliados
        document.querySelectorAll('.personagem.jogador').forEach(el => {
            el.classList.remove('destaque-aliado');
        });

        EstadoDoJogo.cartaSelecionada = null;
    }

    function CalcularReducaoDano(valor) {
        return Math.min(valor / (valor + 88), 0.85);
    }

    function CalcularReducaoMagica(valor) {
        return Math.min(valor / (valor + 88), 0.85);
    }

    // --- Nova Função Centralizada de Dano ---
    function ProcessarAtaque(atacante, defensor, multiplicador = 1.0, ehMagico = false, nomeHabilidade = "Ataque") {
        if (defensor.vida <= 0) return { dano: 0, resultado: "morto" };

        // 1. Esquiva
        const chanceAcerto = atacante.precisao - defensor.esquiva;
        const sorteMod = (atacante.sorte || 0) * 0.5;

        if (Math.random() * 100 > (chanceAcerto + sorteMod)) {
            ExibirMensagem(`${atacante.nome} errou o ataque em ${defensor.nome}! (Esquiva)`);
            return { dano: 0, resultado: "esquiva" };
        }

        // 2. Dano Base
        let danoBase = (ehMagico ? atacante.ataqueMagico : atacante.ataque) * multiplicador;

        // 3. Crítico
        let critico = false;
        if (Math.random() * 100 < (atacante.chanceCritico + ((atacante.sorte || 0) * 0.2))) {
            danoBase *= 1.75;
            critico = true;
        }

        // 4. Redução
        const reducao = ehMagico ? CalcularReducaoMagica(defensor.protecaoMagica) : CalcularReducaoDano(defensor.armadura);
        const danoFinal = Math.floor(danoBase * (1 - reducao));
        const danoReal = danoFinal > 0 ? danoFinal : 1;

        // 5. Aplicação
        defensor.vida = Math.max(0, defensor.vida - danoReal);

        // Dano à Determinação (Stagger)
        defensor.determinacao = Math.max(0, defensor.determinacao - Math.floor(danoReal * 0.1));

        // 6. Lifesteal (apenas se for jogador/aliado por enquanto, ou genérico)
        if (atacante.rouboVida > 0) {
            const cura = Math.floor(danoReal * (atacante.rouboVida / 100));
            atacante.vida = Math.min(atacante.vida + cura, atacante.vidaMaxima);
            // Identificar ID para indicador de cura seria ideal, mas deixaremos genérico visualmente depois
        }

        return { dano: danoReal, critico: critico, resultado: "sucesso" };
    }

    function CalcularAmplificacaoVigor(vigor) {
        return Math.min((vigor / 200) * 0.5, 0.5);
    }

    function RealizarAtaqueJogador(carta) {
        LogDebug(`RealizarAtaqueJogador -> ${carta.nome}`);

        const lider = EstadoDoJogo.jogadores[0];
        const indiceAlvo = EstadoDoJogo.alvoSelecionado;
        const inimigoAlvo = EstadoDoJogo.inimigos[indiceAlvo];

        // Validações
        if (!inimigoAlvo || inimigoAlvo.vida <= 0) {
            ExibirMensagem("Selecione um alvo válido!", "erro");
            return;
        }

        if (lider.energia < (carta.custoEnergia || 0) || lider.mana < (carta.custoMana || 0)) {
            ExibirMensagem("Recursos insuficientes!", "erro");
            return;
        }

        // Consumo de Recursos
        if (carta.custoEnergia) lider.energia -= carta.custoEnergia;
        if (carta.custoMana) lider.mana -= carta.custoMana;

        // Efeitos Sonoros
        if (carta.som && EstadoDoJogo.audioHabilitado) {
            const somAtaque = new Audio(carta.som);
            somAtaque.volume = 1;
            somAtaque.play().catch(() => { });
        }

        // --- 1. Ataque do Líder ---
        const mult = carta.efeito?.danoMultiplicador || 1.0;
        const ehMagico = !!carta.custoMana;

        // Executar Animação Líder
        AnimarAtaque('jogador-1', `inimigo-${indiceAlvo + 1}`);

        // Processar Dano Líder
        setTimeout(() => {
            const resultado = ProcessarAtaque(lider, inimigoAlvo, mult, ehMagico, carta.nome);

            if (resultado.resultado === 'sucesso') {
                MostrarIndicadorDano(`inimigo-${indiceAlvo + 1}`, resultado.dano, resultado.critico ? 'critico' : 'dano');
                ExibirMensagem(`${resultado.critico ? 'CRÍTICO! ' : ''}Você usou ${carta.nome} em ${inimigoAlvo.nome} (${resultado.dano} dano)`);
            }

            AtualizarInterface();
            VerificarFimCombateOuContinuar(true); // true = processar aliados
        }, 300);

        // --- Lógica dos Aliados (Lacaios) ---
        // Função interna para coordenar aliados
        function ProcessarAliados() {
            const aliados = EstadoDoJogo.jogadores.slice(1); // Todos menos o 0 (Líder)

            if (aliados.length === 0) {
                VerificarFimDeTurno();
                return;
            }

            let delayAcumulado = 600; // Começa depois do líder

            aliados.forEach((aliado, idx) => {
                if (aliado.vida <= 0) return;

                // Definir Alvo do Aliado
                let alvoAliado = inimigoAlvo;

                // Se o ataque original foi em área (exemplo flag) ou se alvo original morreu
                const ataqueEmArea = carta.tipo === "Area" || !carta.alvoUnico;

                if (ataqueEmArea || alvoAliado.vida <= 0) {
                    // Busca inimigo com menos vida
                    const vivos = EstadoDoJogo.inimigos.filter(i => i.vida > 0);
                    if (vivos.length > 0) {
                        alvoAliado = vivos.reduce((prev, curr) => prev.vida < curr.vida ? prev : curr);
                    } else {
                        return; // Ninguém pra atacar
                    }
                }

                // Agenda Ataque do Aliado
                setTimeout(() => {
                    const idAliado = idx + 2; // Jogador 2, 3...
                    const idAlvoReal = EstadoDoJogo.inimigos.indexOf(alvoAliado) + 1;

                    AnimarAtaque(`jogador-${idAliado}`, `inimigo-${idAlvoReal}`);

                    setTimeout(() => {
                        const res = ProcessarAtaque(aliado, alvoAliado, 1.0, false, "Ataque Coordenado");
                        if (res.resultado === 'sucesso') {
                            MostrarIndicadorDano(`inimigo-${idAlvoReal}`, res.dano, res.critico ? 'critico' : 'dano');
                        }
                        AtualizarInterface();
                    }, 250);

                }, delayAcumulado);

                delayAcumulado += 800; // Espaçamento entre aliados
            });

            // Finaliza turno após todos os aliados
            setTimeout(() => {
                VerificarFimDeTurno();
            }, delayAcumulado + 500);
        }

        // Guardar referência para chamar depois do ataque do líder
        EstadoDoJogo.ProcessarAliados = ProcessarAliados;
        FecharMenuAtaque();
    }

    // Auxiliar para verificar morte global
    function VerificarFimCombateOuContinuar(processarAliados) {
        const todosInimigosMortos = EstadoDoJogo.inimigos.every(i => i.vida <= 0 || i.determinacao <= 0);

        if (todosInimigosMortos) {
            ExibirMensagem("VITÓRIA TOTAL! O time inimigo foi derrotado.", "vitoria");
            setTimeout(() => {
                TrocarTela('tela-vitoria');
                MostrarTelaVitoria();
            }, 1000);
        } else if (processarAliados && EstadoDoJogo.ProcessarAliados) {
            EstadoDoJogo.ProcessarAliados();
            EstadoDoJogo.ProcessarAliados = null;
        }
    }

    function VerificarFimDeTurno() {
        // Verifica novamente se venceu (caso aliados tenham matado o último)
        const todosInimigosMortos = EstadoDoJogo.inimigos.every(i => i.vida <= 0 || i.determinacao <= 0);
        if (todosInimigosMortos) {
            VerificarFimCombateOuContinuar(false);
        } else {
            EstadoDoJogo.turno = 1; // Turno Inimigo
            setTimeout(TurnoDosInimigos, 1000);
        }
    }

    function AnimarAtaque(idAtacante, idAlvo) {
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
            }, 250);
        }
    }

    function PassarTurnoAutomatico() {
        LogDebug('PassarTurnoAutomatico');
        FecharMenuAtaque();
        EstadoDoJogo.turno = 1;
        setTimeout(TurnoDosInimigos, 1000);
    }

    function IniciarTurnoJogador() {
        LogDebug('IniciarTurnoJogador');
        const jogador = EstadoDoJogo.jogadores[0]; // Corrigido de .jogador
        const amplificacao = CalcularAmplificacaoVigor(jogador.vigor);

        // Visual: Destaca Jogador
        document.querySelectorAll('.personagem').forEach(el => el.classList.remove('ativo'));
        document.getElementById('jogador-1').classList.add('ativo');

        // Regeneração de Início de Turno
        const regenVida = Math.floor(jogador.regeneracaoVida * (1 + amplificacao));
        const regenMana = Math.floor(jogador.regeneracaoMana * (1 + amplificacao));
        const regenEnergia = Math.floor(jogador.vigor * 0.10);

        jogador.vida = Math.min(jogador.vida + regenVida, jogador.vidaMaxima);
        jogador.mana = Math.min(jogador.mana + regenMana, jogador.manaMaxima);
        jogador.energia = Math.min(jogador.energia + regenEnergia, jogador.energiaMaxima);

        if (regenVida > 0) MostrarIndicadorDano('jogador-1', regenVida, 'cura'); // Corrigido ID

        AtualizarInterface();
        ExibirMensagem("Seu turno! Energias recuperadas.");
        EstadoDoJogo.turno = 0;
    }

    function PassarTurno() {
        LogDebug('PassarTurno');
        if (!confirm("Deseja passar o turno e descansar?")) return;
        ExibirMensagem("Você descansou.");
        EstadoDoJogo.turno = 1;
        setTimeout(TurnoDosInimigos, 1000);
    }

    function TurnoDosInimigos() {
        LogDebug('TurnoDosInimigos');

        if (EstadoDoJogo.turno !== 1) return;

        // Identifica Inimigos Vivos
        const inimigosVivos = EstadoDoJogo.inimigos.filter(i => i.vida > 0 && i.determinacao > 0);

        if (inimigosVivos.length === 0) {
            ExibirMensagem("Turno dos inimigos pulado (atordoados/mortos).");
            setTimeout(IniciarTurnoJogador, 1000);
            return;
        }

        // Lógica de Líder (Primeiro vivo comanda)
        const liderInimigo = inimigosVivos[0];

        // Identificar Jogadores Vivos
        const jogadoresVivos = EstadoDoJogo.jogadores.filter(j => j.vida > 0);

        if (jogadoresVivos.length === 0) {
            VerificarGameOver();
            return;
        }

        // Escolha de Alvo do Líder (Aleatório entre os vivos)
        const alvoInicial = jogadoresVivos[Math.floor(Math.random() * jogadoresVivos.length)];
        let alvoAtual = alvoInicial;

        // Destaque visual do Foco
        ExibirMensagem(`${liderInimigo.nome} comanda ataque em ${alvoAtual.nome}!`);

        let indexAtaque = 0;

        function SequenciaAtaqueCoordenado() {
            if (EstadoDoJogo.turno !== 1) return;

            if (indexAtaque >= inimigosVivos.length) {
                setTimeout(IniciarTurnoJogador, 1000);
                return;
            }

            const atacante = inimigosVivos[indexAtaque];

            // Recalcula alvo se o original morreu durante o combo
            if (alvoAtual.vida <= 0) {
                const vivos = EstadoDoJogo.jogadores.filter(j => j.vida > 0);
                if (vivos.length > 0) {
                    // Foca no mais fraco se o principal caiu
                    alvoAtual = vivos.reduce((prev, curr) => prev.vida < curr.vida ? prev : curr);
                } else {
                    VerificarGameOver();
                    return;
                }
            }

            // Realiza o ataque
            const idAtacante = EstadoDoJogo.inimigos.indexOf(atacante) + 1;
            const idAlvo = EstadoDoJogo.jogadores.indexOf(alvoAtual) + 1;

            const elInimigo = document.getElementById(`inimigo-${idAtacante}`);
            if (elInimigo) {
                // Remove ativo anterior
                document.querySelectorAll('.inimigo-container').forEach(el => el.classList.remove('ativo'));
                elInimigo.classList.add('ativo');
            }

            AnimarAtaque(`inimigo-${idAtacante}`, `jogador-${idAlvo}`);

            setTimeout(() => {
                // Inimigos tem sorte reduzida ou padrão
                const resultado = ProcessarAtaque(atacante, alvoAtual, 1.0, false, "Ataque");

                if (resultado.resultado === 'sucesso') {
                    MostrarIndicadorDano(`jogador-${idAlvo}`, resultado.dano, resultado.critico ? 'critico' : 'dano');
                    ExibirMensagem(`${atacante.nome} atacou ${alvoAtual.nome}!`);
                } else if (resultado.resultado === 'esquiva') {
                    // Mensagem já exibida no ProcessarAtaque
                }

                AtualizarInterface();
                VerificarGameOver(); // Checa se jogador morreu a cada hit

            }, 300);

            indexAtaque++;
            setTimeout(SequenciaAtaqueCoordenado, 1500); // Intervalo entre ataques
        }

        setTimeout(SequenciaAtaqueCoordenado, 1000);
    }

    function VerificarGameOver() {
        if (EstadoDoJogo.jogadores[0].vida <= 0 || EstadoDoJogo.jogadores[0].determinacao <= 0) {
            EstadoDoJogo.turno = -1;
            ExibirMensagem("DERROTA! Seu líder caiu.", "derrota");
            setTimeout(() => location.reload(), 4000);
        }
    }

    function AtualizarInterface() {
        LogDebug('AtualizarInterface');
        const J = EstadoDoJogo.jogadores[EstadoDoJogo.jogadorFoco];
        const I = EstadoDoJogo.inimigos[EstadoDoJogo.inimigoFoco];

        if (!J) return;

        // Função auxiliar interna para atualizar barras e textos
        const AtualizarStatusHUD = (elementos, dados, ehJogador) => {
            if (!elementos || !dados) return;

            // Barras e Textos Básicos
            elementos.VidaTexto.textContent = `${Math.floor(dados.vida)}/${dados.vidaMaxima}`;
            elementos.VidaBarra.style.width = `${(dados.vida / dados.vidaMaxima) * 100}%`;
            elementos.EnergiaTexto.textContent = `${Math.floor(dados.energia)}/${dados.energiaMaxima}`;
            elementos.EnergiaBarra.style.width = `${(dados.energia / dados.energiaMaxima) * 100}%`;
            elementos.ManaTexto.textContent = `${Math.floor(dados.mana)}/${dados.manaMaxima}`;
            elementos.ManaBarra.style.width = `${(dados.mana / dados.manaMaxima) * 100}%`;

            // Atributos Detalhados
            if (ehJogador) elementos.AtkLabel.textContent = (dados.classe === "Mago") ? "MATK" : "ATK";
            elementos.AtkValor.textContent = (ehJogador && dados.classe === "Mago") ? dados.ataqueMagico : dados.ataque;
            elementos.Def.textContent = dados.armadura;
            elementos.Vigor.textContent = dados.vigor;
            elementos.Roubo.textContent = `${dados.rouboVida}%`;
            elementos.Crit.textContent = `${dados.chanceCritico}%`;

            const pen = (ehJogador && dados.classe === "Mago") ? dados.penetracaoMagica : dados.penetracaoArmadura;
            elementos.Pen.textContent = pen;
            elementos.Det.textContent = Math.floor(dados.determinacao);

            if (elementos.Nome) elementos.Nome.textContent = dados.nome;
        };

        // Atualizar HUDs usando o cache
        AtualizarStatusHUD(ElementosUI.HUD.Jogador, J, true);

        if (I) {
            AtualizarStatusHUD(ElementosUI.HUD.Inimigo, I, false);
        } else {
            ElementosUI.HUD.Inimigo.Nome.textContent = "Inimigo";
        }
    }

    // --- Modal do Baralho ---
    function AbrirModalBaralho() {
        LogDebug('AbrirModalBaralho');
        const modal = document.getElementById('modal-baralho');
        const grid = document.getElementById('deck-grid');
        grid.innerHTML = '';

        EstadoDoJogo.baralhoPersonalizado.forEach(carta => {
            const cartaEl = document.createElement('div');
            cartaEl.className = `carta-miniatura tipo-${carta.tipo.toLowerCase()}`;
            cartaEl.innerHTML = `
                <div class="carta-miniatura-inner" style="background-image: url('${carta.imagem}')">
                    <div class="info-miniatura">
                        <span class="nome-min">${carta.nome}</span>
                        <span class="tipo-min">${carta.tipo}</span>
                    </div>
                </div>
            `;
            grid.appendChild(cartaEl);
        });

        modal.classList.remove('oculta');
    }

    function FecharModalBaralho() {
        LogDebug('FecharModalBaralho');
        document.getElementById('modal-baralho').classList.add('oculta');
    }

    // --- Sistema de Atributos Detalhados ---
    function AbrirDetalhesAtributos(alvo) {
        LogDebug(`AbrirDetalhesAtributos -> ${alvo}`);
        const modal = document.getElementById('modal-atributos');
        const titulo = document.getElementById('titulo-modal-atributos');
        const grid = document.getElementById('lista-atributos-detalhada');

        const dados = alvo === 'jogador' ? EstadoDoJogo.jogadores[EstadoDoJogo.jogadorFoco] : EstadoDoJogo.inimigos[EstadoDoJogo.inimigoFoco];
        const dadosBase = alvo === 'jogador' ? AtributosBaseJogador : AtributosBaseInimigo;

        if (!dados) return;

        titulo.textContent = `Atributos - ${alvo === 'jogador' ? 'Jogador' : dados.nome}`;
        grid.innerHTML = '';

        // Lista de atributos para exibir (Mapeamento amigável)
        const labels = {
            vida: "Vida", energia: "Energia", mana: "Mana",
            ataque: "Ataque Física", ataqueMagico: "Ataque Mágico", ataqueEsmagador: "Dano Esmagamento",
            armadura: "Armadura", protecaoMagica: "Prot. Mágica", esquiva: "Esquiva",
            determinacao: "Determinação", precisao: "Precisão", chanceCritico: "Crt. Chance",
            danoCritico: "Crt. Dano", rouboVida: "Lifesteal", sorte: "Sorte", vigor: "Vigor",
            penetracaoArmadura: "Pen. Armadura", penetracaoMagica: "Pen. Mágica",
            regeneracaoEnergia: "Regen. Energia", regeneracaoVida: "Regen. Vida", regeneracaoMana: "Regen. Mana"
        };

        Object.keys(labels).forEach(key => {
            const valorAtual = dados[key];
            const valorBase = dadosBase[key] || valorAtual;

            let classeCor = '';
            if (valorAtual > valorBase) classeCor = 'subiu';
            else if (valorAtual < valorBase) classeCor = 'desceu';

            const item = document.createElement('div');
            item.className = 'atrib-item';
            item.innerHTML = `
                <span class="atrib-nome">${labels[key]}</span>
                <span class="atrib-valor ${classeCor}">${valorAtual}</span>
            `;
            grid.appendChild(item);
        });

        modal.classList.remove('oculta');
    }

    function FecharDetalhesAtributos() {
        LogDebug('FecharDetalhesAtributos');
        document.getElementById('modal-atributos').classList.add('oculta');
    }

    // --- Indicadores de Dano/Cura ---
    function MostrarIndicadorDano(slotId, valor, tipo) {
        LogDebug(`MostrarIndicadorDano -> ${slotId}: ${valor} (${tipo})`);
        // slotId pode ser 'jogador-1', 'inimigo-1', etc.
        const el = document.getElementById(`indicador-dano-${slotId}`);

        if (!el) return;

        el.textContent = tipo === 'cura' ? `+${valor}` : `-${valor}`;
        el.className = `indicador-flutuante indicador-${tipo === 'cura' ? 'cura' : 'dano'}`;

        if (tipo === 'critico') {
            el.style.fontSize = '2rem';
            el.style.color = '#ff9f43';
        } else {
            el.style.fontSize = '';
            el.style.color = '';
        }

        // Resetar animação
        el.classList.remove('animar-indicador');
        void el.offsetWidth;
        el.classList.add('animar-indicador');

        setTimeout(() => {
            el.classList.remove('animar-indicador');
        }, 1200);
    }

    // --- Novo Display de Mensagens Centralizado ---
    function ExibirMensagem(texto, tipo = "") {
        LogDebug(`ExibirMensagem -> ${texto.substring(0, 50)}...`);
        const display = document.getElementById('display-mensagens');
        const txtEl = document.getElementById('texto-mensagem');

        clearTimeout(EstadoDoJogo.timerMensagem);

        if (!display || !txtEl) {
            console.error("Elementos de mensagem não encontrados no DOM.");
            return;
        }

        txtEl.textContent = texto;
        display.className = "display-mensagens"; // Limpa tipos
        if (tipo) display.classList.add(`mensagem-${tipo}`);

        display.classList.remove('oculta');

        EstadoDoJogo.timerMensagem = setTimeout(() => {
            display.classList.add('oculta');
        }, 3000);
    }

    function MostrarTelaVitoria() {
        LogDebug('MostrarTelaVitoria');
        const tela = document.getElementById('tela-vitoria');
        const resumo = document.getElementById('vitoria-resumo');
        const inimigo = EstadoDoJogo.inimigoAtual || { nome: "Inimigo" };
        const jogador = EstadoDoJogo.jogadores[0]; // Corrigido de .jogador

        // Pausar música de combate e tocar vitória
        if (MusicaCombate) MusicaCombate.pause();
        MusicaVitoria = new Audio(AudioConfig.CaminhoMusicaVitoria);
        MusicaVitoria.play().catch(e => { });

        // Cálculo de Progresso
        const xpBase = Math.floor(Math.random() * (200 - 120 + 1)) + 120; // Entre 120 e 200
        const bonusSorte = Math.floor(jogador.sorte * 1.5); // Influência da sorte
        const xpGanha = xpBase + bonusSorte;

        jogador.xp += xpGanha;
        jogador.pontosHabilidade += 1; // 1 ponto por vitória

        let subiuDeNivel = false;
        while (jogador.xp >= jogador.xpParaProximoNivel) {
            jogador.nivel++;
            jogador.xp -= jogador.xpParaProximoNivel;
            jogador.pontosHabilidade += 3; // +3 ao subir de nível
            subiuDeNivel = true;
        }

        resumo.innerHTML = `
            <p>Inimigo Derrotado: ${inimigo.nome}</p>
            <p>Experiência Recebida: +${xpGanha} (Sorte: +${bonusSorte})</p>
            <p>Ponto de Habilidade: +1</p>
            ${subiuDeNivel ? `<p style="color: gold; font-weight: bold;">LEVEL UP! (Nível ${jogador.nivel}) +3 Pontos</p>` : ''}
            <p style="margin-top: 1rem;">Total de Pontos Disponíveis: ${jogador.pontosHabilidade}</p>
        `;

        CriarParticulasVitoria();
    }

    function AbrirMenuTalentos() {
        LogDebug('AbrirMenuTalentos');
        TrocarTela('menu-talentos');
        const grid = document.getElementById('grid-talentos');
        const textoPontos = document.getElementById('pontos-talento-valor');

        textoPontos.textContent = EstadoDoJogo.jogadores[0].pontosHabilidade;

        // Sortear 3 talentos aleatórios
        const sorteados = [];
        const colecao = [...BancoDeDados.TalentosColecao];

        for (let i = 0; i < 3; i++) {
            if (colecao.length === 0) break;
            const idx = Math.floor(Math.random() * colecao.length);
            sorteados.push(colecao.splice(idx, 1)[0]);
        }

        grid.innerHTML = '';
        sorteados.forEach(talento => {
            const card = document.createElement('div');
            card.className = 'card-talento';
            card.innerHTML = `
                <div class="img-talento">✨</div>
                <div class="nome-talento">${talento.nome}</div>
                <div class="desc-talento">${talento.descricao}</div>
            `;
            card.onclick = () => SelecionarTalento(talento);
            grid.appendChild(card);
        });
    }

    function SelecionarTalento(talento) {
        LogDebug(`SelecionarTalento -> ${talento.nome}`);
        if (EstadoDoJogo.jogadores[0].pontosHabilidade <= 0) return;

        EstadoDoJogo.jogadores[0].pontosHabilidade--;

        // Aplicar efeitos
        for (let atributo in talento.efeito) {
            if (EstadoDoJogo.jogadores[0].hasOwnProperty(atributo)) {
                EstadoDoJogo.jogadores[0][atributo] += talento.efeito[atributo];
                // Se for vidaMaxima, cura um pouco também
                if (atributo === 'vidaMaxima') EstadoDoJogo.jogadores[0].vida += talento.efeito[atributo];
            }
        }

        ExibirMensagem(`Talento Adquirido: ${talento.nome}`);

        if (EstadoDoJogo.jogadores[0].pontosHabilidade > 0) {
            AbrirMenuTalentos(); // Continua escolhendo se tiver pontos
        } else {
            TrocarTela('tela-mapa'); // Garante volta ao mapa corretamente
            VoltarAoMapa();
        }
    }

    function CriarParticulasVitoria() {
        LogDebug('CriarParticulasVitoria');
        const container = document.getElementById('particulas-vitoria');
        container.innerHTML = '';
        for (let i = 0; i < 50; i++) {
            const p = document.createElement('div');
            p.className = 'particula';
            p.style.left = Math.random() * 100 + 'vw';
            p.style.animationDuration = (Math.random() * 2 + 1) + 's';
            p.style.opacity = Math.random();
            container.appendChild(p);
        }
    }

    function VoltarAoMapa() {
        LogDebug('ContinuarJornada (Antigo VoltarAoMapa)');
        if (MusicaVitoria) MusicaVitoria.pause();

        const proximaFase = EstadoDoJogo.faseAtual + 1;
        EstadoDoJogo.fasesDesbloqueadas = Math.max(EstadoDoJogo.fasesDesbloqueadas, proximaFase);

        // Verifica se a campanha acabou (Exemplo: 4 fases)
        if (EstadoDoJogo.faseAtual >= 4) {
            ExibirMensagem("PARABÉNS! Você conquistou o Castelo de Igvuld!", "vitoria");
            // Volta para o menu de campanhas após zerar
            setTimeout(() => {
                TrocarTela('tela-campanha');
            }, 3000);
        } else {
            // Avança para a próxima luta
            CarregarFase(proximaFase);
        }
    }

    // --- Sistema de Configurações ---
    function AbrirMenuConfig() {
        LogDebug('AbrirMenuConfig');
        document.getElementById('modal-config').classList.remove('oculta');
    }

    function FecharMenuConfig() {
        LogDebug('FecharMenuConfig');
        document.getElementById('modal-config').classList.add('oculta');
    }

    function MenuDesistir() {
        LogDebug('MenuDesistir');
        if (confirm("Guerreiros não desistem, mas se você precisar partir... Tem certeza?")) {
            location.reload();
        }
    }

    function ToggleAudio() {
        LogDebug('ToggleAudio');
        EstadoDoJogo.audioHabilitado = !EstadoDoJogo.audioHabilitado;
        const btn = document.getElementById('btn-audio-toggle');
        btn.textContent = EstadoDoJogo.audioHabilitado ? "Desabilitar Áudio" : "Habilitar Áudio";
        ExibirMensagem(EstadoDoJogo.audioHabilitado ? "Áudio Ativado" : "Áudio Desativado");
    }

    function FecharPrograma() {
        LogDebug('FecharPrograma');
        if (confirm("Deseja realmente fechar o programa?")) {
            window.close();
            // Fallback se window.close() for bloqueado
            location.href = "about:blank";
        }
    }

    function AbrirBaralhoViaConfig() {
        LogDebug('AbrirBaralhoViaConfig');
        FecharMenuConfig();
        AbrirModalBaralho();
    }

    // Expor funções finais para o HTML (Fallback)
    window.AbrirDetalhesAtributos = AbrirDetalhesAtributos;
    window.FecharDetalhesAtributos = FecharDetalhesAtributos;
    window.AbrirModalBaralho = AbrirModalBaralho;
    window.FecharModalBaralho = FecharModalBaralho;
    window.RealizarAtaqueJogador = RealizarAtaqueJogador;
    window.FecharMenuAtaque = FecharMenuAtaque;
    window.AbrirMenuConfig = AbrirMenuConfig;
    window.FecharMenuConfig = FecharMenuConfig;
    window.MenuDesistir = MenuDesistir;
    window.ToggleAudio = ToggleAudio;
    window.FecharPrograma = FecharPrograma;
    window.AbrirBaralhoViaConfig = AbrirBaralhoViaConfig;
});
