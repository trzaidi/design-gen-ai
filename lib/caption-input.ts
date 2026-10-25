import { findMemeImage } from "./meme-images.ts";
import { findMaterialTopic } from "./columbia-material.ts";
export function resolveCaptionInput(input:{imagePath:string;topicId:string;scene:string;tone:string}) {
 const picture=findMemeImage(input.imagePath);
 if(!picture)return {error:"Choose a picture before generating your caption."} as const;
 const topic=findMaterialTopic(input.topicId);
 if(input.topicId&&!topic)return {error:"Choose a current topic or write your own scene."} as const;
 if(topic&&topic.imagePath!==picture.path)return {error:"Choose the topic’s matching picture, or switch to your own scene."} as const;
 const scene=topic?.scene??(input.scene.trim()||picture.description);
 if(scene.length<10||scene.length>600||!["Deadpan","Unhinged","Wholesome"].includes(input.tone))return {error:"Describe a scene in 10–600 characters and choose a tone."} as const;
 return {picture,topic,scene,tone:input.tone as "Deadpan"|"Unhinged"|"Wholesome"};
}
