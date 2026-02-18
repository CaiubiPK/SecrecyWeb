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

        // Se não achou na raiz, tenta achar no Banco de Dados em Efeitos ou Interface
        let recurso = window.BancoDeDados.Audio.Efeitos[chave] ||
            window.BancoDeDados.Audio.Interface[chave];

        if (!recurso) {
            // Tenta procurar nas novas categorias (Impactos/Vozes) se for string composta 'Categoria.Subcategoria'
            const partes = chave.split('.');
            if (partes.length === 2 && window.BancoDeDados.Audio[partes[0]]) {
                recurso = window.BancoDeDados.Audio[partes[0]][partes[1]];
            } else if (partes.length === 3 && window.BancoDeDados.Audio[partes[0]][partes[1]]) {
                recurso = window.BancoDeDados.Audio[partes[0]][partes[1]][partes[2]];
            }
        }

        // Se ainda não achou, tenta usar a string como caminho direto
        if (!recurso && (chave.includes('/') || chave.includes('.'))) {
            recurso = chave;
        }

        if (!recurso) {
            console.warn(`⚠️ Som não encontrado: ${chave}`);
            return;
        }

        // Resolve variações (Array) escolhendo uma aleatória
        let caminhoFinal = recurso;
        if (Array.isArray(recurso)) {
            caminhoFinal = recurso[Math.floor(Math.random() * recurso.length)];
        }

        const audio = new Audio(caminhoFinal);
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
