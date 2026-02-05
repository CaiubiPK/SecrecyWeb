// ==========================================
// CONFIG.JS - Menu de Configurações
// ==========================================

window.Config = {
    AbrirMenu: function () {
        Utils.Log('Config.AbrirMenu');
        const modal = document.getElementById('modal-config');
        if (modal) modal.classList.remove('oculta');
    },

    FecharMenu: function () {
        Utils.Log('Config.FecharMenu');
        const modal = document.getElementById('modal-config');
        if (modal) modal.classList.add('oculta');
    },

    Desistir: function () {
        Utils.Log('Config.Desistir');
        if (confirm("Guerreiros não desistem, mas se você precisar partir... Tem certeza?")) {
            location.reload();
        }
    },

    ToggleAudio: function () {
        Utils.Log('Config.ToggleAudio');
        EstadoDoJogo.audioHabilitado = !EstadoDoJogo.audioHabilitado;
        const btn = document.getElementById('btn-audio-toggle');
        if (btn) {
            btn.textContent = EstadoDoJogo.audioHabilitado ? "Desabilitar Áudio" : "Habilitar Áudio";
        }
        UI.ExibirMensagem(EstadoDoJogo.audioHabilitado ? "Áudio Ativado" : "Áudio Desativado");
    },

    FecharPrograma: function () {
        Utils.Log('Config.FecharPrograma');
        if (confirm("Deseja realmente fechar o programa?")) {
            window.close();
            // Fallback se window.close() for bloqueado
            location.href = "about:blank";
        }
    },

    AbrirBaralho: function () {
        Utils.Log('Config.AbrirBaralho');
        this.FecharMenu();
        if (window.Deck && window.Deck.AbrirModal) {
            window.Deck.AbrirModal();
        }
    }
};

// Aliases Globais para compatibilidade com HTML onclick
window.AbrirMenuConfig = () => window.Config.AbrirMenu();
window.FecharMenuConfig = () => window.Config.FecharMenu();
window.MenuDesistir = () => window.Config.Desistir();
window.ToggleAudio = () => window.Config.ToggleAudio();
window.FecharPrograma = () => window.Config.FecharPrograma();
window.AbrirBaralhoViaConfig = () => window.Config.AbrirBaralho();
