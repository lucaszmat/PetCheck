import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // 1) Pega usuário logado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Usuário não autenticado." },
        { status: 401 }
      )
    }

    const petId = params.id

    // 2) Garante que o pet existe
    //    (RLS já restringe para o tutor certo)
    const { data: pet, error: petError } = await supabase
      .from("pets")
      .select("id, tutor_id")
      .eq("id", petId)
      .single()

    if (petError || !pet) {
      console.error("Pet não encontrado ou sem permissão:", petError)
      return NextResponse.json(
        { error: "Pet não encontrado para este usuário." },
        { status: 404 }
      )
    }

    // 3) Deleta o pet
    //    Se você tiver FKs com ON DELETE CASCADE,
    //    as consultas/vacinas/etc. serão apagadas junto.
    const { error: deleteError } = await supabase
      .from("pets")
      .delete()
      .eq("id", petId)

    if (deleteError) {
      console.error("Erro ao excluir pet:", deleteError)
      return NextResponse.json(
        { error: `Erro ao excluir o pet: ${deleteError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err: any) {
    console.error("Erro inesperado no DELETE /api/pets/[id]:", err)
    return NextResponse.json(
      { error: "Erro interno ao excluir o pet." },
      { status: 500 }
    )
  }
}
