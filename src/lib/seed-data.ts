import { prisma, ensureWalMode } from "./prisma";
import { hashPassword } from "./auth";
import { getCurrentIsoWeek } from "./week-cycle";

export interface SeedIngredientDef {
  name: string;
  category: "Proteínas" | "Laticínios" | "Mercearia" | "Frutas" | "Legumes/Verduras";
  unit: string;
  purchaseFrequency: "MONTHLY" | "BIWEEKLY" | "WEEKLY" | "DAILY";
  weeklyNeed: number;
  monthlyNeed: number;
  inStock: boolean;
  boughtForWeek: boolean;
  notes?: string;
}

// Default Balanced Meal Plan Template (Sample Seed) — 39 catalog & grocery items
export const INITIAL_INGREDIENTS: SeedIngredientDef[] = [
  // PROTEÍNAS (8)
  { name: "Peito de frango (filé)", category: "Proteínas", unit: "g", purchaseFrequency: "WEEKLY", weeklyNeed: 200, monthlyNeed: 800, inStock: true, boughtForWeek: true, notes: "Almoço Seg e Qua (100g/dia)" },
  { name: "Frango desfiado (peito cozido)", category: "Proteínas", unit: "g", purchaseFrequency: "WEEKLY", weeklyNeed: 520, monthlyNeed: 2080, inStock: true, boughtForWeek: true, notes: "Lanches, Jantares e Pizza Rap10" },
  { name: "Patê de frango fit", category: "Proteínas", unit: "g", purchaseFrequency: "WEEKLY", weeklyNeed: 200, monthlyNeed: 800, inStock: false, boughtForWeek: true, notes: "Café Ter/Qui (70g) e Lanche Dom (60g)" },
  { name: "Patinho bovino grelhado", category: "Proteínas", unit: "g", purchaseFrequency: "WEEKLY", weeklyNeed: 340, monthlyNeed: 1360, inStock: true, boughtForWeek: false, notes: "Almoço Ter/Sex (120g) e Jantar Ter (100g)" },
  { name: "Hambúrguer caseiro de patinho", category: "Proteínas", unit: "g", purchaseFrequency: "WEEKLY", weeklyNeed: 280, monthlyNeed: 1120, inStock: true, boughtForWeek: true, notes: "Jantar Qua (140g) e Lanche Sáb (140g)" },
  { name: "Sobrecoxa de frango s/ pele", category: "Proteínas", unit: "g", purchaseFrequency: "WEEKLY", weeklyNeed: 115, monthlyNeed: 460, inStock: false, boughtForWeek: false, notes: "Almoço de Sábado (115g)" },
  { name: "Tilápia grelhada (filé)", category: "Proteínas", unit: "g", purchaseFrequency: "WEEKLY", weeklyNeed: 100, monthlyNeed: 400, inStock: false, boughtForWeek: false, notes: "Almoço de Quinta-feira (100g)" },
  { name: "Ovos de galinha", category: "Proteínas", unit: "un", purchaseFrequency: "WEEKLY", weeklyNeed: 16, monthlyNeed: 64, inStock: true, boughtForWeek: true, notes: "Café Seg/Qua (3), Lanche Ter (2), Sex (2), Sáb (2), Dom (4)" },

  // LATICÍNIOS (4)
  { name: "Requeijão light", category: "Laticínios", unit: "g", purchaseFrequency: "BIWEEKLY", weeklyNeed: 70, monthlyNeed: 280, inStock: true, boughtForWeek: true, notes: "Café Seg/Qua (20g) e Lanche Seg/Qui (15g)" },
  { name: "Queijo muçarela", category: "Laticínios", unit: "g", purchaseFrequency: "WEEKLY", weeklyNeed: 90, monthlyNeed: 360, inStock: true, boughtForWeek: true, notes: "Pizza Rap10 Qua/Sex (30g) e Jantar Sáb (30g)" },
  { name: "Queijo minas frescal / Ricota", category: "Laticínios", unit: "g", purchaseFrequency: "WEEKLY", weeklyNeed: 160, monthlyNeed: 640, inStock: false, boughtForWeek: false, notes: "Ceia Sex (40g) e Café Sáb/Dom (60g)" },
  { name: "Leite semidesnatado/desnatado", category: "Laticínios", unit: "ml", purchaseFrequency: "WEEKLY", weeklyNeed: 225, monthlyNeed: 900, inStock: true, boughtForWeek: true, notes: "Vitamina Sex (75ml) e Dom (150ml)" },

  // MERCEARIA & PANIFICAÇÃO (11)
  { name: "Pão francês", category: "Mercearia", unit: "g", purchaseFrequency: "DAILY", weeklyNeed: 200, monthlyNeed: 800, inStock: false, boughtForWeek: false, notes: "Café Seg, Ter, Qua, Qui (50g = 1 un/dia)" },
  { name: "Pão integral (fatias)", category: "Mercearia", unit: "g", purchaseFrequency: "WEEKLY", weeklyNeed: 280, monthlyNeed: 1120, inStock: true, boughtForWeek: true, notes: "Lanches Seg/Qui (50g) e Qua/Sáb/Dom (60g)" },
  { name: "Rap10 integral", category: "Mercearia", unit: "g", purchaseFrequency: "BIWEEKLY", weeklyNeed: 120, monthlyNeed: 480, inStock: true, boughtForWeek: true, notes: "Lanche Qua/Sex (40g) e Jantar Sáb (40g)" },
  { name: "Arroz (branco ou integral)", category: "Mercearia", unit: "g", purchaseFrequency: "MONTHLY", weeklyNeed: 435, monthlyNeed: 1740, inStock: true, boughtForWeek: true, notes: "Peso cozido nas refeições de Seg, Qua, Qui, Sex, Dom" },
  { name: "Feijão (carioca ou preto)", category: "Mercearia", unit: "g", purchaseFrequency: "MONTHLY", weeklyNeed: 300, monthlyNeed: 1200, inStock: true, boughtForWeek: true, notes: "Almoço Seg/Qua/Sáb/Dom e Jantar Sex (60g)" },
  { name: "Macarrão", category: "Mercearia", unit: "g", purchaseFrequency: "MONTHLY", weeklyNeed: 100, monthlyNeed: 400, inStock: true, boughtForWeek: true, notes: "Almoço Terça e Sexta (50g)" },
  { name: "Aveia em flocos", category: "Mercearia", unit: "g", purchaseFrequency: "MONTHLY", weeklyNeed: 50, monthlyNeed: 200, inStock: true, boughtForWeek: true, notes: "Lanche Ter (15g), Café Sex (20g), Jantar Dom (15g)" },
  { name: "Cuscuz (Flocão de milho)", category: "Mercearia", unit: "g", purchaseFrequency: "MONTHLY", weeklyNeed: 120, monthlyNeed: 480, inStock: true, boughtForWeek: true, notes: "Café Sábado e Domingo (60g)" },
  { name: "Molho de tomate caseiro", category: "Mercearia", unit: "g", purchaseFrequency: "BIWEEKLY", weeklyNeed: 140, monthlyNeed: 560, inStock: true, boughtForWeek: true, notes: "Almoço Ter/Sex (40g) e Pizza Rap10 Qua/Sex (30g)" },
  { name: "Café s/ açúcar", category: "Mercearia", unit: "ml", purchaseFrequency: "MONTHLY", weeklyNeed: 600, monthlyNeed: 2400, inStock: true, boughtForWeek: true, notes: "Cafés da manhã e Lanche de Domingo" },
  { name: "Chá sem açúcar (Camomila/Hortelã)", category: "Mercearia", unit: "ml", purchaseFrequency: "MONTHLY", weeklyNeed: 600, monthlyNeed: 2400, inStock: true, boughtForWeek: true, notes: "Ceias de Seg, Sex e Dom" },

  // FRUTAS (8)
  { name: "Abacaxi", category: "Frutas", unit: "g", purchaseFrequency: "WEEKLY", weeklyNeed: 360, monthlyNeed: 1440, inStock: false, boughtForWeek: false, notes: "Café da manhã Seg e Qua (180g)" },
  { name: "Maçã", category: "Frutas", unit: "g", purchaseFrequency: "WEEKLY", weeklyNeed: 520, monthlyNeed: 2080, inStock: true, boughtForWeek: true, notes: "Colação Seg, Qua, Sex e Dom (130g)" },
  { name: "Melancia", category: "Frutas", unit: "g", purchaseFrequency: "WEEKLY", weeklyNeed: 950, monthlyNeed: 3800, inStock: false, boughtForWeek: true, notes: "Lanche Seg/Qui (100g), Ceia Seg/Qua (150g), Café Sáb/Dom (150g)" },
  { name: "Morango", category: "Frutas", unit: "g", purchaseFrequency: "WEEKLY", weeklyNeed: 405, monthlyNeed: 1620, inStock: false, boughtForWeek: false, notes: "Café Ter/Qui (100g), Ceia Ter/Qui (80g), Café Sex (45g)" },
  { name: "Mexerica", category: "Frutas", unit: "g", purchaseFrequency: "WEEKLY", weeklyNeed: 360, monthlyNeed: 1440, inStock: true, boughtForWeek: true, notes: "Colação Ter, Qui e Sáb (120g)" },
  { name: "Banana-prata", category: "Frutas", unit: "g", purchaseFrequency: "WEEKLY", weeklyNeed: 310, monthlyNeed: 1240, inStock: true, boughtForWeek: true, notes: "Lanche Ter (80g), Café Sex (70g), Lanche/Jantar Dom (160g)" },
  { name: "Uva", category: "Frutas", unit: "g", purchaseFrequency: "WEEKLY", weeklyNeed: 160, monthlyNeed: 640, inStock: true, boughtForWeek: true, notes: "Lanche Quarta e Sexta (80g)" },
  { name: "Laranja", category: "Frutas", unit: "g", purchaseFrequency: "WEEKLY", weeklyNeed: 130, monthlyNeed: 520, inStock: true, boughtForWeek: true, notes: "Ceia de Sábado (130g)" },

  // LEGUMES, VERDURAS & TEMPEROS (8) -> Total = 8 + 4 + 11 + 8 + 8 = 39 itens!
  { name: "Batata inglesa (e Purê)", category: "Legumes/Verduras", unit: "g", purchaseFrequency: "WEEKLY", weeklyNeed: 160, monthlyNeed: 640, inStock: true, boughtForWeek: true, notes: "Jantar Ter (70g) e Purê de batata Qui (90g)" },
  { name: "Batata-doce", category: "Legumes/Verduras", unit: "g", purchaseFrequency: "WEEKLY", weeklyNeed: 80, monthlyNeed: 320, inStock: true, boughtForWeek: true, notes: "Almoço de Sábado (80g)" },
  { name: "Cenoura", category: "Legumes/Verduras", unit: "g", purchaseFrequency: "WEEKLY", weeklyNeed: 280, monthlyNeed: 1120, inStock: true, boughtForWeek: true, notes: "Almoço Seg/Qua (60g) e Ter/Sex (80g)" },
  { name: "Abobrinha", category: "Legumes/Verduras", unit: "g", purchaseFrequency: "WEEKLY", weeklyNeed: 185, monthlyNeed: 740, inStock: true, boughtForWeek: true, notes: "Almoço Seg/Qua (60g) e Jantar Ter (65g)" },
  { name: "Brócolis", category: "Legumes/Verduras", unit: "g", purchaseFrequency: "WEEKLY", weeklyNeed: 310, monthlyNeed: 1240, inStock: true, boughtForWeek: true, notes: "Jantar Seg/Ter/Qui e Almoço Qui" },
  { name: "Ervilha fresca/congelada", category: "Legumes/Verduras", unit: "g", purchaseFrequency: "BIWEEKLY", weeklyNeed: 100, monthlyNeed: 400, inStock: true, boughtForWeek: true, notes: "Jantar Segunda e Quinta (50g)" },
  { name: "Pimentão e Vinagrete", category: "Legumes/Verduras", unit: "g", purchaseFrequency: "WEEKLY", weeklyNeed: 120, monthlyNeed: 480, inStock: true, boughtForWeek: true, notes: "Almoço Ter/Sex (Pimentão 35g) e Jantar Sex (Vinagrete 50g)" },
  { name: "Salada (Alface, Tomate, Pepino) e Temperos", category: "Legumes/Verduras", unit: "g", purchaseFrequency: "WEEKLY", weeklyNeed: 850, monthlyNeed: 3400, inStock: true, boughtForWeek: true, notes: "Alface, Tomate, Pepino, Orégano e Canela p/ todos os dias" },
];

