"use client"

import { FC, useEffect } from "react";
import { ExtendedAssistant } from "./main";
import { useEventRunDetails } from "@trigger.dev/react";

export const Loading: FC<{ eventId: string, onFinish: () => void }> = (props) => {
    const { eventId } = props;
    const { data, error } = useEventRunDetails(eventId);

    useEffect(() => {
        if (!data || error) {
            return;
        }

        if (data.status === 'SUCCESS') {
            props.onFinish();
        }
    }, [data]);

    return <div className="pointer bg-yellow-300 border-yellow-500 p-1 px-3 text-yellow-950 border rounded-2xl">Loading</div>
};

export const AssistantList: FC<{ val: ExtendedAssistant, onFinish: () => void }> = (props) => {
    const { val, onFinish } = props;
    if (val.pending) {
        return <Loading eventId={val.eventId!} onFinish={onFinish} />
    }

    return (
        <div> </div>
    )
}
