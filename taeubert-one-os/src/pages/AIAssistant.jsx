import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Bot, User, Sparkles, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

const QUICK_QUESTIONS = [
  "Wie ist der Finishprozess bei Täubert?",
  "Was sind häufige Fehler bei der Vorbereitung?",
  "Wie erkenne ich Hologramme?",
  "Wie mische ich Farbtöne korrekt?",
  "Was ist beim Klarlack zu beachten?",
  "Wie gehe ich bei Läufern vor?",
];

const SYSTEM_PROMPT = `Du bist der Assistent von Täubert One — dem digitalen Betriebssystem der Täubert Karosserie & Lack.

Du kennst alle Arbeitsstandards. Beantworte Fragen zu:
- Lackierprozessen, Vorbereitung, Finish, Polieren
- Fehleranalyse (Hologramme, Läufer, Farbton, Staub, Übergänge)
- Qualitätsstandards und SOPs
- Fahrzeugannahme und Übergabe
- Materialien und Werkzeuge

Antworte präzise, praxisnah und auf Deutsch. Verwende klare Punkte und Schritte.
Du hilfst Mitarbeitern dabei, den Täubert Standard täglich zu erfüllen.`;

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Guten Morgen! Ich bin dein Täubert Assistent. Ich helfe dir bei Prozessen, Standards und Fragen rund um den Betrieb. Was möchtest du wissen?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploadedUrl(file_url);
  };

  const sendMessage = async (text = input) => {
    if (!text.trim() && !uploadedUrl) return;
    const userMessage = { role: "user", content: text || "Analysiere dieses Bild.", imageUrl: imagePreview };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setImageFile(null);
    setImagePreview(null);
    const imgUrl = uploadedUrl;
    setUploadedUrl(null);
    setIsLoading(true);

    const conversationHistory = [
      ...messages.map(m => `${m.role === "assistant" ? "Assistent" : "Mitarbeiter"}: ${m.content}`),
      `Mitarbeiter: ${text || "Analysiere dieses Bild."}`,
    ].join("\n");

    const prompt = `${SYSTEM_PROMPT}\n\nGesprächsverlauf:\n${conversationHistory}\n\nBitte antworte als Assistent:`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      file_urls: imgUrl ? [imgUrl] : undefined,
    });

    setMessages(prev => [...prev, { role: "assistant", content: response }]);
    setIsLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-lg text-foreground tracking-wide">TÄUBERT ASSISTENT</h1>
            <p className="text-xs text-muted-foreground">SOPs · Prozesse · Qualitätsstandards</p>
            <p className="text-xs text-muted-foreground">SOPs · Prozesse · Qualitätsstandards</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] text-success font-semibold tracking-widest">AKTIV</span>
          </div>
        </div>
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <div className="p-4 border-b border-border">
          <p className="text-[10px] tracking-widest text-muted-foreground mb-3">HÄUFIGE FRAGEN</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 rounded-lg bg-secondary border border-border hover:border-primary/30 text-muted-foreground hover:text-foreground transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === "assistant" ? "bg-primary/10 border border-primary/20" : "bg-secondary border border-border"}`}>
                {msg.role === "assistant" ? <Bot className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-muted-foreground" />}
              </div>
              <div className={`max-w-[80%] rounded-xl p-3.5 ${msg.role === "assistant" ? "bg-card border border-border" : "bg-primary/10 border border-primary/20"}`}>
                {msg.imageUrl && (
                  <img src={msg.imageUrl} alt="Uploaded" className="rounded-lg max-h-40 mb-2 object-cover" />
                )}
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-card border border-border rounded-xl p-3.5">
              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        {imagePreview && (
          <div className="mb-2 flex items-center gap-2">
            <img src={imagePreview} alt="Preview" className="h-12 w-12 rounded-lg object-cover" />
            <button onClick={() => { setImagePreview(null); setImageFile(null); setUploadedUrl(null); }} className="text-xs text-destructive">Entfernen</button>
          </div>
        )}
        <div className="flex gap-2 items-end">
          <label className="cursor-pointer p-2 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors">
            <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            <Camera className="w-4 h-4" />
          </label>
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Frag mich alles über Prozesse, Standards, Fehler..."
            className="flex-1 bg-secondary border-border resize-none h-11 min-h-[44px] max-h-32 py-2.5"
            rows={1}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={(!input.trim() && !uploadedUrl) || isLoading}
            className="bg-primary hover:bg-primary/80 h-11 px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}