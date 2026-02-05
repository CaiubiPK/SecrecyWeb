
// ==========================================
// MAIN.JS - Inicialização e Eventos
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    Utils.Log("Main", "Inicializando...");

    // 1. Inicializar Sistemas
    UI.Init();

    // 2. Event Listeners Globais

    // Tela Inicial
    document.getElementById('botao-iniciar')?.addEventListener('click', () => {
        Navigation.IniciarJogo();
    });

    // Tela Nome
    document.getElementById('botao-confirmar-nome')?.addEventListener('click', () => {
        const nome = document.getElementById('input-nome').value;
        Navigation.ConfirmarNome(nome);
    });

    // Tela Campanha
    document.getElementById('campanha-castelo')?.addEventListener('click', () => {
        // Inicializa Baralho antes da primeira fase
        InicializarBaralhoPadrao();
        Navigation.SelecionarFase(1);
    });

    // Botões de Ação (Combate)
    document.querySelectorAll('.botao-acao').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const acao = e.target.dataset.acao;
            if (acao === 'atacar') AbrirMenuAtaque();
            if (acao === 'passar-turno') Combate.PassarTurno();
        });
    });

    // Inicialização final
    // Inicialização final (Sem audio automático)
});

// Helper de Baralho (Poderia estar em State.js)
function InicializarBaralhoPadrao() {
    EstadoDoJogo.baralhoPersonalizado = [];
    const db = BancoDeDados.CartasColecao;
    // Exemplo: 5 Ataques Básicos
    for (let i = 0; i < 5; i++) EstadoDoJogo.baralhoPersonalizado.push(db.find(c => c.nome === "Ataque Básico"));
    // Exemplo: 2 Defesas
    for (let i = 0; i < 2; i++) EstadoDoJogo.baralhoPersonalizado.push(db.find(c => c.nome === "Defesa Sólida"));
}

function AbrirMenuAtaque() {
    const container = document.getElementById('container-cartas');
    if (!container) return;

    container.innerHTML = '';
    container.classList.remove('oculta');

    EstadoDoJogo.baralhoPersonalizado.forEach(carta => {
        if (!carta) return;
        const el = document.createElement('div');
        el.className = 'carta-combate'; // Necessário CSS
        el.textContent = carta.nome;
        el.onclick = () => {
            Combate.RealizarAtaqueJogador(carta);
            container.classList.add('oculta');
        };
        container.appendChild(el);
    });

    // Botão Voltar
    const btnVoltar = document.createElement('button');
    btnVoltar.textContent = "Voltar";
    btnVoltar.className = "botao-acao";
    btnVoltar.onclick = () => container.classList.add('oculta');
    container.appendChild(btnVoltar);
}