export interface SeedMealDef {
  dayOfWeek: number; // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
  mealType: "BREAKFAST" | "MORNING_SNACK" | "LUNCH" | "AFTERNOON_SNACK" | "DINNER" | "SUPPER";
  scheduledTime: string;
  title: string;
  description: string;
  isOptional?: boolean;
  items: { ingredientName: string; quantity: number }[];
}

export const WEEKLY_MEAL_PLAN: SeedMealDef[] = [
  // ==================== SEGUNDA-FEIRA (1) ====================
  {
    dayOfWeek: 1,
    mealType: "BREAKFAST",
    scheduledTime: "07:30",
    title: "Pão Francês c/ 3 Ovos, Requeijão Light e Abacaxi",
    description: "Pão francês 50g, 3 ovos mexidos, Requeijão light 20g, Abacaxi 180g + Café s/ açúcar",
    items: [
      { ingredientName: "Pão francês", quantity: 50 },
      { ingredientName: "Ovos de galinha", quantity: 3 },
      { ingredientName: "Requeijão light", quantity: 20 },
      { ingredientName: "Abacaxi", quantity: 180 },
      { ingredientName: "Café s/ açúcar", quantity: 150 },
    ],
  },
  {
    dayOfWeek: 1,
    mealType: "MORNING_SNACK",
    scheduledTime: "10:15",
    title: "Colação: Maçã in natura",
    description: "Maçã 130g (1 unidade média)",
    items: [{ ingredientName: "Maçã", quantity: 130 }],
  },
  {
    dayOfWeek: 1,
    mealType: "LUNCH",
    scheduledTime: "12:45",
    title: "Peito de Frango Grelhado, Arroz, Feijão e Legumes",
    description: "Peito de frango 100g, Arroz 65g, Feijão 60g, Cenoura/Abobrinha 120g, Tomate",
    items: [
      { ingredientName: "Peito de frango (filé)", quantity: 100 },
      { ingredientName: "Arroz (branco ou integral)", quantity: 65 },
      { ingredientName: "Feijão (carioca ou preto)", quantity: 60 },
      { ingredientName: "Cenoura", quantity: 60 },
      { ingredientName: "Abobrinha", quantity: 60 },
      { ingredientName: "Salada (Alface, Tomate, Pepino) e Temperos", quantity: 60 },
    ],
  },
  {
    dayOfWeek: 1,
    mealType: "AFTERNOON_SNACK",
    scheduledTime: "16:00",
    title: "Sanduíche Natural de Frango + Melancia",
    description: "2 fatias Pão integral 50g, Frango desfiado 80g, Requeijão light 15g, Alface/Tomate, Melancia 100g",
    items: [
      { ingredientName: "Pão integral (fatias)", quantity: 50 },
      { ingredientName: "Frango desfiado (peito cozido)", quantity: 80 },
      { ingredientName: "Requeijão light", quantity: 15 },
      { ingredientName: "Salada (Alface, Tomate, Pepino) e Temperos", quantity: 50 },
      { ingredientName: "Melancia", quantity: 100 },
    ],
  },
  {
    dayOfWeek: 1,
    mealType: "DINNER",
    scheduledTime: "19:30",
    title: "Arroz com Frango Desfiado, Ervilha e Brócolis",
    description: "Arroz 80g, Frango desfiado 120g, Ervilha 50g, Brócolis no vapor",
    items: [
      { ingredientName: "Arroz (branco ou integral)", quantity: 80 },
      { ingredientName: "Frango desfiado (peito cozido)", quantity: 120 },
      { ingredientName: "Ervilha fresca/congelada", quantity: 50 },
      { ingredientName: "Brócolis", quantity: 80 },
    ],
  },
  {
    dayOfWeek: 1,
    mealType: "SUPPER",
    scheduledTime: "21:45",
    title: "Melancia Fresca + Chá Calmante",
    description: "Melancia 150g + Chá sem açúcar",
    items: [
      { ingredientName: "Melancia", quantity: 150 },
      { ingredientName: "Chá sem açúcar (Camomila/Hortelã)", quantity: 200 },
    ],
  },

  // ==================== TERÇA-FEIRA (2) ====================
  {
    dayOfWeek: 2,
    mealType: "BREAKFAST",
    scheduledTime: "07:30",
    title: "Pão Francês c/ Patê de Frango Fit e Morangos",
    description: "Pão francês 50g, Patê de frango fit 70g, Morango 100g",
    items: [
      { ingredientName: "Pão francês", quantity: 50 },
      { ingredientName: "Patê de frango fit", quantity: 70 },
      { ingredientName: "Morango", quantity: 100 },
    ],
  },
  {
    dayOfWeek: 2,
    mealType: "MORNING_SNACK",
    scheduledTime: "10:15",
    title: "Colação: Mexerica",
    description: "Mexerica 120g (1 unidade média)",
    items: [{ ingredientName: "Mexerica", quantity: 120 }],
  },
  {
    dayOfWeek: 2,
    mealType: "LUNCH",
    scheduledTime: "12:45",
    title: "Patinho Grelhado c/ Macarrão ao Molho Caseiro e Salada",
    description: "Patinho grelhado 120g, Macarrão 50g, Molho de tomate 40g, Cenoura 80g, Pimentão 35g, Alface/Pepino",
    items: [
      { ingredientName: "Patinho bovino grelhado", quantity: 120 },
      { ingredientName: "Macarrão", quantity: 50 },
      { ingredientName: "Molho de tomate caseiro", quantity: 40 },
      { ingredientName: "Cenoura", quantity: 80 },
      { ingredientName: "Pimentão e Vinagrete", quantity: 35 },
      { ingredientName: "Salada (Alface, Tomate, Pepino) e Temperos", quantity: 70 },
    ],
  },
  {
    dayOfWeek: 2,
    mealType: "AFTERNOON_SNACK",
    scheduledTime: "16:00",
    title: "Panqueca / Bowl de Banana-Prata, Aveia e 2 Ovos",
    description: "Banana-prata 80g, Aveia 15g, 2 Ovos",
    items: [
      { ingredientName: "Banana-prata", quantity: 80 },
      { ingredientName: "Aveia em flocos", quantity: 15 },
      { ingredientName: "Ovos de galinha", quantity: 2 },
    ],
  },
  {
    dayOfWeek: 2,
    mealType: "DINNER",
    scheduledTime: "19:30",
    title: "Patinho Grelhado c/ Batata Inglesa, Abobrinha e Brócolis",
    description: "Patinho 100g, Batata inglesa 70g, Abobrinha 65g, Brócolis",
    items: [
      { ingredientName: "Patinho bovino grelhado", quantity: 100 },
      { ingredientName: "Batata inglesa (e Purê)", quantity: 70 },
      { ingredientName: "Abobrinha", quantity: 65 },
      { ingredientName: "Brócolis", quantity: 80 },
    ],
  },
  {
    dayOfWeek: 2,
    mealType: "SUPPER",
    scheduledTime: "21:45",
    title: "Morangos Frescos",
    description: "Morangos 80g",
    items: [{ ingredientName: "Morango", quantity: 80 }],
  },

  // ==================== QUARTA-FEIRA (3) ====================
  {
    dayOfWeek: 3,
    mealType: "BREAKFAST",
    scheduledTime: "07:30",
    title: "Pão Francês c/ 3 Ovos, Requeijão Light e Abacaxi (Igual Seg)",
    description: "Pão francês 50g, 3 ovos, Requeijão light 20g, Abacaxi 180g",
    items: [
      { ingredientName: "Pão francês", quantity: 50 },
      { ingredientName: "Ovos de galinha", quantity: 3 },
      { ingredientName: "Requeijão light", quantity: 20 },
      { ingredientName: "Abacaxi", quantity: 180 },
    ],
  },
  {
    dayOfWeek: 3,
    mealType: "MORNING_SNACK",
    scheduledTime: "10:15",
    title: "Colação: Maçã in natura",
    description: "Maçã 130g",
    items: [{ ingredientName: "Maçã", quantity: 130 }],
  },
  {
    dayOfWeek: 3,
    mealType: "LUNCH",
    scheduledTime: "12:45",
    title: "Peito de Frango Grelhado, Arroz, Feijão e Legumes (Igual Seg)",
    description: "Peito de frango 100g, Arroz 65g, Feijão 60g, Cenoura/Abobrinha 120g, Tomate",
    items: [
      { ingredientName: "Peito de frango (filé)", quantity: 100 },
      { ingredientName: "Arroz (branco ou integral)", quantity: 65 },
      { ingredientName: "Feijão (carioca ou preto)", quantity: 60 },
      { ingredientName: "Cenoura", quantity: 60 },
      { ingredientName: "Abobrinha", quantity: 60 },
      { ingredientName: "Salada (Alface, Tomate, Pepino) e Temperos", quantity: 60 },
    ],
  },
  {
    dayOfWeek: 3,
    mealType: "AFTERNOON_SNACK",
    scheduledTime: "16:00",
    title: "Pizza Rap10 de Frango c/ Muçarela + Uvas",
    description: "1 Rap10 integral 40g, Molho de tomate 30g, Muçarela 30g, Frango desfiado 60g, Tomate/Orégano, Uva 80g",
    items: [
      { ingredientName: "Rap10 integral", quantity: 40 },
      { ingredientName: "Molho de tomate caseiro", quantity: 30 },
      { ingredientName: "Queijo muçarela", quantity: 30 },
      { ingredientName: "Frango desfiado (peito cozido)", quantity: 60 },
      { ingredientName: "Salada (Alface, Tomate, Pepino) e Temperos", quantity: 40 },
      { ingredientName: "Uva", quantity: 80 },
    ],
  },
  {
    dayOfWeek: 3,
    mealType: "DINNER",
    scheduledTime: "19:30",
    title: "Hambúrguer Caseiro de Patinho no Pão Integral",
    description: "Hambúrguer caseiro de patinho 140g, 2 fatias Pão integral 60g, Alface/Tomate",
    items: [
      { ingredientName: "Hambúrguer caseiro de patinho", quantity: 140 },
      { ingredientName: "Pão integral (fatias)", quantity: 60 },
      { ingredientName: "Salada (Alface, Tomate, Pepino) e Temperos", quantity: 60 },
    ],
  },
  {
    dayOfWeek: 3,
    mealType: "SUPPER",
    scheduledTime: "21:45",
    title: "Melancia Fresca",
    description: "Melancia 150g",
    items: [{ ingredientName: "Melancia", quantity: 150 }],
  },

  // ==================== QUINTA-FEIRA (4) ====================
  {
    dayOfWeek: 4,
    mealType: "BREAKFAST",
    scheduledTime: "07:30",
    title: "Pão Francês c/ Patê de Frango Fit e Morangos (Igual Ter)",
    description: "Pão francês 50g, Patê de frango fit 70g, Morango 100g",
    items: [
      { ingredientName: "Pão francês", quantity: 50 },
      { ingredientName: "Patê de frango fit", quantity: 70 },
      { ingredientName: "Morango", quantity: 100 },
    ],
  },
  {
    dayOfWeek: 4,
    mealType: "MORNING_SNACK",
    scheduledTime: "10:15",
    title: "Colação: Mexerica",
    description: "Mexerica 120g",
    items: [{ ingredientName: "Mexerica", quantity: 120 }],
  },
  {
    dayOfWeek: 4,
    mealType: "LUNCH",
    scheduledTime: "12:45",
    title: "Tilápia Grelhada c/ Purê de Batata e Brócolis",
    description: "Tilápia grelhada 100g, Purê de batata 90g, Salada/Brócolis 130g",
    items: [
      { ingredientName: "Tilápia grelhada (filé)", quantity: 100 },
      { ingredientName: "Batata inglesa (e Purê)", quantity: 90 },
      { ingredientName: "Brócolis", quantity: 70 },
      { ingredientName: "Salada (Alface, Tomate, Pepino) e Temperos", quantity: 60 },
    ],
  },
  {
    dayOfWeek: 4,
    mealType: "AFTERNOON_SNACK",
    scheduledTime: "16:00",
    title: "Sanduíche Natural de Frango + Melancia (Igual Seg)",
    description: "2 fatias Pão integral 50g, Frango desfiado 80g, Requeijão light 15g, Alface/Tomate, Melancia 100g",
    items: [
      { ingredientName: "Pão integral (fatias)", quantity: 50 },
      { ingredientName: "Frango desfiado (peito cozido)", quantity: 80 },
      { ingredientName: "Requeijão light", quantity: 15 },
      { ingredientName: "Salada (Alface, Tomate, Pepino) e Temperos", quantity: 50 },
      { ingredientName: "Melancia", quantity: 100 },
    ],
  },
  {
    dayOfWeek: 4,
    mealType: "DINNER",
    scheduledTime: "19:30",
    title: "Arroz com Frango Desfiado, Ervilha e Brócolis (Igual Seg)",
    description: "Arroz 80g, Frango desfiado 120g, Ervilha 50g, Brócolis",
    items: [
      { ingredientName: "Arroz (branco ou integral)", quantity: 80 },
      { ingredientName: "Frango desfiado (peito cozido)", quantity: 120 },
      { ingredientName: "Ervilha fresca/congelada", quantity: 50 },
      { ingredientName: "Brócolis", quantity: 80 },
    ],
  },
  {
    dayOfWeek: 4,
    mealType: "SUPPER",
    scheduledTime: "21:45",
    title: "Morangos Frescos",
    description: "Morangos 80g",
    items: [{ ingredientName: "Morango", quantity: 80 }],
  },

  // ==================== SEXTA-FEIRA (5) ====================
  {
    dayOfWeek: 5,
    mealType: "BREAKFAST",
    scheduledTime: "07:30",
    title: "Vitamina Energética de Banana, Morango e Aveia",
    description: "Vitamina: Banana-prata 70g, Morangos 45g, Leite 75ml, Aveia 20g",
    items: [
      { ingredientName: "Banana-prata", quantity: 70 },
      { ingredientName: "Morango", quantity: 45 },
      { ingredientName: "Leite semidesnatado/desnatado", quantity: 75 },
      { ingredientName: "Aveia em flocos", quantity: 20 },
    ],
  },
  {
    dayOfWeek: 5,
    mealType: "MORNING_SNACK",
    scheduledTime: "10:15",
    title: "Colação: Maçã in natura",
    description: "Maçã 130g",
    items: [{ ingredientName: "Maçã", quantity: 130 }],
  },
  {
    dayOfWeek: 5,
    mealType: "LUNCH",
    scheduledTime: "12:45",
    title: "Patinho Grelhado c/ Macarrão ao Molho Caseiro (Igual Ter)",
    description: "Patinho grelhado 120g, Macarrão 50g, Molho de tomate 40g, Cenoura 80g, Pimentão 35g, Alface/Pepino",
    items: [
      { ingredientName: "Patinho bovino grelhado", quantity: 120 },
      { ingredientName: "Macarrão", quantity: 50 },
      { ingredientName: "Molho de tomate caseiro", quantity: 40 },
      { ingredientName: "Cenoura", quantity: 80 },
      { ingredientName: "Pimentão e Vinagrete", quantity: 35 },
      { ingredientName: "Salada (Alface, Tomate, Pepino) e Temperos", quantity: 70 },
    ],
  },
  {
    dayOfWeek: 5,
    mealType: "AFTERNOON_SNACK",
    scheduledTime: "16:00",
    title: "Pizza Rap10 de Frango c/ Muçarela + Uvas (Igual Qua)",
    description: "1 Rap10 integral 40g, Molho de tomate 30g, Muçarela 30g, Frango desfiado 60g, Tomate/Orégano, Uva 80g",
    items: [
      { ingredientName: "Rap10 integral", quantity: 40 },
      { ingredientName: "Molho de tomate caseiro", quantity: 30 },
      { ingredientName: "Queijo muçarela", quantity: 30 },
      { ingredientName: "Frango desfiado (peito cozido)", quantity: 60 },
      { ingredientName: "Salada (Alface, Tomate, Pepino) e Temperos", quantity: 40 },
      { ingredientName: "Uva", quantity: 80 },
    ],
  },
  {
    dayOfWeek: 5,
    mealType: "DINNER",
    scheduledTime: "19:30",
    title: "Arroz, Feijão, 2 Ovos Mexidos e Vinagrete",
    description: "Arroz 80g, Feijão 60g, 2 Ovos mexidos, Vinagrete 50g",
    items: [
      { ingredientName: "Arroz (branco ou integral)", quantity: 80 },
      { ingredientName: "Feijão (carioca ou preto)", quantity: 60 },
      { ingredientName: "Ovos de galinha", quantity: 2 },
      { ingredientName: "Pimentão e Vinagrete", quantity: 50 },
    ],
  },
  {
    dayOfWeek: 5,
    mealType: "SUPPER",
    scheduledTime: "21:45",
    title: "Queijo Minas Frescal ou Chá",
    description: "Queijo minas 40g ou Chá sem açúcar",
    items: [
      { ingredientName: "Queijo minas frescal / Ricota", quantity: 40 },
      { ingredientName: "Chá sem açúcar (Camomila/Hortelã)", quantity: 200 },
    ],
  },

  // ==================== SÁBADO (6) ====================
  {
    dayOfWeek: 6,
    mealType: "BREAKFAST",
    scheduledTime: "08:30",
    title: "Cuscuz Nordestino c/ Queijo Minas, Melancia e Café",
    description: "Cuscuz cozido 60g, Queijo minas/ricota 60g, Melancia 150g, Café/Chá",
    items: [
      { ingredientName: "Cuscuz (Flocão de milho)", quantity: 60 },
      { ingredientName: "Queijo minas frescal / Ricota", quantity: 60 },
      { ingredientName: "Melancia", quantity: 150 },
      { ingredientName: "Café s/ açúcar", quantity: 150 },
    ],
  },
  {
    dayOfWeek: 6,
    mealType: "MORNING_SNACK",
    scheduledTime: "10:45",
    title: "Colação: Mexerica",
    description: "Mexerica 120g",
    items: [{ ingredientName: "Mexerica", quantity: 120 }],
  },
  {
    dayOfWeek: 6,
    mealType: "LUNCH",
    scheduledTime: "13:00",
    title: "Sobrecoxa Assada s/ Pele, Batata-Doce, Feijão e Salada",
    description: "Sobrecoxa s/ pele 115g, Batata-doce 80g, Feijão 60g, Salada 140g",
    items: [
      { ingredientName: "Sobrecoxa de frango s/ pele", quantity: 115 },
      { ingredientName: "Batata-doce", quantity: 80 },
      { ingredientName: "Feijão (carioca ou preto)", quantity: 60 },
      { ingredientName: "Salada (Alface, Tomate, Pepino) e Temperos", quantity: 140 },
    ],
  },
  {
    dayOfWeek: 6,
    mealType: "AFTERNOON_SNACK",
    scheduledTime: "16:30",
    title: "Hambúrguer Caseiro de Patinho no Pão Integral",
    description: "Hambúrguer patinho 140g, 2 fatias Pão integral 60g, Alface/Tomate",
    items: [
      { ingredientName: "Hambúrguer caseiro de patinho", quantity: 140 },
      { ingredientName: "Pão integral (fatias)", quantity: 60 },
      { ingredientName: "Salada (Alface, Tomate, Pepino) e Temperos", quantity: 60 },
    ],
  },
  {
    dayOfWeek: 6,
    mealType: "DINNER",
    scheduledTime: "20:00",
    title: "Wrap Rap10 Integral c/ Queijo, Ovos Cozidos e Tomate",
    description: "1 Rap10 integral 40g, Muçarela/ricota 30g, 2 Ovos cozidos, Tomate",
    items: [
      { ingredientName: "Rap10 integral", quantity: 40 },
      { ingredientName: "Queijo muçarela", quantity: 30 },
      { ingredientName: "Ovos de galinha", quantity: 2 },
      { ingredientName: "Salada (Alface, Tomate, Pepino) e Temperos", quantity: 40 },
    ],
  },
  {
    dayOfWeek: 6,
    mealType: "SUPPER",
    scheduledTime: "22:00",
    title: "Laranja Fresca",
    description: "Laranja 130g",
    items: [{ ingredientName: "Laranja", quantity: 130 }],
  },

  // ==================== DOMINGO (0) ====================
  {
    dayOfWeek: 0,
    mealType: "BREAKFAST",
    scheduledTime: "08:30",
    title: "Cuscuz Cozido c/ Queijo Minas, Melancia e Café (Igual Sáb)",
    description: "Cuscuz cozido 60g, Queijo minas/ricota 60g, Melancia 150g, Café/Chá",
    items: [
      { ingredientName: "Cuscuz (Flocão de milho)", quantity: 60 },
      { ingredientName: "Queijo minas frescal / Ricota", quantity: 60 },
      { ingredientName: "Melancia", quantity: 150 },
      { ingredientName: "Café s/ açúcar", quantity: 150 },
    ],
  },
  {
    dayOfWeek: 0,
    mealType: "MORNING_SNACK",
    scheduledTime: "10:45",
    title: "Colação: Maçã in natura",
    description: "Maçã 130g",
    items: [{ ingredientName: "Maçã", quantity: 130 }],
  },
  {
    dayOfWeek: 0,
    mealType: "LUNCH",
    scheduledTime: "13:00",
    title: "3 Ovos Grelhados, Arroz, Feijão e Salada Completa",
    description: "3 Ovos, Arroz 65g, Feijão 60g, Salada 150g",
    items: [
      { ingredientName: "Ovos de galinha", quantity: 3 },
      { ingredientName: "Arroz (branco ou integral)", quantity: 65 },
      { ingredientName: "Feijão (carioca ou preto)", quantity: 60 },
      { ingredientName: "Salada (Alface, Tomate, Pepino) e Temperos", quantity: 150 },
    ],
  },
  {
    dayOfWeek: 0,
    mealType: "AFTERNOON_SNACK",
    scheduledTime: "16:30",
    title: "Sanduíche de Patê Fit + Banana-Prata e Café",
    description: "2 fatias Pão integral 60g, Patê de frango 60g, Banana-prata 80g, Café/Chá",
    items: [
      { ingredientName: "Pão integral (fatias)", quantity: 60 },
      { ingredientName: "Patê de frango fit", quantity: 60 },
      { ingredientName: "Banana-prata", quantity: 80 },
      { ingredientName: "Café s/ açúcar", quantity: 150 },
    ],
  },
  {
    dayOfWeek: 0,
    mealType: "DINNER",
    scheduledTime: "19:45",
    title: "Vitamina Noturna de Banana e Aveia (+ 1 Ovo Opcional)",
    description: "Vitamina: Leite 150ml, Aveia 15g, Banana-prata 80g, Canela + 1 ovo opcional",
    isOptional: false,
    items: [
      { ingredientName: "Leite semidesnatado/desnatado", quantity: 150 },
      { ingredientName: "Aveia em flocos", quantity: 15 },
      { ingredientName: "Banana-prata", quantity: 80 },
      { ingredientName: "Ovos de galinha", quantity: 1 },
    ],
  },
  {
    dayOfWeek: 0,
    mealType: "SUPPER",
    scheduledTime: "21:45",
    title: "Chá Relaxante sem Açúcar",
    description: "Chá sem açúcar (Camomila / Erva-doce)",
    items: [{ ingredientName: "Chá sem açúcar (Camomila/Hortelã)", quantity: 200 }],
  },
];

