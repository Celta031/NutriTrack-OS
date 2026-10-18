import nodemailer from "nodemailer";
import { prisma } from "./prisma";
import { ensureSeeded } from "./seed-data";
import { syncWeeklyInventoryExpiration } from "./week-cycle";

export interface MissingTomorrowItem {
  ingredientId: string;
  name: string;
  category: string;
  unit: string;
  quantityForTomorrow: number;
  weeklyNeed: number;
  mealsUsingIt: string[];
}

export interface LookaheadResult {
  tomorrowDate: string;
  tomorrowDayOfWeek: number;
  tomorrowDayName: string;
  totalMealsTomorrow: number;
  missingItems: MissingTomorrowItem[];
  status: "SENT" | "SIMULATED" | "FAILED";
  message: string;
  htmlPreview: string;
  notificationLogId: string;
}

const DAY_NAMES = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

const MEAL_TYPE_LABELS: Record<string, string> = {
  BREAKFAST: "Café da Manhã",
  MORNING_SNACK: "Colação",
  LUNCH: "Almoço",
  AFTERNOON_SNACK: "Lanche da Tarde",
  DINNER: "Jantar",
  SUPPER: "Ceia",
};

export async function computeTomorrowMissing(
  userId: string,
  referenceDate?: Date
) {
  const base = referenceDate ? new Date(referenceDate) : new Date();
  const tomorrow = new Date(base);
  tomorrow.setDate(base.getDate() + 1);

  const tomorrowDate = `${tomorrow.getFullYear()}-${String(
    tomorrow.getMonth() + 1
  ).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
  const monthYear = `${tomorrow.getFullYear()}-${String(
    tomorrow.getMonth() + 1
  ).padStart(2, "0")}`;
  const tomorrowDayOfWeek = tomorrow.getDay();
  const tomorrowDayName = DAY_NAMES[tomorrowDayOfWeek];

  await ensureSeeded(monthYear, userId);

  // SPEC-09: Auto-expire boughtForWeek items if the ISO week has rolled over
  await syncWeeklyInventoryExpiration(userId, base);

  const tomorrowTemplates = await prisma.mealPlanTemplate.findMany({
    where: {
      userId,
      monthYear,
      dayOfWeek: tomorrowDayOfWeek,
    },
    include: {
      ingredients: {
        include: {
          ingredient: true,
        },
      },
    },
    orderBy: {
      scheduledTime: "asc",
    },
  });

  const missingMap = new Map<string, MissingTomorrowItem>();

  for (const meal of tomorrowTemplates) {
    const mealLabel = `${MEAL_TYPE_LABELS[meal.mealType] || meal.mealType} (${meal.scheduledTime})`;
    for (const link of meal.ingredients) {
      const ing = link.ingredient;
      if (!ing.inStock && !ing.boughtForWeek) {
        const existing = missingMap.get(ing.id);
        if (existing) {
          existing.quantityForTomorrow += link.quantityNeeded;
          if (!existing.mealsUsingIt.includes(mealLabel)) {
            existing.mealsUsingIt.push(mealLabel);
          }
        } else {
          missingMap.set(ing.id, {
            ingredientId: ing.id,
            name: ing.name,
            category: ing.category,
            unit: ing.unit,
            quantityForTomorrow: link.quantityNeeded,
            weeklyNeed: ing.weeklyNeed,
            mealsUsingIt: [mealLabel],
          });
        }
      }
    }
  }

  return {
    tomorrowDate,
    tomorrowDayOfWeek,
    tomorrowDayName,
    tomorrowTemplates,
    missingItems: Array.from(missingMap.values()),
  };
}

export async function runLookaheadCheck(
  userId: string,
  options?: {
    referenceDate?: Date;
    forceSendEvenIfComplete?: boolean;
  }
): Promise<LookaheadResult> {
  const {
    tomorrowDate,
    tomorrowDayOfWeek,
    tomorrowDayName,
    tomorrowTemplates,
    missingItems,
  } = await computeTomorrowMissing(userId, options?.referenceDate);

  const [user, config] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.appConfig.findUnique({ where: { userId } }),
  ]);

  const recipient =
    config?.targetEmail ||
    user?.email ||
    process.env.ALERT_RECIPIENT_EMAIL ||
    "user@example.com";
  const userName =
    config?.userName ||
    user?.name ||
    process.env.NEXT_PUBLIC_USER_NAME ||
    "Demo User";
  const configuredTime = config?.alertTime || config?.cronTime || "18:00";

  const subject =
    missingItems.length > 0
      ? `⚠️ [NutriTrack OS] Alerta (${configuredTime}): ${missingItems.length} ingrediente(s) faltando para amanhã (${tomorrowDayName})`
      : `✅ [NutriTrack OS] Estoque 100% pronto para amanhã (${tomorrowDayName})`;

  const rowsHtml =
    missingItems.length > 0
      ? missingItems
          .map(
            (item) => `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #b91c1c;">
            🚨 ${item.name}
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #334155;">
            ${item.category}
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #0f172a;">
            ${item.quantityForTomorrow} ${item.unit}
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #475569;">
            ${item.mealsUsingIt.join(", ")}
          </td>
        </tr>`
          )
          .join("")
      : `<tr><td colspan="4" style="padding: 16px; text-align: center; color: #059669; font-weight: 600;">🎉 Todos os ingredientes das refeições de amanhã já estão marcados em estoque!</td></tr>`;

  const htmlPreview = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #065f46 0%, #10b981 100%); color: white; padding: 20px 24px;">
        <h2 style="margin: 0; font-size: 20px;">NutriTrack OS • Lookahead Diário (${configuredTime})</h2>
        <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">
          Olá, <strong>${userName}</strong>! Verificação preventiva para <strong>${tomorrowDayName} (${tomorrowDate})</strong>.
        </p>
      </div>
      <div style="padding: 20px 24px;">
        <p style="margin-top: 0; color: #334155; font-size: 14px;">
          Cruzamos as <strong>${tomorrowTemplates.length} refeições planejadas para amanhã</strong> com o seu estoque vivo (itens onde <em>"Tenho pro Mês"</em> e <em>"Comprado p/ Semana"</em> estão desmarcados):
        </p>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;">
          <thead>
            <tr style="background: #f8fafc; text-align: left; color: #475569;">
              <th style="padding: 10px 12px; border-bottom: 2px solid #cbd5e1;">Ingrediente em Falta</th>
              <th style="padding: 10px 12px; border-bottom: 2px solid #cbd5e1;">Categoria</th>
              <th style="padding: 10px 12px; border-bottom: 2px solid #cbd5e1;">Qtd. Amanhã</th>
              <th style="padding: 10px 12px; border-bottom: 2px solid #cbd5e1;">Refeições Afetadas</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #065f46;">
          <strong>Dica de Ação:</strong> Compre ou descongele os itens acima hoje à noite e marque <em>"Comprado p/ Semana"</em> na aba <strong>Lista de Compras</strong> do NutriTrack OS para não furar a dieta amanhã!
        </div>
      </div>
    </div>
  `;

  let status: "SENT" | "SIMULATED" | "FAILED" = "SIMULATED";
  let message =
    "Verificação concluída! E-mail processado em modo de pré-visualização (configure credenciais SMTP ou Resend na aba Alertas/Config para disparo externo real).";
  let errorMessage: string | undefined;

  try {
    if (
      config?.emailProvider === "RESEND" &&
      config.resendApiKey &&
      config.resendApiKey.trim() !== ""
    ) {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.resendApiKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "NutriTrack OS <onboarding@resend.dev>",
          to: [recipient],
          subject,
          html: htmlPreview,
        }),
      });
      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Resend API Error (${resp.status}): ${errText}`);
      }
      status = "SENT";
      message = `E-mail enviado com sucesso via Resend para ${recipient}!`;
    } else if (
      config?.emailProvider === "SMTP" &&
      config.smtpUser &&
      config.smtpPass &&
      config.smtpUser.trim() !== "" &&
      config.smtpPass.trim() !== ""
    ) {
      const transporter = nodemailer.createTransport({
        host: config.smtpHost || "smtp.gmail.com",
        port: config.smtpPort || 587,
        secure: (config.smtpPort || 587) === 465,
        auth: {
          user: config.smtpUser.trim(),
          pass: config.smtpPass.trim(),
        },
      });

      await transporter.sendMail({
        from: `"NutriTrack OS - ${userName}" <${config.smtpUser.trim()}>`,
        to: recipient,
        subject,
        html: htmlPreview,
      });

      status = "SENT";
      message = `E-mail enviado com sucesso via SMTP (${config.smtpHost}) para ${recipient}!`;
    }
  } catch (err: unknown) {
    status = "FAILED";
    errorMessage = err instanceof Error ? err.message : String(err);
    message = `Verificação realizada, porém falha no envio SMTP/Resend: ${errorMessage}`;
  }

  const log = await prisma.notificationLog.create({
    data: {
      userId,
      targetDate: tomorrowDate,
      recipient,
      subject,
      missingCount: missingItems.length,
      missingItems: JSON.stringify(missingItems),
      status,
      errorMessage,
    },
  });

  return {
    tomorrowDate,
    tomorrowDayOfWeek,
    tomorrowDayName,
    totalMealsTomorrow: tomorrowTemplates.length,
    missingItems,
    status,
    message,
    htmlPreview,
    notificationLogId: log.id,
  };
}
