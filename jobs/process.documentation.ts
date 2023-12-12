import { eventTrigger } from '@trigger.dev/sdk';
import { v4 as uuidv4 } from 'uuid';
import { object, string } from 'zod';
import { JSDOM } from 'jsdom';
import axios from 'axios';
import { client } from '../trigger';
import { openaiTrigger, openai } from '../app/helper/open.ai';
import { prisma } from '../app/helper/prisma';

client.defineJob({
    id: 'process-portfolio',
    name: "Process Portfolio",
    version: "0.0.1",
    trigger: eventTrigger({
        name: 'process.portfolio{}.event',
        schema: object({
            url: string(),
        })
    }),
    integrations: {
        openaiTrigger
    },
    run: async (payload, io, ctx) => {
    //  get the data modify the data accordingly
    // insert that data into the database
    // this must be a io.runTask function
        return io.runTask('grab-texts-from-portfolio', async () => {
            try {
                await axios.get('http://localhost:4567/posts')
                    .then(async (response) => {
                        response.data.forEach(async (res) => {
                            const textUuid = uuidv4();
                            const contentForUrl = await prisma.docs.upsert({
                                select: {
                                  id: true,
                                  content: true
                                }, where: {
                                    url: res.url
                                }, update: {
                                    content: res.texts[0]
                                }, create: {
                                    url: res.url, content: res.texts[0], identifier: textUuid
                                }
                            });

                            const file = await io.openaiTrigger.files.createAndWaitForProcessing(`upload-file-${contentForUrl.id}-${textUuid}`, {
                                purpose: "assistants",
                                file: contentForUrl.content
                            });

                            let currentAssistant = await prisma.assistant.findFirst({
                                 where: {
                                     url: res.url
                                 }
                            });

                            if(currentAssistant) {
                                currentAssistant = openai.beta.assistants.update(currentAssistant.aId, {
                                    file_ids: [file.id]
                                })
                            } else {
                                currentAssistant = await openai.beta.assistants.create({
                                    name: textUuid,
                                    description: "Portfolio",
                                    instructions: "You are a documentation assistant, you have been loaded with documentation from",
                                    tools: [{ type: "code_interpreter" }, { type: "retrieval" }],
                                    file_ids: [file.id],
                                    model: "gpt-3.5-turbo-1106"
                                });
                            }

                            await prisma.assistant.upsert({
                                where: {
                                    url: res.url,
                                }, update: {
                                    aId: currentAssistant.id,
                                }, create: {
                                    aId: currentAssistant.id,
                                    url: res.url
                                }
                            });
                        })
                    })
                    .catch((error) => {
                        console.log("Error in response:: ", error);
                    })
            } catch (error) {
                console.log("Error while program or the jobs: ", error);
            }
        })
    }
})