export async function recalculateIngredientNeeds(
  userId: string,
  monthYear: string
) {
  const templates = await prisma.mealPlanTemplate.findMany({
    where: { userId, monthYear },
    include: { ingredients: true },
  });

  const weeklyTotals = new Map<string, number>();
  for (const tpl of templates) {
    for (const item of tpl.ingredients) {
      const prev = weeklyTotals.get(item.ingredientId) || 0;
      weeklyTotals.set(item.ingredientId, prev + item.quantityNeeded);
    }
  }

  const allIngredients = await prisma.ingredient.findMany({
    where: { userId },
  });
  for (const ing of allIngredients) {
    const weekly =
      templates.length > 0
        ? weeklyTotals.get(ing.id) ?? 0
        : weeklyTotals.get(ing.id) ?? ing.weeklyNeed;
    await prisma.ingredient.update({
      where: { id: ing.id },
      data: {
        weeklyNeed: Math.round(weekly * 10) / 10,
        monthlyNeed: Math.round(weekly * 4 * 10) / 10,
      },
    });
  }
}

/**
 * Auto-onboarding function (`SPEC-04` / `SDD-002` / `SDD-003`):
 * Provisions the 39 default catalog ingredients, 42 weekly meal templates,
 * and AppConfig for a specific userId inside a Prisma transaction.
 */
