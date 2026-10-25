import Image from "next/image";
import Link from "next/link";
import {SiteHeader} from "@/components/site-header";
import {SiteFooter} from "@/components/site-footer";
import {createClient} from "@/lib/supabase/server";
import {COLUMBIA_MATERIAL} from "@/lib/columbia-material";
import {findMemeImage} from "@/lib/meme-images";
import {PhotoCredit} from "@/components/photo-credit";
export const metadata={title:"Columbia material | Caption Archive"};
export const dynamic="force-dynamic";
export default async function MaterialPage(){
 const client=await createClient();const {data}=await client.auth.getClaims();const claims=data?.claims;
 const signedIn=Boolean(claims?.sub)&&!claims?.is_anonymous;
 return <div className="page"><SiteHeader signedIn={signedIn} email={typeof claims?.email==="string"?claims.email:undefined}/><main id="main" className="interior-page">
 <p className="eyebrow">Campus news. Institutional contradictions. Everyday nonsense.</p><h1 className="interior-title">COLUMBIA MATERIAL<span className="period">.</span></h1>
 <p className="panel-copy">15 setups with matching pictures. News checked October 25, 2026; each story links to its background. The setups and sample captions are jokes.</p>
 {(["In the news","Campus life"] as const).map(category=><section key={category} className="material-section"><h2>{category}</h2><div className="material-grid">{COLUMBIA_MATERIAL.filter(topic=>topic.category===category).map(topic=>{
 const picture=findMemeImage(topic.imagePath)!;
 return <article className="material-card" key={topic.id}><figure className="judge-figure"><Image src={picture.path} alt={picture.description} width={picture.width} height={picture.height} sizes="(max-width: 700px) 100vw, 33vw"/><PhotoCredit picture={picture}/></figure>
 <div className="material-card-body"><h3>{topic.title}</h3><p>{topic.scene}</p><blockquote>{topic.example}</blockquote><details><summary>The background</summary><p>{topic.fact}</p><div className="material-sources">{topic.sources.map(source=><a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.label} ↗</a>)}</div></details><Link className="primary-button" href={`/create?topic=${topic.id}`}>Make your own take →</Link></div></article>;
 })}</div></section>)}
 </main><SiteFooter/></div>;
}
