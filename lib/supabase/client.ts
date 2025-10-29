import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    "https://ompqznwbshheryqbllom.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tcHF6bndic2hoZXJ5cWJsbG9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMzk4MzYsImV4cCI6MjA3MTkxNTgzNn0.whwCjVMKNP4bLTM7LBSe4OEvxFn4fEcjs4rHFKnB08s"
  )
}
