"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { HelpCircle, MessageCircle, Rocket, CheckCircle } from "lucide-react"

export function HelpButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Botão flutuante de ajuda */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 z-50"
          >
            <HelpCircle className="h-6 w-6" />
            <span className="sr-only">Abrir ajuda</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-emerald-800 flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Como podemos ajudar você?
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600">Chat de Suporte</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="text-4xl mb-2">👋</div>
              <p className="text-gray-700 mb-4">
                Olá! Em breve teremos um chat de suporte ao vivo para ajudar você com todas as suas dúvidas sobre o
                PetCheck.
              </p>

              <div className="flex items-center justify-center gap-2 text-emerald-600 font-medium mb-4">
                <Rocket className="h-4 w-4" />
                <span>Funcionalidade em desenvolvimento</span>
              </div>

              <p className="text-gray-600 text-sm mb-6">
                Por enquanto, você pode explorar o sistema e usar todas as funcionalidades disponíveis. Em caso de
                dúvidas, entre em contato conosco!
              </p>
            </div>

            <div className="bg-emerald-50 rounded-lg p-4">
              <h4 className="font-medium text-emerald-800 mb-3">Enquanto isso, você pode:</h4>
              <ul className="space-y-2 text-sm text-emerald-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  Explorar o dashboard e suas funcionalidades
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  Cadastrar seus pets
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  Agendar consultas e vacinas
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  Configurar notificações
                </li>
              </ul>
            </div>

            <div className="flex justify-center pt-2">
              <Button onClick={() => setIsOpen(false)} className="bg-emerald-600 hover:bg-emerald-700">
                Entendi, obrigado!
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
