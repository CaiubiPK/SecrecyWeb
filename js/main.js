/**
 * PONTO DE ENTRADA PRINCIPAL
 * Inicializa todos os subsistemas e prepara o jogo.
 */

window.onload = function () {
    console.log("🚀 [MAIN] Inicializando Secrecy RPG...");

    if (!window.BancoDeDados) {
        alert("Erro Crítico: Banco de Dados não carregado!");
        return;
    }

    try {
        window.EstadoJogo.Inicializar();
        window.GerenciadorInterface.Inicializar();
        window.SistemaInventario.Inicializar();

        ConfigurarEventosIniciais();
        ConfigurarEventosExtras();

        window.GerenciadorInterface.TrocarTela('tela-inicial');

    } catch (e) {
        console.error("Erro na inicialização:", e);
        alert("Erro ao iniciar jogo. Verifique o console.");
    }
};

function ConfigurarEventosIniciais() {
    // Botão Iniciar Jogo
    const btnIniciar = document.getElementById('botao-iniciar');
    if (btnIniciar) {
        btnIniciar.onclick = () => {
            window.GerenciadorAudio.TocarEfeito('Click1');
            window.GerenciadorInterface.TrocarTela('tela-nome');
        };
    }

    // Botão Confirmar Nome
    const btnConfirmarNome = document.getElementById('botao-confirmar-nome');
    if (btnConfirmarNome) {
        btnConfirmarNome.onclick = () => {
            const inputNome = document.getElementById('input-nome');
            const nome = inputNome ? inputNome.value.trim() || "Viajante" : "Viajante";

            window.EstadoJogo.Jogadores[0].nome = nome;
            window.GerenciadorInterface.ExibirMensagem(`Bem-vindo, ${nome}!`);
            window.GerenciadorAudio.TocarEfeito('Sucesso');

            window.GerenciadorInterface.TrocarTela('tela-campanha');
        };
    }

    // Seleção de Campanha (Castelo)
    const cardCastelo = document.getElementById('campanha-castelo');
    if (cardCastelo) {
        cardCastelo.onclick = () => {
            window.GerenciadorAudio.TocarEfeito('Click2');
            window.Navigation.MostrarMapaCampanha();
        };
    }

    // Botão "Passar Turno"
    const btnPassar = document.querySelector('.botao-acao.descansar');
    if (btnPassar) {
        btnPassar.onclick = () => {
            window.SistemaCombate.PassarTurno();
        };
    }
}

function ConfigurarEventosExtras() {
    // Botões de Diálogo
    const btnProx = document.getElementById('btn-proximo-dialogo');
    if (btnProx) btnProx.onclick = () => window.SistemaDialogo.Avancar();

    const btnPular = document.getElementById('btn-pular-dialogo');
    if (btnPular) btnPular.onclick = () => window.SistemaDialogo.Pular();

    const btnInventario = document.querySelector('.botao-acao.mochila');
    if (btnInventario) btnInventario.onclick = () => window.GerenciadorInterface.AbrirInventario();
}

