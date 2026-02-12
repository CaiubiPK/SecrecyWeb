/**
 * GERENCIADOR DE ÁUDIO
 * Controla a reprodução de músicas e efeitos sonoros.
 * Acesso global via: window.GerenciadorAudio
 */

window.GerenciadorAudio = {
    MusicaAtual: null,
    MusicaFading: false,

    /**
     * Toca uma música de fundo em loop, com fade in/out básico
     * @param {string} caminho - Caminho do arquivo de áudio
     */
    TocarMusica: function (caminho) {
        if (!window.EstadoJogo.AudioHabilitado || !caminho) return;

        // Se a mesma música já está tocando, não faz nada
        if (this.MusicaAtual && this.MusicaAtual.src.endsWith(caminho)) {
            if (this.MusicaAtual.paused) this.MusicaAtual.play();
            return;
        }

        // Parar música anterior
        if (this.MusicaAtual) {
            this.MusicaAtual.pause();
            this.MusicaAtual.currentTime = 0;
        }

        this.MusicaAtual = new Audio(caminho);
        this.MusicaAtual.loop = true;
        this.MusicaAtual.volume = 0.5;

        let promessaPlay = this.MusicaAtual.play();
        if (promessaPlay !== undefined) {
            promessaPlay.catch(error => {
                console.warn("⚠️ Autoplay bloqueado pelo navegador. O usuário precisa interagir primeiro.");
            });
        }
    },

    /**
     * Toca um efeito sonoro único (fire and forget)
     * @param {string} chave - Nome do som no BancoDeDados (ex: 'HitEspada')
     */
    TocarEfeito: function (chave) {
        if (!window.EstadoJogo.AudioHabilitado) return;

        // Tenta achar o caminho no banco de dados, em várias categorias
        let caminho = window.BancoDeDados.Audio.Efeitos[chave] ||
            window.BancoDeDados.Audio.Interface[chave];

        if (!caminho) {
            console.warn(`⚠️ Som não encontrado: ${chave}`);
            return;
        }

        const audio = new Audio(caminho);
        audio.volume = 0.6;
        audio.play().catch(() => { });
    },

    PararMusica: function () {
        if (this.MusicaAtual) {
            this.MusicaAtual.pause();
            this.MusicaAtual.currentTime = 0;
            this.MusicaAtual = null;
        }
    },

    AlternarMudo: function () {
        window.EstadoJogo.AudioHabilitado = !window.EstadoJogo.AudioHabilitado;
        if (!window.EstadoJogo.AudioHabilitado) {
            this.PararMusica();
        } else {
            // Reiniciar música da tela atual (necessitaria saber o contexto, mas por enquanto para tudo)
        }
        return window.EstadoJogo.AudioHabilitado;
    }
};
