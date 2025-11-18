"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Copy, Check, AlertTriangle, Download } from "lucide-react"

interface SecretNoteModalProps {
  isOpen: boolean
  onClose: () => void
  secretNote: string
}

export function SecretNoteModal({ isOpen, onClose, secretNote }: SecretNoteModalProps) {
  const [copied, setCopied] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const { toast } = useToast()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(secretNote)
    setCopied(true)
    toast({
      title: "Copied to clipboard",
      description: "Secret note has been copied",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([secretNote], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `flowshield-secret-note-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Downloaded",
      description: "Secret note saved to your device",
    })
  }

  const handleClose = () => {
    if (!confirmed) {
      toast({
        title: "Please confirm",
        description: "You must confirm you have saved your secret note",
        variant: "destructive",
      })
      return
    }
    onClose()
    setConfirmed(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-primary" />
            Save Your Secret Note
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            This is your only chance to save this note. You will need it to withdraw your funds.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-destructive/10 border-2 border-destructive/30 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-destructive mb-1">Critical Security Warning</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>This note cannot be recovered if lost</li>
                  <li>Never share this note with anyone</li>
                  <li>Store it in a secure location</li>
                  <li>You need this note to withdraw your funds</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Your Secret Note</label>
            <div className="relative">
              <div className="bg-secondary border border-border rounded-lg p-4 pr-12 font-mono text-sm break-all">
                {secretNote}
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCopy}
                className="absolute right-2 top-2 hover:bg-primary/10"
              >
                {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleCopy} variant="outline" className="flex-1 bg-transparent">
              <Copy className="w-4 h-4 mr-2" />
              Copy Note
            </Button>
            <Button onClick={handleDownload} variant="outline" className="flex-1 bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>

          <div className="flex items-start gap-3 bg-secondary/50 border border-border rounded-lg p-4">
            <input
              type="checkbox"
              id="confirm-saved"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 w-4 h-4 accent-primary"
            />
            <label htmlFor="confirm-saved" className="text-sm cursor-pointer">
              I have saved my secret note in a secure location and understand that I cannot recover it if lost. I will
              need this note to withdraw my funds.
            </label>
          </div>

          <Button
            onClick={handleClose}
            disabled={!confirmed}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold"
          >
            I Have Saved My Secret Note
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
