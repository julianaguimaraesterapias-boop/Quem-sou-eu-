import { GoogleGenAI, Modality } from "@google/genai";
import { Play, Pause, Loader2, Volume2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { handleFirestoreError, OperationType } from "../firestoreErrorHandler";

interface AudioPlayerProps {
  prompt: string;
  dayId: number;
}

export default function AudioPlayer({ prompt, dayId }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [error, setError] = useState<string | null>(null);

  // Ensure user is authenticated (anonymously if needed)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.error("Auth error:", err);
        }
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Helper to add WAV header to raw PCM data
  const addWavHeader = (pcmData: Uint8Array, sampleRate: number) => {
    const header = new ArrayBuffer(44);
    const view = new DataView(header);

    // RIFF identifier
    view.setUint32(0, 0x52494646, false); // "RIFF"
    // file length
    view.setUint32(4, 36 + pcmData.length, true);
    // RIFF type
    view.setUint32(8, 0x57415645, false); // "WAVE"
    // format chunk identifier
    view.setUint32(12, 0x666d7420, false); // "fmt "
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw)
    view.setUint16(20, 1, true); // PCM
    // channel count
    view.setUint16(22, 1, true); // Mono
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * 2, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, 2, true);
    // bits per sample
    view.setUint16(34, 16, true);
    // data chunk identifier
    view.setUint32(36, 0x64617461, false); // "data"
    // data chunk length
    view.setUint32(40, pcmData.length, true);

    const blob = new Blob([header, pcmData], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  };

  const base64ToBlobUrl = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return addWavHeader(bytes, 24000);
  };

  const loadSavedAudio = async () => {
    if (!auth.currentUser) return;
    
    const path = "daily_audios";
    try {
      const q = query(
        collection(db, path),
        where("dayId", "==", dayId),
        where("userId", "==", auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        const url = base64ToBlobUrl(data.audioBase64);
        setAudioUrl(url);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    }
  };

  const generateAudio = async () => {
    if (audioUrl) {
      setIsPlaying(true);
      audioRef.current?.play();
      return;
    }

    if (!auth.currentUser) {
      setError("Aguardando autenticação...");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const part = response.candidates?.[0]?.content?.parts?.[0];
      const base64Audio = part?.inlineData?.data;
      
      if (base64Audio) {
        // Save to Firestore
        const path = "daily_audios";
        try {
          await addDoc(collection(db, path), {
            dayId,
            audioBase64: base64Audio,
            userId: auth.currentUser.uid,
            createdAt: serverTimestamp()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, path);
        }

        const url = base64ToBlobUrl(base64Audio);
        setAudioUrl(url);
        setIsPlaying(true);
      } else {
        throw new Error("Nenhum dado de áudio recebido da IA.");
      }
    } catch (err) {
      console.error("Error generating audio:", err);
      setError("Não foi possível gerar o áudio. Verifique sua conexão ou tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (audioUrl && isPlaying) {
      audioRef.current?.play();
    }
  }, [audioUrl, isPlaying]);

  const togglePlay = () => {
    if (!audioUrl) {
      generateAudio();
    } else {
      if (isPlaying) {
        audioRef.current?.pause();
      } else {
        audioRef.current?.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Reset and load saved audio when day changes or auth is ready
  useEffect(() => {
    setAudioUrl(null);
    setIsPlaying(false);
    if (isAuthReady) {
      loadSavedAudio();
    }
  }, [dayId, isAuthReady]);

  return (
    <div className="flex items-center gap-4 p-4 bg-stone-100 rounded-2xl border border-stone-200">
      <button
        id={`play-button-${dayId}`}
        onClick={togglePlay}
        disabled={isLoading}
        className="w-12 h-12 flex items-center justify-center bg-stone-800 text-white rounded-full hover:bg-stone-700 transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-6 h-6" />
        ) : (
          <Play className="w-6 h-6 ml-1" />
        )}
      </button>
      <div className="flex-1">
        <p className={`text-sm font-medium flex items-center gap-2 ${error ? "text-red-600" : "text-stone-800"}`}>
          <Volume2 className="w-4 h-4" />
          {isLoading ? "Gerando áudio com IA..." : error ? "Erro no áudio" : audioUrl ? "Áudio pronto" : "Ouvir este dia"}
        </p>
        <p className={`text-xs ${error ? "text-red-400" : "text-stone-500"}`}>
          {isLoading ? "Isso pode levar alguns segundos" : error ? error : "Narração por voz de IA"}
        </p>
      </div>
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}
    </div>
  );
}
