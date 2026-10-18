export interface NutritionistIngredientSpec {
  name: string;
  category:
    | "Proteínas"
    | "Laticínios"
    | "Mercearia"
    | "Frutas"
    | "Legumes/Verduras";
  unit: string;
  purchaseFrequency: "MONTHLY" | "BIWEEKLY" | "WEEKLY" | "DAILY";
  quantityNeeded: number;
}

export interface NutritionistMealOption {
  id: string;
  mealType:
    | "BREAKFAST"
    | "MORNING_SNACK"
    | "LUNCH"
    | "AFTERNOON_SNACK"
    | "DINNER"
    | "SUPPER";
  optionNumber: number;
  label: string;
  scheduledTime: string;
  title: string;
  description: string;
  isOptional?: boolean;
  ingredients: NutritionistIngredientSpec[];
}

/**
 * SPEC-08: Complete Official Nutritionist Meal Plan Catalog (extracted 1:1 from the 13-page PDF)
 * - 6 Breakfast options (08:30 - 09:00)
 * - 3 Morning Snack / Colação options (09:30 - Optional)
 * - 12 Lunch options (12:30)
 * - 10 Afternoon Snack / Pré-treino options (16:00)
 * - 9 Dinner options (20:00)
 * - 8 Supper / Ceia options (21:30 - 22:00 - Optional)
 */
