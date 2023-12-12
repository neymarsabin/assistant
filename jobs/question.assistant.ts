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
        // create or use an existing thread
        const thread = payload.threadId ?
            await io.openai.beta.threads.retrieve('get-thread', payload.threadId) :
            await io.openai.beta.threads.create('create-thread');

        // create a message in the thread
        await io.openai.beta.threads.messages.create('create-message', thread.id, {
            content: payload.content,
            role: 'user'
        });

        // run the thread
        const run = await io.openai.beta.threads.runs.createAndWaitForCompletion('run-thread', thread.id, {
            model: 'gpt-3.5-turbo-1106',
            assistant_id: payload.aId,
        });

        // check the status of the thread
        if(run.status !== "completed") {
            console.log("not completed!!!");
            throw new Error(`Run finished with status ${run.status}: ${JSON.stringify(run.last_error)}`);
        }

        // get the messages from the thread
        const messages = await io.openai.beta.threads.messages.list("list-messages", run.thread_id, {
            query: {
                limit: "1"
            }
        });

        const content = messages[0].context[0];
        if(content.type === "text") {
            return { content: content.text.value, threadId: thread.id }
        }
    }
})
