import { eventTrigger } from "@trigger.dev/sdk";
import { openaiTrigger } from "../app/helper/open.ai"
import { client } from "../trigger";
import { object, string } from "zod";

client.defineJob({
    id: 'question-assistant',
    name: 'Question Assistant',
    version: "0.0.1",
    trigger: eventTrigger({
        name: "question.assistant.event", schema: object({
            content: string(),
            aId: string(),
            threadId: string().optional()
        })
    }), integrations: {
        openai: openaiTrigger
    }, run: async (payload, io, ctx) => {
        const thread = payload.threadId ?
            await io.openai.beta.threads.retrieve('get-thread', payload.threadId) :
            await io.openai.beta.threads.create('create-thread');

        await io.openai.beta.threads.messages.create('create-message', thread.id, {
            content: payload.content,
            role: 'user'
        });

        const run = await io.openai.beta.threads.runs.createAndWaitForCompletion('run-thread', thread.id, {
            model: 'gpt-3.5-turbo-1106',
            assistant_id: payload.aId,
        });

        if(run.status !== "completed") {
            throw new Error(`Run finished with status ${run.status}: ${JSON.stringify(run.last_error)}`);
        }

        const messages = await io.openai.beta.threads.messages.list("list-messages", run.thread_id, {
            query: {
                limit: "1"
            }
        });

        const content = messages.data[0].content[0];
        if(content.type === "text") {
            return { content: content.text.value, threadId: thread.id }
        }
    }
})
