"use client";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { ExtendedAssistant } from "./main";
import Markdown from 'react-markdown'
import { useEventRunDetails } from "@trigger.dev/react";
import { Paper, TextField, Button, Card, CircularProgress } from '@mui/material';

export const ChatgptComponent = ({ list }: { list: ExtendedAssistant[] }) => {
    const url = useRef<HTMLSelectElement>(null);
    const [message, setMessage] = useState('');
    const [messagesList, setMessagesList] = useState([] as any);
    const [threadId, setThreadId] = useState<string>('' as string);
    const [loading, setLoading] = useState<boolean>(false as boolean);

    const submitForm = useCallback(async (e: any) => {
        e.preventDefault();
        setMessagesList((messages) => [...messages, { message: `~/you: ${message}` }]);
        setLoading(true);
        const messageResponse = await (await fetch('/api/message', {
            method: 'POST',
            body: JSON.stringify({ message, threadId }),
        })).json();
        setMessage('')
        setLoading(false)

        if (!threadId) {
            setThreadId(messageResponse.threadId);
        }

        setMessagesList((messages) => [...messages, { message: `~/zodiac: ${messageResponse.content}` }]);
    }, [message, messagesList, url, threadId]);


    useState(() => {
        setMessagesList((messages) => [...messages, {
            message: '~/zodiac: Hello, how can I help you today?'
        }]);
    }, []);

    return (
        <div elevation={5}>
            <div className="main">
                <div className="main-container">
                    {messagesList.map((message) => {
                        return (
                            <Card>
                                <div className="message-section">
                                    {message.message}
                                </div>
                            </Card>
                        )
                    })}
                </div>
                <div className="text-form-group">
                    <div className="text-form">
                        <TextField
                            id="outlined-basic"
                            variant="filled"
                            color="success"
                            multiline
                            rows={2}
                            fullWidth
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <div className="submit-button-group">
                        <div>
                            <Button
                                variant="contained"
                                onClick={submitForm}
                                color="success"
                                disabled={loading}
                            >
                                Submit
                            </Button>
                        </div>
                        <div className="loader-section">
                            {loading && <CircularProgress color="success" size={20} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
