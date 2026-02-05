
// ==========================================
// STATE.JS - Estado Global do Jogo
// ==========================================

// Configurações de Áudio
window.AudioConfig = {
    CaminhoMusicaDeFundo: 'Audio/Musicas/Musica de fundo.mp3',
    CaminhoSomGirarRoleta: 'Audio/Sons/spin.mp3',
    CaminhoSomConfirmarSelecao: 'Audio/Sons/spin.mp3',
    CaminhoSomContagemRegressiva: 'Audio/Sons/spin.mp3',
    CaminhoSomInicioCombate: 'Audio/Sons/spin.mp3',
    CaminhoSomCura: 'Audio/Sons/Curando.mp3',
    CaminhoMusicaVitoria: 'Audio/Musicas/vitória.mp3'
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
