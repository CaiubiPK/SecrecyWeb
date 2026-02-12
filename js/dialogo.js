// ==========================================
// DIALOGO.JS - Sistema de Diálogos Pré-Combate
// ==========================================

window.Dialogo = {
    indiceAtual: 0,
    dialogoAtual: [],
    callback: null,

    Iniciar: function (faseId, imagemInimigo, onComplete) {
        Utils.Log(`Dialogo.Iniciar -> Fase ${faseId}`);

        const campanha = Object.values(BancoDeDados.Campanhas)[0];
        const dadosNivel = campanha.niveis[faseId];

        this.dialogoAtual = (dadosNivel && dadosNivel.dialogos) ? dadosNivel.dialogos : [
            { orador: 'inimigo', texto: "Prepare-se para lutar!" },
            { orador: 'jogador', texto: "Vamos lá!" }
        ];

        this.indiceAtual = 0;
        this.callback = onComplete;

        // Configurar avatares
        const avatarJogador = document.getElementById('avatar-jogador-dialogo');
        const avatarInimigo = document.getElementById('avatar-inimigo-dialogo');

        if (avatarJogador) {
            avatarJogador.style.backgroundImage = `url('Images/Personagens/Jogador.png')`;
        }

        if (avatarInimigo && imagemInimigo) {
            avatarInimigo.style.backgroundImage = `url('${imagemInimigo}')`;
        }

        // Mostrar tela de diálogo
        UI.TrocarTela('tela-dialogo-combate');

        // Ocultar balões inicialmente
        document.getElementById('balao-jogador')?.classList.add('oculta');
        document.getElementById('balao-inimigo')?.classList.add('oculta');

        // Setup event listeners
        document.getElementById('btn-proximo-dialogo').onclick = () => this.Avancar();
        document.getElementById('btn-pular-dialogo').onclick = () => this.Pular();

        // Mostrar primeira fala após delay
        setTimeout(() => this.MostrarFalaAtual(), 500);
    },

    MostrarFalaAtual: function () {
        if (this.indiceAtual >= this.dialogoAtual.length) {
            this.Finalizar();
            return;
        }

        const fala = this.dialogoAtual[this.indiceAtual];
        const ehJogador = fala.orador === 'jogador';

        const balaoAtivo = document.getElementById(ehJogador ? 'balao-jogador' : 'balao-inimigo');
        const balaoInativo = document.getElementById(ehJogador ? 'balao-inimigo' : 'balao-jogador');

        const containerAtivo = document.getElementById(ehJogador ? 'personagem-jogador-dialogo' : 'personagem-inimigo-dialogo');
        const containerInativo = document.getElementById(ehJogador ? 'personagem-inimigo-dialogo' : 'personagem-jogador-dialogo');

        // Atualizar texto
        const textoEl = balaoAtivo?.querySelector('.texto-balao');
        if (textoEl) textoEl.textContent = fala.texto;

        // Trocar visibilidade
        balaoInativo?.classList.add('oculta');
        containerInativo?.classList.remove('falando');
        containerInativo?.classList.add('silencio');

        balaoAtivo?.classList.remove('oculta');
        containerAtivo?.classList.add('falando');
        containerAtivo?.classList.remove('silencio');
    },

    Avancar: function () {
        this.indiceAtual++;
        this.MostrarFalaAtual();
    },

    Pular: function () {
        Utils.Log('Dialogo.Pular');
        this.Finalizar();
    },

    Finalizar: function () {
        Utils.Log('Dialogo.Finalizar');
        if (this.callback) {
            this.callback();
        }
    }
};

// Alias Global
window.IniciarDialogo = (faseId, img, cb) => window.Dialogo.Iniciar(faseId, img, cb);
