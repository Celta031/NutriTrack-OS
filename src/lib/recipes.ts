export interface BaseRecipe {
  id: string;
  title: string;
  yieldPortions: string;
  yieldText: string;
  caloriesPerPortion: string;
  prepTime: string;
  category: string;
  ingredients: string[];
  steps: string[];
  nutritionistTip: string;
  storageTip: string;
}

/**
 * SPEC-08: All 8 Official Base Recipes from Page 13 of the Nutritionist's Meal Plan PDF
 */
export const BASE_RECIPES: BaseRecipe[] = [
  {
    id: "molho-tomate-caseiro",
    title: "1. Molho de Tomate Caseiro",
    yieldPortions: "6 porções (50 g cada)",
    yieldText: "Rende: 6 porções (50 g cada)",
    caloriesPerPortion: "~35 kcal / porção",
    prepTime: "25 minutos",
    category: "Base Culinária Funcional",
    ingredients: [
      "Tomate maduro: 6 unidades (600 g)",
      "Cebola: 1/2 unidade (50 g)",
      "Alho: 2 dentes (10 g)",
      "Azeite de oliva: 1 colher de sopa (10 ml)",
      "Folhas de manjericão: a gosto",
      "Sal e pimenta-do-reino: a gosto",
    ],
    steps: [
      "Lave os tomates, faça um corte em X na base e leve ao fogo por 1 minuto. Retire, descasque e pique.",
      "Em uma panela, aqueça o azeite e refogue a cebola e o alho até dourarem.",
      "Adicione os tomates picados, tempere com sal e pimenta e cozinhe em fogo baixo por 15–20 minutos, mexendo às vezes, até formar um molho.",
      "Finalize com manjericão e desligue o fogo. Bata no liquidificador (opcional).",
    ],
    nutritionistTip:
      "Conserve na geladeira por até 5 dias ou congele em porções individuais.",
    storageTip:
      "Conserve na geladeira por até 5 dias ou congele em porções individuais.",
  },
  {
    id: "lasanha-berinjela",
    title: "2. Lasanha de Berinjela",
    yieldPortions: "6 porções (1 fatia média = 250 g)",
    yieldText: "Rende: 6 porções (1 fatia média = 250 g)",
    caloriesPerPortion: "~230 kcal / fatia",
    prepTime: "60 minutos",
    category: "Prato Principal (Almoço Opção 11)",
    ingredients: [
      "Berinjela: 2 unidades médias (500 g)",
      "Molho de tomate caseiro: 2 xícaras (400 g)",
      "Carne moída magra: 300 g",
      "Cebola: 1 unidade (100 g)",
      "Alho: 2 dentes (10 g)",
      "Ricota ou queijo cottage: 200 g",
      "Queijo muçarela: 100 g",
      "Azeite de oliva: 1 colher de sopa (10 ml)",
      "Sal, pimenta e orégano: a gosto",
    ],
    steps: [
      "Corte as berinjelas em fatias no sentido do comprimento, tempere com sal e deixe descansar por 20 minutos. Enxágue e seque. Grelhe em frigideira antiaderente dos dois lados.",
      "Refogue a cebola e o alho no azeite, adicione a carne moída, tempere e cozinhe até ficar soltinha. Acrescente o molho de tomate.",
      "Em um refratário, alterne camadas de molho com carne, berinjela grelhada e ricota. Finalize com molho e muçarela.",
      "Leve ao forno preaquecido a 180 °C por 25–30 minutos.",
    ],
    nutritionistTip:
      "Sirva com salada verde para uma refeição leve e completa.",
    storageTip:
      "Sirva com salada verde para uma refeição leve e completa.",
  },
  {
    id: "pure-saudavel",
    title: "3. Purê Saudável",
    yieldPortions: "4 porções (150 g cada)",
    yieldText: "Rende: 4 porções (150 g cada)",
    caloriesPerPortion: "~130 kcal / porção",
    prepTime: "30 minutos",
    category: "Acompanhamento (Almoço Opção 3)",
    ingredients: [
      "Batata-doce: 500 g ou Batata inglesa: 300 g",
      "Leite desnatado: 1/2 xícara (120 ml)",
      "Azeite de oliva: 1 colher de sopa (10 ml)",
      "Sal, noz-moscada e pimenta: a gosto",
    ],
    steps: [
      "Cozinhe as batatas até ficarem macias.",
      "Amasse ou bata no mixer com o leite e o azeite até obter um purê cremoso.",
      "Tempere com sal, noz-moscada e pimenta.",
    ],
    nutritionistTip:
      "Fica ótimo com frango grelhado, carnes magras, tilápia ou legumes.",
    storageTip:
      "Fica ótimo com frango grelhado, carnes magras, tilápia ou legumes.",
  },
  {
    id: "pate-fit",
    title: "4. Patê Fit",
    yieldPortions: "6 porções (30 g cada)",
    yieldText: "Rende: 6 porções (30 g cada)",
    caloriesPerPortion: "~65 kcal / porção",
    prepTime: "15 minutos",
    category: "Proteína Prática (Café Opções 1/2/3 & Lanche Opção 5)",
    ingredients: [
      "Frango cozido e desfiado: 200 g (ou Sardinha/Atum escorrido)",
      "Ricota ou cream cheese light: 100 g",
      "Cenoura ralada: 2 colheres de sopa (20 g)",
      "Salsinha: 1 colher de sopa (5 g)",
      "Suco de limão: 1 colher de chá (5 ml)",
      "Sal, pimenta e orégano: a gosto",
    ],
    steps: [
      "Bata o frango com a ricota no processador até formar uma pasta.",
      "Misture a cenoura, salsinha, limão e temperos.",
      "Leve à geladeira por 30 minutos antes de servir.",
    ],
    nutritionistTip:
      "Sirva com pães integrais, pão francês, torradas ou palitos de legumes.",
    storageTip:
      "Sirva com pães integrais, pão francês, torradas ou palitos de legumes.",
  },
  {
    id: "pizza-frigideira-rap10",
    title: "5. Pizza de Frigideira com Rap 10",
    yieldPortions: "1 porção",
    yieldText: "Rende: 1 porção",
    caloriesPerPortion: "~245 kcal / unidade",
    prepTime: "15 minutos",
    category: "Lanche Rápido (Lanche Opção 3 & Jantar Opção 7)",
    ingredients: [
      "Rap 10 integral: 1 unidade (40 g)",
      "Molho de tomate: 2 colheres de sopa (30 g)",
      "Queijo muçarela: 30 g",
      "Tomate fatiado: 3 rodelas (50 g)",
      "Orégano: a gosto",
    ],
    steps: [
      "Espalhe o molho sobre o Rap 10.",
      "Adicione o queijo, o tomate e o orégano (+ frango desfiado ou ovos picados conforme a opção do cardápio).",
      "Leve à frigideira antiaderente com tampa em fogo baixo por 8–10 minutos, até o queijo derreter.",
    ],
    nutritionistTip:
      "Use outros recheios leves: frango desfiado, atum ou vegetais.",
    storageTip:
      "Use outros recheios leves: frango desfiado, atum ou vegetais.",
  },
  {
    id: "massa-panqueca",
    title: "6. Massa de Panqueca",
    yieldPortions: "6 unidades (1 panqueca = 60 g)",
    yieldText: "Rende: 6 unidades (1 panqueca = 60 g)",
    caloriesPerPortion: "~75 kcal / disco",
    prepTime: "20 minutos",
    category: "Massa Funcional (Almoço Opção 12)",
    ingredients: [
      "Ovo: 1 unidade (50 g)",
      "Leite desnatado: 1/2 xícara (120 ml)",
      "Aveia em flocos finos: 2 colheres de sopa (20 g)",
      "Farinha de aveia ou integral: 3 colheres de sopa (30 g)",
      "Sal: uma pitada",
    ],
    steps: [
      "Bata todos os ingredientes no liquidificador até formar uma massa homogênea.",
      "Aqueça uma frigideira antiaderente e despeje uma concha pequena da massa.",
      "Doure dos dois lados. Recheie a gosto (frango desfiado ou carne moída magra + molho de tomate).",
    ],
    nutritionistTip: "Rende 6 panquecas médias leves e ricas em fibras.",
    storageTip: "Rende 6 panquecas médias leves e ricas em fibras.",
  },
  {
    id: "hamburguer-natural",
    title: "7. Hambúrguer Natural",
    yieldPortions: "4 unidades (1 hambúrguer = 100 g)",
    yieldText: "Rende: 4 unidades (1 hambúrguer = 100 g)",
    caloriesPerPortion: "~165 kcal / unidade",
    prepTime: "30 minutos",
    category: "Proteína Magra (Lanche Opção 8 & Jantar Opção 1)",
    ingredients: [
      "Patinho moído: 400 g (ou peito de frango moído)",
      "Cebola ralada: 2 colheres de sopa (20 g)",
      "Alho picado: 1 dente (5 g)",
      "Salsinha picada: 1 colher de sopa (5 g)",
      "Sal, pimenta e cominho: a gosto",
    ],
    steps: [
      "Misture todos os ingredientes até ficar homogêneo.",
      "Modele os hambúrgueres (cerca de 100 g cada).",
      "Grelhe em frigideira antiaderente ou asse em forno médio (180 °C) por 20 minutos, virando na metade do tempo.",
    ],
    nutritionistTip:
      "Congele as unidades cruas por até 3 meses. Grelhe sem óleo ou com 1 fio de azeite.",
    storageTip:
      "Congele as unidades cruas por até 3 meses. Grelhe sem óleo ou com 1 fio de azeite.",
  },
  {
    id: "panqueca-banana",
    title: "8. Panqueca de Banana",
    yieldPortions: "2 unidades (1 panqueca = 120 g)",
    yieldText: "Rende: 2 unidades (1 panqueca = 120 g)",
    caloriesPerPortion: "~195 kcal / receita",
    prepTime: "15 minutos",
    category: "Pré-Treino / Café / Lanche (Opção 10)",
    ingredients: [
      "Banana-prata: 1 unidade média (100 g)",
      "Ovo: 1 unidade (50 g)",
      "Aveia em flocos finos: 1 colher de sopa (15 g)",
      "Canela: a gosto",
    ],
    steps: [
      "Amasse a banana em uma tigela.",
      "Adicione o ovo, a aveia e a canela. Misture bem.",
      "Aqueça uma frigideira antiaderente com um fio de azeite e despeje metade da massa.",
      "Doure dos dois lados. Repita com o restante.",
    ],
    nutritionistTip:
      "Sirva com frutas ou pasta de amendoim 100% (1 colher de chá).",
    storageTip:
      "Sirva com frutas ou pasta de amendoim 100% (1 colher de chá).",
  },
];
