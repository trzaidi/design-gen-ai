import { supabase } from "@/lib/supabase";

type Caption = {
  id: number;
  caption_text: string;
  image_description: string;
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data, error } = await supabase
    .from("captions")
    .select("id, caption_text, image_description")
    .order("id", { ascending: true });

  const captions = (data ?? []) as Caption[];

  return (
    <div className="page">
      <header className="masthead">
        <span
          className="course glitch-small"
          data-text="Design for Generative AI"
        >
          Design for Generative AI
        </span>
        <span className="course-number">COMS 6901 / 6998</span>
      </header>

      <main>
        <section className="hero" aria-labelledby="page-title">
          <p className="assignment">Assignment 02 · Supabase</p>

          <h1 id="page-title">
            <span
              className="glitch-title"
              data-text="CAPTION"
              aria-hidden="true"
            >
              CAPTION
            </span>

            <span
              className="world glitch-title"
              data-text="ARCHIVE."
              aria-hidden="true"
            >
              ARCHIVE<span className="period">.</span>
            </span>

            <span className="sr-only">Caption Archive</span>
          </h1>

          <p className="intro">
            Six questionable decisions, retrieved live from Supabase.
          </p>

          <a className="jump-link" href="#captions">
            View captions
          </a>
        </section>

        <section
          className="caption-section"
          id="captions"
          aria-labelledby="caption-heading"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">Live database feed</p>
              <h2 id="caption-heading">Current entries</h2>
            </div>

            <span className="record-count">
              {captions.length.toString().padStart(2, "0")} records
            </span>
          </div>

          {error ? (
            <p className="database-message" role="alert">
              The caption archive could not be loaded.
            </p>
          ) : (
            <div className="caption-grid">
              {captions.map((caption, index) => (
                <article className="caption-card" key={caption.id}>
                  <div className="card-topline">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span>CAP-{String(caption.id).padStart(4, "0")}</span>
                  </div>

                  <p className="caption-text">{caption.caption_text}</p>

                  <p className="image-description">
                    {caption.image_description}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer>
        <span>Tai Zaidi</span>
        <span>Columbia University · 2026</span>
      </footer>
    </div>
  );
}