export const NUTRITIONIST_CATALOG: NutritionistMealOption[] = [
  // =========================================================================
  // 1. DESJEJUM / CAFÉ DA MANHÃ (08:30 - 09:00) — 6 OPÇÕES OFICIAIS
  // =========================================================================
  {
    id: "BREAKFAST_OPT_1",
    mealType: "BREAKFAST",
    optionNumber: 1,
    label: "Opção 1 – Pão francês com Patê de Frango e Morango",
    scheduledTime: "08:30",
    title: "Opção 1 (Pão francês): Pão Francês + Patê de Frango + Morango",
    description:
      "1 unidade média de pão francês (50 g), Patê de frango (70 g), Morango: 100 g (aprox. 6 a 8 unidades médias).",
    ingredients: [
      {
        name: "Pão francês",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "DAILY",
        quantityNeeded: 50,
      },
      {
        name: "Patê de frango fit",
        category: "Proteínas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 70,
      },
      {
        name: "Morango",
        category: "Frutas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 100,
      },
    ],
  },
  {
    id: "BREAKFAST_OPT_2",
    mealType: "BREAKFAST",
    optionNumber: 2,
    label: "Opção 2 – Integral com Patê de Sardinha e Melancia",
    scheduledTime: "08:30",
    title: "Opção 2 (Integral): Pão Integral + Patê de Sardinha + Melancia",
    description:
      "Pão integral: 2 fatias (aprox. 50 g), Patê de sardinha: 70 g, Melancia: 1 fatia média (150 g).",
    ingredients: [
      {
        name: "Pão integral (fatias)",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 50,
      },
      {
        name: "Patê de sardinha fit",
        category: "Proteínas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 70,
      },
      {
        name: "Melancia",
        category: "Frutas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 150,
      },
    ],
  },
  {
    id: "BREAKFAST_OPT_3",
    mealType: "BREAKFAST",
    optionNumber: 3,
    label: "Opção 3 – Mais saciante (Patê de Atum + Melão + Pão)",
    scheduledTime: "08:30",
    title: "Opção 3 (Mais saciante): Patê de Atum + Melão + Pão",
    description:
      "Patê de atum: 60 g, Melão: 1 fatia média (150 g), Pão francês (50 g) ou Pão integral (50 g).",
    ingredients: [
      {
        name: "Patê de atum fit",
        category: "Proteínas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 60,
      },
      {
        name: "Melão",
        category: "Frutas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 150,
      },
      {
        name: "Pão francês",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "DAILY",
        quantityNeeded: 50,
      },
    ],
  },
  {
    id: "BREAKFAST_OPT_4",
    mealType: "BREAKFAST",
    optionNumber: 4,
    label: "Opção 4 – Proteína alta (3 Ovos Mexidos + Requeijão + Pão + Abacaxi)",
    scheduledTime: "08:30",
    title: "Opção 4 (Proteína alta): 3 Ovos Mexidos, Requeijão Light, Pão e Abacaxi",
    description:
      "Ovos mexidos: 3 unidades, Requeijão light: 20 g, Pão francês: 50 g, Abacaxi 2 fatias médias: 180 g.",
    ingredients: [
      {
        name: "Ovos de galinha",
        category: "Proteínas",
        unit: "un",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 3,
      },
      {
        name: "Requeijão light",
        category: "Laticínios",
        unit: "g",
        purchaseFrequency: "BIWEEKLY",
        quantityNeeded: 20,
      },
      {
        name: "Pão francês",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "DAILY",
        quantityNeeded: 50,
      },
      {
        name: "Abacaxi",
        category: "Frutas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 180,
      },
    ],
  },
  {
    id: "BREAKFAST_OPT_5",
    mealType: "BREAKFAST",
    optionNumber: 5,
    label: "Opção 5 – Cuscuz equilibrado (Cuscuz + Queijo Minas/Ricota + Melancia)",
    scheduledTime: "08:30",
    title: "Opção 5 (Cuscuz equilibrado): Cuscuz Cozido + Queijo Minas/Ricota + Melancia",
    description:
      "Melancia: 150 g, Cuscuz cozido: 60 g, Queijo minas, Ricota ou Cottage: 60 g, Café ou chá: 150–200 ml.",
    ingredients: [
      {
        name: "Melancia",
        category: "Frutas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 150,
      },
      {
        name: "Cuscuz (Flocão de milho)",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "MONTHLY",
        quantityNeeded: 60,
      },
      {
        name: "Queijo minas frescal / Ricota",
        category: "Laticínios",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 60,
      },
      {
        name: "Café s/ açúcar",
        category: "Mercearia",
        unit: "ml",
        purchaseFrequency: "MONTHLY",
        quantityNeeded: 150,
      },
    ],
  },
  {
    id: "BREAKFAST_OPT_6",
    mealType: "BREAKFAST",
    optionNumber: 6,
    label: "Opção 6 – Vitamina completa (Banana + Morangos + Leite + Aveia)",
    scheduledTime: "08:30",
    title: "Opção 6 (Vitamina completa): Banana, Morangos, Leite/Iogurte e Aveia",
    description:
      "Banana: 70 g, Morangos: 45 g, Leite ou iogurte: 75 ml, Aveia: 20 g.",
    ingredients: [
      {
        name: "Banana-prata",
        category: "Frutas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 70,
      },
      {
        name: "Morango",
        category: "Frutas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 45,
      },
      {
        name: "Leite semidesnatado/desnatado",
        category: "Laticínios",
        unit: "ml",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 75,
      },
      {
        name: "Aveia em flocos",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "MONTHLY",
        quantityNeeded: 20,
      },
    ],
  },

  // =========================================================================
  // 2. COLAÇÃO / LANCHE DA MANHÃ (09:30 - OPCIONAL) — 3 OPÇÕES OFICIAIS
  // =========================================================================
  {
    id: "MORNING_SNACK_OPT_1",
    mealType: "MORNING_SNACK",
    optionNumber: 1,
    label: "Opção 1 – Mexerica (120 g)",
    scheduledTime: "09:30",
    title: "Colação Opção 1: Mexerica in natura (120 g)",
    description:
      "Mexerica: 1 unidade média (120 g). Opcional — realizar caso sinta fome.",
    isOptional: true,
    ingredients: [
      {
        name: "Mexerica",
        category: "Frutas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 120,
      },
    ],
  },
  {
    id: "MORNING_SNACK_OPT_2",
    mealType: "MORNING_SNACK",
    optionNumber: 2,
    label: "Opção 2 – Maçã (130 g)",
    scheduledTime: "09:30",
    title: "Colação Opção 2: Maçã in natura (130 g)",
    description:
      "Maçã: 1 unidade média (130 g). Opcional — realizar caso sinta fome.",
    isOptional: true,
    ingredients: [
      {
        name: "Maçã",
        category: "Frutas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 130,
      },
    ],
  },
  {
    id: "MORNING_SNACK_OPT_3",
    mealType: "MORNING_SNACK",
    optionNumber: 3,
    label: "Opção 3 – Gelatina diet (100 g)",
    scheduledTime: "09:30",
    title: "Colação Opção 3: Gelatina Diet (100 g)",
    description:
      "Gelatina diet: 1 porção (100 g). Opcional — realizar caso sinta fome.",
    isOptional: true,
    ingredients: [
      {
        name: "Gelatina diet",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "MONTHLY",
        quantityNeeded: 100,
      },
    ],
  },

  // =========================================================================
  // 3. REFEIÇÃO PRINCIPAL – ALMOÇO (12:30) — 12 OPÇÕES OFICIAIS
  // =========================================================================
  {
    id: "LUNCH_OPT_1",
    mealType: "LUNCH",
    optionNumber: 1,
    label: "Opção 1 – Peito de Frango Grelhado (100g) + Arroz + Feijão + Abobrinha/Cenoura",
    scheduledTime: "12:30",
    title: "Almoço Opção 1: Peito de Frango Grelhado, Arroz, Feijão e Abobrinha/Cenoura",
    description:
      "Peito de frango grelhado: 100 g, Arroz cozido: 2 colheres de sopa (65 g), Feijão: 1 concha média (60 g), Tomate à vontade, Abobrinha ou cenoura: 120 g.",
    ingredients: [
      {
        name: "Peito de frango (filé)",
        category: "Proteínas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 100,
      },
      {
        name: "Arroz (branco ou integral)",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "MONTHLY",
        quantityNeeded: 65,
      },
      {
        name: "Feijão (carioca ou preto)",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "MONTHLY",
        quantityNeeded: 60,
      },
      {
        name: "Cenoura",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 60,
      },
      {
        name: "Abobrinha",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 60,
      },
      {
        name: "Salada (Alface, Tomate, Pepino) e Temperos",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 60,
      },
    ],
  },
  {
    id: "LUNCH_OPT_2",
    mealType: "LUNCH",
    optionNumber: 2,
    label: "Opção 2 – Patinho Grelhado (120g) + Macarrão + Molho de Tomate + Cenoura/Pimentão",
    scheduledTime: "12:30",
    title: "Almoço Opção 2: Patinho Grelhado, Macarrão ao Molho Caseiro, Cenoura e Pimentão",
    description:
      "Patinho grelhado: 120 g, Macarrão cozido: 50 g, Molho de tomate: 40 g, Cenoura: 80 g, Pimentão: 35 g, Pepino e Alface à vontade.",
    ingredients: [
      {
        name: "Patinho bovino grelhado",
        category: "Proteínas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 120,
      },
      {
        name: "Macarrão",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "MONTHLY",
        quantityNeeded: 50,
      },
      {
        name: "Molho de tomate caseiro",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "BIWEEKLY",
        quantityNeeded: 40,
      },
      {
        name: "Cenoura",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 80,
      },
      {
        name: "Pimentão e Vinagrete",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 35,
      },
      {
        name: "Salada (Alface, Tomate, Pepino) e Temperos",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 80,
      },
    ],
  },
  {
    id: "LUNCH_OPT_3",
    mealType: "LUNCH",
    optionNumber: 3,
    label: "Opção 3 – Tilápia Grelhada (100g) + Purê de Batata (90g) + Salada/Legumes",
    scheduledTime: "12:30",
    title: "Almoço Opção 3: Tilápia Grelhada, Purê de Batata e Salada/Legumes",
    description:
      "Tilápia grelhada: 100 g, Purê de batata inglesa (90 g) ou Purê de batata-doce (90 g), Salada e legumes: mínimo de 130 g.",
    ingredients: [
      {
        name: "Tilápia grelhada (filé)",
        category: "Proteínas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 100,
      },
      {
        name: "Batata inglesa (e Purê)",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 90,
      },
      {
        name: "Salada (Alface, Tomate, Pepino) e Temperos",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 130,
      },
    ],
  },
  {
    id: "LUNCH_OPT_4",
    mealType: "LUNCH",
    optionNumber: 4,
    label: "Opção 4 – Ovos (3 un) + Arroz (65g) + Feijão (60g) + Salada (150g)",
    scheduledTime: "12:30",
    title: "Almoço Opção 4: 3 Ovos, Arroz, Feijão e Salada Completa",
    description:
      "Ovos: 3 unidades, Arroz cozido: 2 colheres de sopa (65 g), Feijão: 1 concha média (60 g), Salada (alface, tomate, pepino e cenoura): 150 g.",
    ingredients: [
      {
        name: "Ovos de galinha",
        category: "Proteínas",
        unit: "un",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 3,
      },
      {
        name: "Arroz (branco ou integral)",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "MONTHLY",
        quantityNeeded: 65,
      },
      {
        name: "Feijão (carioca ou preto)",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "MONTHLY",
        quantityNeeded: 60,
      },
      {
        name: "Cenoura",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 50,
      },
      {
        name: "Salada (Alface, Tomate, Pepino) e Temperos",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 100,
      },
    ],
  },
  {
    id: "LUNCH_OPT_5",
    mealType: "LUNCH",
    optionNumber: 5,
    label: "Opção 5 – Acém Magro Grelhado (95g) + Mandioca Cozida (60g) + Brócolis (120g)",
    scheduledTime: "12:30",
    title: "Almoço Opção 5: Acém Magro Grelhado, Mandioca Cozida, Brócolis e Tomate",
    description:
      "Acém magro grelhado: 95 g, Mandioca cozida: 60 g, Brócolis: 120 g, Tomate: à vontade.",
    ingredients: [
      {
        name: "Acém magro grelhado",
        category: "Proteínas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 95,
      },
      {
        name: "Mandioca cozida",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 60,
      },
      {
        name: "Brócolis",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 120,
      },
      {
        name: "Salada (Alface, Tomate, Pepino) e Temperos",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 60,
      },
    ],
  },
  {
    id: "LUNCH_OPT_6",
    mealType: "LUNCH",
    optionNumber: 6,
    label: "Opção 6 – Patinho Grelhado (120g) + Angu/Polenta (90g) + Salada e Legumes (140g)",
    scheduledTime: "12:30",
    title: "Almoço Opção 6: Patinho Grelhado, Angu (Polenta) e Salada/Legumes",
    description:
      "Patinho grelhado: 120 g, Angu (polenta): 90 g, Salada e legumes: mínimo de 140 g.",
    ingredients: [
      {
        name: "Patinho bovino grelhado",
        category: "Proteínas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 120,
      },
      {
        name: "Angu / Polenta (Fubá)",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "MONTHLY",
        quantityNeeded: 90,
      },
      {
        name: "Salada (Alface, Tomate, Pepino) e Temperos",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 140,
      },
    ],
  },
  {
    id: "LUNCH_OPT_7",
    mealType: "LUNCH",
    optionNumber: 7,
    label: "Opção 7 – Sobrecoxa s/ Pele (115g) + Batata-Doce/Inhame (80g) + Feijão + Salada",
    scheduledTime: "12:30",
    title: "Almoço Opção 7: Sobrecoxa sem Pele, Batata-Doce/Inhame, Feijão e Salada",
    description:
      "Sobrecoxa sem pele: 115 g, Batata-doce ou inhame (cará): 80 g, Feijão: 1 concha média (60 g), Salada e legumes: 140 g.",
    ingredients: [
      {
        name: "Sobrecoxa de frango s/ pele",
        category: "Proteínas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 115,
      },
      {
        name: "Batata-doce",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 80,
      },
      {
        name: "Feijão (carioca ou preto)",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "MONTHLY",
        quantityNeeded: 60,
      },
      {
        name: "Salada (Alface, Tomate, Pepino) e Temperos",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 140,
      },
    ],
  },
  {
    id: "LUNCH_OPT_8",
    mealType: "LUNCH",
    optionNumber: 8,
    label: "Opção 8 – Fígado Bovino (100g) + Arroz c/ Brócolis e Milho + Feijão + Repolho",
    scheduledTime: "12:30",
    title: "Almoço Opção 8: Fígado Bovino, Arroz c/ Brócolis e Milho, Feijão e Repolho",
    description:
      "Fígado bovino: 100 g, Arroz com brócolis e milho: 60 g, Feijão: 60 g (opcional), Repolho verde ou roxo: 80 g.",
    ingredients: [
      {
        name: "Fígado bovino",
        category: "Proteínas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 100,
      },
      {
        name: "Arroz (branco ou integral)",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "MONTHLY",
        quantityNeeded: 60,
      },
      {
        name: "Brócolis",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 50,
      },
      {
        name: "Feijão (carioca ou preto)",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "MONTHLY",
        quantityNeeded: 60,
      },
      {
        name: "Repolho verde ou roxo",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 80,
      },
    ],
  },
  {
    id: "LUNCH_OPT_9",
    mealType: "LUNCH",
    optionNumber: 9,
    label: "Opção 9 – Macarrão (70g) + Atum em Água (65g) + Lentilha (50g) + Salada Verde",
    scheduledTime: "12:30",
    title: "Almoço Opção 9: Macarrão com Atum em Água, Lentilha Cozida e Salada Verde",
    description:
      "Macarrão cozido: 70 g, Atum em água escorrido: 65 g, Lentilha cozida: 50 g, Tomate à vontade, Salada verde: 80 g.",
    ingredients: [
      {
        name: "Macarrão",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "MONTHLY",
        quantityNeeded: 70,
      },
      {
        name: "Atum em água (escorrido)",
        category: "Proteínas",
        unit: "g",
        purchaseFrequency: "BIWEEKLY",
        quantityNeeded: 65,
      },
      {
        name: "Lentilha cozida",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "MONTHLY",
        quantityNeeded: 50,
      },
      {
        name: "Salada (Alface, Tomate, Pepino) e Temperos",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 80,
      },
    ],
  },
  {
    id: "LUNCH_OPT_10",
    mealType: "LUNCH",
    optionNumber: 10,
    label: "Opção 10 – Frango Desfiado (120g) + Batata-Baroa (50g) + Abobrinha + Beterraba",
    scheduledTime: "12:30",
    title: "Almoço Opção 10: Frango Desfiado, Batata-Baroa, Abobrinha, Beterraba e Alface",
    description:
      "Frango desfiado: 120 g, Batata-baroa (mandioquinha): 50 g, Abobrinha: 50 g, Beterraba: 60 g, Alface à vontade.",
    ingredients: [
      {
        name: "Frango desfiado (peito cozido)",
        category: "Proteínas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 120,
      },
      {
        name: "Batata-baroa (mandioquinha)",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 50,
      },
      {
        name: "Abobrinha",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 50,
      },
      {
        name: "Beterraba",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 60,
      },
      {
        name: "Salada (Alface, Tomate, Pepino) e Temperos",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 60,
      },
    ],
  },
  {
    id: "LUNCH_OPT_11",
    mealType: "LUNCH",
    optionNumber: 11,
    label: "Opção 11 – Lasanha de Berinjela (120-160g) + Alface e Tomate",
    scheduledTime: "12:30",
    title: "Almoço Opção 11: Lasanha de Berinjela Fit + Salada de Alface e Tomate",
    description:
      "Lasanha de berinjela: 160–120 g (berinjela, carne moída magra, molho caseiro, ricota e muçarela), Alface à vontade, Tomate à vontade.",
    ingredients: [
      {
        name: "Berinjela (p/ Lasanha)",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 150,
      },
      {
        name: "Patinho bovino grelhado",
        category: "Proteínas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 100,
      },
      {
        name: "Molho de tomate caseiro",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "BIWEEKLY",
        quantityNeeded: 60,
      },
      {
        name: "Queijo minas frescal / Ricota",
        category: "Laticínios",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 40,
      },
      {
        name: "Queijo muçarela",
        category: "Laticínios",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 20,
      },
      {
        name: "Salada (Alface, Tomate, Pepino) e Temperos",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 80,
      },
    ],
  },
  {
    id: "LUNCH_OPT_12",
    mealType: "LUNCH",
    optionNumber: 12,
    label: "Opção 12 – Panqueca Saudável (2 un c/ Frango/Carne 80g) + Molho + Salada",
    scheduledTime: "12:30",
    title: "Almoço Opção 12: Panqueca Saudável (2 un) c/ Frango ou Carne Magra + Salada",
    description:
      "Panqueca saudável: 2 unidades médias recheadas com frango desfiado ou carne moída magra (80 g), Molho de tomate: 60 g, Alface à vontade, Pepino: 50 g.",
    ingredients: [
      {
        name: "Aveia em flocos",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "MONTHLY",
        quantityNeeded: 30,
      },
      {
        name: "Ovos de galinha",
        category: "Proteínas",
        unit: "un",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 1,
      },
      {
        name: "Frango desfiado (peito cozido)",
        category: "Proteínas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 80,
      },
      {
        name: "Molho de tomate caseiro",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "BIWEEKLY",
        quantityNeeded: 60,
      },
      {
        name: "Salada (Alface, Tomate, Pepino) e Temperos",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 80,
      },
    ],
  },

  // =========================================================================
  // 4. LANCHE DA TARDE / PRÉ-TREINO (16:00) — 10 OPÇÕES OFICIAIS
  // =========================================================================
  {
    id: "AFTERNOON_SNACK_OPT_1",
    mealType: "AFTERNOON_SNACK",
    optionNumber: 1,
    label: "Opção 1 – Pão Francês (50g) + 2 Ovos + Tomate + Mamão (100g)",
    scheduledTime: "16:00",
    title: "Lanche Opção 1: Pão Francês c/ 2 Ovos, Tomate e Mamão",
    description:
      "Pão francês: 50 g, Ovo: 2 unidades (cozido ou mexido), Tomate à vontade, Mamão: 100 g.",
    ingredients: [
      {
        name: "Pão francês",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "DAILY",
        quantityNeeded: 50,
      },
      {
        name: "Ovos de galinha",
        category: "Proteínas",
        unit: "un",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 2,
      },
      {
        name: "Salada (Alface, Tomate, Pepino) e Temperos",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 40,
      },
      {
        name: "Mamão",
        category: "Frutas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 100,
      },
    ],
  },
  {
    id: "AFTERNOON_SNACK_OPT_2",
    mealType: "AFTERNOON_SNACK",
    optionNumber: 2,
    label: "Opção 2 – Pão Integral (50g) + Frango Desfiado (80g) + Requeijão Light + Melancia",
    scheduledTime: "16:00",
    title: "Lanche Opção 2: Sanduíche Natural de Frango c/ Requeijão Light + Melancia",
    description:
      "Pão integral: 50 g (2 fatias), Frango desfiado: 80 g, Requeijão light: 15 g, Alface e Tomate à vontade, Melancia: 100 g.",
    ingredients: [
      {
        name: "Pão integral (fatias)",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 50,
      },
      {
        name: "Frango desfiado (peito cozido)",
        category: "Proteínas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 80,
      },
      {
        name: "Requeijão light",
        category: "Laticínios",
        unit: "g",
        purchaseFrequency: "BIWEEKLY",
        quantityNeeded: 15,
      },
      {
        name: "Salada (Alface, Tomate, Pepino) e Temperos",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 40,
      },
      {
        name: "Melancia",
        category: "Frutas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 100,
      },
    ],
  },
  {
    id: "AFTERNOON_SNACK_OPT_3",
    mealType: "AFTERNOON_SNACK",
    optionNumber: 3,
    label: "Opção 3 – Pizza de Frigideira Rap10 (Frango + Muçarela + Molho) + Uva (80g)",
    scheduledTime: "16:00",
    title: "Lanche Opção 3: Pizza de Frigideira Rap10 c/ Frango e Muçarela + Uva",
    description:
      "Massa Rap10 integral: 1 unidade (40 g), Molho de tomate: 30 g, Muçarela ou queijo minas padrão: 30 g, Frango desfiado: 60 g, Tomate à vontade, Orégano a gosto, Uva: 80 g.",
    ingredients: [
      {
        name: "Rap10 integral",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "BIWEEKLY",
        quantityNeeded: 40,
      },
      {
        name: "Molho de tomate caseiro",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "BIWEEKLY",
        quantityNeeded: 30,
      },
      {
        name: "Queijo muçarela",
        category: "Laticínios",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 30,
      },
      {
        name: "Frango desfiado (peito cozido)",
        category: "Proteínas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 60,
      },
      {
        name: "Uva",
        category: "Frutas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 80,
      },
    ],
  },
  {
    id: "AFTERNOON_SNACK_OPT_4",
    mealType: "AFTERNOON_SNACK",
    optionNumber: 4,
    label: "Opção 4 – Banana-Prata Assada (80g) + 2 Ovos Mexidos + Queijo Muçarela/Minas (30g)",
    scheduledTime: "16:00",
    title: "Lanche Opção 4: Banana-Prata Assada + 2 Ovos Mexidos c/ Queijo",
    description:
      "Banana-prata assada: 80 g, Ovos mexidos: 2 unidades, Queijo muçarela ou minas: 30 g.",
    ingredients: [
      {
        name: "Banana-prata",
        category: "Frutas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 80,
      },
      {
        name: "Ovos de galinha",
        category: "Proteínas",
        unit: "un",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 2,
      },
      {
        name: "Queijo muçarela",
        category: "Laticínios",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 30,
      },
    ],
  },
  {
    id: "AFTERNOON_SNACK_OPT_5",
    mealType: "AFTERNOON_SNACK",
    optionNumber: 5,
    label: "Opção 5 – Banana-Prata (80g) + Pão (50-60g) + Patê de Frango/Sardinha (60g) + Café",
    scheduledTime: "16:00",
    title: "Lanche Opção 5: Pão c/ Patê Fit + Banana-Prata + Café ou Chá",
    description:
      "1 Banana-prata: 80 g, Pão francês (50 g) ou pão integral (60 g / 2 fatias), Patê de frango ou de sardinha: 60 g, Café ou chá: 150–200 ml.",
    ingredients: [
      {
        name: "Banana-prata",
        category: "Frutas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 80,
      },
      {
        name: "Pão integral (fatias)",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 60,
      },
      {
        name: "Patê de frango fit",
        category: "Proteínas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 60,
      },
      {
        name: "Café s/ açúcar",
        category: "Mercearia",
        unit: "ml",
        purchaseFrequency: "MONTHLY",
        quantityNeeded: 150,
      },
    ],
  },
  {
    id: "AFTERNOON_SNACK_OPT_6",
    mealType: "AFTERNOON_SNACK",
    optionNumber: 6,
    label: "Opção 6 – Vitamina de Abacate (60g) + Leite (150ml) + Gelo e Canela",
    scheduledTime: "16:00",
    title: "Lanche Opção 6: Vitamina Cremosa de Abacate c/ Leite e Canela",
    description:
      "Abacate: 60 g, Leite integral: 150 ml, Gelo à vontade, Canela a gosto (sem adição de açúcar).",
    ingredients: [
      {
        name: "Abacate",
        category: "Frutas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 60,
      },
      {
        name: "Leite semidesnatado/desnatado",
        category: "Laticínios",
        unit: "ml",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 150,
      },
    ],
  },
  {
    id: "AFTERNOON_SNACK_OPT_7",
    mealType: "AFTERNOON_SNACK",
    optionNumber: 7,
    label: "Opção 7 – Ovo Cozido (3 un) + Morangos (100g)",
    scheduledTime: "16:00",
    title: "Lanche Opção 7: 3 Ovos Cozidos + Morangos Frescos (100g)",
    description:
      "Ovo cozido: 3 unidades, Morangos: 100 g (8 a 10 unidades médias).",
    ingredients: [
      {
        name: "Ovos de galinha",
        category: "Proteínas",
        unit: "un",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 3,
      },
      {
        name: "Morango",
        category: "Frutas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 100,
      },
    ],
  },
  {
    id: "AFTERNOON_SNACK_OPT_8",
    mealType: "AFTERNOON_SNACK",
    optionNumber: 8,
    label: "Opção 8 – Hambúrguer Caseiro de Patinho/Frango (140g) + Pão Integral (60g) + Salada",
    scheduledTime: "16:00",
    title: "Lanche Opção 8: Hambúrguer Artesanal Fit no Pão Integral",
    description:
      "Hambúrguer bovino magro (patinho) ou de frango: 140 g, Pão integral: 60 g, Alface e Tomate à vontade.",
    ingredients: [
      {
        name: "Hambúrguer caseiro de patinho",
        category: "Proteínas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 140,
      },
      {
        name: "Pão integral (fatias)",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 60,
      },
      {
        name: "Salada (Alface, Tomate, Pepino) e Temperos",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 50,
      },
    ],
  },
  {
    id: "AFTERNOON_SNACK_OPT_9",
    mealType: "AFTERNOON_SNACK",
    optionNumber: 9,
    label: "Opção 9 – Salada de Frutas (140g) + 2 Ovos Cozidos + Queijo Minas Frescal (60g)",
    scheduledTime: "16:00",
    title: "Lanche Opção 9: Salada de Frutas (140g) + 2 Ovos Cozidos + Queijo Minas",
    description:
      "Salada de frutas: 140 g (mamão, banana, maçã, morango sem açúcar) acompanhada de Ovo cozido: 2 unidades e Queijo minas frescal: 60 g.",
    ingredients: [
      {
        name: "Mamão",
        category: "Frutas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 50,
      },
      {
        name: "Banana-prata",
        category: "Frutas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 45,
      },
      {
        name: "Maçã",
        category: "Frutas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 45,
      },
      {
        name: "Ovos de galinha",
        category: "Proteínas",
        unit: "un",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 2,
      },
      {
        name: "Queijo minas frescal / Ricota",
        category: "Laticínios",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 60,
      },
    ],
  },
  {
    id: "AFTERNOON_SNACK_OPT_10",
    mealType: "AFTERNOON_SNACK",
    optionNumber: 10,
    label: "Opção 10 – Panqueca/Mix de Banana-Prata (80g) + 2 Ovos + Aveia (15g)",
    scheduledTime: "16:00",
    title: "Lanche Opção 10: Banana-Prata c/ Aveia + 2 Ovos (ou Panqueca de Banana)",
    description:
      "1 Banana-prata: 80 g, Ovo: 2 unidades, Aveia (para a banana): 15 g (1 colher de sopa).",
    ingredients: [
      {
        name: "Banana-prata",
        category: "Frutas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 80,
      },
      {
        name: "Ovos de galinha",
        category: "Proteínas",
        unit: "un",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 2,
      },
      {
        name: "Aveia em flocos",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "MONTHLY",
        quantityNeeded: 15,
      },
    ],
  },

  // =========================================================================
  // 5. JANTAR (20:00) — 9 OPÇÕES OFICIAIS
  // =========================================================================
  {
    id: "DINNER_OPT_1",
    mealType: "DINNER",
    optionNumber: 1,
    label: "Opção 1 – Hambúrguer Caseiro de Patinho/Frango (140g) + Pão Integral (60g) + Salada",
    scheduledTime: "20:00",
    title: "Jantar Opção 1: Hambúrguer Caseiro de Patinho/Frango no Pão Integral",
    description:
      "Hambúrguer caseiro (patinho ou frango): 140 g, Pão integral: 60 g (2 fatias ou 1 pão para hambúrguer integral), Alface e Tomate à vontade.",
    ingredients: [
      {
        name: "Hambúrguer caseiro de patinho",
        category: "Proteínas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 140,
      },
      {
        name: "Pão integral (fatias)",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 60,
      },
      {
        name: "Salada (Alface, Tomate, Pepino) e Temperos",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 60,
      },
    ],
  },
  {
    id: "DINNER_OPT_2",
    mealType: "DINNER",
    optionNumber: 2,
    label: "Opção 2 – Carne Bovina Magra (120g) + Cenoura (50g) + Batata-Baroa (65g) + Chuchu/Couve",
    scheduledTime: "20:00",
    title: "Jantar Opção 2: Carne Bovina Magra, Batata-Baroa, Cenoura, Chuchu e Couve",
    description:
      "Carne bovina magra: 120 g, Cenoura: 50 g, Batata-baroa (mandioquinha): 65 g, Cebolinha a gosto, Outros legumes (chuchu, couve): à vontade.",
    ingredients: [
      {
        name: "Patinho bovino grelhado",
        category: "Proteínas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 120,
      },
      {
        name: "Cenoura",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 50,
      },
      {
        name: "Batata-baroa (mandioquinha)",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 65,
      },
      {
        name: "Salada (Alface, Tomate, Pepino) e Temperos",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 80,
      },
    ],
  },
  {
    id: "DINNER_OPT_3",
    mealType: "DINNER",
    optionNumber: 3,
    label: "Opção 3 – Frango Desfiado (120g) + Batata-Baroa (65g) + Cebolinha e Legumes",
    scheduledTime: "20:00",
    title: "Jantar Opção 3: Frango Desfiado c/ Batata-Baroa e Legumes",
    description:
      "Frango desfiado: 120 g, Batata-baroa (mandioquinha): 65 g, Cebolinha e temperos naturais a gosto, Outros legumes à vontade.",
    ingredients: [
      {
        name: "Frango desfiado (peito cozido)",
        category: "Proteínas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 120,
      },
      {
        name: "Batata-baroa (mandioquinha)",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 65,
      },
      {
        name: "Salada (Alface, Tomate, Pepino) e Temperos",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 80,
      },
    ],
  },
  {
    id: "DINNER_OPT_4",
    mealType: "DINNER",
    optionNumber: 4,
    label: "Opção 4 – Polenta/Angu (90g) + Carne Moída Magra/Patinho (100g) + Molho de Tomate",
    scheduledTime: "20:00",
    title: "Jantar Opção 4: Polenta (Angu) c/ Carne Moída Magra ao Molho Caseiro",
    description:
      "Polenta (angu): 90 g, Carne moída magra (patinho): 100 g, Molho de tomate: 40 g.",
    ingredients: [
      {
        name: "Angu / Polenta (Fubá)",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "MONTHLY",
        quantityNeeded: 90,
      },
      {
        name: "Patinho bovino grelhado",
        category: "Proteínas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 100,
      },
      {
        name: "Molho de tomate caseiro",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "BIWEEKLY",
        quantityNeeded: 40,
      },
    ],
  },
  {
    id: "DINNER_OPT_5",
    mealType: "DINNER",
    optionNumber: 5,
    label: "Opção 5 (Vitamina) – Leite (150ml) + Aveia (15g) + Banana-Prata (80g) + 1 Ovo",
    scheduledTime: "20:00",
    title: "Jantar Opção 5 (Vitamina): Leite, Banana-Prata, Aveia e Canela (+ 1 Ovo)",
    description:
      "Leite integral: 150 ml, Aveia: 15 g, Banana-prata: 80 g, Canela a gosto (+ 1 ovo cozido opcional pós-treino).",
    ingredients: [
      {
        name: "Leite semidesnatado/desnatado",
        category: "Laticínios",
        unit: "ml",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 150,
      },
      {
        name: "Aveia em flocos",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "MONTHLY",
        quantityNeeded: 15,
      },
      {
        name: "Banana-prata",
        category: "Frutas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 80,
      },
      {
        name: "Ovos de galinha",
        category: "Proteínas",
        unit: "un",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 1,
      },
    ],
  },
  {
    id: "DINNER_OPT_6",
    mealType: "DINNER",
    optionNumber: 6,
    label: "Opção 6 – Arroz Cozido (80g) + Frango Desfiado (120g) + Brócolis + Ervilha (50g)",
    scheduledTime: "20:00",
    title: "Jantar Opção 6: Frango Desfiado, Arroz, Brócolis e Ervilha",
    description:
      "Arroz cozido: 80 g, Frango desfiado: 120 g, Brócolis: à vontade, Ervilha: 50 g.",
    ingredients: [
      {
        name: "Arroz (branco ou integral)",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "MONTHLY",
        quantityNeeded: 80,
      },
      {
        name: "Frango desfiado (peito cozido)",
        category: "Proteínas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 120,
      },
      {
        name: "Brócolis",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 100,
      },
      {
        name: "Ervilha fresca/congelada",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "BIWEEKLY",
        quantityNeeded: 50,
      },
    ],
  },
  {
    id: "DINNER_OPT_7",
    mealType: "DINNER",
    optionNumber: 7,
    label: "Opção 7 – Rap10 Integral (1 un) + Muçarela/Ricota (30g) + 2 Ovos Picados + Tomate",
    scheduledTime: "20:00",
    title: "Jantar Opção 7: Wrap Rap10 Integral c/ 2 Ovos Cozidos, Queijo e Tomate",
    description:
      "Rap10 integral: 1 unidade (40 g), Queijo muçarela ou Ricota cremosa: 30 g, Ovo cozido picado: 2 unidades, Tomate à vontade.",
    ingredients: [
      {
        name: "Rap10 integral",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "BIWEEKLY",
        quantityNeeded: 40,
      },
      {
        name: "Queijo muçarela",
        category: "Laticínios",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 30,
      },
      {
        name: "Ovos de galinha",
        category: "Proteínas",
        unit: "un",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 2,
      },
      {
        name: "Salada (Alface, Tomate, Pepino) e Temperos",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 50,
      },
    ],
  },
  {
    id: "DINNER_OPT_8",
    mealType: "DINNER",
    optionNumber: 8,
    label: "Opção 8 – Carne Bovina Magra (100g) + Batata Cozida/Assada (70g) + Abobrinha + Brócolis",
    scheduledTime: "20:00",
    title: "Jantar Opção 8: Carne Bovina Magra, Batata Assada, Abobrinha e Brócolis",
    description:
      "Carne bovina magra: 100 g, Batata cozida ou assada: 70 g, Abobrinha: 65 g, Brócolis: à vontade.",
    ingredients: [
      {
        name: "Patinho bovino grelhado",
        category: "Proteínas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 100,
      },
      {
        name: "Batata inglesa (e Purê)",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 70,
      },
      {
        name: "Abobrinha",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 65,
      },
      {
        name: "Brócolis",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 90,
      },
    ],
  },
  {
    id: "DINNER_OPT_9",
    mealType: "DINNER",
    optionNumber: 9,
    label: "Opção 9 – Arroz Cozido (80g) + Feijão (60g) + 2 Ovos Mexidos + Vinagrete (50g)",
    scheduledTime: "20:00",
    title: "Jantar Opção 9: Arroz, Feijão, 2 Ovos Mexidos e Vinagrete",
    description:
      "Arroz cozido: 80 g, Feijão: 60 g, Ovos mexidos: 2 unidades, Vinagrete: 50 g.",
    ingredients: [
      {
        name: "Arroz (branco ou integral)",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "MONTHLY",
        quantityNeeded: 80,
      },
      {
        name: "Feijão (carioca ou preto)",
        category: "Mercearia",
        unit: "g",
        purchaseFrequency: "MONTHLY",
        quantityNeeded: 60,
      },
      {
        name: "Ovos de galinha",
        category: "Proteínas",
        unit: "un",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 2,
      },
      {
        name: "Pimentão e Vinagrete",
        category: "Legumes/Verduras",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 50,
      },
    ],
  },

  // =========================================================================
  // 6. CEIA (21:30 - 22:00 - SE NECESSÁRIO) — 8 OPÇÕES OFICIAIS DO PDF
  // =========================================================================
  {
    id: "SUPPER_OPT_1",
    mealType: "SUPPER",
    optionNumber: 1,
    label: "Opção 1 – Morangos (80g / 5 un) + Chá sem açúcar (150ml)",
    scheduledTime: "21:30",
    title: "Ceia Opção 1: Morangos (80g) + Chá Relaxante s/ Açúcar",
    description:
      "Morangos: 5 unidades (80 g) + Chá sem açúcar (camomila, erva-doce, cidreira ou hortelã): 150 ml.",
    isOptional: true,
    ingredients: [
      {
        name: "Morango",
        category: "Frutas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 80,
      },
      {
        name: "Chá sem açúcar (Camomila/Hortelã)",
        category: "Mercearia",
        unit: "ml",
        purchaseFrequency: "MONTHLY",
        quantityNeeded: 150,
      },
    ],
  },
  {
    id: "SUPPER_OPT_2",
    mealType: "SUPPER",
    optionNumber: 2,
    label: "Opção 2 – Melancia (150g) + Chá sem açúcar (150ml)",
    scheduledTime: "21:30",
    title: "Ceia Opção 2: Melancia (150g) + Chá s/ Açúcar",
    description:
      "Melancia: 100–160 g + Chá sem açúcar (camomila, erva-doce, cidreira ou hortelã): 150 ml.",
    isOptional: true,
    ingredients: [
      {
        name: "Melancia",
        category: "Frutas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 150,
      },
      {
        name: "Chá sem açúcar (Camomila/Hortelã)",
        category: "Mercearia",
        unit: "ml",
        purchaseFrequency: "MONTHLY",
        quantityNeeded: 150,
      },
    ],
  },
  {
    id: "SUPPER_OPT_3",
    mealType: "SUPPER",
    optionNumber: 3,
    label: "Opção 3 – Melão (150g) + Chá sem açúcar (150ml)",
    scheduledTime: "21:30",
    title: "Ceia Opção 3: Melão (150g) + Chá s/ Açúcar",
    description:
      "Melão: 100–160 g + Chá sem açúcar (camomila, erva-doce, cidreira ou hortelã): 150 ml.",
    isOptional: true,
    ingredients: [
      {
        name: "Melão",
        category: "Frutas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 150,
      },
      {
        name: "Chá sem açúcar (Camomila/Hortelã)",
        category: "Mercearia",
        unit: "ml",
        purchaseFrequency: "MONTHLY",
        quantityNeeded: 150,
      },
    ],
  },
  {
    id: "SUPPER_OPT_4",
    mealType: "SUPPER",
    optionNumber: 4,
    label: "Opção 4 – Mexerica (130g) + Chá sem açúcar (150ml)",
    scheduledTime: "21:30",
    title: "Ceia Opção 4: Mexerica (130g) + Chá s/ Açúcar",
    description:
      "Mexerica: 1 unidade média (120–140 g) + Chá sem açúcar: 150 ml.",
    isOptional: true,
    ingredients: [
      {
        name: "Mexerica",
        category: "Frutas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 130,
      },
      {
        name: "Chá sem açúcar (Camomila/Hortelã)",
        category: "Mercearia",
        unit: "ml",
        purchaseFrequency: "MONTHLY",
        quantityNeeded: 150,
      },
    ],
  },
  {
    id: "SUPPER_OPT_5",
    mealType: "SUPPER",
    optionNumber: 5,
    label: "Opção 5 – Laranja (130g) + Chá sem açúcar (150ml)",
    scheduledTime: "21:30",
    title: "Ceia Opção 5: Laranja (130g) + Chá s/ Açúcar",
    description:
      "Laranja: 1 unidade média (130 g) + Chá sem açúcar: 150 ml.",
    isOptional: true,
    ingredients: [
      {
        name: "Laranja",
        category: "Frutas",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 130,
      },
      {
        name: "Chá sem açúcar (Camomila/Hortelã)",
        category: "Mercearia",
        unit: "ml",
        purchaseFrequency: "MONTHLY",
        quantityNeeded: 150,
      },
    ],
  },
  {
    id: "SUPPER_OPT_6",
    mealType: "SUPPER",
    optionNumber: 6,
    label: "Opção 6 (Proteica Leve) – Leite Morno (130ml)",
    scheduledTime: "21:30",
    title: "Ceia Opção 6: Leite Morno (130 ml)",
    description:
      "Leite morno: 130 ml (copo americano padrão). Consumir apenas em caso de fome física.",
    isOptional: true,
    ingredients: [
      {
        name: "Leite semidesnatado/desnatado",
        category: "Laticínios",
        unit: "ml",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 130,
      },
    ],
  },
  {
    id: "SUPPER_OPT_7",
    mealType: "SUPPER",
    optionNumber: 7,
    label: "Opção 7 (Proteica Leve) – Queijo Minas Frescal (40g) + Chá sem açúcar",
    scheduledTime: "21:30",
    title: "Ceia Opção 7: Queijo Minas Frescal (40g) + Chá Relaxante",
    description:
      "Queijo minas frescal: 40 g + Chá sem açúcar (150 ml).",
    isOptional: true,
    ingredients: [
      {
        name: "Queijo minas frescal / Ricota",
        category: "Laticínios",
        unit: "g",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 40,
      },
      {
        name: "Chá sem açúcar (Camomila/Hortelã)",
        category: "Mercearia",
        unit: "ml",
        purchaseFrequency: "MONTHLY",
        quantityNeeded: 150,
      },
    ],
  },
  {
    id: "SUPPER_OPT_8",
    mealType: "SUPPER",
    optionNumber: 8,
    label: "Opção 8 (Proteica Leve) – Ovo Cozido (2 unidades / 80g)",
    scheduledTime: "21:30",
    title: "Ceia Opção 8: 2 Ovos Cozidos (80g)",
    description:
      "Ovo cozido: 2 unidades (80 g). Consumir em caso de fome física noturna.",
    isOptional: true,
    ingredients: [
      {
        name: "Ovos de galinha",
        category: "Proteínas",
        unit: "un",
        purchaseFrequency: "WEEKLY",
        quantityNeeded: 2,
      },
    ],
  },
];