export async function provisionInitialUserData(
  userId: string,
  userName?: string,
  userEmail?: string,
  targetMonthYear?: string
) {
  await ensureWalMode();

  const now = new Date();
  const currentMonthYear =
    targetMonthYear ||
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentIsoWeek = getCurrentIsoWeek(now);

  const resolvedName =
    userName || process.env.NEXT_PUBLIC_USER_NAME || "Demo User";
  const resolvedEmail =
    userEmail || process.env.ALERT_RECIPIENT_EMAIL || "user@example.com";

  await prisma.$transaction(async (tx) => {
    // 1. Ensure AppConfig for this user
    const existingConfig = await tx.appConfig.findUnique({
      where: { userId },
    });

    if (!existingConfig) {
      await tx.appConfig.create({
        data: {
          userId,
          userName: resolvedName,
          nutritionistName: "Nutricionista Clínica & Esportiva",
          targetEmail: resolvedEmail,
          smtpHost: process.env.SMTP_HOST || "smtp.example.com",
          smtpPort: Number(process.env.SMTP_PORT) || 587,
          emailProvider: process.env.EMAIL_PROVIDER || "SMTP",
          dailyWaterGoalMl: 3000,
          fastingWaterMl: 500,
          cronTime: "18:00",
          cronEnabled: true,
          alertTime: "18:00",
          alertEnabled: true,
        },
      });
    }

    // 2. Ensure all 39 ingredients for this user
    const existingCount = await tx.ingredient.count({ where: { userId } });
    const ingredientMap = new Map<string, string>();

    if (existingCount === 0) {
      for (const ing of INITIAL_INGREDIENTS) {
        const created = await tx.ingredient.create({
          data: {
            userId,
            name: ing.name,
            category: ing.category,
            unit: ing.unit,
            purchaseFrequency: ing.purchaseFrequency,
            weeklyNeed: ing.weeklyNeed,
            monthlyNeed: ing.monthlyNeed,
            inStock: ing.inStock,
            boughtForWeek: ing.boughtForWeek,
            boughtForWeekAt: ing.boughtForWeek ? now : null,
            weekCycleKey: ing.boughtForWeek ? currentIsoWeek : null,
            notes: ing.notes,
          },
        });
        ingredientMap.set(created.name, created.id);
      }
    } else {
      const all = await tx.ingredient.findMany({ where: { userId } });
      for (const item of all) {
        ingredientMap.set(item.name, item.id);
      }
    }

    // 3. Ensure MealPlanTemplates for currentMonthYear for this user
    const monthPlansCount = await tx.mealPlanTemplate.count({
      where: { userId, monthYear: currentMonthYear },
    });

    if (monthPlansCount === 0) {
      for (const meal of WEEKLY_MEAL_PLAN) {
        const createdMeal = await tx.mealPlanTemplate.create({
          data: {
            userId,
            monthYear: currentMonthYear,
            dayOfWeek: meal.dayOfWeek,
            mealType: meal.mealType,
            scheduledTime: meal.scheduledTime,
            title: meal.title,
            description: meal.description,
            isOptional: meal.isOptional ?? false,
          },
        });

        for (const link of meal.items) {
          const ingId = ingredientMap.get(link.ingredientName);
          if (ingId) {
            await tx.mealPlanIngredient.create({
              data: {
                mealPlanTemplateId: createdMeal.id,
                ingredientId: ingId,
                quantityNeeded: link.quantity,
              },
            });
          }
        }
      }
    }
  });

  await recalculateIngredientNeeds(userId, currentMonthYear);
}

/**
 * Ensures either a specific user's month plan is seeded, or if called without
 * userId (e.g. CLI seed / initial boot), ensures the primary owner account exists and is seeded.
 */
export async function ensureSeeded(
  targetMonthYear?: string,
  forUserId?: string
) {
  await ensureWalMode();

  if (forUserId) {
    const user = await prisma.user.findUnique({ where: { id: forUserId } });
    if (user) {
      await provisionInitialUserData(
        user.id,
        user.name,
        user.email,
        targetMonthYear
      );
    }
    return;
  }

  let primaryUser = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!primaryUser) {
    const defaultName = process.env.NEXT_PUBLIC_USER_NAME || "Demo User";
    const defaultEmail = (
      process.env.ALERT_RECIPIENT_EMAIL || "user@example.com"
    ).toLowerCase();
    const defaultPassword =
      process.env.DEFAULT_OWNER_PASSWORD || "NutriTrack123!";

    primaryUser = await prisma.user.create({
      data: {
        id: "owner-primary",
        name: defaultName,
        email: defaultEmail,
        passwordHash: hashPassword(defaultPassword),
      },
    });
  }

  await provisionInitialUserData(
    primaryUser.id,
    primaryUser.name,
    primaryUser.email,
    targetMonthYear
  );
}

