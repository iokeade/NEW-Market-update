"use client";

import { useRef, useState } from "react";

type SpeechRecognitionType = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: any) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionType;
    webkitSpeechRecognition?: new () => SpeechRecognitionType;
  }
}

export default function VoiceMarketPage() {
  const [language, setLanguage] = useState("en-NG");
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");

  const recognitionRef = useRef<SpeechRecognitionType | null>(null);

  const startRecording = () => {
    setError("");

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Speech recognition is not supported in this browser. Please use Google Chrome."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        finalText += event.results[i][0].transcript;
      }

      setTranscript((previous) => {
        if (event.results[event.results.length - 1].isFinal) {
          return `${previous} ${finalText}`.trim();
        }

        return `${previous} ${finalText}`.trim();
      });
    };

    recognition.onerror = (event: any) => {
      setError(`Microphone error: ${event.error}`);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const clearTranscript = () => {
    setTranscript("");
    setError("");
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-green-700">
              MarketLink
            </h1>

            <p className="text-sm text-gray-500">
              AI Voice Market
            </p>
          </div>

          <div className="rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
            🎤 Voice Selling
          </div>
        </div>
      </header>

      {/* MAIN */}
      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* TITLE */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-slate-900">
            Sell With Your Voice
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            No typing required. Speak your product details and
            MarketLink will turn your voice into a marketplace listing.
          </p>
        </div>

        {/* LANGUAGE */}
        <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm">

          <label className="mb-2 block text-sm font-bold text-slate-700">
            🌍 Select your language
          </label>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isRecording}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-lg outline-none focus:border-green-600 md:max-w-md"
          >
            <option value="en-NG">
              English
            </option>

            <option value="yo-NG">
              Yoruba
            </option>

            <option value="ha-NG">
              Hausa
            </option>

            <option value="ig-NG">
              Igbo
            </option>
          </select>

          <p className="mt-3 text-sm text-gray-500">
            Start with English for testing. We will connect proper
            Nigerian-language AI transcription next.
          </p>
        </section>

        {/* VOICE RECORDER */}
        <section className="mt-6 rounded-2xl bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-5xl">
            🎤
          </div>

          <h3 className="mt-6 text-2xl font-bold">
            {isRecording
              ? "Listening..."
              : "Ready to listen"}
          </h3>

          <p className="mt-2 text-gray-500">
            {isRecording
              ? "Speak clearly. MarketLink is transcribing your voice."
              : "Press the button and describe your product."}
          </p>

          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="mt-7 rounded-xl bg-green-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-green-700"
            >
              🎤 Start Speaking
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="mt-7 rounded-xl bg-red-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-red-700"
            >
              ⏹ Stop Recording
            </button>
          )}

          {error && (
            <div className="mx-auto mt-6 max-w-xl rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}
        </section>

        {/* TRANSCRIPT */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">
                📝 Voice Transcription
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Your spoken words will appear here.
              </p>
            </div>

            {transcript && (
              <button
                type="button"
                onClick={clearTranscript}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Clear
              </button>
            )}
          </div>

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Your transcription will appear here..."
            rows={7}
            className="mt-5 w-full resize-none rounded-xl border border-gray-300 p-5 text-lg outline-none focus:border-green-600"
          />

          {/* TEST EXAMPLE */}
          <div className="mt-5 rounded-xl bg-green-50 p-5">
            <p className="font-bold text-green-800">
              💡 Try saying:
            </p>

            <p className="mt-2 text-green-700">
              "I have 10 bags of rice for 82 thousand naira."
            </p>
          </div>
        </section>

        {/* PRODUCT PREVIEW */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

          <h3 className="text-xl font-bold">
            📦 Product Listing Preview
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Later, MarketLink AI will automatically extract these
            details from your voice.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">

            <div className="rounded-xl border p-5">
              <p className="text-sm text-gray-500">
                Product
              </p>

              <p className="mt-1 text-lg font-bold">
                Rice
              </p>
            </div>

            <div className="rounded-xl border p-5">
              <p className="text-sm text-gray-500">
                Quantity
              </p>

              <p className="mt-1 text-lg font-bold">
                10 bags
              </p>
            </div>

            <div className="rounded-xl border p-5">
              <p className="text-sm text-gray-500">
                Price
              </p>

              <p className="mt-1 text-lg font-bold">
                ₦82,000
              </p>
            </div>

            <div className="rounded-xl border p-5">
              <p className="text-sm text-gray-500">
                Language
              </p>

              <p className="mt-1 text-lg font-bold">
                {language === "en-NG"
                  ? "English"
                  : language === "yo-NG"
                  ? "Yoruba"
                  : language === "ha-NG"
                  ? "Hausa"
                  : "Igbo"}
              </p>
            </div>

          </div>

          <button
            type="button"
            className="mt-6 w-full rounded-xl bg-slate-900 px-6 py-4 text-lg font-bold text-white hover:bg-slate-800"
          >
            🚀 Create Marketplace Listing
          </button>

        </section>

      </div>
    </main>
  );
}
