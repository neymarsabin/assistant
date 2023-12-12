import { prisma } from '../../helper/prisma';
import { client } from '../../../trigger';

export async function POST(request: Request) {
    const body = await request.json();

    // check that we have assistant id and message
    if (!body.id || !body.message) {
        return new Reponse(JSON.stringify({ error: 'ID and message are required' }), { status: 400 })
    }

    // get the assistant id in OpenAI from the id in the database
  const assistant = await prisma.assistant.findUnique({
      where: {
          id: +body.id
      }
  });

  // We send an event to the trigger to process the documentation
  const {id: eventId} = await client.sendEvent({
      name: "question.assistant.event",
      payload: {
          content: body.message,
          aId: assistant?.aId,
          threadId: body.threadId
      },
  });

  return new Response(JSON.stringify({eventId}), {status: 200});
}
