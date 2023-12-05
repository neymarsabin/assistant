import { eventTrigger } from '@trigger.dev/sdk';
import { client } from '@gpt-assistant/trigger';
import { object, string } from 'zod';
import { JSDOM } from 'jsdom';
import { openai } from '@gpt-assistant/helper/open.ai';

client.defineJob({
    id: 'process-portfolio',
    name: "Process Portfolio",
    version: "0.0.1"
    trigger: eventTrigger({
        name: 'process.portfolio.event',
        schema: object({
            url: string(),
        })
    }),
    integrations: {
        openai
    },
    run: async (payload, io, ctx) => {
    }
})
