document.addEventListener('DOMContentLoaded', () => {
    // ===== FUNÇÃO DE DEBUG =====
    // Função auxiliar para logar a execução de funções
    // ===== FUNÇÃO DE DEBUG =====
    // Função auxiliar para logar a execução de funções
    window.LogDebug = function (nomeFuncao) {
        console.log(`%c▶ Executando: ${nomeFuncao}`, 'color: #4CAF50; font-weight: bold; font-size: 12px;');
    }

    // Elementos da Interface (DOM) - Cache Global de Elementos
    window.ElementosUI = {
        Telas: {
            Inicial: document.getElementById('tela-inicial'),
            Jogo: document.getElementById('tela-jogo'),
            Nome: document.getElementById('tela-nome'),
            Campanha: document.getElementById('tela-campanha'),
            // Mapa removido: linear progression
            Vitoria: document.getElementById('tela-vitoria'),
            Talentos: document.getElementById('menu-talentos'),
            DialogoCombate: document.getElementById('tela-dialogo-combate'),
            Historia: document.getElementById('tela-historia')
        },
        Historia: {
            Titulo: document.getElementById('historia-titulo'),
            Subtitulo: document.getElementById('historia-subtitulo'),
            Texto: document.getElementById('historia-texto'),
            Botao: document.getElementById('btn-iniciar-historia')
        },
        Dialogo: {
            Container: document.querySelector('.dialogo-combate-container'),
            AvatarJogador: document.getElementById('avatar-jogador-dialogo'),
            AvatarInimigo: document.getElementById('avatar-inimigo-dialogo'),
            BalaoJogador: document.getElementById('balao-jogador'),
            BalaoInimigo: document.getElementById('balao-inimigo'),
            TextoJogador: document.querySelector('#balao-jogador .texto-balao'),
            TextoInimigo: document.querySelector('#balao-inimigo .texto-balao'),
            BtnPular: document.getElementById('btn-pular-dialogo'),
            BtnProximo: document.getElementById('btn-proximo-dialogo'),
            ContainerJogador: document.getElementById('personagem-jogador-dialogo'),
            ContainerInimigo: document.getElementById('personagem-inimigo-dialogo')
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
    // Estado do Jogo (AGORA GLOBAL)
    window.EstadoDoJogo = {
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
    window.AudioConfig = {
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

    window.MusicaCombate = null;
    window.MusicaVitoria = null;

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

    function AbrirDetalhesAtributos(alvo, indexOpcional = null) {
        LogDebug(`AbrirDetalhesAtributos -> ${alvo}`);
        const modal = document.getElementById('modal-atributos');
        const titulo = document.getElementById('titulo-modal-atributos');
        const grid = document.getElementById('lista-atributos-detalhada');
        const imgDestaque = document.getElementById('imagem-atributo-destaque');

        let dados, dadosBase;

        if (alvo === 'jogador') {
            const idx = indexOpcional !== null ? indexOpcional : EstadoDoJogo.jogadorFoco;
            dados = EstadoDoJogo.jogadores[idx];
            dadosBase = AtributosBaseJogador; // Nota: Isso guarda apenas a base do J1, ideal seria ter base de todos
        } else {
            const idx = indexOpcional !== null ? indexOpcional : EstadoDoJogo.inimigoFoco;
            dados = EstadoDoJogo.inimigos[idx];
            dadosBase = AtributosBaseInimigo;
        }

        if (!dados) return;

        titulo.textContent = `Atributos - ${dados.nome}`;

        // Atualizar Imagem
        if (imgDestaque) {
            const imgUrl = dados.imagem || (alvo === 'jogador' ? 'Images/Personagens/Jogador.png' : 'Images/FotoDr.jpeg');
            imgDestaque.style.backgroundImage = `url('${imgUrl}')`;
        }

        grid.innerHTML = '';

        // Lista de atributos para exibir (Mapeamento amigável)
        const labels = {
            vida: "Vida", energia: "Energia", mana: "Mana",
            ataque: "Ataque Física", ataqueMagico: "Ataque Mágico", ataqueEsmagador: "Dano Esmagamento",
            armadura: "Armadura", protecaoMagica: "Prot. Mágica", esquiva: "Esquiva",
            determinacao: "Determininação", precisao: "Precisão", chanceCritico: "Crt. Chance",
            danoCritico: "Crt. Dano", rouboVida: "Lifesteal", sorte: "Sorte", vigor: "Vigor",
            penetracaoArmadura: "Pen. Armadura", penetracaoMagica: "Pen. Mágica",
            regeneracaoEnergia: "Regen. Energia", regeneracaoVida: "Regen. Vida", regeneracaoMana: "Regen. Mana"
        };

        Object.keys(labels).forEach(key => {
            const valorAtual = dados[key];
            // Se não tiver base especifica (aliados), usa o atual como base visual
            const valorBase = (dadosBase && dadosBase[key]) !== undefined ? dadosBase[key] : valorAtual;

            let classeCor = '';
            if (valorAtual > valorBase) classeCor = 'subiu';
            else if (valorAtual < valorBase) classeCor = 'desceu';

            // Formatar se for porcentagem
            let valorFormatado = valorAtual;
            if (['chanceCritico', 'danoCritico', 'esquiva', 'rouboVida', 'precisao'].includes(key)) {
                valorFormatado += '%';
            }

            // Ignorar valores nulos/zero que não sejam relevantes (opcional, mas limpa a tela)
            // if (valorAtual === 0 && key !== 'vida') return; 

            const item = document.createElement('div');
            item.className = 'atrib-item';
            item.innerHTML = `
                <span class="atrib-nome">${labels[key]}</span>
                <span class="atrib-valor ${classeCor}">${valorFormatado}</span>
            `;
            grid.appendChild(item);
        });

        modal.classList.remove('oculta');
    }
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
            'menu-talentos': ElementosUI.Telas.Talentos,
            'tela-dialogo-combate': ElementosUI.Telas.DialogoCombate,
            'tela-historia': ElementosUI.Telas.Historia
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

    // --- Sistema de Narrativa (História Estilo Livro) ---
    const HistoriasFase = {
        1: {
            titulo: "Capítulo I",
            subtitulo: "A Chegada ao Portão",
            texto: "Após dias de marcha através das Terras Baixas, o Castelo de Igvuld finalmente se ergue no horizonte. Suas torres negras perfuram o céu cinzento como lanças de obsidiana. O ar é pesado, com cheiro de enxofre e metal antigo. Dizem que o Guardião do Portão nunca dorme, e que sua armadura é feita das almas daqueles que tentaram invadir. Você aperta o cabo de sua arma. Não há volta."
        },
        2: {
            titulo: "Capítulo II",
            subtitulo: "O Pátio dos Caídos",
            texto: "O portão cedeu com um estrondo que ecoou pelas montanhas. O pátio interno é um cenário de desolação. Estátuas de heróis antigos estão quebradas, suas faces desfiguradas pelo tempo e pela malícia. No centro, Durotan aguarda. O carrasco do rei louco. Seu machado é maior que um homem, e sua risada é um trovão que anuncia a tempestade."
        },
        3: {
            titulo: "Capítulo III",
            subtitulo: "A Biblioteca Proibida",
            texto: "Os corredores do castelo são um labirinto de sombras. Sussurros ecoam das paredes. Você chega à grande biblioteca, onde o conhecimento proibido foi selado. Mas o selo foi quebrado. Zirgur, o Profano, profana os textos sagrados em busca de poder absoluto. A magia aqui é densa e sufocante. Cada passo é uma luta contra a própria loucura."
        },
        4: {
            titulo: "Capítulo IV",
            subtitulo: "O Trono de Sangue",
            texto: "O topo da torre mais alta. O vento uiva, trazendo a promessa de destruição. Gromn está sentado no trono que usurpou. Ele não parece surpreso. Ele esperava por você. O destino do reino será decidido aqui, sob o olhar frio das estrelas. Não é apenas uma luta pela coroa, mas pela própria existência da luz neste mundo."
        }
    };

    function IniciarCenaHistoria(fase, callback) {
        LogDebug(`IniciarCenaHistoria -> Fase ${fase}`);

        const historia = HistoriasFase[fase] || {
            titulo: "Capítulo Desconhecido",
            subtitulo: "Uma nova jornada",
            texto: "Você avança para o desconhecido, preparado para qualquer desafio que o destino coloque em seu caminho."
        };

        ElementosUI.Historia.Titulo.textContent = historia.titulo;
        ElementosUI.Historia.Subtitulo.textContent = historia.subtitulo;
        ElementosUI.Historia.Texto.textContent = historia.texto;

        TrocarTela('tela-historia');

        ElementosUI.Historia.Botao.onclick = () => {
            // Efeito visual de virar página poderia ser adicionado aqui
            if (callback) callback();
        };
    }

    // --- Sistema de Diálogos (Integrado) ---
    const DialogosFase = {
        1: [
            { orador: 'jogador', texto: "Quem ousa barrar meu caminho para o Castelo de Igvuld?" },
            { orador: 'inimigo', texto: "Eu sou o Guardião do Portão. Ninguém passa sem pagar o preço de sangue!" },
            { orador: 'jogador', texto: "Então cobrarei esse preço da sua própria vida!" },
            { orador: 'inimigo', texto: "Tolo arrogante! Prepare-se para morrer!" }
        ],
        2: [
            { orador: 'inimigo', texto: "Você derrotou o guardião... Impressionante." },
            { orador: 'jogador', texto: "Durotan! Seu reinado de terror acaba aqui." },
            { orador: 'inimigo', texto: "Meu machado anseia por carne fresca. Venha, pequeno herói!" },
            { orador: 'jogador', texto: "Minha espada será a última coisa que verá." }
        ],
        3: [
            { orador: 'inimigo', texto: "Sinto o cheiro de magia... e medo." },
            { orador: 'jogador', texto: "Zirgur, o Profano. Volte para as sombras de onde veio!" },
            { orador: 'inimigo', texto: "As sombras são minhas aliadas. Elas vão devorar sua alma!" }
        ],
        4: [
            { orador: 'inimigo', texto: "Finalmente nos encontramos..." },
            { orador: 'jogador', texto: "Acabou, Gromn. O castelo cairá." },
            { orador: 'inimigo', texto: "O castelo é eterno, assim como meu poder. Ajoelhe-se ou seja destruído!" },
            { orador: 'jogador', texto: "Eu não me ajoelho para tiranos!" }
        ]
    };

    let EstadoDialogo = { dialogoAtual: [], indice: 0, callbackFim: null };

    function IniciarCenaDialogo(fase, inimigoVisual, callback) {
        LogDebug(`IniciarCenaDialogo -> Fase ${fase}`);

        const dialogos = DialogosFase[fase] || [
            { orador: 'inimigo', texto: "Grrr! Intrusos!" },
            { orador: 'jogador', texto: "Prepare-se para lutar!" }
        ];

        EstadoDialogo.dialogoAtual = dialogos;
        EstadoDialogo.indice = 0;
        EstadoDialogo.callbackFim = callback;

        // Configurar Visuais
        ElementosUI.Dialogo.AvatarJogador.style.backgroundImage = `url('Images/Personagens/Jogador.png')`;

        const imgInimigo = inimigoVisual || 'Images/FotoDr.jpeg';
        ElementosUI.Dialogo.AvatarInimigo.style.backgroundImage = `url('${imgInimigo}')`;

        TrocarTela('tela-dialogo-combate');

        // Resetar UI antes de começar
        ElementosUI.Dialogo.BalaoJogador.classList.add('oculta');
        ElementosUI.Dialogo.BalaoInimigo.classList.add('oculta');

        setTimeout(MostrarFalaAtual, 500);

        // Configurar botões (usando onclick para simplificar remoção de listeners antigos)
        ElementosUI.Dialogo.BtnProximo.onclick = AvancarDialogo;
        ElementosUI.Dialogo.BtnPular.onclick = FinalizarDialogo;
    }

    function MostrarFalaAtual() {
        if (EstadoDialogo.indice >= EstadoDialogo.dialogoAtual.length) {
            FinalizarDialogo();
            return;
        }

        const fala = EstadoDialogo.dialogoAtual[EstadoDialogo.indice];
        const ehJogador = fala.orador === 'jogador';

        // Identificar elementos Ativos e Inativos
        const balaoAtivo = ehJogador ? ElementosUI.Dialogo.BalaoJogador : ElementosUI.Dialogo.BalaoInimigo;
        const balaoInativo = ehJogador ? ElementosUI.Dialogo.BalaoInimigo : ElementosUI.Dialogo.BalaoJogador;

        const containerAtivo = ehJogador ? ElementosUI.Dialogo.ContainerJogador : ElementosUI.Dialogo.ContainerInimigo;
        const containerInativo = ehJogador ? ElementosUI.Dialogo.ContainerInimigo : ElementosUI.Dialogo.ContainerJogador;

        const textoAtivo = ehJogador ? ElementosUI.Dialogo.TextoJogador : ElementosUI.Dialogo.TextoInimigo;

        // Atualizar Texto
        textoAtivo.textContent = fala.texto;

        // Troca de estado imediata (Sem flicker)
        balaoInativo.classList.add('oculta');
        containerInativo.classList.remove('falando');
        containerInativo.classList.add('silencio'); // Classe para escurecer quem não fala

        balaoAtivo.classList.remove('oculta');
        containerAtivo.classList.add('falando');
        containerAtivo.classList.remove('silencio');
    }

    function AvancarDialogo() {
        EstadoDialogo.indice++;
        MostrarFalaAtual();
    }

    function FinalizarDialogo() {
        LogDebug('FinalizarDialogo');
        if (EstadoDialogo.callbackFim) {
            EstadoDialogo.callbackFim();
        }
    }

    function CarregarFase(numeroDaFase) {
        LogDebug(`CarregarFase -> Fase ${numeroDaFase}`);

        if (EstadoDoJogo.carregandoFase) return;
        ExibirMensagem("dNTRODO IF");
        EstadoDoJogo.carregandoFase = true;
        EstadoDoJogo.faseAtual = numeroDaFase;

        // Exibir mensagem de carregamento
        ExibirMensagem(`Iniciando Fase ${numeroDaFase}... Preparando campo de batalha.`);

        setTimeout(() => {
            // Sequência de chefes e inimigos
            const inimigosNoBanco = BancoDeDados.Inimigos;
            const inimigosFase = [];

            if (numeroDaFase === 1) {
                // Fase 1: Igvuld + 2 Guerreiros Orcs Nvl 1
                const igvuld = inimigosNoBanco.find(i => i.nome === "Igvuld");
                if (igvuld) inimigosFase.push({ ...igvuld });

                inimigosFase.push({ ...BancoDeDados.Unidades.Orcs.Guerreiro[0] });
                inimigosFase.push({ ...BancoDeDados.Unidades.Orcs.Guerreiro[0] });

                // Configurar Aliados: Jogador + 1 Arqueiro Humano Nvl 1
                const jogadorPrincipal = EstadoDoJogo.jogadores[0];
                EstadoDoJogo.jogadores = [jogadorPrincipal]; // Reseta aliados anteriores

                // Adiciona o Arqueiro Humano Nvl 1
                const aliadoArqueiro = { ...BancoDeDados.Unidades.Humanos.Arqueiro[0] };
                EstadoDoJogo.jogadores.push(aliadoArqueiro);
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

            // Obter imagem do inimigo principal para o diálogo
            const imgPrincipal = inimigosFase[0] ? inimigosFase[0].imagem : null;

            // Iniciar História -> Diálogo -> Combate
            IniciarCenaHistoria(numeroDaFase, () => {
                // Ao clicar em "Virar Página", inicia o Diálogo
                if (typeof IniciarCenaDialogo === "function") {
                    IniciarCenaDialogo(numeroDaFase, imgPrincipal, () => {
                        // Ao terminar o Diálogo, começa o Combate
                        ComecarCombateReal();
                        EstadoDoJogo.carregandoFase = false;
                    });
                } else {
                    console.warn("Sistema de Diálogo não encontrado. Iniciando combate direto.");
                    ComecarCombateReal();
                    EstadoDoJogo.carregandoFase = false;
                }
            });
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
                // Adiciona evento de clique para focar
                el.onclick = () => {
                    // Se há uma carta selecionada, executa o ataque (mas só se for alvo válido, buff em aliado a lógica seria outra)
                    // Por enquanto assumimos que cartas são ataques em inimigos ou buffs proprios (sem alvo aliado especifico ainda)
                    if (EstadoDoJogo.cartaSelecionada && !EstadoDoJogo.cartaSelecionada.alvoAliado) {
                        ExibirMensagem("Esta carta deve ser usada em um inimigo!", "erro");
                    } else {
                        FocarJogador(index);
                    }
                };
            }

            // Inicializar Efeitos do Jogador se não existir
            if (!jogador.efeitos) jogador.efeitos = [];

            // Snapshot dos status base para cálculos de efeitos
            jogador.baseStatus = {
                ataque: jogador.ataque,
                vigor: jogador.vigor,
                precisao: jogador.precisao,
                armadura: jogador.armadura,
                ataqueMagico: jogador.ataqueMagico,
                vidaMaxima: jogador.vidaMaxima
            };
        });

        // Snapshot para Inimigos também
        EstadoDoJogo.inimigos.forEach(inimigo => {
            if (!inimigo.efeitos) inimigo.efeitos = [];
            inimigo.baseStatus = {
                ataque: inimigo.ataque,
                vigor: inimigo.vigor,
                precisao: inimigo.precisao,
                armadura: inimigo.armadura,
                ataqueMagico: inimigo.ataqueMagico,
                vidaMaxima: inimigo.vidaMaxima
            };
        });

        // Debug: Adicionar 2 efeitos aleatórios para todos
        const efeitosDebug = ["Envenenamento", "Regeneracao", "Sangramento", "Combustao", "Concussao", "Atordoamento"];

        [...EstadoDoJogo.inimigos, ...EstadoDoJogo.jogadores].forEach(p => {
            // Adicionar 2 efeitos aleatorios por 3 turnos
            for (let k = 0; k < 2; k++) {
                const effNome = efeitosDebug[Math.floor(Math.random() * efeitosDebug.length)];
                const nivelRand = Math.floor(Math.random() * 3) + 1; // Nivel 1 a 3
                AdicionarEfeito(p, effNome, 3, nivelRand, false);
            }
        });

        AtualizarInterface();

        // Esconde slots extras de jogadores se houverem menos de 3
        for (let i = EstadoDoJogo.jogadores.length + 1; i <= 3; i++) {
            const el = document.getElementById(`jogador-${i}`);
            if (el) el.classList.add('oculta');
        }

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
                // PassarTurno agora é chamado diretamente
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

    function FocarInimigo(index) {
        if (typeof LogDebug === 'function') LogDebug(`FocarInimigo -> ${index}`);

        EstadoDoJogo.inimigoFoco = index;
        AtualizarInterface();

        // Selecionar visualmente
        document.querySelectorAll('.personagem.inimigo').forEach(el => el.classList.remove('foco'));
        const el = document.getElementById(`inimigo-${index + 1}`);
        if (el) el.classList.add('foco');

        // REMOVIDO: Abrir detalhes automaticamente
        // AbrirDetalhesAtributos('inimigo', index);
    }

    function FocarJogador(index) {
        if (typeof LogDebug === 'function') LogDebug(`FocarJogador -> ${index}`);

        EstadoDoJogo.jogadorFoco = index;
        AtualizarInterface();

        // Selecionar visualmente
        document.querySelectorAll('.personagem.jogador').forEach(el => el.classList.remove('foco'));
        const el = document.getElementById(`jogador-${index + 1}`);
        if (el) el.classList.add('foco');

        // REMOVIDO: Abrir detalhes automaticamente
        // AbrirDetalhesAtributos('jogador', index);
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

            // Processar Efeitos Inimigos no Inicio do Turno DELES
            EstadoDoJogo.inimigos.forEach(inimigo => {
                if (inimigo.vida > 0) ProcessarEfeitosTurno(inimigo);
                // Precisamos garantir que a base exista para recalcular (simplificação: usando atual como base se não existir copia, perigoso mas funcional por hora)
                // Ideal: Ter Base armazenada. `AtributosBaseInimigo` guarda o SELECIONADO.
                // Ajuste rápido: Recalcular baseando no proprio valor pode degradar (reduz 10% de 90%, vira 81%).
                // Assumindo que o jogo reseta stats ou não lida com degradação complexa ainda.
                // O correto seria ter `inimigo.baseStats`. 
            });

            setTimeout(TurnoDosInimigos, 1000);
        }
    }

    function PassarTurno() {
        // Processar Efeitos Jogador (Fim do turno dele/Inicio do Próximo?)
        // Geralmente Inicio do Turno = Efeito Trigger.
        // Aqui, Jogador clica em passar.

        EstadoDoJogo.jogadores.forEach(j => {
            if (j.vida > 0) ProcessarEfeitosTurno(j);
        });

        AtualizarInterface();
        VerificarFimDeTurno();
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

    // Função Turno dos Inimigos (Recriada pois não estava visível no bloco anterior mas chamada no código)
    function TurnoDosInimigos() {
        LogDebug('TurnoDosInimigos');

        // Verifica Atordoamento
        const inimigoAtivo = EstadoDoJogo.inimigos.find(i => i.vida > 0 && !TemAtordoamento(i));

        if (!inimigoAtivo) {
            // Todos mortos ou atordoados
            ExibirMensagem("Inimigos não podem agir!");
            EstadoDoJogo.turno = 0;
            return;
        }

        // Simulação ataque simples
        const alvoJogador = EstadoDoJogo.jogadores[0]; // Sempre ataca o lider por enquanto
        if (alvoJogador.vida > 0) {
            AnimarAtaque(`inimigo-${EstadoDoJogo.inimigos.indexOf(inimigoAtivo) + 1}`, 'jogador-1');
            setTimeout(() => {
                const res = ProcessarAtaque(inimigoAtivo, alvoJogador, 1.0, false, "Ataque");
                if (res.resultado === 'sucesso') MostrarIndicadorDano('jogador-1', res.dano, 'dano');
                AtualizarInterface();
                VerificarGameOver();

                EstadoDoJogo.turno = 0;
            }, 500);
        } else {
            EstadoDoJogo.turno = 0;
        }
    }

    function TemAtordoamento(personagem) {
        return personagem.efeitos && personagem.efeitos.some(e => e.nome === "Atordoamento");
    }
}, 250);

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
    try {
        if (typeof LogDebug === 'function') LogDebug('AtualizarInterface');

        // Verificação de segurança
        if (!EstadoDoJogo || !EstadoDoJogo.jogadores || !EstadoDoJogo.inimigos) {
            console.warn("EstadoDoJogo inválido em AtualizarInterface");
            return;
        }

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

            // Atualizar Container de Efeitos
            const containerEfeitos = ehJogador ? document.getElementById('efeitos-jogador') : document.getElementById('efeitos-inimigo');
            if (containerEfeitos) {
                containerEfeitos.innerHTML = '';
                if (dados.efeitos && dados.efeitos.length > 0) {
                    dados.efeitos.forEach(eff => {
                        const def = BancoDeDados.Efeitos[eff.nome];
                        const nivelInfo = def && def.niveis ? def.niveis[eff.nivel] : {};
                        const icone = nivelInfo.icone || "❓";

                        const elEff = document.createElement('div');
                        elEff.className = 'efeito-icone';
                        elEff.innerHTML = `${icone} <div class="efeito-turnos">${eff.duracao}</div> <div class="efeito-stack">${eff.nivel}</div>`;
                        elEff.title = `${eff.nome} ${eff.nivel} (${eff.duracao} turnos)`;
                        containerEfeitos.appendChild(elEff);
                    });
                }
            }
        };

        // Atualizar HUDs usando o cache
        if (window.ElementosUI && window.ElementosUI.HUD) {
            AtualizarStatusHUD(window.ElementosUI.HUD.Jogador, J, true);

            if (I) {
                AtualizarStatusHUD(window.ElementosUI.HUD.Inimigo, I, false);
            } else {
                if (window.ElementosUI.HUD.Inimigo && window.ElementosUI.HUD.Inimigo.Nome) {
                    window.ElementosUI.HUD.Inimigo.Nome.textContent = "Inimigo";
                }
            }
        }
    } catch (e) {
        console.error("Erro seguro em AtualizarInterface:", e);
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


function FecharDetalhesAtributos() {
    if (typeof LogDebug === 'function') LogDebug('FecharDetalhesAtributos');
    const modal = document.getElementById('modal-atributos');
    if (modal) modal.classList.add('oculta');
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
// --- Novo Display de Mensagens Centralizado ---
// --- Novo Display de Mensagens Centralizado ---
function ExibirMensagem(texto, tipo = "") {
    try {
        const textoStr = (texto !== undefined && texto !== null) ? String(texto) : "";
        if (typeof LogDebug === 'function') {
            LogDebug(`ExibirMensagem -> ${textoStr.substring(0, 50)}...`);
        }

        const display = document.getElementById('display-mensagens');
        const txtEl = document.getElementById('texto-mensagem');

        // Check if EstadoDoJogo is available before accessing it
        if (typeof EstadoDoJogo !== 'undefined' && EstadoDoJogo.timerMensagem) {
            clearTimeout(EstadoDoJogo.timerMensagem);
        }

        if (!display || !txtEl) {
            console.warn("Elementos de mensagem não encontrados no DOM.");
            return;
        }

        txtEl.textContent = textoStr;
        display.className = "display-mensagens"; // Limpa tipos
        if (tipo) display.classList.add(`mensagem-${tipo}`);

        display.classList.remove('oculta');

        if (typeof EstadoDoJogo !== 'undefined') {
            EstadoDoJogo.timerMensagem = setTimeout(() => {
                display.classList.add('oculta');
            }, 3000);
        }
    } catch (e) {
        console.error("Erro seguro em ExibirMensagem:", e);
    }
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

// --- Sistema de Efeitos ---
function AdicionarEfeito(personagem, nomeEfeito, duracao, nivel, atualizarUI = true) {
    if (!personagem.efeitos) personagem.efeitos = [];

    // Procurar se já tem o efeito
    const existente = personagem.efeitos.find(e => e.nome === nomeEfeito);

    if (existente) {
        // Regra: "similares, eles se unem" (assumindo soma de nível se mesmo nome, mas o prompt diz "seunem" e dá exemplo de Poison 1 + Poison 1 = Poison 2)

        if (nivel === existente.nivel) {
            // Mesmo nível -> Sobe de nível, mantem duração maior? 
            // O prompt diz: "envenenamento 1por 2 rodas, duas vezes, ele receberá envenenamento 2 por 2 rodadas"
            // Então: Sobe nivel, reseta duração
            existente.nivel++;
            // Limitar ao máximo de 3 níveis por enquanto
            if (existente.nivel > 3) existente.nivel = 3;
            existente.duracao = Math.max(existente.duracao, duracao);
            // ExibirMensagem(`${personagem.nome}: ${nomeEfeito} intensificado para Nível ${existente.nivel}!`);
        } else if (nivel < existente.nivel) {
            // Nível menor -> Aumenta duração do atual
            // "tempo do novo efeito dividido por 2 e arredondado para cima será adicionado ao contador"
            const tempoExtra = Math.ceil(duracao / 2);
            existente.duracao += tempoExtra;
            // ExibirMensagem(`${personagem.nome}: ${nomeEfeito} prolongado (+${tempoExtra} turnos).`);
        } else {
            // Nível maior -> Substitui (Assumindo comportamento padrão de upgrade)
            existente.nivel = nivel;
            existente.duracao = duracao;
            // ExibirMensagem(`${personagem.nome}: ${nomeEfeito} agora é Nível ${nivel}!`);
        }
    } else {
        // Novo efeito
        personagem.efeitos.push({ nome: nomeEfeito, duracao: duracao, nivel: nivel });
        // ExibirMensagem(`${personagem.nome} afetado por ${nomeEfeito} ${nivel}!`);
    }
    // Recalcular imediatamente ao adicionar
    RecalcularAtributosComEfeitos(personagem);
    if (atualizarUI) AtualizarInterface();
}

function ProcessarEfeitosTurno(personagem) {
    if (!personagem.efeitos || personagem.efeitos.length === 0) return;

    // Iterar de trás pra frente para remover seguros
    for (let i = personagem.efeitos.length - 1; i >= 0; i--) {
        const eff = personagem.efeitos[i];
        const defBase = BancoDeDados.Efeitos[eff.nome];
        const dadosNivel = defBase.niveis[eff.nivel];

        if (!dadosNivel) continue;

        // Aplicação de Danos/Cura por turno (DoT/HoT)
        // Envenenamento, Sangramento, Combustão, Regeneração

        // Calcular Dano/Cura
        let danoTotal = 0;
        let curaTotal = 0;

        if (dadosNivel.danoFixo || dadosNivel.danoPct) {
            const fixo = dadosNivel.danoFixo || 0;
            const pct = dadosNivel.danoPct || 0;
            danoTotal = Math.floor(fixo + (personagem.vidaMaxima * pct));
        }

        if (dadosNivel.curaPct) {
            curaTotal = Math.floor(personagem.vidaMaxima * dadosNivel.curaPct);
        }

        // Aplicar
        if (danoTotal > 0) {
            personagem.vida = Math.max(0, personagem.vida - danoTotal);
            const alvoID = (personagem === EstadoDoJogo.jogadores[0]) ? 'jogador-1' : (EstadoDoJogo.inimigos.includes(personagem) ? `inimigo-${EstadoDoJogo.inimigos.indexOf(personagem) + 1}` : 'jogador-2'); // Simplificação ID

            // Tenta achar ID correto
            let domID = null;
            EstadoDoJogo.jogadores.forEach((p, idx) => { if (p === personagem) domID = `jogador-${idx + 1}`; });
            EstadoDoJogo.inimigos.forEach((p, idx) => { if (p === personagem) domID = `inimigo-${idx + 1}`; });

            if (domID) MostrarIndicadorDano(domID, danoTotal, 'dano');
            if (domID) MostrarIndicadorDano(domID, danoTotal, 'dano');
            // ExibirMensagem(`${personagem.nome} sofre ${danoTotal} de ${eff.nome}.`);
        }

        if (curaTotal > 0) {
            personagem.vida = Math.min(personagem.vidaMaxima, personagem.vida + curaTotal);
            // Tenta achar ID correto
            let domID = null;
            EstadoDoJogo.jogadores.forEach((p, idx) => { if (p === personagem) domID = `jogador-${idx + 1}`; });
            EstadoDoJogo.inimigos.forEach((p, idx) => { if (p === personagem) domID = `inimigo-${idx + 1}`; });

            if (domID) MostrarIndicadorDano(domID, curaTotal, 'cura');
            // ExibirMensagem(`${personagem.nome} recupera ${curaTotal} de ${eff.nome}.`);
        }

        // Reduzir duração
        eff.duracao--;

        if (eff.duracao <= 0) {
            personagem.efeitos.splice(i, 1);
            // ExibirMensagem(`${eff.nome} expirou em ${personagem.nome}.`);
        }
    }

    // Recalcular status após processar turno (pode ter removido efeitos)
    RecalcularAtributosComEfeitos(personagem);
}

// Calcular Stats Efetivos (chamado ao Ataque ou UI)
// Para simplificar, vamos alterar 'personagem.ataque', 'vigor' etc temporariamente ou usar getters?
// Como o sistema atual lê direto .ataque, precisamos atualizar esses valores baseado na Base + Efeitos
// Melhor abordagem: Resetar para Base no início de AtualizarInterface/Calculo e aplicar Efeitos.
// Mas precisamos da Base persistente. `AtributosBaseJogador` existe, mas e inimigos?
// Vamos criar `CalcularAtributosAtuais(personagem)` e usar isso.

// Porem o código já usa acesso direto em vários lugares.
// Solução rápida: Aplicar modificadores de "Stat" (Vigor, Ataque, Precisão) aqui no Processamento?
// Não, porque se remover o efeito, o stat tem que voltar.
// Então Re-calcular todo turno/frame é melhor.

function RecalcularAtributosComEfeitos(personagem) {
    if (!personagem.baseStatus) return; // Segurança

    // Restaura base
    personagem.vigor = personagem.baseStatus.vigor;
    personagem.ataque = personagem.baseStatus.ataque;
    personagem.precisao = personagem.baseStatus.precisao;

    // Se houverem outros stats modificáveis, restaurar aqui

    if (!personagem.efeitos) return;

    personagem.efeitos.forEach(eff => {
        const defBase = BancoDeDados.Efeitos[eff.nome];
        const dadosNivel = defBase && defBase.niveis ? defBase.niveis[eff.nivel] : null;

        if (dadosNivel) {
            if (dadosNivel.redVigorPct) {
                personagem.vigor = Math.floor(personagem.vigor * (1 - dadosNivel.redVigorPct));
            }
            if (dadosNivel.redAtaquePct) {
                personagem.ataque = Math.floor(personagem.ataque * (1 - dadosNivel.redAtaquePct));
            }
            if (dadosNivel.redPrecisao) {
                personagem.precisao = Math.max(0, personagem.precisao - dadosNivel.redPrecisao);
            }
            // Atordoamento (perde turno) é checado na logica de turno
        }
    });
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
;
