
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "API key not configured"
    });
  }

  try {
    const { question } = req.body || {};

    if (!question || typeof question !== "string") {
      return res.status(400).json({
        error: "Question is required"
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{
              text: "তুমি ShikhoAI-এর বাংলা AI শিক্ষক। সহজ ভাষায়, ধাপে ধাপে এবং নির্ভুলভাবে উত্তর দেবে।"
            }]
          },
          contents: [{
            role: "user",
            parts: [{ text: question }]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({
        error: "AI service error",
        details: data.error?.message || "Request failed"
      });
    }

    const answer =
      data.candidates?.[0]?.content?.parts
        ?.map(p => p.text || "")
        .join("") || "উত্তর পাওয়া যায়নি।";

    return res.status(200).json({ answer });

  } catch (error) {
    return res.status(500).json({
      error: "Server error"
    });
  }
};
