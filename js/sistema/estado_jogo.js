/**
 * ESTADO DO JOGO
 * Gerencia o estado mutável da sessão atual (vida atual, turno, inimigos vivos).
 * Acesso global via: window.EstadoJogo
 */

window.EstadoJogo = {
    // Entidades Vivas na Batalha
    Jogadores: [],
    Inimigos: [],
    InimigoSelecionadoIndice: 0, // Índice do inimigo cujos atributos estão sendo exibidos no HUD
    Deck: [], // Baralho atual do jogador
    Mao: [], // Cartas na mão atual

    // Controle de Fluxo
    Turno: 0, // 0: Jogador, 1: Inimigo, -1: Encerrado
    FaseAtual: 1,
    FasesDesbloqueadas: 1,

    // Controle de Ações
    ItensUsadosNoTurno: 0,
    FacasGastas: 0,

    // Metadados
    AudioHabilitado: true,
    LogCombate: [],

    /**
     * Reseta o estado para iniciar uma nova batalha ou campanha
     */
    Inicializar: function () {
        if (!window.BancoDeDados) {
            console.error("❌ Erro: Banco de Dados não carregado antes do Estado.");
            return;
        }

        // Clona o jogador base (Deep Copy simples para evitar referência)
        this.Jogadores = [JSON.parse(JSON.stringify(window.BancoDeDados.JogadorBase))];
        this.Inimigos = [];
        this.Turno = 0;
        this.ItensUsadosNoTurno = 0;

        console.log("✅ [SISTEMA] Estado do Jogo Inicializado.");
    }
};
