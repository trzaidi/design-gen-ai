const greetings = [
  { text: "سلام دنیا", lang: "fa", direction: "rtl" },
  { text: "HALLO WELT", lang: "de", direction: "ltr" },
  { text: "ПРИВЕТ, МИР", lang: "ru", direction: "ltr" },
  { text: "नमस्ते दुनिया", lang: "hi", direction: "ltr" },
  { text: "你好，世界", lang: "zh", direction: "ltr" },
  { text: "안녕하세요, 세계", lang: "ko", direction: "ltr" },
  { text: "こんにちは、世界", lang: "ja", direction: "ltr" },
  { text: "مرحباً بالعالم", lang: "ar", direction: "rtl" },
  { text: "BONJOUR LE MONDE", lang: "fr", direction: "ltr" },
  { text: "HOLA MUNDO", lang: "es", direction: "ltr" },
  { text: "ΓΕΙΑ ΣΟΥ ΚΟΣΜΕ", lang: "el", direction: "ltr" },
  { text: "CIAO MONDO", lang: "it", direction: "ltr" },
  { text: "OLÁ MUNDO", lang: "pt", direction: "ltr" },
  { text: "MERHABA DÜNYA", lang: "tr", direction: "ltr" },
  { text: "שלום עולם", lang: "he", direction: "rtl" },
  { text: "ہیلو دنیا", lang: "ur", direction: "rtl" },
  { text: "SALAMU, DUNIA", lang: "sw", direction: "ltr" },
  { text: "HALLO WERELD", lang: "nl", direction: "ltr" },
  { text: "WITAJ ŚWIECIE", lang: "pl", direction: "ltr" },
  { text: "ПРИВІТ, СВІТЕ", lang: "uk", direction: "ltr" },
  { text: "হ্যালো বিশ্ব", lang: "bn", direction: "ltr" },
  { text: "XIN CHÀO THẾ GIỚI", lang: "vi", direction: "ltr" },
  { text: "HALO DUNIA", lang: "id", direction: "ltr" },
  { text: "สวัสดีชาวโลก", lang: "th", direction: "ltr" },
];

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

        <div className="language-wheel">
          <div className="language-track">
            {greetings.map((greeting, index) => (
              <p
                className="language"
                style={{ animationDelay: `${index * 3}s` }}
                key={greeting.lang}
              >
                <bdi
                  lang={greeting.lang}
                  dir={greeting.direction === "rtl" ? "rtl" : "ltr"}
                >
                  {greeting.text}
                </bdi>
              </p>
            ))}
          </div>
        </div>

        <div className="color-key" aria-hidden="true">
          <span className="green" />
          <span className="cyan" />
          <span className="purple" />
        </div>
      </main>

      <footer>
        <span>Tai Zaidi</span>
        <span>Columbia University · 2026</span>
      </footer>
    </div>
  );
}