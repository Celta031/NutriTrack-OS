export interface BaseRecipe {
  id: string;
  title: string;
  category: string;
  prepTime: string;
  yieldText: string;
  caloriesPerPortion: string;
  ingredients: string[];
  steps: string[];
  storageTip: string;
}

export const BASE_RECIPES: BaseRecipe[] = [
  {
    id: "pate-fit",
    title: "Patê de Frango Fit Cremoso",
    category: "Base Semanal (Ter / Qui / Dom)",
    prepTime: "15 min",
    yieldText: "Rende ~350g (5 porções de 70g)",
    caloriesPerPortion: "105 kcal / 70g",
    ingredients: [
      "250g de peito de frango cozido e bem desfiado",
      "70g de requeijão light (ou creme de ricota light)",
      "40g de cenoura crua ralada bem fininha",
      "Cheiro-verde (salsinha e cebolinha) picado a gosto",
      "Sal, pimenta-do-reino, páprica doce e alho em pó a gosto",
    ],
    steps: [
      "Cozinhe o peito de frango em água com temperos naturais (alho, cebola, louro) e desfie ainda quente.",
      "Em um bowl, misture o frango desfiado frio com a cenoura ralada no ralo fino.",
      "Adicione o requeijão light aos poucos, mexendo com um garfo até atingir textura cremosa de patê.",
      "Tempere com salsinha, cebolinha e pimenta-do-reino.",
    ],
    storageTip: "Conservar em pote de vidro hermético na geladeira por até 5 dias.",
  },
  {
    id: "hamburguer-caseiro",
    title: "Hambúrguer Caseiro de Patinho (140g)",
    category: "Lanches & Jantares (Qua / Sáb)",
    prepTime: "20 min",
    yieldText: "Rende 4 hambúrgueres de 140g (peso cru)",
    caloriesPerPortion: "185 kcal / 140g",
    ingredients: [
      "560g de patinho bovino moído 2 vezes (sem gordura aparente)",
      "2 dentes de alho bem picados ou pasta de alho",
      "1/2 cebola pequena ralada e espremida",
      "Cheiro-verde picado bem fino",
      "Sal, pimenta-do-reino e páprica defumada a gosto",
      "2 colheres de sopa de água gelada (para dar liga e suculência)",
    ],
    steps: [
      "Em uma tigela, misture a carne moída com o alho, a cebola ralada, o sal e a páprica.",
      "Adicione a água gelada e amasse rapidamente com as mãos por 1 a 2 minutos até dar liga.",
      "Divida em 4 bolas iguais de 140g cada e molde os discos (aprox. 1,5 cm de altura).",
      "Grelhe em frigideira antiaderente bem quente por 3-4 minutos de cada lado.",
    ],
    storageTip: "Pode congelar cru separado por papel manteiga por até 60 dias.",
  },
  {
    id: "molho-tomate",
    title: "Molho de Tomate Caseiro Rústico",
    category: "Almoços & Rap10 (Ter / Qua / Sex)",
    prepTime: "35 min",
    yieldText: "Rende ~500g de molho",
    caloriesPerPortion: "18 kcal / 40g",
    ingredients: [
      "6 tomates italianos bem maduros picados",
      "1/2 cebola picada em cubos pequenos",
      "2 dentes de alho laminados",
      "Folhas de manjericão fresco e orégano",
      "1 fio de azeite de oliva extravirgem, sal e pimenta-do-reino",
    ],
    steps: [
      "Refogue a cebola e o alho com 1 fio mínimo de azeite e um pingo de água até dourar.",
      "Acrescente os tomates picados com pele e sementes, tampe e deixe cozinhar em fogo baixo por 25 minutos.",
      "Amasse com uma colher de pau ou bata rapidamente no mixer para textura rústica.",
      "Finalize com manjericão fresco, orégano e acerte o sal.",
    ],
    storageTip: "Dura 5 dias na geladeira ou 90 dias congelado em porções.",
  },
  {
    id: "lasanha-berinjela",
    title: "Lasanha de Berinjela Fit (Substituição Inteligente)",
    category: "Substituição de Almoço / Jantar",
    prepTime: "30 min",
    yieldText: "Rende 2 porções individuais",
    caloriesPerPortion: "240 kcal / porção",
    ingredients: [
      "1 berinjela média fatiada longitudinalmente (substitui a massa)",
      "200g de patinho moído refogado ou frango desfiado",
      "80g de molho de tomate caseiro",
      "30g de queijo muçarela ou minas ralado",
      "Orégano e manjericão a gosto",
    ],
    steps: [
      "Fatie a berinjela fina e grelhe rapidamente na frigideira antiaderente dos dois lados para amaciar.",
      "Em um refratário pequeno, intercale camadas de molho de tomate, berinjela grelhada e proteína (patinho ou frango).",
      "Finalize com a muçarela e orégano por cima.",
      "Leve ao forno ou Airfryer a 180°C por 10 minutos para gratinar.",
    ],
    storageTip: "Excelente opção low-carb para variar o jantar mantendo as metas.",
  },
  {
    id: "pure-batata",
    title: "Purê de Batata Inglesa Leve (Quinta-feira)",
    category: "Almoço (Quinta-feira c/ Tilápia)",
    prepTime: "20 min",
    yieldText: "Rende 2 porções de 90g",
    caloriesPerPortion: "78 kcal / 90g",
    ingredients: [
      "180g de batata inglesa descascada e picada",
      "20ml de leite desnatado/semidesnatado morno",
      "1 colher de chá rasa de requeijão light (opcional)",
      "Sal, noz-moscada ralada na hora e cebolinha",
    ],
    steps: [
      "Cozinhe a batata inglesa em água com pouco sal até ficar bem macia.",
      "Escorra e amasse ainda quente com espremedor ou garfo.",
      "Adicione o leite morno e misture vigorosamente até ficar aerado.",
      "Tempere com uma pitada de noz-moscada.",
    ],
    storageTip: "Consuma fresco ou conserve na geladeira por até 3 dias.",
  },
  {
    id: "panqueca-aveia",
    title: "Panqueca / Crepioca de Banana e Aveia (Terça Lanche)",
    category: "Lanche da Tarde (Terça-feira)",
    prepTime: "10 min",
    yieldText: "1 porção individual",
    caloriesPerPortion: "265 kcal / porção",
    ingredients: [
      "2 ovos inteiros",
      "1 banana-prata madura amassada (80g)",
      "15g de aveia em flocos finos",
      "Canela em pó a gosto",
    ],
    steps: [
      "Amasse bem a banana-prata com um garfo até virar um purê liso.",
      "Adicione os 2 ovos, a aveia em flocos e a canela em pó, batendo bem.",
      "Despeje em frigideira antiaderente untada com 1 gota de azeite em fogo baixo.",
      "Tampe, deixe dourar por 3 minutos, vire e doure o outro lado.",
    ],
    storageTip: "Prepare na hora para manter a textura macia e quentinha.",
  },
];
