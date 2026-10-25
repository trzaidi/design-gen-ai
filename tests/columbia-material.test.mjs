import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {COLUMBIA_MATERIAL,dailyMaterial} from '../lib/columbia-material.ts';
import {findMemeImage} from '../lib/meme-images.ts';
import {resolveCaptionInput} from '../lib/caption-input.ts';
import {buildPrompt} from '../lib/arena.ts';

test('every topic resolves to a shipped image and can be submitted with its trusted background',()=>{
 const ids=new Set();
 for(const topic of COLUMBIA_MATERIAL){
  assert.ok(!ids.has(topic.id));ids.add(topic.id);
  assert.ok(findMemeImage(topic.imagePath));
  assert.ok(existsSync(new URL('../public'+topic.imagePath,import.meta.url)));
  const input=resolveCaptionInput({imagePath:topic.imagePath,topicId:topic.id,scene:'Tampered scene',tone:'Deadpan'});
  assert.ok(!('error' in input));assert.equal(input.scene,topic.scene);
  assert.equal(input.topic.fact,topic.fact);
  assert.ok(buildPrompt(input.scene,input.tone,input.topic).includes(topic.sources[0].url));
 }
});
test('rejects missing/unknown pictures and mismatched or unknown topical material',()=>{
 const base={imagePath:'',topicId:'',scene:'A student studies in Butler Library.',tone:'Deadpan'};
 assert.ok(resolveCaptionInput(base).error);
 assert.ok(resolveCaptionInput({...base,imagePath:'/memes/not-in-gallery.webp'}).error);
 assert.ok(resolveCaptionInput({...base,imagePath:'/memes/airport-armor.webp',topicId:'cyber-training'}).error);
 assert.ok(resolveCaptionInput({...base,imagePath:'/memes/airport-armor.webp',topicId:'fabricated-news'}).error);
});
test('custom setups keep their chosen picture, with no accidental news context',()=>{
 const input=resolveCaptionInput({imagePath:'/memes/police-goose.webp',topicId:'',scene:'A goose demands everyone complete another training module.',tone:'Unhinged'});
 assert.ok(!('error' in input));assert.equal(input.picture.path,'/memes/police-goose.webp');assert.equal(input.topic,undefined);
});
test('daily material changes at New York midnight and visits all fifteen topics',()=>{
 assert.equal(dailyMaterial(new Date('2026-10-25T03:59:00Z')).day,'2026-10-24');
 assert.equal(dailyMaterial(new Date('2026-10-25T04:00:00Z')).day,'2026-10-25');
 const ids=new Set(Array.from({length:15},(_,i)=>dailyMaterial(new Date(Date.UTC(2026,9,25+i,12))).topic.id));
 assert.equal(ids.size,COLUMBIA_MATERIAL.length);
});
