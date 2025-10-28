import { redirect } from "next/navigation"

export default function ProtectedPage() {
  // Redirecionar para o dashboard
  redirect("/dashboard")
}
