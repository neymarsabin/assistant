"use client"

import { Assistant } from '@prisma/client';
import { TriggerProvider } from '@trigger.dev/react';
import { useCallback, useState } from 'react';
import { ChatgptComponent } from './chatgpt.component';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { AssistantList } from './assistant.list';

export interface ExtendedAssistant extends Assistant {
    pending?: boolean;
    eventId?: string;
}

export default function Main({ list }: { list: ExtendedAssistant[] }) {
    const [assistantState, setAssistantState] = useState(list);

    return (
        <TriggerProvider publicApiKey={process.env.NEXT_PUBLIC_TRIGGER_PUBLIC_API_KEY!}>
            <div className="w-full max-w-2xl mx-auto p-6 flex flex-col gap-4">
                <ChatgptComponent list={assistantState} />
            </div>
        </TriggerProvider>
    )
};
