import { prisma } from '../../helper/prisma';
import { client } from '../../../trigger';
import { openai } from "../../helper/open.ai"

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

export async function POST(request: Request) {
  const body = await request.json();
  let thread;

  if (!body.message) {
    return new Response(JSON.stringify({ error: 'ID and message are required' }), { status: 400 })
  }

  if (!body.threadId) {
    thread = await openai.beta.threads.create();
  }

  const runThreadId = body.threadId ? body.threadId : thread.id

  await openai.beta.threads.messages.create(
    runThreadId,
    {
      content: body.message,
      role: 'user'
    })

  const run = await openai.beta.threads.runs.create(
    runThreadId,
    {
      assistant_id: "asst_0NNAQwtxUs5d1BgGUxkuhiBZ",
      model: 'gpt-3.5-turbo-1106',
      instructions: "Never mention that a file was uploaded in the message responses."
    }
  )

  let runStatus = await openai.beta.threads.runs.retrieve(
    runThreadId,
    run.id
  )

  do {
    runStatus = await openai.beta.threads.runs.retrieve(
      runThreadId,
      run.id
    )
    await sleep(5000)
  } while (runStatus.status != 'completed')

  const messages = await openai.beta.threads.messages.list(body.threadId ? body.threadId : thread.id, {
    query: {
      limit: '1'
    }
  })

  const content = messages.data[0].content[0];

  if (content.type === "text") {
    return new Response(JSON.stringify({
      content: content.text.value,
      threadId: runThreadId
    }), { status: 200 })
  }
}
