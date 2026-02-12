/**
 * UTILITÁRIOS GERAIS
 * Funções auxiliares para matemática, logs e manipulação básica.
 */

window.Uteis = {
    /**
     * Gera um número aleatório entre min e max (inclusivo)
     */
    GerarNumeroAleatorio: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Registra logs no console com timestamp (apenas se DEBUG estiver ativo - opcional)
     */
    Log: function (mensagem, dados = null) {
        const hora = new Date().toLocaleTimeString();
        if (dados) {
            console.log(`[${hora}] ℹ️ ${mensagem}`, dados);
        } else {
            console.log(`[${hora}] ℹ️ ${mensagem}`);
        }
    },

    /**
     * Toca um som se o áudio estiver habilitado
     */
    TocarSom: function (caminho, volume = 1.0) {
        if (window.EstadoJogo && !window.EstadoJogo.AudioHabilitado) return;

        try {
            const audio = new Audio(caminho);
            audio.volume = volume;
            audio.play().catch(e => console.warn("Áudio bloqueado pelo navegador:", e));
        } catch (erro) {
            console.error("Erro ao tocar som:", erro);
        }
    },

    /**
     * Verifica chance percentual (0 a 100)
     */
    VerificarChance: function (porcentagem) {
        return Math.random() * 100 < porcentagem;
    },

    /**
     * Clona um objeto profundamente para evitar referências
     */
    ClonarObjeto: function (obj) {
        return JSON.parse(JSON.stringify(obj));
    }
};
