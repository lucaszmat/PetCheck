/**
 * Função helper para criar notificação na API
 */
export async function criarNotificacao(data: {
  tutor_id: string
  titulo: string
  data_lembrete: string
  notificar_antecedencia: boolean
  minutos_antecedencia?: number | null
}) {
  try {
    const response = await fetch("https://api.petcheck.codexsengineer.com.br/api/notifications/reminders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tutor_id: data.tutor_id,
        titulo: data.titulo,
        data_lembrete: data.data_lembrete,
        notificar_antecedencia: data.notificar_antecedencia,
        minutos_antecedencia: data.notificar_antecedencia ? (data.minutos_antecedencia || 60) : undefined,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Erro ao criar notificação" }))
      throw new Error(errorData.message || "Erro ao criar notificação")
    }

    const result = await response.json()
    return { success: true, data: result }
  } catch (error) {
    console.error("Erro ao criar notificação:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar notificação",
    }
  }
}

