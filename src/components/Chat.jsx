import { GoogleGenAI } from "@google/genai";
import './Chat.css'
import { useState } from 'react'
import { gemeniModel } from "../../Firebase/Config";

function Chat({ file }) {

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    async function handelSendMessage() {
        if (input.length) {
            let chatMessages = [...messages, { role: "user", text: input }, { role: "loader", text: "" }];
            setInput("");
            setMessages(chatMessages);

            try {
                const contents = [
                    {
                        role: "user",
                        parts: [
                            {
                                text: `
                            Answer this question about the attached document: ${input}
                            Answer as a chatbot with short messages and text only (no mark downs, tags, symbols)
                            Chat History: ${JSON.stringify(messages)}
                          `
                            },
                            {
                                inlineData: {
                                    mimeType: file.type,
                                    data: file.file
                                }
                            }
                        ]
                    }
                ];


                /*     const response = await ai.models.generateContent({
                         model: "gemini-2.5-flash",
                         contents: contents
                     });  */

                console.log("Sending contents:", contents);
                const response = await gemeniModel.generateContent({
                    contents: contents
                });

                console.log("Gemini raw response:", response);
                const text = response.response?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry! Error from Server. Try later.";

                chatMessages = [...chatMessages.filter(msg => msg.role != 'loader'), { role: "model", text: text }];
                setMessages(chatMessages);


            } catch (error) {
                chatMessages = [...chatMessages.filter(msg => msg.role != 'loader'), { role: "error", text: "Error sending messages, please try again" }];
                setMessages(chatMessages);

                console.log('error');
            }
        }
    }

    return (
        <section className="chat-window">

            <h2>Chat</h2>
            {
                messages.length ?
                    <div className="chat">
                        {
                            messages.map(msg => (
                                <div className={msg.role} key={msg.text}>
                                    <p>{msg.text}</p>
                                </div>
                            ))
                        }
                    </div> :
                    ''
            }

            <div className="input-area">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    type="text"
                    placeholder="Ask any question about the uploaded document"
                />
                <button onClick={handelSendMessage}>Send</button>
            </div>
        </section >
    )
}

export default Chat