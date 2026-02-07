
// ==========================================
// STATE.JS - Estado Global do Jogo
// ==========================================

// Configurações de Áudio
window.AudioConfig = {
    CaminhoMusicaDeFundo: 'Audio/Musicas/Musica de fundo.mp3',
    CaminhoMusicaVitoria: 'Audio/Musicas/vitória.mp3',

    // Interface
    Interface: {
        Click1: 'Audio/Sons/Sons de interface/Click1.mp3',
        Click2: 'Audio/Sons/Sons de interface/Click2.mp3',
        Click3: 'Audio/Sons/Sons de interface/Click3.mp3',
        Click4: 'Audio/Sons/Sons de interface/Click4.mp3',
        ClickGenerico: 'Audio/Sons/Sons de interface/Click.mp3',
        Sucesso: 'Audio/Sons/Sons de interface/Sucesso.mp3',
        Erro: 'Audio/Sons/Sons de interface/Erro1.mp3',
        ErroGrave: 'Audio/Sons/Sons de interface/Erro2.mp3',
        Fracasso: 'Audio/Sons/Sons de interface/Fracasso.mp3',
        FracassoAlt: 'Audio/Sons/Sons de interface/Fracasso2.mp3',
        LevelUp: 'Audio/Sons/Sons de interface/SubindoDeNivel.wav'
    },

    // Combate / Geral
    Sons: {
        AtaqueBasico: 'Audio/Sons/Sons Gerais/Ataque Básico.mp3',
        HitEspada: 'Audio/Sons/Sons Gerais/HitEspada.mp3',
        Cura: 'Audio/Sons/Sons Gerais/Curando.mp3',
        Defendido: 'Audio/Sons/Sons Gerais/Defendido.mp3',
        Desvio: 'Audio/Sons/Sons Gerais/Desvio1.mp3',
        Desvio2: 'Audio/Sons/Sons Gerais/Desvio2.mp3',
        Pocao: 'Audio/Sons/Sons Gerais/bebendoPocao.mp3',
        PocaoQuebrando: 'Audio/Sons/Sons Gerais/PocaoQuebrando.mp3',
        ChuvaDeFlechas: 'Audio/Sons/Sons Gerais/ChuvaDeFlechas.mp3',
        FlechaNoCorpo: 'Audio/Sons/Sons Gerais/FlechaNoCorpo.mp3',
        Soco: 'Audio/Sons/Sons Gerais/Soco.mp3',
        GritoDurotan: 'Audio/Sons/Sons Gerais/GritoDurotan.mp3',
        Combo3Hits: 'Audio/Sons/Sons Gerais/Combo3Hits2.mp3',
        ComboForte: 'Audio/Sons/Sons Gerais/ComboForte.mp3',
        OssoQuebrando: 'Audio/Sons/Sons Gerais/Osso quebrando.mp3',
        Parry: 'Audio/Sons/Sons Gerais/Parry.mp3',
        MagiaMortos: 'Audio/Sons/Sons Gerais/MagiaDosMortos.wav'
    }
};

// Variáveis Globais de Música (para controle)
window.MusicaCombate = null;
window.MusicaVitoria = null;

// Inicialização do Estado
window.EstadoDoJogo = {
    jogadores: [], // Será populado no init
    inimigos: [],

    // Controles de Turno e Foco
    turno: 0, // 0: Jogador, 1: Inimigo, -1: Fim
    jogadorFoco: 0,
    inimigoFoco: 0,
    alvoSelecionado: 0,

    // Metadados da Sessão
    faseAtual: 1,
    fasesDesbloqueadas: 1,

    // Baralho
    baralhoPersonalizado: [],

    // Flags de Controle
    carregandoFase: false,
    audioHabilitado: true,

    // Referências Temporárias
    cartaSelecionada: null,
    processarAliadosCallback: null // Callback para cadeia de ataques
};

// Função para Resetar/Inicializar o Estado Base
window.InicializarEstado = function () {
    if (!window.BancoDeDados) {
        console.error("BancoDeDados não carregado!");
        return;
    }

    // Clona o jogador base para não alterar o "template"
    window.EstadoDoJogo.jogadores = [{ ...window.BancoDeDados.JogadorBase }];
    window.EstadoDoJogo.inimigos = [];
    window.EstadoDoJogo.turno = 0;
};
