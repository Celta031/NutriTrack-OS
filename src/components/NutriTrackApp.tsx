"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Droplets,
  Calendar as CalendarIcon,
  ShoppingCart,
  Bell,
  FileText,
  Utensils,
  Camera,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Printer,
  ChefHat,
  Plus,
  Edit3,
  Send,
  Settings,
  Check,
  XCircle,
  Sparkles,
  Share2,
  Search,
  Filter,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { BaseRecipe } from "@/lib/recipes";

interface IngredientItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  purchaseFrequency: string;
  weeklyNeed: number;
  monthlyNeed: number;
  inStock: boolean;
  boughtForWeek: boolean;
  notes?: string;
  usedTomorrow: boolean;
  missingForTomorrow: boolean;
  tomorrowQuantity: number;
  tomorrowMeals: string[];
}

interface MealIngredientLink {
  id: string;
  ingredientId: string;
  quantityNeeded: number;
  ingredient: {
    id: string;
    name: string;
    unit: string;
    category: string;
    inStock: boolean;
    boughtForWeek: boolean;
  };
}

interface MealPlanTemplateItem {
  id: string;
  monthYear: string;
  dayOfWeek: number;
  mealType: string;
  scheduledTime: string;
  title: string;
  description: string;
  isOptional: boolean;
  ingredients: MealIngredientLink[];
}

interface DailyLogItem {
  id: string;
  date: string;
  mealPlanTemplateId?: string | null;
  mealType?: string | null;
  status: string; // PENDING, COMPLETED, SUBSTITUTED, SKIPPED
  actualNotes?: string | null;
  photoUrl?: string | null;
  loggedAt: string;
  latitude?: number | null;
  longitude?: number | null;
  locationName?: string | null;
  waterIntakeMl: number;
  fastingWaterDone: boolean;
  mealPlanTemplate?: MealPlanTemplateItem | null;
}

interface NotificationLogItem {
  id: string;
  sentAt: string;
  targetDate: string;
  recipient: string;
  subject: string;
  missingCount: number;
  missingItems: string;
  status: string;
  errorMessage?: string | null;
}

interface AppConfigData {
  userName: string;
  nutritionistName: string;
  targetEmail: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  resendApiKey: string;
  emailProvider: string;
  dailyWaterGoalMl: number;
  fastingWaterMl: number;
  cronTime: string;
  cronEnabled: boolean;
}

interface TomorrowSummary {
  tomorrowDate: string;
  tomorrowDayOfWeek: number;
  tomorrowDayName: string;
  totalMealsTomorrow: number;
  missingItems: {
    ingredientId: string;
    name: string;
    category: string;
    unit: string;
    quantityForTomorrow: number;
    weeklyNeed: number;
    mealsUsingIt: string[];
  }[];
}

const DAY_LABELS = [
  { dow: 1, short: "Seg", full: "Segunda-feira" },
  { dow: 2, short: "Ter", full: "Terça-feira" },
  { dow: 3, short: "Qua", full: "Quarta-feira" },
  { dow: 4, short: "Qui", full: "Quinta-feira" },
  { dow: 5, short: "Sex", full: "Sexta-feira" },
  { dow: 6, short: "Sáb", full: "Sábado" },
  { dow: 0, short: "Dom", full: "Domingo" },
];

const MEAL_TYPE_META: Record<
  string,
  { label: string; badgeColor: string; order: number }
> = {
  BREAKFAST: {
    label: "Café da Manhã",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    order: 1,
  },
  MORNING_SNACK: {
    label: "Colação",
    badgeColor: "bg-lime-100 text-lime-800 border-lime-200",
    order: 2,
  },
  LUNCH: {
    label: "Almoço",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    order: 3,
  },
  AFTERNOON_SNACK: {
    label: "Lanche da Tarde",
    badgeColor: "bg-sky-100 text-sky-800 border-sky-200",
    order: 4,
  },
  DINNER: {
    label: "Jantar",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
    order: 5,
  },
  SUPPER: {
    label: "Ceia",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    order: 6,
  },
};

const FREQ_LABELS: Record<string, string> = {
  MONTHLY: "Mensal",
  BIWEEKLY: "Quinzenal",
  WEEKLY: "Semanal",
  DAILY: "Diário",
};

// Client-side Canvas WebP image compressor (guarantees <= 400KB)
async function compressImageToWebP(
  file: File
): Promise<{ dataUrl: string; sizeKB: number; originalKB: number }> {
  const originalKB = Math.round(file.size / 1024);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIM = 1200;
        let width = img.width;
        let height = img.height;
        if (width > height && width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context unavailable"));
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.82;
        let dataUrl = canvas.toDataURL("image/webp", quality);
        // Estimate byte size from base64 length
        let byteLength = Math.round((dataUrl.length * 3) / 4);
        while (byteLength > 390 * 1024 && quality > 0.35) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL("image/webp", quality);
          byteLength = Math.round((dataUrl.length * 3) / 4);
        }
        resolve({
          dataUrl,
          sizeKB: Math.max(1, Math.round(byteLength / 1024)),
          originalKB,
        });
      };
      img.onerror = () => reject(new Error("Falha ao processar imagem"));
      img.src = ev.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}

