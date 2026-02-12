/**
 * BANCO DE DADOS CENTRAL
 * Contém todos os dados estáticos do jogo: Personagens, Inimigos, Itens, Cartas, Efeitos e Campanhas.
 * Acesso global via: window.BancoDeDados
 */

window.BancoDeDados = {
    // Referências de Áudio (Centralizadas)
    Audio: {
        Musicas: {
            Fundo: 'Audio/Musicas/Musica de fundo.mp3',
            BatalhaSimples: 'Audio/Musicas/Musica de fundo.mp3', // Placeholder ou similar
            Vitoria: 'Audio/Musicas/vitória.mp3'
        },
        Interface: {
            Click1: 'Audio/Sons/Sons de interface/Click1.mp3',
            Click2: 'Audio/Sons/Sons de interface/Click2.mp3',
            Click3: 'Audio/Sons/Sons de interface/Click3.mp3',
            Click4: 'Audio/Sons/Sons de interface/Click4.mp3',
            Generico: 'Audio/Sons/Sons de interface/Click.mp3',
            Sucesso: 'Audio/Sons/Sons de interface/Sucesso.mp3',
            Erro: 'Audio/Sons/Sons de interface/Erro1.mp3',
            ErroGrave: 'Audio/Sons/Sons de interface/Erro2.mp3',
            Fracasso: 'Audio/Sons/Sons de interface/Fracasso.mp3',
            LevelUp: 'Audio/Sons/Sons de interface/SubindoDeNivel.wav'
        },
        Efeitos: {
            AtaqueBasico: 'Audio/Sons/Sons Gerais/Ataque Básico.mp3',
            HitEspada: 'Audio/Sons/Sons Gerais/HitEspada.mp3',
            Cura: 'Audio/Sons/Sons Gerais/Curando.mp3',
            Defendido: 'Audio/Sons/Sons Gerais/Defendido.mp3',
            Desvio: 'Audio/Sons/Sons Gerais/Desvio1.mp3',
            Pocao: 'Audio/Sons/Sons Gerais/bebendoPocao.mp3',
            PocaoQuebrando: 'Audio/Sons/Sons Gerais/PocaoQuebrando.mp3',
            ChuvaDeFlechas: 'Audio/Sons/Sons Gerais/ChuvaDeFlechas.mp3',
            Soco: 'Audio/Sons/Sons Gerais/Soco.mp3',
            GritoDurotan: 'Audio/Sons/Sons Gerais/GritoDurotan.mp3',
            ComboForte: 'Audio/Sons/Sons Gerais/ComboForte.mp3',
            OssoQuebrando: 'Audio/Sons/Sons Gerais/Osso quebrando.mp3',
            Parry: 'Audio/Sons/Sons Gerais/Parry.mp3',
            MagiaMortos: 'Audio/Sons/Sons Gerais/MagiaDosMortos.wav'
        }
    },

    // Template Base do Jogador
    JogadorBase: {
        nome: "Protagonista",
        ehPrincipal: true,
        classe: "Guerreiro",
        // Atributos Vitais
        vida: 160, vidaMaxima: 160,
        energia: 200, energiaMaxima: 200,
        mana: 30, manaMaxima: 30,
        // Atributos de Combate
        ataque: 45,
        ataqueMagico: 10,
        ataqueEsmagador: 5,
        armadura: 30,
        protecaoMagica: 5,
        esquiva: 10,
        precisao: 100,
        // Atributos Especiais
        determinacao: 200, determinacaoMaxima: 200,
        chanceCritico: 5,
        danoCritico: 175, // Porcentagem
        rouboVida: 10,
        sorte: 5,
        penetracaoArmadura: 0,
        penetracaoMagica: 0,
        vigor: 40,
        // Progressão
        nivel: 1,
        xp: 0,
        xpParaProximoNivel: 100,
        pontosHabilidade: 0,
        // Regeneração
        regeneracaoEnergia: 10,
        regeneracaoVida: 5,
        regeneracaoMana: 2,
        // Visual
        imagem: "Images/Personagens/Jogador.png"
    },

    // Unidades (Aliados/Inimigos padrão)
    Unidades: {
        Humanos: {
            Guerreiro: [
                { id: "h_g_1", nome: "Guerreiro Humano Nvl 1", nivel: 1, vida: 75, vidaMaxima: 75, ataque: 12, energia: 80, energiaMaxima: 80, armadura: 10, vigor: 10, esquiva: 4, precisao: 90, chanceCritico: 5, danoCritico: 175, imagem: "Images/Personagens/HumanoGuerreiroNvl1.png" },
                { id: "h_g_2", nome: "Guerreiro Humano Nvl 2", nivel: 2, vida: 115, vidaMaxima: 115, ataque: 15, energia: 100, energiaMaxima: 100, armadura: 25, vigor: 20, esquiva: 5, precisao: 95, chanceCritico: 8, danoCritico: 175, imagem: "Images/Personagens/HumanoGuerreiroNvl2.png" },
                { id: "h_g_3", nome: "Guerreiro Humano Nvl 3", nivel: 3, vida: 140, vidaMaxima: 140, ataque: 17, energia: 120, energiaMaxima: 120, armadura: 50, vigor: 40, esquiva: 7, precisao: 99, chanceCritico: 12, danoCritico: 175, imagem: "Images/Personagens/HumanoGuerreiroNvl3.png" }
            ],
            Arqueiro: [
                { id: "h_a_1", nome: "Arqueiro Humano Nvl 1", nivel: 1, vida: 60, vidaMaxima: 60, ataque: 18, energia: 80, energiaMaxima: 80, armadura: 0, vigor: 10, esquiva: 4, precisao: 100, chanceCritico: 10, danoCritico: 185, imagem: "Images/Personagens/ArqueiroHumanoNvl1.png" },
                { id: "h_a_2", nome: "Arqueiro Humano Nvl 2", nivel: 2, vida: 80, vidaMaxima: 80, ataque: 23, energia: 100, energiaMaxima: 100, armadura: 15, vigor: 20, esquiva: 5, precisao: 110, chanceCritico: 15, danoCritico: 195, imagem: "Images/Personagens/ArqueiroHumanoNvl2.png" },
                { id: "h_a_3", nome: "Arqueiro Humano Nvl 3", nivel: 3, vida: 100, vidaMaxima: 100, ataque: 27, energia: 120, energiaMaxima: 120, armadura: 30, vigor: 40, esquiva: 7, precisao: 120, chanceCritico: 20, danoCritico: 205, imagem: "Images/Personagens/ArqueiroHumanoNvl3.png" }
            ]
        },
        Orcs: {
            Guerreiro: [
                { id: "o_g_1", nome: "Guerreiro Orc Nvl 1", nivel: 1, vida: 75, vidaMaxima: 75, ataque: 12, energia: 80, energiaMaxima: 80, armadura: 10, vigor: 10, esquiva: 4, precisao: 90, chanceCritico: 5, danoCritico: 175, imagem: "Images/Personagens/OrcGuerreiroNvl1.png" },
                { id: "o_g_2", nome: "Guerreiro Orc Nvl 2", nivel: 2, vida: 115, vidaMaxima: 115, ataque: 15, energia: 100, energiaMaxima: 100, armadura: 25, vigor: 20, esquiva: 5, precisao: 95, chanceCritico: 8, danoCritico: 175, imagem: "Images/Personagens/OrcGuerreiroNvl2.png" },
                { id: "o_g_3", nome: "Guerreiro Orc Nvl 3", nivel: 3, vida: 140, vidaMaxima: 140, ataque: 17, energia: 120, energiaMaxima: 120, armadura: 50, vigor: 40, esquiva: 7, precisao: 99, chanceCritico: 12, danoCritico: 175, imagem: "Images/Personagens/OrcGuerreiroNvl3.png" }
            ],
            Arqueiro: [
                { id: "o_a_1", nome: "Arqueiro Orc Nvl 1", nivel: 1, vida: 60, vidaMaxima: 60, ataque: 18, energia: 80, energiaMaxima: 80, armadura: 0, vigor: 10, esquiva: 4, precisao: 100, chanceCritico: 10, danoCritico: 185, imagem: "Images/Personagens/OrcArqueiroNvl1.png" },
                { id: "o_a_2", nome: "Arqueiro Orc Nvl 2", nivel: 2, vida: 80, vidaMaxima: 80, ataque: 23, energia: 100, energiaMaxima: 100, armadura: 15, vigor: 20, esquiva: 5, precisao: 110, chanceCritico: 15, danoCritico: 195, imagem: "Images/Personagens/OrcArqueiroNvl2.png" },
                { id: "o_a_3", nome: "Arqueiro Orc Nvl 3", nivel: 3, vida: 100, vidaMaxima: 100, ataque: 27, energia: 120, energiaMaxima: 120, armadura: 30, vigor: 40, esquiva: 7, precisao: 120, chanceCritico: 20, danoCritico: 205, imagem: "Images/Personagens/OrcArqueiroNvl3.png" }
            ]
        }
    },

    // Inimigos Únicos (Chefes)
    Chefes: [
        { id: 1, nome: "Durotan", ehPrincipal: true, vida: 150, vidaMaxima: 150, energia: 80, energiaMaxima: 80, mana: 20, manaMaxima: 20, ataque: 20, ataqueMagico: 5, ataqueEsmagador: 15, armadura: 12, protecaoMagica: 8, esquiva: 5, determinacao: 200, determinacaoMaxima: 200, chanceCritico: 10, danoCritico: 150, rouboVida: 0, sorte: 5, precisao: 90, penetracaoArmadura: 5, vigor: 15, regeneracaoEnergia: 8, regeneracaoVida: 2, regeneracaoMana: 1, imagem: "Images/Personagens/Durotan.png" },
        { id: 2, nome: "Igvuld", ehPrincipal: true, vida: 120, vidaMaxima: 120, energia: 200, energiaMaxima: 200, mana: 100, manaMaxima: 100, ataque: 10, ataqueMagico: 25, ataqueEsmagador: 5, armadura: 5, protecaoMagica: 20, esquiva: 12, determinacao: 200, determinacaoMaxima: 200, chanceCritico: 15, danoCritico: 180, rouboVida: 5, sorte: 10, precisao: 95, penetracaoArmadura: 0, vigor: 8, regeneracaoEnergia: 5, regeneracaoVida: 1, regeneracaoMana: 10, imagem: "Images/Personagens/Igvuld.png" },
        { id: 3, nome: "Zirgur", ehPrincipal: true, vida: 100, vidaMaxima: 100, energia: 200, energiaMaxima: 200, mana: 40, manaMaxima: 40, ataque: 25, ataqueMagico: 10, ataqueEsmagador: 20, armadura: 2, protecaoMagica: 5, esquiva: 20, determinacao: 200, determinacaoMaxima: 200, chanceCritico: 25, danoCritico: 200, rouboVida: 10, sorte: 15, precisao: 85, penetracaoArmadura: 10, vigor: 12, regeneracaoEnergia: 15, regeneracaoVida: 5, regeneracaoMana: 2, imagem: "Images/Personagens/Zirgur.png" },
        { id: 4, nome: "Gromn", ehPrincipal: true, vida: 200, vidaMaxima: 200, energia: 200, energiaMaxima: 200, mana: 10, manaMaxima: 10, ataque: 35, ataqueMagico: 0, ataqueEsmagador: 30, armadura: 25, protecaoMagica: 10, esquiva: 0, determinacao: 200, determinacaoMaxima: 200, chanceCritico: 5, danoCritico: 140, rouboVida: 0, sorte: 2, precisao: 80, penetracaoArmadura: 15, vigor: 25, regeneracaoEnergia: 3, regeneracaoVida: 10, regeneracaoMana: 0, imagem: "Images/Personagens/Gromn.png" },
        { id: 5, nome: "Cavaleiro Esquecido", ehPrincipal: true, vida: 110, vidaMaxima: 110, energia: 150, energiaMaxima: 150, mana: 50, manaMaxima: 50, ataque: 22, ataqueMagico: 15, ataqueEsmagador: 10, armadura: 40, protecaoMagica: 30, esquiva: 15, determinacao: 150, determinacaoMaxima: 150, chanceCritico: 10, danoCritico: 160, rouboVida: 5, sorte: 8, precisao: 90, penetracaoArmadura: 5, vigor: 15, regeneracaoEnergia: 8, regeneracaoVida: 4, regeneracaoMana: 3, imagem: "Images/Personagens/CavaleiroEsquecido.png" }
    ],

    // Itens Consumíveis e Equipáveis
    Itens: [
        { id: 1, nome: "Poção de Vida Menor", tipo: "consumivel", descricao: "Recupera 30 pontos de vida.", efeito: { atributo: "vida", valor: 30 }, preco: 10 },
        { id: 2, nome: "Elixir de Mana", tipo: "consumivel", descricao: "Recupera 20 pontos de mana.", efeito: { atributo: "mana", valor: 20 }, preco: 15 },
        { id: 3, nome: "Espada Enferrujada", tipo: "arma", descricao: "Uma espada velha, mas ainda corta.", ataque: 5, preco: 50 },
        // Itens que estavam hardcoded no combat.js para teste
        { id: 4, nome: "Poção de Vida Média", tipo: "consumivel", descricao: "Recupera 60 pontos de vida.", efeito: { atributo: "vida", valor: 60 }, preco: 30 },
        { id: 5, nome: "Poção de Mana Média", tipo: "consumivel", descricao: "Recupera 40 pontos de mana.", efeito: { atributo: "mana", valor: 40 }, preco: 35 },
        { id: 6, nome: "Poção de Energia Média", tipo: "consumivel", descricao: "Recupera 50 pontos de energia.", efeito: { atributo: "energia", valor: 50 }, preco: 25 },
        { id: 7, nome: "Facas de Arremesso", tipo: "consumivel-dano", descricao: "Atinge um inimigo à distância.", efeito: { especial: "FacasArremesso" }, preco: 20 },
        { id: 8, nome: "Óleo Rúnico", tipo: "consumivel-buff", descricao: "Aplica fogo à arma por 3 turnos.", efeito: { especial: "OleoRunico" }, preco: 45 },
        { id: 9, nome: "Poção Misteriosa", tipo: "consumivel", descricao: "Efeitos imprevisíveis.", efeito: { especial: "PocaoMisteriosa" }, preco: 10 }
    ],

    // Cartas de Habilidade
    Cartas: [
        { id: 1, nome: "Ataque Básico", tipo: "Bronze", custoEnergia: 5, efeito: { danoMultiplicador: 1.1 }, raridade: "Comum", imagem: "Images/Cartas/AtaqueBasico.png", som: "Audio/Sons/HitEspada.mp3" },
        { id: 2, nome: "Defesa Sólida", tipo: "Bronze", custoEnergia: 8, efeito: { armaduraBonus: 5 }, raridade: "Comum", imagem: "Images/Cartas/AtaquePreciso.png", alvoAliado: true },
        { id: 3, nome: "Fogo Arcano", tipo: "Bronze", custoMana: 5, efeito: { danoMultiplicador: 1.2 }, raridade: "Comum", imagem: "Images/Cartas/AtaqueBasico.png" },
        { id: 4, nome: "Sopro de Vida", tipo: "Bronze", custoMana: 10, efeito: { cura: 15 }, raridade: "Incomum", imagem: "Images/Cartas/AtaquePreciso.png", alvoAliado: true },
        { id: 5, nome: "Ataque Preciso", tipo: "Prata", custoEnergia: 15, efeito: { danoMultiplicador: 1.8 }, raridade: "Raro", imagem: "Images/Cartas/AtaquePesado.png", som: "Audio/Sons/ComboForte.mp3" }
    ],

    // Definições de Efeitos (Status Effects)
    Efeitos: {
        Envenenamento: { nome: "Envenenamento", niveis: { 1: { danoFixo: 5, danoPct: 0.05, icone: "☠️" }, 2: { danoFixo: 10, danoPct: 0.05, icone: "☠️" }, 3: { danoFixo: 15, danoPct: 0.05, icone: "☠️" } } },
        Atordoamento: { nome: "Atordoamento", tipo: "Controle", niveis: { 1: { perdeTurno: true, icone: "💫" } } },
        Regeneracao: { nome: "Regeneração", tipo: "Buff", niveis: { 1: { curaPct: 0.10, icone: "🌿" }, 2: { curaPct: 0.20, icone: "🌿" } } },
        Sangramento: { nome: "Sangramento", niveis: { 1: { danoFixo: 5, danoPct: 0.075, icone: "🩸" }, 2: { danoFixo: 10, danoPct: 0.075, icone: "🩸" } } },
        Combustao: { nome: "Combustão", niveis: { 1: { danoFixo: 10, danoPct: 0.10, icone: "🔥" }, 2: { danoFixo: 15, danoPct: 0.10, icone: "🔥" } } },
        ArmaCombustao: { nome: "Arma em Chamas", niveis: { 1: { chanceAplicar: 0.3, nivelAplicar: 1, icone: "🔥" }, 2: { chanceAplicar: 0.5, nivelAplicar: 2, icone: "🔥" } } },
        ArmaEnvenenada: { nome: "Arma com Veneno", niveis: { 1: { chanceAplicar: 0.3, nivelAplicar: 1, icone: "☠️" }, 2: { chanceAplicar: 0.5, nivelAplicar: 2, icone: "☠️" } } },
        BuffDefesa: { nome: "Armadura Aumentada", niveis: { 1: { armaduraBonus: 10, icone: "🛡️" } } },
        BuffDivino: { nome: "Proteção Divina", niveis: { 1: { protecaoMagicaBonus: 10, icone: "✨" } } },
        BuffAtaque: { nome: "Fúria", niveis: { 1: { ataqueBonus: 5, icone: "⚔️" } } },
        RegeneracaoMana: { nome: "Regeneração de Mana", niveis: { 1: { curaManaPct: 0.1, icone: "💧" } } }
    },

    // Talentos Passivos
    Talentos: [
        { id: 1, nome: "Força Guerreira", descricao: "+5 de Ataque Físico", efeito: { ataque: 5 }, imagem: "Images/Talentos/AtkFisico.png" },
        { id: 2, nome: "Sabedoria Arcana", descricao: "+5 de Ataque Mágico", efeito: { ataqueMagico: 5 }, imagem: "Images/Talentos/AtkMagico.png" },
        { id: 5, nome: "Vitalidade", descricao: "+20 de Vida Máxima", efeito: { vidaMaxima: 20 }, imagem: "Images/Talentos/Vida.png" }
    ],

    // Dados da Campanha e Missões
    Campanhas: {
        Castelo: {
            nome: "O Castelo de Igvuld",
            niveis: {
                1: {
                    nome: "Cap. 1: A Jornada",
                    inimigos: [
                        { tipo: 'Aleatorio', raca: 'Orcs', nivel: 1 },
                        { tipo: 'Aleatorio', raca: 'Orcs', nivel: 1 }
                    ],
                    cenario: "Images/Cenarios/C1F1_AldeiaHumana.png",
                    imagemInimigo: 'Images/Personagens/OrcGuerreiroNvl1.png',
                    historia: {
                        titulo: "Capítulo I",
                        subtitulo: "A Jornada",
                        texto: "O jogador inicia sua jornada, com o objetivo de conquistar o reino do orc Gromn, o conquistador, enfrentando 2 lacaios orcs aleatórios de nível 1."
                    },
                    dialogos: [
                        { orador: 'jogador', texto: "Gromn cairá, e seu reino será meu!" },
                        { orador: 'inimigo', texto: "Muitos tentaram, todos viraram adubo!" }
                    ]
                },
                2: {
                    nome: "Cap. 2: Luta contra Igvuld",
                    inimigos: [
                        { tipo: 'Chefe', id: 2 }, // Igvuld
                        { tipo: 'Unidade', raca: 'Orcs', classe: 'Arqueiro', nivel: 1 }
                    ],
                    cenario: "Images/Cenarios/PonteDoCastelo.png",
                    imagemInimigo: 'Images/Personagens/Igvuld.png',
                    historia: {
                        titulo: "Capítulo II",
                        subtitulo: "Luta contra Igvuld",
                        texto: "Na fronteira da terra dos Orcs o jogador encontra o orc Igvuld, um arqueiro de nível 2 e um arqueiro de nível 1, bloqueando seu caminho."
                    },
                    dialogos: [
                        { orador: 'inimigo', texto: "Ninguém cruza esta fronteira sob meu olhar!" },
                        { orador: 'jogador', texto: "Sua flecha terá que ser mais rápida que minha determinação, Igvuld." }
                    ]
                },
                3: {
                    nome: "Cap. 3: Encontro Aleatório",
                    inimigos: [
                        { tipo: 'Aleatorio', nivel: 1 },
                        { tipo: 'Aleatorio', nivel: 1 },
                        { tipo: 'Aleatorio', nivel: 1 }
                    ],
                    cenario: "Images/Cenarios/FlorestaSombria.png",
                    imagemInimigo: 'Images/Personagens/CavaleiroEsquecido.png',
                    historia: {
                        titulo: "Capítulo III",
                        subtitulo: "Encontro Aleatório",
                        texto: "O jogador irá se encontrar com 3 lacaios aleatórios, podendo serem orcs, humanos, ou o cavaleiro esquecido, e descobre que tem que enfrentar Zirgur, para poder então derrubar o feitiço que protege o castelo."
                    },
                    dialogos: [
                        { orador: 'inimigo', texto: "Zirgur prometeu ouro por sua cabeça!" },
                        { orador: 'jogador', texto: "Um cavaleiro vindo do esquecimento? Minha lâmina o enviará de volta." }
                    ]
                },
                4: {
                    nome: "Cap. 4: Luta contra Zirgur",
                    inimigos: [
                        { tipo: 'Chefe', id: 3 }, // Zirgur
                        { tipo: 'Unidade', raca: 'Orcs', classe: 'Guerreiro', nivel: 2 },
                        { tipo: 'Unidade', raca: 'Orcs', classe: 'Guerreiro', nivel: 2 }
                    ],
                    cenario: "Images/Cenarios/TorreMago.png",
                    imagemInimigo: 'Images/Personagens/Zirgur.png',
                    historia: {
                        titulo: "Capítulo IV",
                        subtitulo: "Luta contra Zirgur",
                        texto: "O jogador Chega na torre do zirgur, enfrenta o mago e dois soldados orcs guerreiros nlv 2."
                    },
                    dialogos: [
                        { orador: 'inimigo', texto: "Tolo! Minha magia sustenta este império!" },
                        { orador: 'jogador', texto: "Sua magia termina hoje, Zirgur!" }
                    ]
                },
                5: {
                    nome: "Cap. 5: Encontro do Portão",
                    inimigos: [
                        { tipo: 'Aleatorio', raca: 'Orcs', nivel: 3 },
                        { tipo: 'Aleatorio', raca: 'Orcs', nivel: 3 },
                        { tipo: 'Aleatorio', raca: 'Orcs', nivel: 3 }
                    ],
                    cenario: "Images/Cenarios/PortaoCastelo.png",
                    imagemInimigo: 'Images/Personagens/OrcGuerreiroNvl3.png',
                    historia: {
                        titulo: "Capítulo V",
                        subtitulo: "Encontro do Portão",
                        texto: "O jogador Chega no portão do castelo de grom e enfrenta os guardas, 3 lacaios orcs aleatórios de nível 3."
                    },
                    dialogos: [
                        { orador: 'inimigo', texto: "Ninguém invade o castelo de Gromn!" },
                        { orador: 'jogador', texto: "Este portão cairá hoje!" }
                    ]
                },
                6: {
                    nome: "Cap. 6: Luta contra Durotan",
                    inimigos: [
                        { tipo: 'Chefe', id: 1 }, // Durotan
                        { tipo: 'Unidade', raca: 'Orcs', classe: 'Arqueiro', nivel: 3 },
                        { tipo: 'Unidade', raca: 'Orcs', classe: 'Arqueiro', nivel: 3 }
                    ],
                    cenario: "Images/Cenarios/InteriorCastelo.png",
                    imagemInimigo: 'Images/Personagens/Durotan.png',
                    historia: {
                        titulo: "Capítulo VI",
                        subtitulo: "Luta contra Durotan",
                        texto: "O jogador invade o castelo e derrota durotan e dois arqueiros nvl 3, em seu último suspiro durotan revela que seu comandante Gromn, o conquistador, está atacando a cidade do jogador."
                    },
                    dialogos: [
                        { orador: 'inimigo', texto: "Você luta por um reino que já está em cinzas... Gromn atacará seu lar!" },
                        { orador: 'jogador', texto: "Mentira! Vou te derrotar e voltar para salvar meu povo!" }
                    ]
                },
                7: {
                    nome: "Cap. 7: O Retorno ao Reino",
                    inimigos: [
                        { tipo: 'Chefe', id: 4 }, // Gromn
                        { tipo: 'Unidade', raca: 'Orcs', classe: 'Guerreiro', nivel: 3 },
                        { tipo: 'Unidade', raca: 'Orcs', classe: 'Guerreiro', nivel: 3 }
                    ],
                    cenario: "Images/Cenarios/ReinoEmChamas.png",
                    imagemInimigo: 'Images/Personagens/Gromn.png',
                    historia: {
                        titulo: "Capítulo VII",
                        subtitulo: "O Retorno ao Reino",
                        texto: "O jogador Retorna para seu reino para derrotar Gromn, e 2 soldados orcs de nível 3."
                    },
                    dialogos: [
                        { orador: 'inimigo', texto: "Veja sua cidade queimar! Eu sou o Conquistador!" },
                        { orador: 'jogador', texto: "Acabou, Gromn! Hoje eu reconquisto meu lar!" }
                    ]
                }
            }
        }
    }
};

console.log("✅ [SISTEMA] Banco de Dados Inicializado.");
