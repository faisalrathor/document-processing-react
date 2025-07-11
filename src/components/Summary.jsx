import { GoogleGenAI } from "@google/genai";
import { useState, useEffect } from "react";
import Loader from "./Loader";
import { gemeniModel } from "../../Firebase/Config";

function Summary({ file }) {

    const [summary, setSummary] = useState("");
    const [status, setStatus] = useState("idle");

    async function getSummary() {
        setStatus('loading');

        try {
            const contents = [
                {
                    role: "user",
                    parts: [
                        {
                            text: `
                        Summarize the document in one short paragraph (less than 100 words). Use just plain text with no markdowns or html tags.
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


            /*    const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: contents
                }); */


            console.log("Sending contents:", contents);
            const response = await gemeniModel.generateContent({
                contents: contents
            });

            console.log("Gemini raw response:", response);
            setStatus('success');
            const text = response.response?.candidates?.[0]?.content?.parts?.[0]?.text || "No summary found.";
            setSummary(text);


        } catch (error) {
            console.error("Summary error:", error);
            setStatus('error');
        }
    }

    useEffect(() => {
        if (status === 'idle') {
            getSummary();
        }
    }, [status]);

    return (
        <section className="summary">
            <img src={file.imageURL} alt="Preview Image" />
            <h2>Summary</h2>
            {
                status === 'loading' ?
                    <Loader /> :
                    status === 'success' ?
                        <p>{summary}</p> :
                        status === 'error' ?
                            <p>Error getting Summary</p> :
                            ''
            }
        </section>
    )
}

export default Summary
