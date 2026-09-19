import type { CSSProperties } from "react";

const greetings = [
  ["Persian", "سلام دنیا", "fa", "rtl"],
  ["German", "Hallo Welt", "de", "ltr"],
  ["Russian", "Привет, мир", "ru", "ltr"],
  ["Hindi", "नमस्ते दुनिया", "hi", "ltr"],
  ["Mandarin", "你好，世界", "zh", "ltr"],
  ["Korean", "안녕하세요, 세계", "ko", "ltr"],
  ["Japanese", "こんにちは、世界", "ja", "ltr"],
  ["Arabic", "مرحباً بالعالم", "ar", "rtl"],
  ["French", "Bonjour le monde", "fr", "ltr"],
  ["Spanish", "Hola mundo", "es", "ltr"],
  ["Greek", "Γεια σου κόσμε", "el", "ltr"],
  ["Italian", "Ciao mondo", "it", "ltr"],
  ["Portuguese", "Olá mundo", "pt", "ltr"],
  ["Turkish", "Merhaba dünya", "tr", "ltr"],
  ["Hebrew", "שלום עולם", "he", "rtl"],
  ["Urdu", "ہیلو دنیا", "ur", "rtl"],
  ["Swahili", "Salamu, dunia", "sw", "ltr"],
  ["Dutch", "Hallo wereld", "nl", "ltr"],
  ["Polish", "Witaj świecie", "pl", "ltr"],
  ["Ukrainian", "Привіт, світе", "uk", "ltr"],
  ["Bengali", "হ্যালো বিশ্ব", "bn", "ltr"],
  ["Vietnamese", "Xin chào thế giới", "vi", "ltr"],
  ["Indonesian", "Halo dunia", "id", "ltr"],
  ["Thai", "สวัสดีชาวโลก", "th", "ltr"],
] as const;

export default function Home() {
  return (
    <div className="page">
      <header className="masthead">
        <span className="course">Design for Generative AI</span>
        <span className="course-number">COMS 6901 / 6998</span>
      </header>

      <main className="hero">
        <p className="assignment">Assignment 01</p>

        <h1>
          <span>Hello</span>

          <span className="world">
            World<span className="period">.</span>
          </span>
        </h1>

        <div
          className="language-wheel"
          aria-label="Hello World in different languages"
        >
          <div className="language-track">
            {greetings.map(
              ([language, greeting, code, direction], index) => (
                <p
                  className="language"
                  style={
                    {
                      "--position": index,
                    } as CSSProperties
                  }
                  key={language}
                >
                  <span>{language}</span>

                  <bdi lang={code} dir={direction}>
                    {greeting}
                  </bdi>
                </p>
              ),
            )}
          </div>
        </div>

        <div className="color-key" aria-hidden="true">
          <span className="green" />
          <span className="cyan" />
          <span className="purple" />
        </div>
      </main>

      <footer>
        <span>Designed and built by Tai Zaidi</span>
        <span>New York · 2026</span>
      </footer>
    </div>
  );
}