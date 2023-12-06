import { eventTrigger } from '@trigger.dev/sdk';
import { v4 as uuidv4 } from 'uuid';
import { object, string } from 'zod';
import { JSDOM } from 'jsdom';
import axios from 'axios';
import { client } from '../trigger';
import { openai } from '../app/helper/open.ai';
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
        openai
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
                            await prisma.docs.upsert({
                                where: {
                                    url: res.url
                                }, update: {
                                    content: res.texts[0], identifier: textUuid
                                }, create: {
                                    url: res.url, content: res.texts[0], identifier: textUuid
                                }
                            })
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
