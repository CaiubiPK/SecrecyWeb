/**
 * SISTEMA DE DIÁLOGO
 * Gerencia cenas de diálogo entre jogador e inimigos antes das batalhas.
 * Migrado de: dialogo.js
 */

window.SistemaDialogo = {
    IndiceAtual: 0,
    DialogoAtual: [],
    CallbackFim: null,

    /**
     * Inicia a sequência de diálogo
     * @param {number} faseId - ID da fase para carregar falas
     * @param {Function} onComplete - Callback ao terminar
     */
    Iniciar: function (faseId, onComplete) {
        console.log(`[DIALOGO] Iniciando diálogo fase ${faseId}`);

        // Busca dados no Banco (assumindo apenas Castelo por enquanto)
        const nivel = window.BancoDeDados.Campanhas.Castelo.niveis[faseId];

        if (!nivel || !nivel.dialogos) {
            console.warn("Sem diálogo definido, pulando.");
            if (onComplete) onComplete();
            return;
        }

        this.DialogoAtual = nivel.dialogos;
        this.IndiceAtual = 0;
        this.CallbackFim = onComplete;

        // Configura Avatares Visualmente
        const avatarJogador = document.getElementById('avatar-jogador-dialogo');
        const avatarInimigo = document.getElementById('avatar-inimigo-dialogo');

        if (avatarJogador) avatarJogador.style.backgroundImage = `url('Images/Personagens/Jogador.png')`;
        if (avatarInimigo) avatarInimigo.style.backgroundImage = `url('${nivel.imagemInimigo || "Images/FotoDr.jpeg"}')`;

        window.GerenciadorInterface.TrocarTela('tela-dialogo-combate');
        this.MostrarFalaAtual();
    },

    MostrarFalaAtual: function () {
        if (this.IndiceAtual >= this.DialogoAtual.length) {
            this.Finalizar();
            return;
        }

        const fala = this.DialogoAtual[this.IndiceAtual];
        const ehJogador = fala.orador === 'jogador';

        // Lógica Visual de Balões (Simplificada)
        const balaoJogador = document.getElementById('balao-jogador');
        const balaoInimigo = document.getElementById('balao-inimigo');

        if (balaoJogador) balaoJogador.classList.add('oculta');
        if (balaoInimigo) balaoInimigo.classList.add('oculta');

        const balaoAtivo = ehJogador ? balaoJogador : balaoInimigo;
        if (balaoAtivo) {
            balaoAtivo.classList.remove('oculta');
            const textoEl = balaoAtivo.querySelector('.texto-balao');
            if (textoEl) textoEl.innerText = fala.texto;
        }
    },

    Avancar: function () {
        this.IndiceAtual++;
        window.GerenciadorAudio.TocarEfeito('Click3');
        this.MostrarFalaAtual();
    },

    Pular: function () {
        window.GerenciadorAudio.TocarEfeito('Click4');
        this.Finalizar();
    },

    Finalizar: function () {
        console.log("[DIALOGO] Fim.");
        if (this.CallbackFim) {
            this.CallbackFim();
        }
    }
};
