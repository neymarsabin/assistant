import OpenAI from "openai";
import { OpenAI as Open } from "@trigger.dev/openai";

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const openaiTrigger = new Open({
    id: 'openai',
    apiKey: process.env.OPENAI_API_KEY!
})
