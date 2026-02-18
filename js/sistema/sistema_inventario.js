/**
 * SISTEMA DE INVENTÁRIO
 * Gerencia a mochila do jogador, uso de itens e manipulação do grid.
 */

window.SistemaInventario = {
    Inicializar: function () {
        // Popula inventário de teste se estiver vazio (apenas para demo)
        const jogador = window.EstadoJogo.Jogadores[0];
        if (!jogador.inventario) {
            jogador.inventario = new Array(12).fill(null);
            // Adiciona itens de teste
            jogador.inventario[0] = JSON.parse(JSON.stringify(window.BancoDeDados.Itens.find(i => i.id === 1))); // Poção Vida
            jogador.inventario[1] = JSON.parse(JSON.stringify(window.BancoDeDados.Itens.find(i => i.id === 2))); // Elixir Mana
            jogador.inventario[2] = JSON.parse(JSON.stringify(window.BancoDeDados.Itens.find(i => i.id === 7))); // Facas
        }
    },

    UsarItem: function (indiceSlot) {
        const jogador = window.EstadoJogo.Jogadores[0];
        const item = jogador.inventario[indiceSlot];

        if (!item) return;

        console.log(`[INVENTARIO] Usando ${item.nome}...`);

        // Regra de Turno (se em combate)
        if (window.EstadoJogo.Turno === 0) { // Turno Jogador
            if (window.EstadoJogo.ItensUsadosNoTurno >= 3) {
                window.GerenciadorInterface.ExibirMensagem("Limite de itens por turno atingido!", "erro");
                return;
            }
        }

        // Lógica de Efeito
        // Se for consumível ofensivo (ex: faca), precisa de mira
        if (item.tipo === 'consumivel-dano') {
            window.GerenciadorInterface.FecharInventario(); // Fecha modal para mirar
            window.SistemaMira.IniciarSelecao({
                nome: item.nome,
                alvoAliado: false,
                efeito: item.efeito
            }, (alvos) => {
                this.AplicarEfeitoItem(item, alvos);
                this.ConsumirItem(indiceSlot);
            });
            return;
        }

        // Consumível Benéfico (Auto-aplicável no jogador principal por padrão nesta versão simplificada, ou abre mira aliado)
        // Por simplicidade: Auto-aplica no jogador 0
        this.AplicarEfeitoItem(item, [{ tipo: 'aliado', indice: 0 }]);
        this.ConsumirItem(indiceSlot);
    },

    AplicarEfeitoItem: function (item, alvos) {
        const jogador = window.EstadoJogo.Jogadores[0];

        alvos.forEach(alvoDef => {
            const alvo = alvoDef.tipo === 'aliado'
                ? window.EstadoJogo.Jogadores[alvoDef.indice]
                : window.EstadoJogo.Inimigos[alvoDef.indice];

            if (item.efeito.atributo === 'vida') {
                const cura = item.efeito.valor;
                alvo.vida = Math.min(alvo.vida + cura, alvo.vidaMaxima);
                window.GerenciadorInterface.AdicionarAoLog(
                    `${jogador.nome} usou ${item.nome}, recuperando ${cura} de vida`,
                    'item'
                );
                window.GerenciadorInterface.MostrarIndicadorFlutuante('jogador-1', cura, 'cura');
            }
            else if (item.efeito.especial === 'FacasArremesso') {
                const dano = 20 + window.Uteis.GerarNumeroAleatorio(1, 10);
                alvo.vida = Math.max(0, alvo.vida - dano);
                window.GerenciadorInterface.AdicionarAoLog(
                    `${jogador.nome} usou ${item.nome}, causando ${dano} de dano em ${alvo.nome}`,
                    'item'
                );
                window.GerenciadorInterface.MostrarIndicadorFlutuante('inimigo-1', dano, 'dano');
            }
        });

        window.GerenciadorInterface.AtualizarHUDCompleto();
    },

    ConsumirItem: function (indiceSlot) {
        const jogador = window.EstadoJogo.Jogadores[0];
        jogador.inventario[indiceSlot] = null;

        // Incrementa uso no turno
        if (window.EstadoJogo.Turno === 0) {
            window.EstadoJogo.ItensUsadosNoTurno++;
        }

        window.GerenciadorInterface.RenderizarInventario(); // Re-renderiza se modal aberto
    }
};
