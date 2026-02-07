// Banco de Dados do Jogo
// Aqui ficam armazenadas todas as informações de Inimigos, Itens e Habilidades

window.BancoDeDados = {
    JogadorBase: {
        nome: "Protagonista",
        ehPrincipal: true, // Personagem Principal
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
        imagem: "Images/Personagens/Jogador.png"
    },
    Unidades: {
        Humanos: {
            Guerreiro: [
                { id: "h_g_1", nome: "Guerreiro Humano Nvl 1", nivel: 1, vida: 75, vidaMaxima: 75, ataque: 12, energia: 80, energiaMaxima: 80, armadura: 10, vigor: 10, esquiva: 4, precisao: 90, chanceCritico: 5, danoCritico: 175, penetracaoArmadura: 0, regeneracaoVida: 1, imagem: "Images/Personagens/HumanoGuerreiroNvl1.png", mana: 0, manaMaxima: 0, ataqueMagico: 0, protecaoMagica: 0, rouboVida: 0, sorte: 0, penetracaoMagica: 0, determinacao: 100, determinacaoMaxima: 100 },
                { id: "h_g_2", nome: "Guerreiro Humano Nvl 2", nivel: 2, vida: 115, vidaMaxima: 115, ataque: 15, energia: 100, energiaMaxima: 100, armadura: 25, vigor: 20, esquiva: 5, precisao: 95, chanceCritico: 8, danoCritico: 175, penetracaoArmadura: 0, regeneracaoVida: 2, imagem: "Images/Personagens/HumanoGuerreiroNvl2.png", mana: 0, manaMaxima: 0, ataqueMagico: 0, protecaoMagica: 0, rouboVida: 0, sorte: 0, penetracaoMagica: 0, determinacao: 100, determinacaoMaxima: 100 },
                { id: "h_g_3", nome: "Guerreiro Humano Nvl 3", nivel: 3, vida: 140, vidaMaxima: 140, ataque: 17, energia: 120, energiaMaxima: 120, armadura: 50, vigor: 40, esquiva: 7, precisao: 99, chanceCritico: 12, danoCritico: 175, penetracaoArmadura: 5, regeneracaoVida: 3, imagem: "Images/Personagens/HumanoGuerreiroNvl3.png", mana: 0, manaMaxima: 0, ataqueMagico: 0, protecaoMagica: 0, rouboVida: 0, sorte: 0, penetracaoMagica: 0, determinacao: 100, determinacaoMaxima: 100 }
            ],
            Arqueiro: [
                { id: "h_a_1", nome: "Arqueiro Humano Nvl 1", nivel: 1, vida: 60, vidaMaxima: 60, ataque: 18, energia: 80, energiaMaxima: 80, armadura: 0, vigor: 10, esquiva: 4, precisao: 100, chanceCritico: 10, danoCritico: 185, penetracaoArmadura: 5, regeneracaoVida: 1, imagem: "Images/Personagens/ArqueiroHumanoNvl1.png", mana: 0, manaMaxima: 0, ataqueMagico: 0, protecaoMagica: 0, rouboVida: 0, sorte: 0, penetracaoMagica: 0, determinacao: 100, determinacaoMaxima: 100 },
                { id: "h_a_2", nome: "Arqueiro Humano Nvl 2", nivel: 2, vida: 80, vidaMaxima: 80, ataque: 23, energia: 100, energiaMaxima: 100, armadura: 15, vigor: 20, esquiva: 5, precisao: 110, chanceCritico: 15, danoCritico: 195, penetracaoArmadura: 10, regeneracaoVida: 2, imagem: "Images/Personagens/ArqueiroHumanoNvl2.png", mana: 0, manaMaxima: 0, ataqueMagico: 0, protecaoMagica: 0, rouboVida: 0, sorte: 0, penetracaoMagica: 0, determinacao: 100, determinacaoMaxima: 100 },
                { id: "h_a_3", nome: "Arqueiro Humano Nvl 3", nivel: 3, vida: 100, vidaMaxima: 100, ataque: 27, energia: 120, energiaMaxima: 120, armadura: 30, vigor: 40, esquiva: 7, precisao: 120, chanceCritico: 20, danoCritico: 205, penetracaoArmadura: 15, regeneracaoVida: 3, imagem: "Images/Personagens/ArqueiroHumanoNvl3.png", mana: 0, manaMaxima: 0, ataqueMagico: 0, protecaoMagica: 0, rouboVida: 0, sorte: 0, penetracaoMagica: 0, determinacao: 100, determinacaoMaxima: 100 }
            ]
        },
        Orcs: {
            Guerreiro: [
                { id: "o_g_1", nome: "Guerreiro Orc Nvl 1", nivel: 1, vida: 75, vidaMaxima: 75, ataque: 12, energia: 80, energiaMaxima: 80, armadura: 10, vigor: 10, esquiva: 4, precisao: 90, chanceCritico: 5, danoCritico: 175, penetracaoArmadura: 0, regeneracaoVida: 1, imagem: "Images/Personagens/OrcGuerreiroNvl1.png", mana: 0, manaMaxima: 0, ataqueMagico: 0, protecaoMagica: 0, rouboVida: 0, sorte: 0, penetracaoMagica: 0, determinacao: 100, determinacaoMaxima: 100 },
                { id: "o_g_2", nome: "Guerreiro Orc Nvl 2", nivel: 2, vida: 115, vidaMaxima: 115, ataque: 15, energia: 100, energiaMaxima: 100, armadura: 25, vigor: 20, esquiva: 5, precisao: 95, chanceCritico: 8, danoCritico: 175, penetracaoArmadura: 0, regeneracaoVida: 2, imagem: "Images/Personagens/OrcGuerreiroNvl2.png", mana: 0, manaMaxima: 0, ataqueMagico: 0, protecaoMagica: 0, rouboVida: 0, sorte: 0, penetracaoMagica: 0, determinacao: 100, determinacaoMaxima: 100 },
                { id: "o_g_3", nome: "Guerreiro Orc Nvl 3", nivel: 3, vida: 140, vidaMaxima: 140, ataque: 17, energia: 120, energiaMaxima: 120, armadura: 50, vigor: 40, esquiva: 7, precisao: 99, chanceCritico: 12, danoCritico: 175, penetracaoArmadura: 5, regeneracaoVida: 3, imagem: "Images/Personagens/OrcGuerreiroNvl3.png", mana: 0, manaMaxima: 0, ataqueMagico: 0, protecaoMagica: 0, rouboVida: 0, sorte: 0, penetracaoMagica: 0, determinacao: 100, determinacaoMaxima: 100 }
            ],
            Arqueiro: [
                { id: "o_a_1", nome: "Arqueiro Orc Nvl 1", nivel: 1, vida: 60, vidaMaxima: 60, ataque: 18, energia: 80, energiaMaxima: 80, armadura: 0, vigor: 10, esquiva: 4, precisao: 100, chanceCritico: 10, danoCritico: 185, penetracaoArmadura: 5, regeneracaoVida: 1, imagem: "Images/Personagens/OrcArqueiroNvl1.png", mana: 0, manaMaxima: 0, ataqueMagico: 0, protecaoMagica: 0, rouboVida: 0, sorte: 0, penetracaoMagica: 0, determinacao: 100, determinacaoMaxima: 100 },
                { id: "o_a_2", nome: "Arqueiro Orc Nvl 2", nivel: 2, vida: 80, vidaMaxima: 80, ataque: 23, energia: 100, energiaMaxima: 100, armadura: 15, vigor: 20, esquiva: 5, precisao: 110, chanceCritico: 15, danoCritico: 195, penetracaoArmadura: 10, regeneracaoVida: 2, imagem: "Images/Personagens/OrcArqueiroNvl2.png", mana: 0, manaMaxima: 0, ataqueMagico: 0, protecaoMagica: 0, rouboVida: 0, sorte: 0, penetracaoMagica: 0, determinacao: 100, determinacaoMaxima: 100 },
                { id: "o_a_3", nome: "Arqueiro Orc Nvl 3", nivel: 3, vida: 100, vidaMaxima: 100, ataque: 27, energia: 120, energiaMaxima: 120, armadura: 30, vigor: 40, esquiva: 7, precisao: 120, chanceCritico: 20, danoCritico: 205, penetracaoArmadura: 15, regeneracaoVida: 3, imagem: "Images/Personagens/OrcArqueiroNvl3.png", mana: 0, manaMaxima: 0, ataqueMagico: 0, protecaoMagica: 0, rouboVida: 0, sorte: 0, penetracaoMagica: 0, determinacao: 100, determinacaoMaxima: 100 }
            ]
        }
    },
    Inimigos: [
        {
            id: 1,
            nome: "Durotan",
            ehPrincipal: true,
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
            ehPrincipal: true,
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
            ehPrincipal: true,
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
            ehPrincipal: true,
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
        },
        {
            id: 5,
            nome: "Cavaleiro Esquecido",
            ehPrincipal: true,
            vida: 110, vidaMaxima: 110,
            energia: 150, energiaMaxima: 150,
            mana: 50, manaMaxima: 50,
            ataque: 22,
            ataqueMagico: 15,
            ataqueEsmagador: 10,
            armadura: 40,
            protecaoMagica: 30,
            esquiva: 15,
            determinacao: 150, determinacaoMaxima: 150,
            chanceCritico: 10,
            danoCritico: 160,
            rouboVida: 5,
            sorte: 8,
            precisao: 90,
            penetracaoArmadura: 5,
            penetracaoMagica: 10,
            vigor: 15,
            regeneracaoEnergia: 8,
            regeneracaoVida: 4,
            regeneracaoMana: 3,
            imagem: "Images/Personagens/ForgottenKnight.png",
            recompensas: { xp: 55, ouro: 25 }
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
        {
            id: 1,
            nome: "Ataque Básico",
            tipo: "Bronze",
            custoEnergia: 5,
            efeito: { danoMultiplicador: 1.1 },
            raridade: "Comum",
            imagem: "Images/Cartas/AtaqueBasico.png",
            som: "Audio/Sons/HitEspada.mp3"
        },
        {
            id: 2,
            nome: "Defesa Sólida",
            tipo: "Bronze",
            custoEnergia: 8,
            efeito: { armaduraBonus: 5 },
            raridade: "Comum",
            imagem: "Images/Cartas/AtaquePreciso.png",
            alvoAliado: true  // Buff em aliado
        },
        {
            id: 3,
            nome: "Fogo Arcano",
            tipo: "Bronze",
            custoMana: 5,
            efeito: { danoMultiplicador: 1.2 },
            raridade: "Comum",
            imagem: "Images/Cartas/AtaqueBasico.png"
        },
        {
            id: 4,
            nome: "Sopro de Vida",
            tipo: "Bronze",
            custoMana: 10,
            efeito: { cura: 15 },
            raridade: "Incomum",
            imagem: "Images/Cartas/AtaquePreciso.png",
            alvoAliado: true  // Cura aliado
        },
        {
            id: 5,
            nome: "Ataque Preciso",
            tipo: "Prata",
            custoEnergia: 15,
            efeito: { danoMultiplicador: 1.8 },
            raridade: "Raro",
            imagem: "Images/Cartas/AtaquePesado.png",
            som: "Audio/Sons/ComboForte.mp3"
        },
    ],
    Efeitos: {
        Envenenamento: {
            nome: "Envenenamento",
            niveis: {
                1: { danoFixo: 5, danoPct: 0.05, redVigorPct: 0.60, redAtaquePct: 0.10, icone: "☠️" },
                2: { danoFixo: 10, danoPct: 0.05, redVigorPct: 0.70, redAtaquePct: 0.15, icone: "☠️" },
                3: { danoFixo: 15, danoPct: 0.05, redVigorPct: 0.80, redAtaquePct: 0.20, icone: "☠️" }
            }
        },
        Atordoamento: {
            nome: "Atordoamento",
            tipo: "Controle",
            niveis: {
                1: { perdeTurno: true, icone: "💫" }
            }
        },
        Concussao: {
            nome: "Concussão",
            niveis: {
                1: { redPrecisao: 25, icone: "😵" }
            }
        },
        Regeneracao: {
            nome: "Regeneração",
            tipo: "Buff",
            niveis: {
                1: { curaPct: 0.10, icone: "🌿" },
                2: { curaPct: 0.20, icone: "🌿" },
                3: { curaPct: 0.30, icone: "🌿" }
            }
        },
        Sangramento: {
            nome: "Sangramento",
            niveis: {
                1: { danoFixo: 5, danoPct: 0.075, redVigorPct: 0.25, icone: "🩸" },
                2: { danoFixo: 10, danoPct: 0.075, redVigorPct: 0.30, icone: "🩸" },
                3: { danoFixo: 15, danoPct: 0.075, redVigorPct: 0.40, icone: "🩸" }
            }
        },
        Combustao: {
            nome: "Combustão",
            niveis: {
                1: { danoFixo: 10, danoPct: 0.10, redVigorPct: 0.30, icone: "🔥" },
                2: { danoFixo: 15, danoPct: 0.10, redVigorPct: 0.40, icone: "🔥" },
                3: { danoFixo: 25, danoPct: 0.10, redVigorPct: 0.50, icone: "🔥" }
            }
        }
    },
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
    ],

    Historias: {
        1: { titulo: "Capítulo I", subtitulo: "A jornada", texto: "Você inicia sua jornada com um único objetivo: conquistar o reino do orc Gromn, o conquistador. O caminho é longo e perigoso, mas sua determinação é inabalável." },
        2: { titulo: "Capítulo II", subtitulo: "Luta contra Igvuld", texto: "Na fronteira da terra dos Orcs, a névoa se dissipa para revelar uma figura imponente. Igvuld bloqueia o caminho, e o aço será a única linguagem que ele entende." },
        3: { titulo: "Capítulo III", subtitulo: "Encontro aleatório", texto: "Emboscadas surgem de todos os lados. Entre lacaios e mercenários, você encontra o Cavaleiro Esquecido e descobre que deve enfrentar Zirgur para derrubar o feitiço que protege o castelo." },
        4: { titulo: "Capítulo IV", subtitulo: "Luta contra Zirgur", texto: "Você chega à torre negra. Zirgur aguarda no topo, tecendo magias de morte. Quebre o feitiço e abra caminho para o castelo." },
        5: { titulo: "Capítulo V", subtitulo: "Encontro do portão", texto: "O portão monumental de Gromn está à vista. Guardas tentam uma resistência desesperada, mas eles parecem fracos demais diante da sua fúria." },
        6: { titulo: "Capítulo VI", subtitulo: "Luta contra Durotan", texto: "Dentro do castelo, o lendário Durotan aparece. Após uma batalha épica, em seu último suspiro, ele revela a terrível verdade: Gromn está atacando sua cidade natal!" },
        7: { titulo: "Capítulo VII", subtitulo: "O Retorno ao reino", texto: "Você cavalga de volta desesperadamente. Sua cidade está em chamas. Gromn, o conquistador, aguarda no centro da praça. A batalha final começa agora!" }
    },

    Dialogos: {
        1: [
            { orador: 'jogador', texto: "Gromn cairá, e seu reino será meu!" },
            { orador: 'inimigo', texto: "Muitos tentaram, todos viraram adubo para as planícies." }
        ],
        2: [
            { orador: 'jogador', texto: "Saia da frente, Igvuld. Não tenho tempo para jogos." },
            { orador: 'inimigo', texto: "Ninguém cruza esta fronteira enquanto eu respirar!" }
        ],
        3: [
            { orador: 'inimigo', texto: "Peguem-no! Pelas ordens de Zirgur!" },
            { orador: 'jogador', texto: "Um cavaleiro vindo do esquecimento? Que seja." }
        ],
        4: [
            { orador: 'inimigo', texto: "Minha torre será seu túmulo, mortal!" },
            { orador: 'jogador', texto: "Seu feitiço acaba hoje, Zirgur!" }
        ],
        5: [
            { orador: 'inimigo', texto: "Parem-no! Não deixem que chegue ao portão!" },
            { orador: 'jogador', texto: "É só isso que Gromn tem a oferecer?" }
        ],
        6: [
            { orador: 'inimigo', texto: "Você é forte... mas Gromn já venceu. Suas terras queimam enquanto lutamos!" },
            { orador: 'jogador', texto: "Durotan! Onde ele está?!" }
        ],
        7: [
            { orador: 'inimigo', texto: "Veja sua cidade queimar! Eu sou Gromn, o Conquistador!" },
            { orador: 'jogador', texto: "Pague pelo que fez com o meu povo!" }
        ]
    },

    Campanha: {
        1: {
            nome: "A Jornada",
            imagemInimigo: 'Images/Personagens/OrcGuerreiroNvl1.png',
            inimigos: [
                { tipo: 'Unidade', raca: 'Orcs', classe: 'Guerreiro', nivel: 0 }
            ]
        },
        2: {
            nome: "Fronteira Orc",
            imagemInimigo: 'Images/Personagens/Igvuld.png',
            inimigos: [
                { tipo: 'Inimigo', nome: 'Igvuld' },
                { tipo: 'Unidade', raca: 'Orcs', classe: 'Guerreiro', nivel: 0 }
            ]
        },
        3: {
            nome: "Planícies Enevoadas",
            imagemInimigo: 'Images/Personagens/ForgottenKnight.png',
            inimigos: [
                { tipo: 'Inimigo', nome: 'Cavaleiro Esquecido' },
                { tipo: 'Unidade', raca: 'Orcs', classe: 'Arqueiro', nivel: 0 }
            ]
        },
        4: {
            nome: "Torre de Zirgur",
            imagemInimigo: 'Images/Personagens/Zirgur.png',
            inimigos: [
                { tipo: 'Inimigo', nome: 'Zirgur' }
            ]
        },
        5: {
            nome: "Portão Monumental",
            imagemInimigo: 'Images/Personagens/OrcGuerreiroNvl1.png',
            inimigos: [
                { tipo: 'Unidade', raca: 'Orcs', classe: 'Guerreiro', nivel: 0 },
                { tipo: 'Unidade', raca: 'Orcs', classe: 'Guerreiro', nivel: 0 }
            ]
        },
        6: {
            nome: "Salão Real",
            imagemInimigo: 'Images/Personagens/Durotan.png',
            inimigos: [
                { tipo: 'Inimigo', nome: 'Durotan' }
            ]
        },
        7: {
            nome: "Cidade em Chamas",
            imagemInimigo: 'Images/Personagens/Gromn.png',
            inimigos: [
                { tipo: 'Inimigo', nome: 'Gromn' }
            ]
        }
    }
};
