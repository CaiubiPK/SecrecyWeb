
// ==========================================
// UTILS.JS - Funções Utilitárias e Debug
// ==========================================

window.Utils = {
    // Logger colorido para debug
    Log: function (nomeFuncao, detalhes = "") {
        console.log(`%c▶ Executando: ${nomeFuncao} ${detalhes}`, 'color: #4CAF50; font-weight: bold; font-size: 12px;');
    },

    // Gera número aleatório entre min e max (inclusivos)
    Random: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Função de delay (Promessa)
    Wait: function (ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // Toca um som de forma segura
    PlaySound: function (path, volume = 1.0) {
        if (!path || (window.EstadoDoJogo && !window.EstadoDoJogo.audioHabilitado)) return;

        try {
            const audio = new Audio(path);
            audio.volume = volume;
            audio.play().catch(e => {
                // Silenciar erros de interação do navegador se necessário
                if (e.name !== "NotAllowedError") {
                    console.warn("Erro ao tocar som:", path, e);
                }
            });
            return audio;
        } catch (e) {
            console.warn("Erro no áudio:", e);
        }
    },

    // Atalho para sons de clique de interface
    PlayClick: function (tipo = null) {
        if (!window.AudioConfig) return;

        const clicks = [
            AudioConfig.Interface.Click1,
            AudioConfig.Interface.Click2,
            AudioConfig.Interface.Click3,
            AudioConfig.Interface.Click4
        ];

        let chosen = tipo;
        if (!chosen) {
            chosen = clicks[this.Random(0, clicks.length - 1)];
        }

        return this.PlaySound(chosen, 0.4);
    }
};

// Atalho global para compatibilidade
window.LogDebug = window.Utils.Log;
