import { GoogleGenerativeAI } from "@google/genai";
import { useEffect, useState } from "react";
//import { GoogleGenAI } from "@google/genai";

import "./Chat.css";

function Chat({ file }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [chatSession, setChatSession] = useState(null);
    const [loading, setLoading] = useState(false);

    const ai = new GoogleGenerativeAI({
        apiKey: "AIzaSyBv5L19S9KHe21zFTUDYAjp0A-UCtl7uYw"
    });

    // Step 1: Initialize chat session and upload file
    useEffect(() => {
        const startChat = async () => {
            if (!file || !file.file || !file.type) {
                console.error("File not provided correctly");
                return;
            }

            try {
                const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
                const chat = model.startChat({ history: [] });

                // Upload file once with context
                await chat.sendMessage([
                    { text: "This is a document. Please read and understand it. I will ask questions." },
                    {
                        inlineData: {
                            mimeType: file.type,
                            data: file.file,
                        },
                    },
                ]);

                setChatSession(chat);
                setMessages([
                    { role: "system", text: "✅ Document uploaded. You can now ask your questions." },
                ]);
            } catch (err) {
                console.error("Error initializing chat:", err);
                setMessages([{ role: "error", text: "❌ Failed to upload document." }]);
            }
        };

        startChat();
    }, [file]);

    // Step 2: Handle sending user message
    const handleSendMessage = async () => {
        if (!input.trim()) return;
        if (!chatSession) {
            alert("Chat session not ready yet.");
            return;
        }

        const userMessage = { role: "user", text: input };
        setMessages((prev) => [...prev, userMessage, { role: "loader", text: "⏳" }]);
        setInput("");
        setLoading(true);

        try {
            const result = await chatSession.sendMessage(
                `Answer shortly, as a chatbot: ${input}`
            );
            const response = await result.response;
            const text = await response.text();

            setMessages((prev) => [
                ...prev.filter((msg) => msg.role !== "loader"),
                { role: "model", text },
            ]);
        } catch (err) {
            console.error("Error during message send:", err);
            setMessages((prev) => [
                ...prev.filter((msg) => msg.role !== "loader"),
                { role: "error", text: "⚠️ Something went wrong." },
            ]);
        }

        setLoading(false);
    };

    return (
        <section className="chat-window">
            <h2>📄 Chat with Document</h2>

            <div className="chat">
                {messages.map((msg, i) => (
                    <div key={i} className={msg.role}>
                        <p>{msg.text}</p>
                    </div>
                ))}
            </div>

            <div className="input-area">
                <input
                    type="text"
                    value={input}
                    placeholder="Ask a question..."
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading}
                />
                <button onClick={handleSendMessage} disabled={loading || !chatSession}>
                    Send
                </button>
            </div>
        </section>
    );
}

export default Chat2;
