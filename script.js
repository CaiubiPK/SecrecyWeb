document.addEventListener('DOMContentLoaded', () => {
    // Elementos da Interface (DOM)
    const TelaInicial = document.getElementById('tela-inicial');
    const TelaDeJogo = document.getElementById('tela-jogo');
    const BotaoIniciar = document.getElementById('botao-iniciar');
    const BotoesDeAcao = document.querySelectorAll('.botao-acao');

    // Dados dos Inimigos são carregados do arquivo dados.js
    // Acessados via: BancoDeDados.Inimigos

    // Estado do Jogo
    const EstadoDoJogo = {
        jogador: { ...BancoDeDados.JogadorBase },
        inimigoAtual: null,
        turno: 0,
        fasesDesbloqueadas: 1,
        baralhoPersonalizado: [],
        timerMensagem: null,
        indiceDialogo: 0,
        dialogoAtual: [],
        audioHabilitado: true
    };

    const DialogosCombate = {
        "Igvuld": [
            { nome: "Igvuld", texto: "Quem ousa invadir meus domínios?", imagem: "Images/Personagens/Igvuld.png" },
            { nome: "Protagonista", texto: "Vim colocar um fim à sua tirania, Igvuld!", imagem: "Images/Personagens/Protagonista.png" },
            { nome: "Igvuld", texto: "Tolo... Seu sangue servirá de oferenda para as sombras!", imagem: "Images/Personagens/Igvuld.png" }
        ],
        "Padrao": [
            { nome: "Inimigo", texto: "Prepare-se para morrer!", imagem: "" },
            { nome: "Protagonista", texto: "Eu não seria tão confiante se fosse você.", imagem: "Images/Personagens/Protagonista.png" }
        ]
    };

    // Inicializar baralho com 20 cartas (exemplo: Bronze e Prata misturadas)
    function InicializarBaralho() {
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

    document.getElementById('btn-vitoria-continuar').onclick = () => {
        if (EstadoDoJogo.jogador.pontosHabilidade > 0) {
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

    document.getElementById('botao-avancar-dialogo').addEventListener('click', AvancarDialogo);
    document.querySelectorAll('.fase').forEach(fase => {
        fase.addEventListener('click', (e) => {
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

    // --- Funções Principais ---

    function IniciarJogo() {
        InicializarBaralho();
        AtributosBaseJogador = { ...EstadoDoJogo.jogador }; // Salva base
        // Agora vai para o Mapa, não direto para o jogo
        TelaInicial.classList.add('oculta');
        EntrarNoMapa();
    }

    function EntrarNoMapa() {
        const TelaMapa = document.getElementById('tela-mapa');
        TelaMapa.classList.remove('oculta');
        TelaMapa.classList.add('ativa');

        AtualizarMapa();
    }

    function AtualizarMapa() {
        // Atualiza visual das fases (bloqueado/desbloqueado)
        document.querySelectorAll('.fase').forEach(faseEl => {
            const num = parseInt(faseEl.dataset.fase);
            const icone = faseEl.querySelector('.icone-fase');

            icone.className = 'icone-fase'; // Limpa classes

            if (num <= EstadoDoJogo.fasesDesbloqueadas) {
                icone.classList.add('disponivel');
            } else {
                icone.classList.add('bloqueado');
            }
        });

        // Atualiza posição do token do jogador
        // Movemos para a fase atual (ou última visitada)
        const TokenJogador = document.getElementById('jogador-mapa');
        const FaseAtualEl = document.querySelector(`.fase[data-fase="${EstadoDoJogo.faseAtual}"]`);

        // Vamos pegar o 'left' e 'top' da fase atual para alinhar o token perfeitamente
        if (FaseAtualEl) {
            TokenJogador.style.left = FaseAtualEl.style.left;
            TokenJogador.style.top = FaseAtualEl.style.top; // Copia também a altura
        }
    }

    function ClicarFase(numeroDaFase) {
        if (numeroDaFase > EstadoDoJogo.fasesDesbloqueadas) {
            alert("⚠️ Complete a fase anterior para desbloquear esta!");
            return;
        }

        // Se fase liberada, entra no combate
        EstadoDoJogo.faseAtual = numeroDaFase;
        AtualizarMapa(); // Move jogador visualmente

        // Pequeno delay para ver o boneco andando
        setTimeout(() => {
            const TelaMapa = document.getElementById('tela-mapa');
            TelaMapa.classList.add('oculta'); // Esconde mapa

            // Prepara a tela de jogo
            TelaDeJogo.classList.remove('oculta');
            TelaDeJogo.classList.add('ativa');
            TelaDeJogo.classList.add('modo-selecao');

            console.log(`Entrando na Fase ${numeroDaFase}`);

            // Define o inimigo com base na fase (Fase 1 = Igvuld)
            let inimigo;
            if (numeroDaFase === 1) {
                inimigo = BancoDeDados.Inimigos.find(i => i.nome === "Igvuld");
            } else {
                // Para outras fases, pode ser aleatório ou sequência
                inimigo = BancoDeDados.Inimigos[Math.floor(Math.random() * BancoDeDados.Inimigos.length)];
            }

            IniciarDialogoPreCombate(inimigo);
        }, 500);
    }



    function ComecarCombateReal() {
        // Remove modo seleção para mostrar HUD e Controles
        TelaDeJogo.classList.remove('modo-selecao');

        // Atualizar Cenário de Fundo com base na Fase
        const fase = EstadoDoJogo.faseAtual;
        const imagemCenario = BancoDeDados.Cenarios[fase] || "Images/Cenarios/CampoDeBatalha.png"; // Fallback

        TelaDeJogo.style.backgroundImage = `url('${imagemCenario}')`;
        TelaDeJogo.style.backgroundSize = "cover";
        TelaDeJogo.style.backgroundPosition = "center";

        // Tocar música de fundo
        if (MusicaCombate) MusicaCombate.pause();
        MusicaCombate = new Audio(AudioConfig.CaminhoMusicaDeFundo);
        MusicaCombate.loop = true;
        MusicaCombate.volume = 0.5;
        MusicaCombate.play().catch(erro => console.log("Erro ao tocar música:", erro));

        TelaInicial.style.display = 'none';

        // Garante que o mapa também some se algo deu errado
        document.getElementById('tela-mapa').classList.add('oculta');

        console.log("Combate Real Iniciado!");
    }

    function IniciarDialogoPreCombate(inimigo) {
        EstadoDoJogo.inimigoAtual = { ...inimigo };
        AtributosBaseInimigo = { ...inimigo };

        // Configura o visual do inimigo antes do diálogo
        const VisualDoInimigo = document.querySelector('.visual-inimigo');
        const NomeDoInimigo = document.querySelector('.personagem.inimigo .nome-personagem');
        VisualDoInimigo.style.backgroundImage = `url('${inimigo.imagem}')`;
        NomeDoInimigo.textContent = inimigo.nome;

        // Prepara diálogos
        EstadoDoJogo.dialogoAtual = DialogosCombate[inimigo.nome] || DialogosCombate["Padrao"];
        EstadoDoJogo.indiceDialogo = 0;

        // Mostra overlay de diálogo
        document.getElementById('overlay-dialogo').classList.remove('oculta');
        AtualizarTextoDialogo();
    }

    function AtualizarTextoDialogo() {
        const dialogo = EstadoDoJogo.dialogoAtual[EstadoDoJogo.indiceDialogo];
        document.getElementById('nome-personagem-dialogo').textContent = dialogo.nome;
        document.getElementById('texto-dialogo').textContent = dialogo.texto;

        const img = document.getElementById('img-personagem-dialogo');
        if (dialogo.imagem) {
            img.src = dialogo.imagem;
            img.style.display = 'block';
        } else {
            // Se for o inimigo e não tiver imagem específica no diálogo, usa a do banco
            img.src = EstadoDoJogo.inimigoAtual.imagem;
            img.style.display = 'block';
        }
    }

    function AvancarDialogo() {
        EstadoDoJogo.indiceDialogo++;
        if (EstadoDoJogo.indiceDialogo < EstadoDoJogo.dialogoAtual.length) {
            AtualizarTextoDialogo();
        } else {
            FecharDialogo();
        }
    }

    function FecharDialogo() {
        document.getElementById('overlay-dialogo').classList.add('oculta');

        // Atualiza a Interface completa chamando a nova função
        AtualizarInterface();

        document.getElementById('nome-inimigo-hud').textContent = EstadoDoJogo.inimigoAtual.nome;

        ComecarCombateReal();
    }

    function IniciarRoletaDeInimigos() {
        // Função mantida mas não mais chamada diretamente para permitir diálogos
        console.warn("Roleta desativada em favor do sistema de diálogos.");
    }

    function FinalizarSelecaoDeInimigo(InimigoSelecionado) {
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

            cartaEl.onclick = () => RealizarAtaqueJogador(carta);
            wrapper.appendChild(cartaEl);
        });

        document.querySelector('.controles').classList.add('oculta');
        containerCartas.classList.remove('oculta');
    }

    function FecharMenuAtaque() {
        document.getElementById('container-cartas').classList.add('oculta');
        document.querySelector('.controles').classList.remove('oculta');
    }

    function CalcularReducaoDano(valor) {
        return Math.min(valor / (valor + 88), 0.85);
    }

    function CalcularReducaoMagica(valor) {
        return Math.min(valor / (valor + 88), 0.85);
    }

    function CalcularAmplificacaoVigor(vigor) {
        return Math.min((vigor / 200) * 0.5, 0.5);
    }

    function RealizarAtaqueJogador(carta) {
        const jogador = EstadoDoJogo.jogador;
        const inimigo = EstadoDoJogo.inimigoAtual;

        if (jogador.energia < (carta.custoEnergia || 0) && jogador.mana < (carta.custoMana || 0)) {
            ExibirMensagem("Recursos insuficientes!");
            return;
        }

        // Consumir Recursos
        if (carta.custoEnergia) jogador.energia -= carta.custoEnergia;
        if (carta.custoMana) jogador.mana -= carta.custoMana;

        // Tocar Som da Carta
        if (carta.som && EstadoDoJogo.audioHabilitado) {
            const somAtaque = new Audio(carta.som);
            somAtaque.volume = 1;
            somAtaque.play().catch(e => console.log("Erro ao tocar som da carta:", e));
        }

        // Precisão vs Esquiva
        const chanceAcerto = jogador.precisao - inimigo.esquiva;
        const sorteMod = jogador.sorte * 0.5;
        if (Math.random() * 100 > (chanceAcerto + sorteMod)) {
            ExibirMensagem("O ataque falhou! (Esquiva)", "erro");
            PassarTurnoAutomatico();
            return;
        }

        // Calcular Dano
        const mult = carta.efeito?.danoMultiplicador || 1.0;
        let danoBase = (carta.custoMana ? jogador.ataqueMagico : jogador.ataque) * mult;

        // Crítico (175%)
        let critico = false;
        if (Math.random() * 100 < (jogador.chanceCritico + (jogador.sorte * 0.2))) {
            danoBase *= 1.75;
            critico = true;
        }

        // Redução por Defesa
        const reducao = carta.custoMana ? CalcularReducaoMagica(inimigo.protecaoMagica) : CalcularReducaoDano(inimigo.armadura);
        const danoFinal = Math.floor(danoBase * (1 - reducao));
        const danoReal = danoFinal > 0 ? danoFinal : 1;

        // Aplicar Dano
        inimigo.vida -= danoReal;
        if (inimigo.vida < 0) inimigo.vida = 0;

        // Afeta Determinação (10% do dano tirado)
        inimigo.determinacao -= Math.floor(danoReal * 0.1);
        if (inimigo.determinacao < 0) inimigo.determinacao = 0;

        // Lifesteal
        if (jogador.rouboVida > 0) {
            const cura = Math.floor(danoReal * (jogador.rouboVida / 100));
            jogador.vida = Math.min(jogador.vida + cura, jogador.vidaMaxima);
            if (cura > 0) MostrarIndicadorDano('jogador', cura, 'cura');
        }

        MostrarIndicadorDano('inimigo', danoReal, critico ? 'critico' : 'dano');

        // Feedback Visual e Interface
        FecharMenuAtaque();
        AtualizarInterface();

        ExibirMensagem(`${critico ? 'CRÍTICO! ' : ''}Você usou ${carta.nome} causando ${danoReal} de dano!`);

        // Verifica vitória ou passa turno
        if (inimigo.vida <= 0 || inimigo.determinacao <= 0) {
            ExibirMensagem(inimigo.vida <= 0 ? "VITÓRIA! O inimigo sucumbiu." : "VITÓRIA! O inimigo perdeu a determinação.", "vitoria");
            setTimeout(MostrarTelaVitoria, 1000);
        } else {
            EstadoDoJogo.turno = 1; // Inimigo
            setTimeout(TurnoDoInimigo, 1500);
        }
    }

    function PassarTurnoAutomatico() {
        FecharMenuAtaque();
        EstadoDoJogo.turno = 1;
        setTimeout(TurnoDoInimigo, 1000);
    }

    function IniciarTurnoJogador() {
        const jogador = EstadoDoJogo.jogador;
        const amplificacao = CalcularAmplificacaoVigor(jogador.vigor);

        // Visual: Destaca Jogador
        document.querySelector('.visual-jogador').classList.add('ativo');
        document.querySelector('.visual-inimigo').classList.remove('ativo');

        // Regeneração de Início de Turno
        const regenVida = Math.floor(jogador.regeneracaoVida * (1 + amplificacao));
        const regenMana = Math.floor(jogador.regeneracaoMana * (1 + amplificacao));
        const regenEnergia = Math.floor(jogador.vigor * 0.10);

        jogador.vida = Math.min(jogador.vida + regenVida, jogador.vidaMaxima);
        jogador.mana = Math.min(jogador.mana + regenMana, jogador.manaMaxima);
        jogador.energia = Math.min(jogador.energia + regenEnergia, jogador.energiaMaxima);

        if (regenVida > 0) MostrarIndicadorDano('jogador', regenVida, 'cura');

        AtualizarInterface();
        ExibirMensagem("Seu turno! Energias recuperadas.");
        EstadoDoJogo.turno = 0;
    }

    function PassarTurno() {
        if (!confirm("Deseja passar o turno e descansar?")) return;
        ExibirMensagem("Você descansou.");
        EstadoDoJogo.turno = 1;
        setTimeout(TurnoDoInimigo, 1000);
    }

    function TurnoDoInimigo() {
        const inimigo = EstadoDoJogo.inimigoAtual;
        const jogador = EstadoDoJogo.jogador;

        // Visual: Destaca Inimigo
        document.querySelector('.visual-inimigo').classList.add('ativo');
        document.querySelector('.visual-jogador').classList.remove('ativo');

        // Inimigo Ataca (Lógica simplificada para IA)
        const chanceAcerto = inimigo.precisao - jogador.esquiva;
        if (Math.random() * 100 > chanceAcerto) {
            ExibirMensagem(`${inimigo.nome} errou o ataque!`);
            setTimeout(IniciarTurnoJogador, 1000);
            return;
        }

        const aleatorio = 1 + (Math.random() * 0.5); // 1.0 a 1.5
        const danoBruto = Math.floor(inimigo.ataque * aleatorio);
        const reducao = CalcularReducaoDano(jogador.armadura);
        const danoFinal = Math.max(1, Math.floor(danoBruto * (1 - reducao)));

        jogador.vida -= danoFinal;
        jogador.determinacao -= Math.floor(danoFinal * 0.1);

        MostrarIndicadorDano('jogador', danoFinal, 'dano');
        AtualizarInterface();
        ExibirMensagem(`${inimigo.nome} atacou causando ${danoFinal} de dano!`);

        // Verifica Derrota ou Teste de Determinação
        if (jogador.vida <= 0 || jogador.determinacao <= 0) {
            if (jogador.determinacao > 0) {
                // Teste de Ressurreição
                const teste = Math.random() * 100;
                const limite = (jogador.determinacao / 2) - 25 + (jogador.sorte * 2);
                if (teste < limite) {
                    jogador.vida = 1;
                    ExibirMensagem("DETERMINAÇÃO! Você se recusa a cair!", "vitoria");
                    setTimeout(IniciarTurnoJogador, 1500);
                    return;
                }
            }

            ExibirMensagem("DERROTA! Seu cavaleiro caiu em batalha.", "derrota");
            setTimeout(() => location.reload(), 3000);
        } else {
            setTimeout(IniciarTurnoJogador, 1500);
        }
    }

    function AtualizarInterface() {
        const J = EstadoDoJogo.jogador;
        const I = EstadoDoJogo.inimigoAtual;
        const BaseJ = BancoDeDados.JogadorBase;

        if (!J) return;

        // --- Barras Jogador ---
        document.getElementById('texto-vida-jogador').textContent = `${Math.floor(J.vida)}/${J.vidaMaxima}`;
        document.getElementById('barra-vida-jogador').style.width = `${(J.vida / J.vidaMaxima) * 100}%`;

        document.getElementById('texto-energia-jogador').textContent = `${Math.floor(J.energia)}/${J.energiaMaxima}`;
        document.getElementById('barra-energia-jogador').style.width = `${(J.energia / J.energiaMaxima) * 100}%`;

        document.getElementById('texto-mana-jogador').textContent = `${Math.floor(J.mana)}/${J.manaMaxima}`;
        document.getElementById('barra-mana-jogador').style.width = `${(J.mana / J.manaMaxima) * 100}%`;

        // --- Grid Jogador ---
        const isMago = J.classe === "Mago";
        const labelAtk = document.getElementById('label-ataque-jogador');
        labelAtk.textContent = isMago ? "MATK" : "ATK";

        const baseAtkValue = isMago ? BaseJ.ataqueMagico : BaseJ.ataque;
        const atualAtkValue = isMago ? J.ataqueMagico : J.ataque;

        const elAtkBase = document.getElementById('atk-jogador-base');
        elAtkBase.textContent = baseAtkValue;

        const elAtkAtual = document.getElementById('atk-jogador');
        elAtkAtual.textContent = atualAtkValue;
        elAtkAtual.className = "valor-atual " + (atualAtkValue > baseAtkValue ? "subiu" : (atualAtkValue < baseAtkValue ? "desceu" : ""));

        // DEF
        const defReducao = (CalcularReducaoDano(J.armadura) * 100).toFixed(1);
        document.getElementById('def-jogador').textContent = J.armadura;
        document.getElementById('def-jogador-pct').textContent = `(${defReducao}%)`;

        // VIG
        const vigAmp = (CalcularAmplificacaoVigor(J.vigor) * 100).toFixed(1);
        document.getElementById('vigor-jogador').textContent = J.vigor;
        document.getElementById('vigor-jogador-pct').textContent = `(+${vigAmp}%)`;

        // ROUBO / CRIT
        document.getElementById('roubo-jogador').textContent = `${J.rouboVida}%`;
        document.getElementById('crit-jogador').textContent = `${J.chanceCritico}%`;

        // PEN
        const labelPen = document.getElementById('label-pen-jogador');
        labelPen.textContent = isMago ? "MPEN" : "PEN";
        const penVal = isMago ? J.penetracaoMagica : J.penetracaoArmadura;
        document.getElementById('pen-jogador-abs').textContent = penVal;
        document.getElementById('pen-jogador-pct').textContent = `(${penVal}%)`;

        // DETERMINAÇÃO
        document.getElementById('det-jogador').textContent = Math.floor(J.determinacao);
        document.getElementById('det-max-jogador').textContent = J.determinacaoMaxima || 200;

        // --- Inimigo ---
        if (I) {
            document.getElementById('texto-vida-inimigo').textContent = `${Math.floor(I.vida)}/${I.vidaMaxima}`;
            document.getElementById('barra-vida-inimigo').style.width = `${(I.vida / I.vidaMaxima) * 100}%`;
            document.getElementById('texto-energia-inimigo').textContent = `${Math.floor(I.energia)}/${I.energiaMaxima}`;
            document.getElementById('barra-energia-inimigo').style.width = `${(I.energia / I.energiaMaxima) * 100}%`;
            document.getElementById('texto-mana-inimigo').textContent = `${Math.floor(I.mana)}/${I.manaMaxima}`;
            document.getElementById('barra-mana-inimigo').style.width = `${(I.mana / I.manaMaxima) * 100}%`;

            document.getElementById('atk-inimigo').textContent = I.ataque;
            document.getElementById('def-inimigo').textContent = I.armadura;
            document.getElementById('def-inimigo-pct').textContent = `(${(CalcularReducaoDano(I.armadura) * 100).toFixed(1)}%)`;
            document.getElementById('vigor-inimigo').textContent = I.vigor;
            document.getElementById('roubo-inimigo').textContent = `${I.rouboVida}%`;
            document.getElementById('crit-inimigo').textContent = `${I.chanceCritico}%`;
            document.getElementById('pen-inimigo-abs').textContent = I.penetracaoArmadura;
            document.getElementById('det-inimigo').textContent = Math.floor(I.determinacao);
        }
    }

    // --- Modal do Baralho ---
    function AbrirModalBaralho() {
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
        document.getElementById('modal-baralho').classList.add('oculta');
    }

    // --- Sistema de Atributos Detalhados ---
    function AbrirDetalhesAtributos(alvo) {
        const modal = document.getElementById('modal-atributos');
        const titulo = document.getElementById('titulo-modal-atributos');
        const grid = document.getElementById('lista-atributos-detalhada');

        const dados = alvo === 'jogador' ? EstadoDoJogo.jogador : EstadoDoJogo.inimigoAtual;
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
        document.getElementById('modal-atributos').classList.add('oculta');
    }

    // --- Indicadores de Dano/Cura ---
    function MostrarIndicadorDano(alvo, valor, tipo) {
        const id = alvo === 'jogador' ? 'indicador-dano-jogador' : 'indicador-dano-inimigo';
        const el = document.getElementById(id);

        el.textContent = tipo === 'dano' ? `-${valor}` : `+${valor}`;
        el.className = `indicador-flutuante ${tipo === 'dano' ? 'indicador-dano' : 'indicador-cura'}`;

        // Resetar animação
        el.classList.remove('animar-indicador');
        void el.offsetWidth;
        el.classList.add('animar-indicador');

        setTimeout(() => {
            el.classList.remove('animar-indicador');
        }, 1000);
    }

    // --- Novo Display de Mensagens Centralizado ---
    function ExibirMensagem(texto, tipo = "") {
        const display = document.getElementById('display-mensagens');
        const txtEl = document.getElementById('texto-mensagem');

        clearTimeout(EstadoDoJogo.timerMensagem);

        txtEl.textContent = texto;
        display.className = "display-mensagens"; // Limpa tipos
        if (tipo) display.classList.add(`mensagem-${tipo}`);

        display.classList.remove('oculta');

        EstadoDoJogo.timerMensagem = setTimeout(() => {
            display.classList.add('oculta');
        }, 3000);
    }

    function MostrarTelaVitoria() {
        const tela = document.getElementById('tela-vitoria');
        const resumo = document.getElementById('vitoria-resumo');
        const inimigo = EstadoDoJogo.inimigoAtual;
        const jogador = EstadoDoJogo.jogador;

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
            // Mantendo 100 de XP conforme pedido, ou aumentando levemente
            // jogador.xpParaProximoNivel = 100; 
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

        tela.classList.remove('oculta');
        CriarParticulasVitoria();
    }

    function AbrirMenuTalentos() {
        document.getElementById('tela-vitoria').classList.add('oculta');
        const menu = document.getElementById('menu-talentos');
        const grid = document.getElementById('grid-talentos');
        const textoPontos = document.getElementById('pontos-talento-valor');

        textoPontos.textContent = EstadoDoJogo.jogador.pontosHabilidade;
        menu.classList.remove('oculta');

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
        if (EstadoDoJogo.jogador.pontosHabilidade <= 0) return;

        EstadoDoJogo.jogador.pontosHabilidade--;

        // Aplicar efeitos
        for (let atributo in talento.efeito) {
            if (EstadoDoJogo.jogador.hasOwnProperty(atributo)) {
                EstadoDoJogo.jogador[atributo] += talento.efeito[atributo];
                // Se for vidaMaxima, cura um pouco também
                if (atributo === 'vidaMaxima') EstadoDoJogo.jogador.vida += talento.efeito[atributo];
            }
        }

        ExibirMensagem(`Talento Adquirido: ${talento.nome}`);

        if (EstadoDoJogo.jogador.pontosHabilidade > 0) {
            AbrirMenuTalentos(); // Continua escolhendo se tiver pontos
        } else {
            document.getElementById('menu-talentos').classList.add('oculta');
            VoltarAoMapa();
        }
    }

    function CriarParticulasVitoria() {
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
        if (MusicaVitoria) MusicaVitoria.pause();
        document.getElementById('tela-vitoria').classList.add('oculta');

        TelaDeJogo.classList.remove('ativa');
        TelaDeJogo.classList.add('oculta');

        EstadoDoJogo.fasesDesbloqueadas = Math.max(EstadoDoJogo.fasesDesbloqueadas, EstadoDoJogo.faseAtual + 1);
        EntrarNoMapa();
    }

    // --- Sistema de Configurações ---
    function AbrirMenuConfig() {
        document.getElementById('modal-config').classList.remove('oculta');
    }

    function FecharMenuConfig() {
        document.getElementById('modal-config').classList.add('oculta');
    }

    function MenuDesistir() {
        if (confirm("Guerreiros não desistem, mas se você precisar partir... Tem certeza?")) {
            location.reload();
        }
    }

    function ToggleAudio() {
        EstadoDoJogo.audioHabilitado = !EstadoDoJogo.audioHabilitado;
        const btn = document.getElementById('btn-audio-toggle');
        btn.textContent = EstadoDoJogo.audioHabilitado ? "Desabilitar Áudio" : "Habilitar Áudio";
        ExibirMensagem(EstadoDoJogo.audioHabilitado ? "Áudio Ativado" : "Áudio Desativado");
    }

    function FecharPrograma() {
        if (confirm("Deseja realmente fechar o programa?")) {
            window.close();
            // Fallback se window.close() for bloqueado
            location.href = "about:blank";
        }
    }

    function AbrirBaralhoViaConfig() {
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
