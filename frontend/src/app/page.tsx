"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, AlertTriangle, Search, Activity, Upload, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ForensicDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [claim, setClaim] = useState("");
  const [loading, setLoading] = useState(false);
  const [visualResult, setVisualResult] = useState<any>(null);
  const [contextResult, setContextResult] = useState<any>(null);

  const handleVisualUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setLoading(true);
    setVisualResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:8000/analyze-media", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      // FIX: Ensure data is an object
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      setVisualResult(parsedData);
    } catch (err) {
      console.error("Visual Analysis Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleContextCheck = async () => {
    if (!claim) return;
    setLoading(true);
    setContextResult(null);

    try {
      const response = await fetch("http://localhost:8000/verify-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: claim }),
      });
      const data = await response.json();
      // FIX: Handle cases where Groq might return a stringified JSON
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      setContextResult(parsedData);
    } catch (err) {
      console.error("Contextual Analysis Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-green-500/30">
      <nav className="border-b border-white/10 px-8 py-4 flex justify-between items-center bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
            <ShieldCheck className="text-black w-5 h-5" />
          </div>
          <span className="font-bold tracking-tighter text-xl italic text-white uppercase">VERISIGHT <span className="text-green-500 font-black">AI</span></span>
        </div>
        <Badge variant="outline" className="border-green-500/50 text-green-400 bg-green-500/5 px-3 py-1 animate-pulse">
            Neural Engine: Active
        </Badge>
      </nav>

      <main className="max-w-6xl mx-auto p-8">
        <Tabs defaultValue="visual" className="w-full">
          <TabsList className="bg-slate-900/50 border border-white/5 mb-8 p-1">
            <TabsTrigger value="visual" className="data-[state=active]:bg-green-600 data-[state=active]:text-black">
              <Activity className="w-4 h-4 mr-2" /> Visual Forensics
            </TabsTrigger>
            <TabsTrigger value="context" className="data-[state=active]:bg-green-600 data-[state=active]:text-black">
              <Search className="w-4 h-4 mr-2" /> Contextual Verification
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visual">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-slate-900/40 border-white/5 h-[400px] flex flex-col items-center justify-center relative overflow-hidden group border-dashed border-2">
                {loading && (
                  <div className="absolute inset-0 z-20 bg-black/80 flex flex-col items-center justify-center">
                    <div className="w-full h-1 bg-green-500 absolute top-0 animate-[scan_2s_linear_infinite] shadow-[0_0_15px_#22c55e]" />
                    <p className="text-green-500 font-mono animate-pulse tracking-widest text-sm uppercase">Deep Scanning Media...</p>
                  </div>
                )}
                <input type="file" onChange={handleVisualUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <Upload className="w-12 h-12 text-slate-700 mb-4 group-hover:text-green-500 transition-colors" />
                <p className="text-slate-400 font-medium">{file ? file.name : "Drop Forensic Evidence"}</p>
              </Card>
              
              <AnimatePresence mode="wait">
                {visualResult && (
                  <motion.div key="visual-res" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <Card className={`h-full border-t-4 bg-slate-900/40 ${visualResult.is_tampered ? 'border-t-red-500' : 'border-t-green-500'}`}>
                      <CardHeader>
                        <CardTitle className="text-xs uppercase tracking-[0.2em] text-slate-500 flex justify-between items-center">
                            Forensic Report
                            {visualResult.is_tampered ? <AlertTriangle className="text-red-500 w-4 h-4" /> : <CheckCircle2 className="text-green-500 w-4 h-4" />}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                           <div className={`text-7xl font-black ${visualResult.is_tampered ? 'text-red-500' : 'text-green-500'}`}>
                             {visualResult.integrity_score ?? 0}%
                           </div>
                           <p className="text-sm text-slate-400 uppercase tracking-widest mt-1">Authenticity Score</p>
                        </div>

                        <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            key={`bar-${visualResult.integrity_score}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${visualResult.integrity_score ?? 0}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={`h-full ${visualResult.is_tampered ? 'bg-red-500' : 'bg-green-500'} shadow-[0_0_10px_rgba(34,197,94,0.3)]`}
                          />
                        </div>

                        <div className="p-4 bg-black/40 rounded border border-white/5 font-mono text-xs text-slate-300 leading-relaxed uppercase">
                           <span className="text-green-500 mr-2 font-bold">LOG_REPORT:</span>
                           {visualResult.report || "Analysis complete."}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="context">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-slate-900/40 border-white/5">
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-widest text-slate-500">Cross-Reference Investigation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <textarea 
                    value={claim}
                    onChange={(e) => setClaim(e.target.value)}
                    className="w-full h-48 bg-black/50 border border-white/10 rounded-lg p-4 text-slate-200 focus:border-green-500 outline-none transition-all resize-none"
                    placeholder="Paste a viral headline or claim to verify..."
                  />
                  <Button 
                    onClick={handleContextCheck}
                    disabled={loading || !claim}
                    className="w-full bg-green-600 hover:bg-green-700 text-black font-black uppercase tracking-widest py-6 transition-all"
                  >
                    {loading ? "Accessing Global Databases..." : "Run Truth Engine"}
                  </Button>
                </CardContent>
              </Card>

              <AnimatePresence mode="wait">
                {contextResult && (
                  <motion.div key="context-res" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <Card className={`h-full border-t-4 bg-slate-900/40 ${contextResult.verdict === 'FALSE' ? 'border-t-red-500' : 'border-t-green-500'}`}>
                       <CardHeader><CardTitle className="text-xs uppercase text-slate-500 tracking-widest">Final Verdict Synthesis</CardTitle></CardHeader>
                       <CardContent className="space-y-6">
                          <div className={`text-6xl font-black ${contextResult.verdict === 'FALSE' ? 'text-red-500' : 'text-green-500'}`}>
                            {contextResult.verdict || "UNKNOWN"}
                          </div>
                          
                          <div className="space-y-2">
                             <div className="flex justify-between text-[10px] uppercase text-slate-500 font-bold">
                                <span>Confidence</span>
                                <span>{contextResult.confidence ?? 0}%</span>
                             </div>
                             <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                <motion.div 
                                  key={`conf-${contextResult.confidence}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${contextResult.confidence ?? 0}%` }}
                                  transition={{ duration: 1.2, ease: "easeOut" }}
                                  className="h-full bg-slate-400"
                                />
                             </div>
                          </div>
                          
                          <div className="bg-black/50 p-4 rounded border border-white/5 relative overflow-hidden">
                             <div className="absolute top-0 left-0 w-1 h-full bg-green-500/30" />
                             <p className="text-slate-300 text-sm leading-relaxed italic">
                                "{contextResult.explanation || "Verification complete."}"
                             </p>
                          </div>
                       </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(400px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}