export default function NutriTrackApp() {
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  }, []);

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "planner" | "shopping" | "alerts" | "report"
  >("dashboard");
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>(
    todayStr.slice(0, 7)
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<string | null>(null);

  // App state from API
  const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
  const [mealTemplates, setMealTemplates] = useState<MealPlanTemplateItem[]>([]);
  const [monthLogs, setMonthLogs] = useState<DailyLogItem[]>([]);
  const [config, setConfig] = useState<AppConfigData | null>(null);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLogItem[]>(
    []
  );
  const [baseRecipes, setBaseRecipes] = useState<BaseRecipe[]>([]);
  const [tomorrowSummary, setTomorrowSummary] =
    useState<TomorrowSummary | null>(null);

  // Planner sub-state
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(() =>
    new Date().getDay()
  );
  const [editingMeal, setEditingMeal] = useState<MealPlanTemplateItem | null>(
    null
  );
  const [editMealTitle, setEditMealTitle] = useState("");
  const [editMealTime, setEditMealTime] = useState("");
  const [editMealDesc, setEditMealDesc] = useState("");
  const [editMealIngredients, setEditMealIngredients] = useState<
    { ingredientId: string; quantityNeeded: number }[]
  >([]);

  // Shopping sub-state
  const [shoppingCategory, setShoppingCategory] = useState<string>("ALL");
  const [shoppingSearch, setShoppingSearch] = useState<string>("");
  const [onlyMissingTomorrow, setOnlyMissingTomorrow] =
    useState<boolean>(false);
  const [onlyUnbought, setOnlyUnbought] = useState<boolean>(false);

  // Register Meal Modal state
  const [registerModalMeal, setRegisterModalMeal] =
    useState<MealPlanTemplateItem | null>(null);
  const [regStatus, setRegStatus] = useState<string>("COMPLETED");
  const [regNotes, setRegNotes] = useState<string>("");
  const [regPhotoUrl, setRegPhotoUrl] = useState<string>("");
  const [regPhotoStats, setRegPhotoStats] = useState<{
    originalKB: number;
    sizeKB: number;
  } | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const [regLat, setRegLat] = useState<number | null>(null);
  const [regLng, setRegLng] = useState<number | null>(null);
  const [regLocationName, setRegLocationName] = useState<string>("");
  const [gettingGps, setGettingGps] = useState<boolean>(false);
  const [savingLog, setSavingLog] = useState<boolean>(false);

  // Lookahead test state
  const [testingAlert, setTestingAlert] = useState<boolean>(false);
  const [lastAlertHtml, setLastAlertHtml] = useState<string | null>(null);
  const [savingConfig, setSavingConfig] = useState<boolean>(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 4000);
  }, []);

  const fetchState = useCallback(
    async (dateOverride?: string, monthOverride?: string) => {
      try {
        const d = dateOverride || selectedDate;
        const m = monthOverride || selectedMonthYear;
        const res = await fetch(`/api/state?date=${d}&monthYear=${m}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (data.ingredients) setIngredients(data.ingredients);
        if (data.mealTemplates) setMealTemplates(data.mealTemplates);
        if (data.monthLogs) setMonthLogs(data.monthLogs);
        if (data.config) setConfig(data.config);
        if (data.notificationLogs) setNotificationLogs(data.notificationLogs);
        if (data.baseRecipes) setBaseRecipes(data.baseRecipes);
        if (data.tomorrowSummary) setTomorrowSummary(data.tomorrowSummary);
      } catch (e) {
        console.error("Failed to fetch state:", e);
      } finally {
        setLoading(false);
      }
    },
    [selectedDate, selectedMonthYear]
  );

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Logs for selectedDate
  const selectedDateLogs = useMemo(
    () => monthLogs.filter((l) => l.date === selectedDate),
    [monthLogs, selectedDate]
  );

  // Hydration for selectedDate
  const currentWaterMl = useMemo(() => {
    return selectedDateLogs.reduce(
      (max, l) => Math.max(max, l.waterIntakeMl || 0),
      0
    );
  }, [selectedDateLogs]);

  const currentFastingWaterDone = useMemo(() => {
    return selectedDateLogs.some((l) => l.fastingWaterDone);
  }, [selectedDateLogs]);

  // Selected date dayOfWeek
  const selectedDateDow = useMemo(() => {
    const d = new Date(`${selectedDate}T12:00:00`);
    return d.getDay();
  }, [selectedDate]);

  // Meals for selectedDate
  const todayMeals = useMemo(() => {
    return mealTemplates
      .filter((t) => t.dayOfWeek === selectedDateDow)
      .sort(
        (a, b) =>
          (MEAL_TYPE_META[a.mealType]?.order || 99) -
          (MEAL_TYPE_META[b.mealType]?.order || 99)
      );
  }, [mealTemplates, selectedDateDow]);

  // Update hydration
  const handleUpdateHydration = async (
    newWaterMl: number,
    newFastingDone: boolean
  ) => {
    const clamped = Math.max(0, newWaterMl);
    try {
      await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "HYDRATION",
          date: selectedDate,
          waterIntakeMl: clamped,
          fastingWaterDone: newFastingDone,
        }),
      });
      await fetchState();
      showToast(`Hidratação atualizada: ${clamped} ml`);
    } catch {
      showToast("Erro ao atualizar hidratação");
    }
  };

  // Capture GPS + Nominatim reverse geocoding
  const captureGpsLocation = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setRegLocationName("GPS indisponível no navegador");
      return;
    }
    setGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        setRegLat(lat);
        setRegLng(lng);
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
            {
              headers: { "Accept-Language": "pt-BR" },
            }
          );
          if (r.ok) {
            const geo = await r.json();
            const addr = geo.address || {};
            const suburb =
              addr.suburb ||
              addr.neighbourhood ||
              addr.city_district ||
              addr.town ||
              "";
            const city = addr.city || addr.municipality || addr.state || "";
            const label = [suburb, city].filter(Boolean).join(", ");
            setRegLocationName(label || `${lat}, ${lng}`);
          } else {
            setRegLocationName(`GPS (${lat}, ${lng})`);
          }
        } catch {
          setRegLocationName(`GPS (${lat}, ${lng})`);
        } finally {
          setGettingGps(false);
        }
      },
      () => {
        setGettingGps(false);
        if (!regLocationName) {
          setRegLocationName("Casa • Localização Padrão");
        }
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  }, [regLocationName]);

  // Open Register Meal modal
  const openRegisterModal = (meal: MealPlanTemplateItem) => {
    const existing = selectedDateLogs.find(
      (l) => l.mealPlanTemplateId === meal.id
    );
    setRegisterModalMeal(meal);
    setRegStatus(existing?.status || "COMPLETED");
    setRegNotes(existing?.actualNotes || "");
    setRegPhotoUrl(existing?.photoUrl || "");
    setRegPhotoStats(null);
    setRegLat(existing?.latitude ?? null);
    setRegLng(existing?.longitude ?? null);
    setRegLocationName(existing?.locationName || "Casa • Localização Padrão");
    if (!existing?.locationName) {
      captureGpsLocation();
    }
  };

  // Handle photo file input -> compress client-side to WebP <= 400KB -> upload to /api/uploads
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const compressed = await compressImageToWebP(file);
      setRegPhotoStats({
        originalKB: compressed.originalKB,
        sizeKB: compressed.sizeKB,
      });

      const res = await fetch("/api/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl: compressed.dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha no upload");
      setRegPhotoUrl(data.url);
      showToast(
        `Foto otimizada em WebP (${compressed.sizeKB} KB) e salva com sucesso!`
      );
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Erro ao comprimir/enviar foto"
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Save meal registration
  const handleSaveMealLog = async () => {
    if (!registerModalMeal) return;
    setSavingLog(true);
    try {
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          mealPlanTemplateId: registerModalMeal.id,
          mealType: registerModalMeal.mealType,
          status: regStatus,
          actualNotes:
            regNotes.trim() ||
            (regStatus === "COMPLETED"
              ? `Concluído conforme cardápio: ${registerModalMeal.title}`
              : ""),
          photoUrl: regPhotoUrl || null,
          latitude: regLat,
          longitude: regLng,
          locationName: regLocationName || "Casa • Localização Padrão",
          loggedAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Falha ao registrar refeição");
      setRegisterModalMeal(null);
      await fetchState();
      showToast("Refeição registrada com sucesso!");
    } catch {
      showToast("Erro ao salvar registro da refeição");
    } finally {
      setSavingLog(false);
    }
  };

  // Toggle ingredient checkbox (inStock or boughtForWeek)
  const handleToggleIngredient = async (
    ing: IngredientItem,
    field: "inStock" | "boughtForWeek"
  ) => {
    const newVal = !ing[field];
    // Optimistic update
    setIngredients((prev) =>
      prev.map((item) => {
        if (item.id !== ing.id) return item;
        const updated = { ...item, [field]: newVal };
        updated.missingForTomorrow =
          updated.usedTomorrow && !updated.inStock && !updated.boughtForWeek;
        return updated;
      })
    );

    try {
      await fetch("/api/ingredients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ing.id, [field]: newVal }),
      });
      await fetchState();
    } catch {
      showToast("Erro ao atualizar estoque");
    }
  };

  // Open Edit Meal Template modal in Planner
  const openEditMealModal = (meal: MealPlanTemplateItem) => {
    setEditingMeal(meal);
    setEditMealTitle(meal.title);
    setEditMealTime(meal.scheduledTime);
    setEditMealDesc(meal.description);
    setEditMealIngredients(
      meal.ingredients.map((link) => ({
        ingredientId: link.ingredientId,
        quantityNeeded: link.quantityNeeded,
      }))
    );
  };

  const handleSaveMealTemplate = async () => {
    if (!editingMeal) return;
    try {
      const res = await fetch("/api/meals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingMeal.id,
          monthYear: selectedMonthYear,
          title: editMealTitle,
          scheduledTime: editMealTime,
          description: editMealDesc,
          ingredients: editMealIngredients,
        }),
      });
      if (!res.ok) throw new Error("Erro ao salvar prato");
      setEditingMeal(null);
      await fetchState();
      showToast(
        "Prato atualizado! Quantidades semanais e mensais recalculadas na Lista de Compras."
      );
    } catch {
      showToast("Erro ao atualizar prato do cardápio");
    }
  };

  // Trigger manual lookahead email check
  const handleRunLookaheadNow = async () => {
    setTestingAlert(true);
    try {
      const res = await fetch("/api/alerts/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate }),
      });
      const data = await res.json();
      if (data.htmlPreview) {
        setLastAlertHtml(data.htmlPreview);
      }
      await fetchState();
      showToast(data.message || "Verificação Lookahead executada!");
    } catch {
      showToast("Falha ao executar verificação de alerta");
    } finally {
      setTestingAlert(false);
    }
  };

  // Save AppConfig
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setSavingConfig(true);
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error("Falha ao salvar");
      await fetchState();
      showToast("Configurações de E-mail e Metas salvas com sucesso!");
    } catch {
      showToast("Erro ao salvar configurações");
    } finally {
      setSavingConfig(false);
    }
  };

  // Monthly Calendar computation
  const calendarDays = useMemo(() => {
    const [yearStr, monthStr] = selectedMonthYear.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr); // 1-12
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayDow = new Date(year, month - 1, 1).getDay(); // 0=Dom

    const result: {
      day: number;
      dateStr: string;
      status: "GREEN" | "YELLOW" | "RED" | "EMPTY";
      completedCount: number;
      substitutedCount: number;
      skippedCount: number;
      waterMl: number;
    }[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${yearStr}-${monthStr}-${String(d).padStart(2, "0")}`;
      const dayLogs = monthLogs.filter(
        (l) => l.date === dateStr && l.mealPlanTemplateId
      );
      const waterMl = monthLogs
        .filter((l) => l.date === dateStr)
        .reduce((m, l) => Math.max(m, l.waterIntakeMl || 0), 0);

      const completedCount = dayLogs.filter(
        (l) => l.status === "COMPLETED"
      ).length;
      const substitutedCount = dayLogs.filter(
        (l) => l.status === "SUBSTITUTED"
      ).length;
      const skippedCount = dayLogs.filter((l) => l.status === "SKIPPED").length;

      let status: "GREEN" | "YELLOW" | "RED" | "EMPTY" = "EMPTY";
      if (dayLogs.length > 0) {
        if (skippedCount >= 2) {
          status = "RED";
        } else if (substitutedCount > 0 || skippedCount === 1 || completedCount < 4) {
          status = "YELLOW";
        } else {
          status = "GREEN";
        }
      }

      result.push({
        day: d,
        dateStr,
        status,
        completedCount,
        substitutedCount,
        skippedCount,
        waterMl,
      });
    }

    return { firstDayDow, days: result };
  }, [selectedMonthYear, monthLogs]);

  // Executive Report KPIs
  const reportStats = useMemo(() => {
    const mealLogs = monthLogs.filter((l) => l.mealPlanTemplateId);
    const totalLogged = mealLogs.length;
    const completed = mealLogs.filter((l) => l.status === "COMPLETED").length;
    const substituted = mealLogs.filter(
      (l) => l.status === "SUBSTITUTED"
    ).length;
    const skipped = mealLogs.filter((l) => l.status === "SKIPPED").length;

    const adherencePct =
      totalLogged > 0
        ? Math.round(((completed + substituted * 0.85) / totalLogged) * 100)
        : 100;

    const daysWithWater = calendarDays.days.filter((d) => d.waterMl > 0);
    const avgWaterMl =
      daysWithWater.length > 0
        ? Math.round(
            daysWithWater.reduce((acc, d) => acc + d.waterMl, 0) /
              daysWithWater.length
          )
        : 0;

    const chartData = calendarDays.days
      .filter(
        (d) =>
          d.completedCount + d.substitutedCount + d.skippedCount > 0 ||
          d.waterMl > 0
      )
      .map((d) => ({
        dia: d.dateStr.slice(8, 10),
        Concluidas: d.completedCount,
        Substituidas: d.substitutedCount,
        Puladas: d.skippedCount,
        AguaLitros: Number((d.waterMl / 1000).toFixed(2)),
      }));

    return {
      totalLogged,
      completed,
      substituted,
      skipped,
      adherencePct,
      avgWaterMl,
      chartData,
      substitutionsList: mealLogs.filter((l) => l.status === "SUBSTITUTED"),
      photosList: mealLogs.filter((l) => Boolean(l.photoUrl)),
    };
  }, [monthLogs, calendarDays]);

  // Filtered shopping list
  const filteredIngredients = useMemo(() => {
    return ingredients.filter((ing) => {
      if (shoppingCategory !== "ALL" && ing.category !== shoppingCategory)
        return false;
      if (
        shoppingSearch.trim() !== "" &&
        !ing.name.toLowerCase().includes(shoppingSearch.toLowerCase())
      )
        return false;
      if (onlyMissingTomorrow && !ing.missingForTomorrow) return false;
      if (onlyUnbought && (ing.inStock || ing.boughtForWeek)) return false;
      return true;
    });
  }, [
    ingredients,
    shoppingCategory,
    shoppingSearch,
    onlyMissingTomorrow,
    onlyUnbought,
  ]);

  const waterGoal = config?.dailyWaterGoalMl || 3000;
  const waterPct = Math.min(100, Math.round((currentWaterMl / waterGoal) * 100));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 pb-20 md:pb-8">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-30 bg-emerald-950 text-white shadow-lg no-print">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-emerald-950 shadow-inner">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg tracking-tight">
                  NutriTrack OS
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200 font-medium border border-emerald-700">
                  {config?.userName || process.env.NEXT_PUBLIC_USER_NAME || "User"} • v1.0
                </span>
              </div>
              <p className="text-xs text-emerald-300">
                Gestão Inteligente de Dieta, Estoque Vivo (39 itens) & Alertas
              </p>
            </div>
          </div>

          {/* Date & Month Selectors */}
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center bg-emerald-900/80 border border-emerald-700/80 rounded-lg px-2.5 py-1.5">
              <CalendarIcon className="w-4 h-4 text-emerald-300 mr-2" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    setSelectedDate(val);
                    setSelectedMonthYear(val.slice(0, 7));
                    fetchState(val, val.slice(0, 7));
                  }
                }}
                className="bg-transparent text-white text-xs sm:text-sm focus:outline-none"
              />
            </div>

            {tomorrowSummary && tomorrowSummary.missingItems.length > 0 && (
              <button
                onClick={() => {
                  setActiveTab("shopping");
                  setOnlyMissingTomorrow(true);
                }}
                className="hidden sm:flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow animate-pulse"
              >
                <AlertTriangle className="w-4 h-4" />
                {tomorrowSummary.missingItems.length} Falta(m) p/ Amanhã!
              </button>
            )}
          </div>

          {/* Desktop Navigation Pills */}
          <nav className="hidden md:flex items-center gap-1 bg-emerald-900/60 p-1 rounded-xl border border-emerald-800">
            {[
              { id: "dashboard", label: "Hoje & Mês", icon: CalendarIcon },
              { id: "planner", label: "Cardápio & Receitas", icon: ChefHat },
              {
                id: "shopping",
                label: `Compras (${ingredients.length})`,
                icon: ShoppingCart,
              },
              { id: "alerts", label: "Alertas 18h", icon: Bell },
              { id: "report", label: "Relatório Nutri", icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(
                      tab.id as
                        | "dashboard"
                        | "planner"
                        | "shopping"
                        | "alerts"
                        | "report"
                    )
                  }
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? "bg-emerald-500 text-emerald-950 shadow"
                      : "text-emerald-200 hover:bg-emerald-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/40 flex items-center gap-2.5 text-sm max-w-md animate-bounce no-print">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-sm font-medium">
              Carregando NutriTrack OS...
            </p>
          </div>
        ) : (
          <>
            {/* =====================================================================
                TAB 1: DASHBOARD "HOJE & MÊS ATUAL"
               ===================================================================== */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* Lookahead Alert Banner for Tomorrow */}
                {tomorrowSummary && tomorrowSummary.missingItems.length > 0 && (
                  <div className="bg-rose-50 border-l-4 border-rose-600 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-bold text-rose-900">
                          Atenção para Amanhã ({tomorrowSummary.tomorrowDayName} •{" "}
                          {tomorrowSummary.tomorrowDate}):{" "}
                          {tomorrowSummary.missingItems.length} ingrediente(s)
                          desmarcado(s) no estoque!
                        </h3>
                        <p className="text-xs text-rose-700 mt-1">
                          Faltando comprar:{" "}
                          <strong>
                            {tomorrowSummary.missingItems
                              .map(
                                (i) =>
                                  `${i.name} (${i.quantityForTomorrow}${i.unit})`
                              )
                              .join(" • ")}
                          </strong>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setActiveTab("shopping");
                          setOnlyMissingTomorrow(true);
                        }}
                        className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm"
                      >
                        Ver na Lista de Compras
                      </button>
                      <button
                        onClick={handleRunLookaheadNow}
                        disabled={testingAlert}
                        className="px-3 py-2 rounded-lg bg-white border border-rose-300 text-rose-800 hover:bg-rose-100 text-xs font-semibold"
                      >
                        {testingAlert ? "Enviando..." : "Disparar Alerta E-mail"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Top Grid: Hydration Card + Day Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Hydration & Fasting Water Highlight */}
                  <div className="lg:col-span-2 bg-gradient-to-br from-sky-900 via-sky-800 to-emerald-900 text-white rounded-2xl p-5 shadow-md flex flex-col justify-between">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-sky-400/20 border border-sky-300/30 flex items-center justify-center">
                          <Droplets className="w-7 h-7 text-sky-300" />
                        </div>
                        <div>
                          <span className="text-xs uppercase tracking-wider text-sky-300 font-semibold">
                            Controle Diário de Hidratação ({selectedDate})
                          </span>
                          <h2 className="text-2xl font-extrabold mt-0.5">
                            {currentWaterMl} ml{" "}
                            <span className="text-sm font-normal text-sky-200">
                              / meta {waterGoal} ml ({waterPct}%)
                            </span>
                          </h2>
                        </div>
                      </div>

                      {/* Highlight Badge: 300-600ml Fasting Water upon waking */}
                      <button
                        onClick={() => {
                          const nextDone = !currentFastingWaterDone;
                          const nextWater =
                            nextDone && currentWaterMl === 0
                              ? 500
                              : currentWaterMl;
                          handleUpdateHydration(nextWater, nextDone);
                        }}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
                          currentFastingWaterDone
                            ? "bg-emerald-400 text-emerald-950 border-emerald-300 shadow-lg"
                            : "bg-amber-400/20 border-amber-300 text-amber-200 hover:bg-amber-400/30 animate-pulse"
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {currentFastingWaterDone
                          ? "✓ Meta Água em Jejum (300-600ml) Concluída!"
                          : "⚡ Marcar 300-600ml de Água em Jejum ao Acordar"}
                      </button>
                    </div>

                    {/* Progress bar */}
                    <div className="my-4">
                      <div className="w-full h-3.5 bg-sky-950/70 rounded-full overflow-hidden p-0.5 border border-sky-700/50">
                        <div
                          className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${waterPct}%` }}
                        />
                      </div>
                      <p className="text-xs text-sky-200 mt-1.5">
                        Protocolo Nutricional Diário: Ingerir{" "}
                        <strong>300ml a 600ml de água em jejum</strong> logo ao
                        acordar para ativação metabólica e hidratação intestinal.
                      </p>
                    </div>

                    {/* Quick Water Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() =>
                          handleUpdateHydration(
                            currentWaterMl + 250,
                            currentFastingWaterDone
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-sky-500/30 hover:bg-sky-500/50 border border-sky-300/30 text-xs font-semibold"
                      >
                        + 250ml (Copo)
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateHydration(
                            currentWaterMl + 500,
                            true
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 text-emerald-950 hover:bg-emerald-400 text-xs font-bold shadow"
                      >
                        + 500ml (Garrafa / Jejum)
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateHydration(
                            currentWaterMl + 300,
                            currentFastingWaterDone
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-sky-500/30 hover:bg-sky-500/50 border border-sky-300/30 text-xs font-semibold"
                      >
                        + 300ml
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateHydration(
                            Math.max(0, currentWaterMl - 250),
                            currentFastingWaterDone
                          )
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs"
                      >
                        - 250ml
                      </button>
                    </div>
                  </div>

                  {/* Quick Monthly Adherence Card */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                        Resumo do Mês ({selectedMonthYear})
                      </span>
                      <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                        {reportStats.adherencePct}% de Adesão
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {reportStats.completed} refeições 100% no plano •{" "}
                        {reportStats.substituted} substituídas •{" "}
                        {reportStats.skipped} puladas
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 my-4 text-center">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2">
                        <div className="text-lg font-extrabold text-emerald-700">
                          {reportStats.completed}
                        </div>
                        <div className="text-[11px] text-emerald-800 font-medium">
                          Concluídas
                        </div>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-2">
                        <div className="text-lg font-extrabold text-amber-700">
                          {reportStats.substituted}
                        </div>
                        <div className="text-[11px] text-amber-800 font-medium">
                          Substituídas
                        </div>
                      </div>
                      <div className="bg-rose-50 border border-rose-200 rounded-xl p-2">
                        <div className="text-lg font-extrabold text-rose-700">
                          {reportStats.skipped}
                        </div>
                        <div className="text-[11px] text-rose-800 font-medium">
                          Fora/Puladas
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab("report")}
                      className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Abrir Relatório da Nutricionista
                    </button>
                  </div>
                </div>

                {/* Main Dashboard Split: Timeline of Today's Meals (Left 7 cols) + Monthly Calendar (Right 5 cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Daily Meal Timeline */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Linha do Tempo de Refeições ({selectedDate})
                        </h3>
                        <p className="text-xs text-slate-500">
                          Cardápio de{" "}
                          <strong>
                            {
                              DAY_LABELS.find((d) => d.dow === selectedDateDow)
                                ?.full
                            }
                          </strong>{" "}
                          • Registre foto com horário exato e localização GPS
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {todayMeals.map((meal) => {
                        const log = selectedDateLogs.find(
                          (l) => l.mealPlanTemplateId === meal.id
                        );
                        const meta = MEAL_TYPE_META[meal.mealType] || {
                          label: meal.mealType,
                          badgeColor: "bg-slate-100 text-slate-800",
                        };

                        const statusBadge =
                          log?.status === "COMPLETED" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <Check className="w-3.5 h-3.5" /> Concluído
                            </span>
                          ) : log?.status === "SUBSTITUTED" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <RefreshCw className="w-3.5 h-3.5" /> Substituído
                            </span>
                          ) : log?.status === "SKIPPED" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              <XCircle className="w-3.5 h-3.5" /> Pulado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                              Pendente
                            </span>
                          );

                        return (
                          <div
                            key={meal.id}
                            className={`bg-white rounded-2xl p-4 border transition-all shadow-sm ${
                              log?.status === "COMPLETED"
                                ? "border-emerald-300 bg-emerald-50/20"
                                : log?.status === "SUBSTITUTED"
                                ? "border-amber-300 bg-amber-50/20"
                                : log?.status === "SKIPPED"
                                ? "border-rose-300 bg-rose-50/20"
                                : "border-slate-200 hover:border-emerald-300"
                            }`}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-900 text-white">
                                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                                  {meal.scheduledTime}
                                </span>
                                <span
                                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${meta.badgeColor}`}
                                >
                                  {meta.label}
                                </span>
                                {statusBadge}
                              </div>

                              <button
                                onClick={() => openRegisterModal(meal)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                {log ? "Editar Registro" : "Registrar Refeição"}
                              </button>
                            </div>

                            <h4 className="font-bold text-slate-900 mt-2.5 text-base">
                              {meal.title}
                            </h4>
                            <p className="text-xs text-slate-600 mt-0.5">
                              {meal.description}
                            </p>

                            {/* Linked Ingredients Chips */}
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {meal.ingredients.map((link) => {
                                const stocked =
                                  link.ingredient.inStock ||
                                  link.ingredient.boughtForWeek;
                                return (
                                  <span
                                    key={link.id}
                                    className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${
                                      stocked
                                        ? "bg-slate-100 text-slate-700 border-slate-200"
                                        : "bg-rose-50 text-rose-700 border-rose-200 font-semibold"
                                    }`}
                                  >
                                    {link.ingredient.name}: {link.quantityNeeded}
                                    {link.ingredient.unit}
                                    {!stocked && " ⚠️"}
                                  </span>
                                );
                              })}
                            </div>

                            {/* Logged Notes & Photo with GPS + Exact Time Badge */}
                            {log && (
                              <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2">
                                {log.actualNotes && (
                                  <p className="text-xs text-slate-700 bg-slate-100/80 px-3 py-2 rounded-lg">
                                    <strong>Registro:</strong> {log.actualNotes}
                                  </p>
                                )}
                                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                                  <span className="inline-flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                                    Horário registrado:{" "}
                                    {new Date(log.loggedAt).toLocaleTimeString(
                                      "pt-BR",
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )}
                                  </span>
                                  {log.locationName && (
                                    <span className="inline-flex items-center gap-1">
                                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                                      {log.locationName}
                                    </span>
                                  )}
                                </div>

                                {log.photoUrl && (
                                  <div className="relative rounded-xl overflow-hidden border border-slate-200 max-w-sm mt-2">
                                    <img
                                      src={log.photoUrl}
                                      alt={meal.title}
                                      className="w-full h-48 object-cover"
                                    />
                                    <div className="absolute bottom-2 left-2 right-2 bg-slate-950/80 backdrop-blur-sm text-white px-2.5 py-1.5 rounded-lg text-[11px] flex items-center justify-between gap-2">
                                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-300">
                                        <Clock className="w-3 h-3" />
                                        {new Date(
                                          log.loggedAt
                                        ).toLocaleTimeString("pt-BR", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                      <span className="inline-flex items-center gap-1 truncate">
                                        <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                                        {log.locationName || "GPS Auditado"}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Monthly Adherence Calendar + Quick Base Recipes Preview */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            Calendário do Mês ({selectedMonthYear})
                          </h3>
                          <p className="text-xs text-slate-500">
                            Clique em um dia para inspecionar ou lançar refeições
                          </p>
                        </div>
                        <input
                          type="month"
                          value={selectedMonthYear}
                          onChange={(e) => {
                            if (e.target.value) {
                              setSelectedMonthYear(e.target.value);
                              const nextDate = `${e.target.value}-01`;
                              setSelectedDate(nextDate);
                              fetchState(nextDate, e.target.value);
                            }
                          }}
                          className="text-xs border border-slate-300 rounded-lg px-2 py-1"
                        />
                      </div>

                      {/* Weekday Headers */}
                      <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold text-slate-500 mb-2">
                        <div>Dom</div>
                        <div>Seg</div>
                        <div>Ter</div>
                        <div>Qua</div>
                        <div>Qui</div>
                        <div>Sex</div>
                        <div>Sáb</div>
                      </div>

                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-1.5">
                        {Array.from({ length: calendarDays.firstDayDow }).map(
                          (_, idx) => (
                            <div key={`pad-${idx}`} className="h-11" />
                          )
                        )}
                        {calendarDays.days.map((d) => {
                          const isSelected = d.dateStr === selectedDate;
                          const colorClass =
                            d.status === "GREEN"
                              ? "bg-emerald-500 text-white border-emerald-600"
                              : d.status === "YELLOW"
                              ? "bg-amber-400 text-slate-950 border-amber-500"
                              : d.status === "RED"
                              ? "bg-rose-500 text-white border-rose-600"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100";

                          return (
                            <button
                              key={d.dateStr}
                              onClick={() => {
                                setSelectedDate(d.dateStr);
                                fetchState(d.dateStr, selectedMonthYear);
                              }}
                              className={`h-11 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition-all ${colorClass} ${
                                isSelected
                                  ? "ring-2 ring-offset-2 ring-slate-900 scale-105"
                                  : ""
                              }`}
                            >
                              <span>{d.day}</span>
                              {d.waterMl > 0 && (
                                <span className="text-[9px] opacity-90 font-normal">
                                  {(d.waterMl / 1000).toFixed(1)}L
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Legend */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
                          Concluído (Plano)
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded bg-amber-400 inline-block" />
                          Parcial / Substituído
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded bg-rose-500 inline-block" />
                          Fora do Plano
                        </span>
                      </div>
                    </div>

                    {/* Tomorrow Lookahead Box */}
                    {tomorrowSummary && (
                      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Bell className="w-4 h-4 text-emerald-600" />
                            Radar Lookahead • Amanhã (
                            {tomorrowSummary.tomorrowDayName})
                          </h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                            Cron 18:00 Ativo
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Verifica automaticamente às 18:00 se algum ingrediente
                          das {tomorrowSummary.totalMealsTomorrow} refeições de
                          amanhã está desmarcado.
                        </p>

                        {tomorrowSummary.missingItems.length === 0 ? (
                          <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            Tudo pronto! Todos os ingredientes de amanhã estão
                            marcados em estoque.
                          </div>
                        ) : (
                          <div className="mt-3 space-y-1.5">
                            {tomorrowSummary.missingItems.map((item) => (
                              <div
                                key={item.ingredientId}
                                className="flex items-center justify-between text-xs bg-rose-50 border border-rose-200 text-rose-900 px-3 py-2 rounded-lg"
                              >
                                <span className="font-bold">
                                  🚨 {item.name} ({item.quantityForTomorrow}
                                  {item.unit})
                                </span>
                                <span className="text-[11px] text-rose-700">
                                  {item.mealsUsingIt[0]}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* =====================================================================
                TAB 2: MONTAGEM MENSAL DINÂMICA & GUIA DE RECEITAS BASE
               ===================================================================== */}
            {activeTab === "planner" && (
              <div className="space-y-8">
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Montagem Mensal Dinâmica (Ciclo Semanal Seg a Dom)
                      </h2>
                      <p className="text-xs text-slate-500">
                        Altere qualquer refeição ou quantidade do ciclo do mês{" "}
                        <strong>{selectedMonthYear}</strong> — a Lista de Compras
                        recalcula automaticamente as metas semanais e mensais!
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-slate-600">
                        Mês do Plano:
                      </label>
                      <input
                        type="month"
                        value={selectedMonthYear}
                        onChange={(e) => {
                          if (e.target.value) {
                            setSelectedMonthYear(e.target.value);
                            fetchState(selectedDate, e.target.value);
                          }
                        }}
                        className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 font-semibold"
                      />
                    </div>
                  </div>

                  {/* Day of Week Selector Tabs */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {DAY_LABELS.map((d) => {
                      const active = selectedDayOfWeek === d.dow;
                      return (
                        <button
                          key={d.dow}
                          onClick={() => setSelectedDayOfWeek(d.dow)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            active
                              ? "bg-emerald-600 text-white shadow"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {d.full}
                        </button>
                      );
                    })}
                  </div>

                  {/* Meals for selectedDayOfWeek */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mealTemplates
                      .filter((t) => t.dayOfWeek === selectedDayOfWeek)
                      .sort(
                        (a, b) =>
                          (MEAL_TYPE_META[a.mealType]?.order || 99) -
                          (MEAL_TYPE_META[b.mealType]?.order || 99)
                      )
                      .map((meal) => {
                        const meta = MEAL_TYPE_META[meal.mealType] || {
                          label: meal.mealType,
                          badgeColor: "bg-slate-100 text-slate-800",
                        };
                        return (
                          <div
                            key={meal.id}
                            className="rounded-xl border border-slate-200 p-4 flex flex-col justify-between hover:border-emerald-300 transition-colors"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                                    {meal.scheduledTime}
                                  </span>
                                  <span
                                    className={`text-xs font-bold px-2.5 py-0.5 rounded border ${meta.badgeColor}`}
                                  >
                                    {meta.label}
                                  </span>
                                </div>
                                <button
                                  onClick={() => openEditMealModal(meal)}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                                >
                                  <Edit3 className="w-3.5 h-3.5" /> Editar Prato
                                </button>
                              </div>
                              <h4 className="font-bold text-slate-900 mt-2 text-sm">
                                {meal.title}
                              </h4>
                              <p className="text-xs text-slate-600 mt-1">
                                {meal.description}
                              </p>
                            </div>

                            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                              {meal.ingredients.map((link) => (
                                <span
                                  key={link.id}
                                  className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                                >
                                  {link.ingredient.name}:{" "}
                                  <strong>
                                    {link.quantityNeeded}
                                    {link.ingredient.unit}
                                  </strong>
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Built-in Base Recipes Guide */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-6 h-6 text-emerald-700" />
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Guia de Receitas Base do Cardápio (Embutido)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Preparações oficiais do plano alimentar padrão para
                        otimizar a marmita semanal e substituições
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {baseRecipes.map((rec) => (
                      <div
                        key={rec.id}
                        className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                              {rec.category}
                            </span>
                            <span className="text-slate-500 font-medium">
                              ⏱ {rec.prepTime}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-base mt-2">
                            {rec.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {rec.yieldText} •{" "}
                            <strong className="text-slate-700">
                              {rec.caloriesPerPortion}
                            </strong>
                          </p>

                          <div className="mt-3">
                            <div className="text-xs font-bold text-slate-800 mb-1">
                              Ingredientes:
                            </div>
                            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                              {rec.ingredients.map((ing, i) => (
                                <li key={i}>{ing}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="mt-3">
                            <div className="text-xs font-bold text-slate-800 mb-1">
                              Modo de Preparo:
                            </div>
                            <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                              {rec.steps.map((st, i) => (
                                <li key={i}>{st}</li>
                              ))}
                            </ol>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-emerald-800 bg-emerald-50/60 px-3 py-2 rounded-lg">
                          <strong>Conservação:</strong> {rec.storageTip}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* =====================================================================
                TAB 3: LISTA DE COMPRAS INTELIGENTE (MENSAL & SEMANAL - 39 ITENS)
               ===================================================================== */}
            {activeTab === "shopping" && (
              <div className="space-y-6">
                {/* Summary KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                    <span className="text-xs text-slate-500 font-medium">
                      Catálogo Total
                    </span>
                    <div className="text-2xl font-extrabold text-slate-900 mt-1">
                      {ingredients.length} itens
                    </div>
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      100% vinculado ao cardápio
                    </span>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                    <span className="text-xs text-slate-500 font-medium">
                      Tenho pro Mês
                    </span>
                    <div className="text-2xl font-extrabold text-emerald-700 mt-1">
                      {ingredients.filter((i) => i.inStock).length} /{" "}
                      {ingredients.length}
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Estoque base mensal
                    </span>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                    <span className="text-xs text-slate-500 font-medium">
                      Comprado pra Semana
                    </span>
                    <div className="text-2xl font-extrabold text-sky-700 mt-1">
                      {ingredients.filter((i) => i.boughtForWeek).length} /{" "}
                      {ingredients.length}
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Abastecimento semanal
                    </span>
                  </div>
                  <div className="bg-rose-50 rounded-2xl p-4 border border-rose-200 shadow-sm">
                    <span className="text-xs text-rose-700 font-bold">
                      🚨 Falta para Amanhã!
                    </span>
                    <div className="text-2xl font-extrabold text-rose-700 mt-1">
                      {ingredients.filter((i) => i.missingForTomorrow).length}{" "}
                      item(ns)
                    </div>
                    <span className="text-[11px] text-rose-600">
                      Usados em {tomorrowSummary?.tomorrowDayName}
                    </span>
                  </div>
                </div>

                {/* Filters & Bulk Actions */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        "ALL",
                        "Proteínas",
                        "Laticínios",
                        "Mercearia",
                        "Frutas",
                        "Legumes/Verduras",
                      ].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setShoppingCategory(cat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            shoppingCategory === cat
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {cat === "ALL" ? "Todas Categorias (39)" : cat}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={async () => {
                          await fetch("/api/ingredients", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ action: "RESET_WEEK" }),
                          });
                          await fetchState();
                          showToast(
                            "Checkboxes 'Comprado pra Semana' reiniciados para novo ciclo semanal!"
                          );
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700"
                      >
                        Reiniciar Semana
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <div className="relative flex-1 min-w-[220px]">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Buscar ingrediente (ex: Frango, Patinho, Morango, Pão)..."
                        value={shoppingSearch}
                        onChange={(e) => setShoppingSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                        <input
                          type="checkbox"
                          checked={onlyMissingTomorrow}
                          onChange={(e) =>
                            setOnlyMissingTomorrow(e.target.checked)
                          }
                          className="rounded text-rose-600"
                        />
                        🚨 Apenas "Falta para Amanhã!"
                      </label>

                      <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">
                        <input
                          type="checkbox"
                          checked={onlyUnbought}
                          onChange={(e) => setOnlyUnbought(e.target.checked)}
                          className="rounded text-emerald-600"
                        />
                        <Filter className="w-3.5 h-3.5" /> Apenas Pendentes de
                        Compra
                      </label>
                    </div>
                  </div>
                </div>

                {/* Shopping Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 uppercase text-[11px]">
                          <th className="py-3 px-4">Ingrediente & Alertas</th>
                          <th className="py-3 px-3">Categoria</th>
                          <th className="py-3 px-3">Frequência</th>
                          <th className="py-3 px-3">Meta Semanal</th>
                          <th className="py-3 px-3">Meta Mensal</th>
                          <th className="py-3 px-4 text-center bg-emerald-50/60">
                            [ ] Tenho pro Mês
                          </th>
                          <th className="py-3 px-4 text-center bg-sky-50/60">
                            [ ] Comprado p/ Semana
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredIngredients.map((ing) => {
                          return (
                            <tr
                              key={ing.id}
                              className={`transition-colors ${
                                ing.missingForTomorrow
                                  ? "bg-rose-50/90 hover:bg-rose-100/80"
                                  : ing.inStock || ing.boughtForWeek
                                  ? "bg-white hover:bg-slate-50"
                                  : "bg-amber-50/30 hover:bg-amber-50/60"
                              }`}
                            >
                              <td className="py-3 px-4">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`font-bold text-sm ${
                                      ing.missingForTomorrow
                                        ? "text-rose-900"
                                        : "text-slate-900"
                                    }`}
                                  >
                                    {ing.name}
                                  </span>
                                  {ing.missingForTomorrow && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-600 text-white shadow-sm animate-pulse">
                                      🚨 Falta para Amanhã! (
                                      {ing.tomorrowQuantity}
                                      {ing.unit})
                                    </span>
                                  )}
                                  {!ing.missingForTomorrow &&
                                    ing.usedTomorrow && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                        ✓ Usado amanhã ({ing.tomorrowQuantity}
                                        {ing.unit})
                                      </span>
                                    )}
                                </div>
                                {ing.notes && (
                                  <div className="text-[11px] text-slate-500 mt-0.5">
                                    {ing.notes}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-3 font-medium text-slate-700">
                                {ing.category}
                              </td>
                              <td className="py-3 px-3">
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                                  {FREQ_LABELS[ing.purchaseFrequency] ||
                                    ing.purchaseFrequency}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-bold text-slate-800">
                                {ing.weeklyNeed} {ing.unit}
                              </td>
                              <td className="py-3 px-3 font-semibold text-slate-600">
                                {ing.monthlyNeed} {ing.unit}
                              </td>
                              <td className="py-3 px-4 text-center bg-emerald-50/30">
                                <label className="inline-flex items-center justify-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={ing.inStock}
                                    onChange={() =>
                                      handleToggleIngredient(ing, "inStock")
                                    }
                                    className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                  />
                                </label>
                              </td>
                              <td className="py-3 px-4 text-center bg-sky-50/30">
                                <label className="inline-flex items-center justify-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={ing.boughtForWeek}
                                    onChange={() =>
                                      handleToggleIngredient(
                                        ing,
                                        "boughtForWeek"
                                      )
                                    }
                                    className="w-5 h-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                                  />
                                </label>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* =====================================================================
                TAB 4: MOTOR DE ALERTA POR E-MAIL (LOOKAHEAD CRON 18:00) & CONFIG
               ===================================================================== */}
            {activeTab === "alerts" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 7 cols: Lookahead Engine & Logs */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                          Lookahead Cron Diário ({config?.cronTime || "18:00"})
                        </span>
                        <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                          Motor Inteligente de Alerta Preventivo por E-mail
                        </h2>
                        <p className="text-xs text-slate-600 mt-1">
                          Cruza automaticamente as refeições do dia seguinte (
                          <strong>{tomorrowSummary?.tomorrowDayName}</strong>) com
                          os ingredientes onde{" "}
                          <code>inStock == false && boughtForWeek == false</code>.
                        </p>
                      </div>

                      <button
                        onClick={handleRunLookaheadNow}
                        disabled={testingAlert}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition-all"
                      >
                        <Send className="w-4 h-4" />
                        {testingAlert
                          ? "Verificando e Disparando..."
                          : "Testar Verificação e E-mail Agora"}
                      </button>
                    </div>

                    {/* HTML Email Preview */}
                    {lastAlertHtml && (
                      <div className="mt-5 pt-4 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-700">
                            Pré-visualização do E-mail HTML Gerado:
                          </span>
                          <button
                            onClick={() => setLastAlertHtml(null)}
                            className="text-xs text-slate-500 hover:text-slate-800"
                          >
                            Fechar Preview
                          </button>
                        </div>
                        <div
                          className="border border-slate-200 rounded-xl p-3 bg-slate-50 overflow-x-auto"
                          dangerouslySetInnerHTML={{ __html: lastAlertHtml }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Notification Logs History */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 mb-3">
                      Histórico de Verificações e Alertas Disparados
                    </h3>
                    {notificationLogs.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4">
                        Nenhum alerta disparado ainda. Clique em{" "}
                        <strong>"Testar Verificação e E-mail Agora"</strong> acima
                        para testar!
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {notificationLogs.map((nlog) => (
                          <div
                            key={nlog.id}
                            className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 text-xs"
                          >
                            <div>
                              <div className="font-bold text-slate-900">
                                {nlog.subject}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Destino: {nlog.recipient} • Data Alvo:{" "}
                                {nlog.targetDate} • Disparado em:{" "}
                                {new Date(nlog.sentAt).toLocaleString("pt-BR")}
                              </div>
                              {nlog.errorMessage && (
                                <div className="text-[11px] text-rose-600 mt-1">
                                  Erro: {nlog.errorMessage}
                                </div>
                              )}
                            </div>
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                nlog.status === "SENT"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : nlog.status === "SIMULATED"
                                  ? "bg-sky-100 text-sky-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {nlog.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right 5 cols: AppConfig SMTP / Resend Form */}
                <div className="lg:col-span-5">
                  {config && (
                    <form
                      onSubmit={handleSaveConfig}
                      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4"
                    >
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Settings className="w-5 h-5 text-emerald-600" />
                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            Configurações de E-mail (SMTP / Resend) & Metas
                          </h3>
                          <p className="text-xs text-slate-500">
                            Configure diretamente pela interface web
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          E-mail de Destino dos Alertas
                        </label>
                        <input
                          type="email"
                          value={config.targetEmail}
                          onChange={(e) =>
                            setConfig({ ...config, targetEmail: e.target.value })
                          }
                          className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Provedor de Disparo
                          </label>
                          <select
                            value={config.emailProvider}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                emailProvider: e.target.value,
                              })
                            }
                            className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2"
                          >
                            <option value="SMTP">SMTP (Gmail / Outlook)</option>
                            <option value="RESEND">Resend API</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Horário do Cron Diário
                          </label>
                          <input
                            type="time"
                            value={config.cronTime}
                            onChange={(e) =>
                              setConfig({ ...config, cronTime: e.target.value })
                            }
                            className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2"
                          />
                        </div>
                      </div>

                      {config.emailProvider === "SMTP" ? (
                        <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                SMTP Host
                              </label>
                              <input
                                type="text"
                                value={config.smtpHost}
                                onChange={(e) =>
                                  setConfig({
                                    ...config,
                                    smtpHost: e.target.value,
                                  })
                                }
                                placeholder="smtp.gmail.com"
                                className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Porta
                              </label>
                              <input
                                type="number"
                                value={config.smtpPort}
                                onChange={(e) =>
                                  setConfig({
                                    ...config,
                                    smtpPort: Number(e.target.value),
                                  })
                                }
                                className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Usuário SMTP (Seu E-mail)
                            </label>
                            <input
                              type="text"
                              value={config.smtpUser}
                              onChange={(e) =>
                                setConfig({
                                  ...config,
                                  smtpUser: e.target.value,
                                })
                              }
                              placeholder="seu-email@gmail.com"
                              className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Senha de App SMTP (App Password)
                            </label>
                            <input
                              type="password"
                              value={config.smtpPass}
                              onChange={(e) =>
                                setConfig({
                                  ...config,
                                  smtpPass: e.target.value,
                                })
                              }
                              placeholder="••••••••••••••••"
                              className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                          <label className="block text-[11px] font-bold text-slate-700">
                            Resend API Key (re_...)
                          </label>
                          <input
                            type="password"
                            value={config.resendApiKey}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                resendApiKey: e.target.value,
                              })
                            }
                            placeholder="re_123456789..."
                            className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Meta Diária Água (ml)
                          </label>
                          <input
                            type="number"
                            value={config.dailyWaterGoalMl}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                dailyWaterGoalMl: Number(e.target.value),
                              })
                            }
                            className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Nome da Nutricionista
                          </label>
                          <input
                            type="text"
                            value={config.nutritionistName}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                nutritionistName: e.target.value,
                              })
                            }
                            className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={savingConfig}
                        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow"
                      >
                        {savingConfig
                          ? "Salvando..."
                          : "Salvar Configurações no Servidor"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* =====================================================================
                TAB 5: RELATÓRIO EXECUTIVO PARA A NUTRICIONISTA
               ===================================================================== */}
            {activeTab === "report" && (
              <div className="space-y-6">
                {/* Report Header Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Relatório Executivo de Acompanhamento Clínico & Nutricional
                    </span>
                    <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                      Paciente: {config?.userName || process.env.NEXT_PUBLIC_USER_NAME || "Demo User"} • Referência:{" "}
                      {selectedMonthYear}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Destinatário:{" "}
                      <strong>
                        {config?.nutritionistName || "Dra. Nutricionista"}
                      </strong>{" "}
                      • Gerado pelo NutriTrack OS em{" "}
                      {new Date().toLocaleDateString("pt-BR")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 no-print">
                    <button
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          navigator.clipboard?.writeText(window.location.href);
                          showToast(
                            "Link do relatório copiado para a área de transferência!"
                          );
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700"
                    >
                      <Share2 className="w-4 h-4" /> Compartilhar Link
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow"
                    >
                      <Printer className="w-4 h-4" /> Exportar PDF (Imprimir)
                    </button>
                  </div>
                </div>

                {/* KPI Metrics Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                    <span className="text-xs text-slate-500">
                      Taxa de Adesão Mensal
                    </span>
                    <div className="text-3xl font-extrabold text-emerald-600 mt-1">
                      {reportStats.adherencePct}%
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {reportStats.totalLogged} refeições auditadas no mês
                    </span>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                    <span className="text-xs text-slate-500">
                      Média de Hidratação
                    </span>
                    <div className="text-3xl font-extrabold text-sky-600 mt-1">
                      {reportStats.avgWaterMl} ml
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Meta diária: {waterGoal} ml (+ jejum 500ml)
                    </span>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                    <span className="text-xs text-slate-500">
                      Refeições 100% no Plano
                    </span>
                    <div className="text-3xl font-extrabold text-slate-900 mt-1">
                      {reportStats.completed}
                    </div>
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      Seguidas rigorosamente
                    </span>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                    <span className="text-xs text-slate-500">
                      Substituições / Puladas
                    </span>
                    <div className="text-3xl font-extrabold text-amber-600 mt-1">
                      {reportStats.substituted} / {reportStats.skipped}
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Registradas com justificativa
                    </span>
                  </div>
                </div>

                {/* Adherence & Hydration Chart */}
                {reportStats.chartData.length > 0 && (
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm print-break-inside-avoid">
                    <h3 className="text-sm font-bold text-slate-900 mb-4">
                      Evolução Diária de Refeições & Hidratação ({selectedMonthYear})
                    </h3>
                    <div className="w-full h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reportStats.chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar
                            dataKey="Concluidas"
                            name="Refeições Concluídas"
                            fill="#10b981"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="Substituidas"
                            name="Substituídas"
                            fill="#f59e0b"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="AguaLitros"
                            name="Água (Litros)"
                            fill="#0ea5e9"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Substitutions History */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm print-break-inside-avoid">
                  <h3 className="text-base font-bold text-slate-900 mb-3">
                    Histórico de Substituições e Observações do Mês
                  </h3>
                  {reportStats.substitutionsList.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      Nenhuma substituição registrada neste mês.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {reportStats.substitutionsList.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs flex flex-wrap items-center justify-between gap-2"
                        >
                          <div>
                            <span className="font-bold text-amber-900">
                              {sub.date} •{" "}
                              {sub.mealPlanTemplate?.title || sub.mealType}
                            </span>
                            <p className="text-slate-700 mt-0.5">
                              {sub.actualNotes}
                            </p>
                          </div>
                          {sub.locationName && (
                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-amber-700" />
                              {sub.locationName}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Photo Gallery with Date, Time & GPS Badges */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm print-break-inside-avoid">
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    Galeria Auditável de Fotos das Refeições (Data, Hora & GPS)
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Fotos comprimidas em WebP (&le;400KB) com metadados de
                    horário e geolocalização capturados no check-in
                  </p>

                  {reportStats.photosList.length === 0 ? (
                    <div className="p-8 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                      Nenhuma foto anexada ainda neste mês. Use o botão{" "}
                      <strong>"Registrar Refeição"</strong> na aba Hoje para
                      fotografar seu prato!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {reportStats.photosList.map((plog) => (
                        <div
                          key={plog.id}
                          className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm flex flex-col"
                        >
                          <div className="relative h-48">
                            <img
                              src={plog.photoUrl!}
                              alt="Refeição registrada"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 bg-slate-950/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                              {plog.date} •{" "}
                              {new Date(plog.loggedAt).toLocaleTimeString(
                                "pt-BR",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                            <div className="absolute bottom-2 left-2 right-2 bg-slate-950/80 backdrop-blur-sm text-white text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1 truncate">
                              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              <span className="truncate">
                                {plog.locationName || "GPS Verificado"}
                              </span>
                            </div>
                          </div>
                          <div className="p-3 text-xs">
                            <div className="font-bold text-slate-900">
                              {plog.mealPlanTemplate?.title || "Refeição"}
                            </div>
                            {plog.actualNotes && (
                              <p className="text-slate-600 mt-1 text-[11px]">
                                {plog.actualNotes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* =====================================================================
          MODAL 1: REGISTRAR REFEIÇÃO (FOTO WEBP <= 400KB + GPS + HORÁRIO)
         ===================================================================== */}
      {registerModalMeal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase">
                  Check-in de Refeição • {selectedDate}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {registerModalMeal.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {registerModalMeal.description}
                </p>
              </div>
              <button
                onClick={() => setRegisterModalMeal(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold px-2"
              >
                ✕
              </button>
            </div>

            {/* Status Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Status da Refeição
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    id: "COMPLETED",
                    label: "✓ Concluído",
                    cls: "border-emerald-500 bg-emerald-50 text-emerald-900",
                  },
                  {
                    id: "SUBSTITUTED",
                    label: "⇄ Substituído",
                    cls: "border-amber-500 bg-amber-50 text-amber-900",
                  },
                  {
                    id: "SKIPPED",
                    label: "✕ Pulado",
                    cls: "border-rose-500 bg-rose-50 text-rose-900",
                  },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setRegStatus(st.id)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      regStatus === st.id
                        ? `${st.cls} ring-2 ring-offset-1 ring-slate-900`
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes & Quick Base Recipe Substitutions */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                O que você comeu / Observações
              </label>
              <textarea
                rows={2}
                value={regNotes}
                onChange={(e) => setRegNotes(e.target.value)}
                placeholder="Ex: Segui 100% o plano / Substituí por Lasanha de Berinjela Fit..."
                className="w-full text-xs border border-slate-300 rounded-xl p-2.5"
              />
              {regStatus === "SUBSTITUTED" && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {baseRecipes.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() =>
                        setRegNotes(`Substituído por: ${r.title} (${r.caloriesPerPortion})`)
                      }
                      className="text-[11px] bg-amber-100 hover:bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md font-medium"
                    >
                      + {r.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* GPS Location + Quick Location Tags */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  Localização GPS / Tag Rápida
                </label>
                <button
                  type="button"
                  onClick={captureGpsLocation}
                  disabled={gettingGps}
                  className="text-[11px] font-bold text-emerald-700 hover:underline"
                >
                  {gettingGps ? "Capturando GPS..." : "📡 Atualizar via GPS"}
                </button>
              </div>
              <input
                type="text"
                value={regLocationName}
                onChange={(e) => setRegLocationName(e.target.value)}
                placeholder="Bairro, Cidade ou Tag..."
                className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
              />
              <div className="flex flex-wrap gap-1.5">
                {[
                  "🏠 Casa",
                  "🏢 Trabalho",
                  "🏋️ Pós-Treino / Academia",
                  "🍽️ Restaurante",
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setRegLocationName(tag)}
                    className="text-[11px] bg-white border border-slate-300 hover:bg-slate-100 px-2.5 py-1 rounded-lg font-medium"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Upload with Client-Side Canvas WebP Compression */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Foto do Prato (Compressão Automática WebP &le; 400KB)
              </label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoSelect}
                className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100"
              />
              {uploadingPhoto && (
                <p className="text-xs text-emerald-700 font-semibold animate-pulse">
                  Comprimindo em Canvas WebP e enviando...
                </p>
              )}
              {regPhotoStats && (
                <p className="text-[11px] text-emerald-700 font-semibold">
                  ✓ Otimizado: de {regPhotoStats.originalKB} KB para{" "}
                  <strong>{regPhotoStats.sizeKB} KB (WebP)</strong>
                </p>
              )}

              {regPhotoUrl && (
                <div className="relative rounded-xl overflow-hidden border border-slate-300 mt-2">
                  <img
                    src={regPhotoUrl}
                    alt="Preview do prato"
                    className="w-full h-48 object-cover"
                  />
                  {/* Live Badge Overlay with Exact Time + GPS */}
                  <div className="absolute bottom-2 left-2 right-2 bg-slate-950/85 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-300">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date().toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="inline-flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      {regLocationName || "GPS Ativo"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRegisterModalMeal(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveMealLog}
                disabled={savingLog || uploadingPhoto}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow"
              >
                {savingLog ? "Salvando..." : "Confirmar Registro"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: EDITAR PRATO NA MONTAGEM MENSAL DINÂMICA
         ===================================================================== */}
      {editingMeal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase">
                  Editar Refeição do Ciclo ({selectedMonthYear})
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {editingMeal.title}
                </h3>
              </div>
              <button
                onClick={() => setEditingMeal(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Título do Prato
                </label>
                <input
                  type="text"
                  value={editMealTitle}
                  onChange={(e) => setEditMealTitle(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Horário
                </label>
                <input
                  type="time"
                  value={editMealTime}
                  onChange={(e) => setEditMealTime(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Descrição Detalhada (Porções)
              </label>
              <textarea
                rows={2}
                value={editMealDesc}
                onChange={(e) => setEditMealDesc(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-xl p-2.5"
              />
            </div>

            {/* Linked Ingredients Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Ingredientes Vinculados (Recalcula Lista de Compras)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (ingredients.length > 0) {
                      setEditMealIngredients([
                        ...editMealIngredients,
                        { ingredientId: ingredients[0].id, quantityNeeded: 50 },
                      ]);
                    }
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Ingrediente
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {editMealIngredients.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={row.ingredientId}
                      onChange={(e) => {
                        const next = [...editMealIngredients];
                        next[idx].ingredientId = e.target.value;
                        setEditMealIngredients(next);
                      }}
                      className="flex-1 text-xs border border-slate-300 rounded-lg px-2 py-1.5"
                    >
                      {ingredients.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name} ({ing.unit})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={row.quantityNeeded}
                      onChange={(e) => {
                        const next = [...editMealIngredients];
                        next[idx].quantityNeeded = Number(e.target.value);
                        setEditMealIngredients(next);
                      }}
                      className="w-24 text-xs border border-slate-300 rounded-lg px-2 py-1.5"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditMealIngredients(
                          editMealIngredients.filter((_, i) => i !== idx)
                        )
                      }
                      className="text-rose-600 text-xs font-bold px-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingMeal(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveMealTemplate}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow"
              >
                Salvar e Recalcular Compras
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg no-print">
        {[
          { id: "dashboard", label: "Hoje", icon: CalendarIcon },
          { id: "planner", label: "Cardápio", icon: ChefHat },
          { id: "shopping", label: "Compras", icon: ShoppingCart },
          { id: "alerts", label: "Alertas", icon: Bell },
          { id: "report", label: "Nutri PDF", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(
                  tab.id as
                    | "dashboard"
                    | "planner"
                    | "shopping"
                    | "alerts"
                    | "report"
                )
              }
              className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                active ? "text-emerald-700 bg-emerald-50" : "text-slate-500"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
