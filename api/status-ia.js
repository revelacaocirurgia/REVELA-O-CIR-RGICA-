export default async function handler(req, res) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        ok: false,
        erro: "OPENAI_API_KEY não configurada na Vercel."
      });
    }

    const resposta = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: "Responda apenas: IA ativa."
      })
    });

    const data = await resposta.json();

    if (!resposta.ok) {
      return res.status(resposta.status).json({
        ok: false,
        erro: data?.error?.message || "Erro ao chamar a IA."
      });
    }

    return res.status(200).json({
      ok: true,
      status: "IA conectada e funcionando.",
      resposta: data.output_text || "IA respondeu, mas sem texto simples."
    });

  } catch (erro) {
    return res.status(500).json({
      ok: false,
      erro: erro.message || "Erro interno."
    });
  }
}
