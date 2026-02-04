// Banco de Dados do Jogo
// Aqui ficam armazenadas todas as informações de Inimigos, Itens e Habilidades

const BancoDeDados = {
    JogadorBase: {
        nome: "Protagonista",
        classe: "Guerreiro",
        vida: 160, vidaMaxima: 160,
        energia: 200, energiaMaxima: 200,
        mana: 30, manaMaxima: 30,
        ataque: 45,
        ataqueMagico: 10,
        ataqueEsmagador: 5,
        armadura: 30,
        protecaoMagica: 5,
        esquiva: 10,
        determinacao: 200, determinacaoMaxima: 200,
        chanceCritico: 5,
        danoCritico: 175,
        rouboVida: 10,
        sorte: 5,
        precisao: 100,
        penetracaoArmadura: 0,
        penetracaoMagica: 0,
        regeneracaoEnergia: 10,
        regeneracaoVida: 5,
        regeneracaoMana: 2,
        vigor: 40,
        nivel: 1,
        xp: 0,
        xpParaProximoNivel: 100,
        pontosHabilidade: 0,
        imagem: "Images/Personagens/Protagonista.png"
    },
    Inimigos: [
        {
            id: 1,
            nome: "Durotan",
            vida: 150, vidaMaxima: 150,
            energia: 80, energiaMaxima: 80,
            mana: 20, manaMaxima: 20,
            ataque: 20,
            ataqueMagico: 5,
            ataqueEsmagador: 15,
            armadura: 12,
            protecaoMagica: 8,
            esquiva: 5,
            determinacao: 15,
            chanceCritico: 10,
            danoCritico: 150,
            rouboVida: 0,
            sorte: 5,
            precisao: 90,
            penetracaoArmadura: 5,
            penetracaoMagica: 0,
            vigor: 15,
            regeneracaoEnergia: 8,
            regeneracaoVida: 2,
            regeneracaoMana: 1,
            imagem: "Images/Personagens/Durotan.png",
            recompensas: { xp: 50, ouro: 20 },
            energia: 200, energiaMaxima: 200,
            determinacao: 200, determinacaoMaxima: 200
        },
        {
            id: 2,
            nome: "Igvuld",
            vida: 120, vidaMaxima: 120,
            energia: 200, energiaMaxima: 200,
            mana: 100, manaMaxima: 100,
            ataque: 10,
            ataqueMagico: 25,
            ataqueEsmagador: 5,
            armadura: 5,
            protecaoMagica: 20,
            esquiva: 12,
            determinacao: 200, determinacaoMaxima: 200,
            chanceCritico: 15,
            danoCritico: 180,
            rouboVida: 5,
            sorte: 10,
            precisao: 95,
            penetracaoArmadura: 0,
            penetracaoMagica: 15,
            vigor: 8,
            regeneracaoEnergia: 5,
            regeneracaoVida: 1,
            regeneracaoMana: 10,
            imagem: "Images/Personagens/Igvuld.png",
            recompensas: { xp: 45, ouro: 25 }
        },
        {
            id: 3,
            nome: "Zirgur",
            vida: 100, vidaMaxima: 100,
            energia: 200, energiaMaxima: 200,
            mana: 40, manaMaxima: 40,
            ataque: 25,
            ataqueMagico: 10,
            ataqueEsmagador: 20,
            armadura: 2,
            protecaoMagica: 5,
            esquiva: 20,
            determinacao: 200, determinacaoMaxima: 200,
            chanceCritico: 25,
            danoCritico: 200,
            rouboVida: 10,
            sorte: 15,
            precisao: 85,
            penetracaoArmadura: 10,
            penetracaoMagica: 5,
            vigor: 12,
            regeneracaoEnergia: 15,
            regeneracaoVida: 5,
            regeneracaoMana: 2,
            imagem: "Images/Personagens/Zirgur.png",
            recompensas: { xp: 40, ouro: 15 }
        },
        {
            id: 4,
            nome: "Gromn",
            vida: 200, vidaMaxima: 200,
            energia: 200, energiaMaxima: 200,
            mana: 10, manaMaxima: 10,
            ataque: 35,
            ataqueMagico: 0,
            ataqueEsmagador: 30,
            armadura: 25,
            protecaoMagica: 10,
            esquiva: 0,
            determinacao: 200, determinacaoMaxima: 200,
            chanceCritico: 5,
            danoCritico: 140,
            rouboVida: 0,
            sorte: 2,
            precisao: 80,
            penetracaoArmadura: 15,
            penetracaoMagica: 0,
            vigor: 25,
            regeneracaoEnergia: 3,
            regeneracaoVida: 10,
            regeneracaoMana: 0,
            imagem: "Images/Personagens/Gromn.png",
            recompensas: { xp: 60, ouro: 30 }
        }
    ],

    // Mapeamento de Fases para Cenários de Batalha
    Cenarios: {
        1: "Images/Cenarios/CampoDeBatalha.png", // Muralhas
        2: "Images/Cenarios/PonteDoCastelo.png", // Ponte
        3: "Images/Cenarios/CampoDeBatalha.png", // Entrada (Reutilizando ou novo)
        4: "Images/Cenarios/PonteDoCastelo.png"  // Salão (Reutilizando ou novo)
    },

    Itens: [
        {
            id: 1,
            nome: "Poção de Vida Menor",
            tipo: "consumivel",
            descricao: "Recupera 30 pontos de vida.",
            efeito: { atributo: "vida", valor: 30 },
            preco: 10
        },
        {
            id: 2,
            nome: "Elixir de Mana",
            tipo: "consumivel",
            descricao: "Recupera 20 pontos de mana.",
            efeito: { atributo: "mana", valor: 20 },
            preco: 15
        },
        {
            id: 3,
            nome: "Espada Enferrujada",
            tipo: "arma",
            descricao: "Uma espada velha, mas ainda corta.",
            ataque: 5,
            preco: 50
        }
    ],

    Habilidades: [
        {
            id: 1,
            nome: "Golpe Pesado",
            custoEnergia: 20,
            dano: 25,
            descricao: "Um ataque forte que gasta energia."
        },
        {
            id: 2,
            nome: "Bola de Fogo",
            custoMana: 15,
            dano: 30,
            descricao: "Lança uma bola de fogo no inimigo."
        }
    ],

    CartasColecao: [
        { id: 1, nome: "Ataque Básico", tipo: "Bronze", custoEnergia: 5, efeito: { danoMultiplicador: 1.1 }, raridade: "Comum", imagem: "Images/Cartas/AtaqueBasico.png", som: "Audio/Sons/HitEspada.mp3" },
        { id: 2, nome: "Defesa Sólida", tipo: "Bronze", custoEnergia: 8, efeito: { armaduraBonus: 5 }, raridade: "Comum", imagem: "Images/Cartas/AtaquePreciso.png" },
        { id: 3, nome: "Foco Arcano", tipo: "Bronze", custoMana: 5, efeito: { manaRegen: 5 }, raridade: "Comum", imagem: "Images/Cartas/AtaqueBasico.png" },
        { id: 4, nome: "Sopro de Vida", tipo: "Bronze", custoMana: 10, efeito: { cura: 15 }, raridade: "Incomum", imagem: "Images/Cartas/AtaquePreciso.png" },
        { id: 5, nome: "Ataque Preciso", tipo: "Prata", custoEnergia: 15, efeito: { danoMultiplicador: 1.8 }, raridade: "Raro", imagem: "Images/Cartas/AtaquePesado.png", som: "Audio/Sons/ComboForte.mp3" },
        { id: 6, nome: "Escudo Espelhado", tipo: "Prata", custoMana: 12, efeito: { protecaoMagicaBonus: 10 }, raridade: "Raro", imagem: "Images/Cartas/AtaqueCerteiro.png" },
        { id: 7, nome: "Lâmina de Sangue", tipo: "Prata", custoEnergia: 20, efeito: { danoMultiplicador: 1.5, rouboVida: 10 }, raridade: "Raro", imagem: "Images/Cartas/AtaquePesado.png" },
        { id: 8, nome: "Agilidade Felina", tipo: "Prata", custoEnergia: 10, efeito: { esquivaBonus: 15 }, raridade: "Incomum", imagem: "Images/Cartas/AtaquePreciso.png" },
        { id: 9, nome: "Fúria do Dragão", tipo: "Ouro", custoEnergia: 30, efeito: { danoMultiplicador: 2.5, penetracaoArmadura: 20 }, raridade: "Épico", imagem: "Images/Cartas/AtaquePesado.png" },
        { id: 10, nome: "Benção de Gaia", tipo: "Ouro", custoMana: 25, efeito: { curaTotal: 50, determinacaoBonus: 10 }, raridade: "Épico", imagem: "Images/Cartas/AtaqueCerteiro.png" },
        { id: 11, nome: "Tempestade Estática", tipo: "Ouro", custoMana: 35, efeito: { danoMagico: 40 }, raridade: "Épico", imagem: "Images/Cartas/AtaqueCerteiro.png" },
        { id: 12, nome: "Olho do Destino", tipo: "Ouro", custoEnergia: 15, efeito: { chanceCriticoBonus: 30 }, raridade: "Raro", imagem: "Images/Cartas/AtaquePreciso.png" },
        { id: 13, nome: "Eclipse Eterno", tipo: "Negra", custoEnergia: 50, efeito: { danoMultiplicador: 4.0, custoVida: 20 }, raridade: "Lendário", imagem: "Images/Cartas/AtaquePesado.png" },
        { id: 14, nome: "Vazio Abissal", tipo: "Negra", custoMana: 60, efeito: { manaDrain: 30, danoMagico: 50 }, raridade: "Lendário", imagem: "Images/Cartas/AtaqueCerteiro.png" },
        { id: 15, nome: "Sacrifício Supremo", tipo: "Negra", custoEnergia: 0, efeito: { determinacaoBonus: 50, custoVida: 40 }, raridade: "Lendário", imagem: "Images/Cartas/AtaquePreciso.png" },
        { id: 16, nome: "Corte Dimensional", tipo: "Negra", custoEnergia: 40, efeito: { danoVerdadeiro: 60 }, raridade: "Lendário", imagem: "Images/Cartas/AtaquePesado.png" }
    ],

    TalentosColecao: [
        { id: 1, nome: "Força Guerreira", descricao: "+5 de Ataque Físico", efeito: { ataque: 5 }, imagem: "Images/Talentos/AtkFisico.png" },
        { id: 2, nome: "Sabedoria Arcana", descricao: "+5 de Ataque Mágico", efeito: { ataqueMagico: 5 }, imagem: "Images/Talentos/AtkMagico.png" },
        { id: 3, nome: "Resiliência", descricao: "+5 de Armadura", efeito: { armadura: 5 }, imagem: "Images/Talentos/Defesa.png" },
        { id: 4, nome: "Mente Protegida", descricao: "+5 de Proteção Mágica", efeito: { protecaoMagica: 5 }, imagem: "Images/Talentos/ProtMagica.png" },
        { id: 5, nome: "Vitalidade", descricao: "+20 de Vida Máxima", efeito: { vidaMaxima: 20 }, imagem: "Images/Talentos/Vida.png" },
        { id: 6, nome: "Vigor renovado", descricao: "+10 de Energia Máxima", efeito: { energiaMaxima: 10 }, imagem: "Images/Talentos/Energia.png" },
        { id: 7, nome: "Fluxo Espiritual", descricao: "+10 de Mana Máxima", efeito: { manaMaxima: 10 }, imagem: "Images/Talentos/Mana.png" },
        { id: 8, nome: "Reflexos Rápidos", descricao: "+5 de Esquiva", efeito: { esquiva: 5 }, imagem: "Images/Talentos/Esquiva.png" },
        { id: 9, nome: "Precisão Mortal", descricao: "+5% de Chance Crítica", efeito: { chanceCritico: 5 }, imagem: "Images/Talentos/Critico.png" },
        { id: 10, nome: "Golpe Devastador", descricao: "+25% de Dano Crítico", efeito: { danoCritico: 25 }, imagem: "Images/Talentos/DanoCritico.png" },
        { id: 11, nome: "Poder do Vigor", descricao: "+10 de Vigor", efeito: { vigor: 10 }, imagem: "Images/Talentos/Vigor.png" }
    ]
};
