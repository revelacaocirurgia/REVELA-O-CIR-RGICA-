export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Use POST." });
  }

  try {
    const { texto, modulo, conversaAntiga, objetivo } = req.body || {};

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        erro: "OPENAI_API_KEY não configurada na Vercel."
      });
    }

    if (!texto || texto.trim().length < 10) {
      return res.status(400).json({
        erro: "Envie um texto, relato, conversa ou material para análise."
      });
    }

    const instrucao = `
Você é o motor de análise do aplicativo REVELAÇÃO CIRÚRGICA.

Objetivo:
Analisar relatos, conversas e padrões para identificar risco de enganação, contradições, omissões, manipulação ou sinais relevantes.

Regra central:
Não invente fatos.
Não diga que algo é mentira absoluta sem evidência.
Aponte inconsistências, padrões, risco e dados insuficientes quando faltar material.
A verdade dos fatos é indispensável.

Formato da resposta:
1. Resumo objetivo do caso
2. Dados enviados
3. Pontos confirmados
4. Pontos duvidosos
5. Contradições ou mudanças de versão
6. Sinais de enganação/manipulação
7. Comparação com conversa antiga, se houver
8. Índice estimado de risco: baixo, moderado, alto ou dados insuficientes
9. Perguntas que faltam para melhorar a análise
10. Orientação objetiva
`;

    const entrada = `
Módulo: ${modulo || "Enganação"}
Objetivo do cliente: ${objetivo || "não informado"}

Conversa antiga para comparar padrão:
${conversaAntiga || "não enviada"}

Material principal enviado:
${texto}
`;

    const resposta = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        instructions: instrucao,
        input: entrada
      })
    });

    const data = await resposta.json();

    if (!resposta.ok) {
      return res.status(resposta.status).json({
        erro: data?.error?.message || "Erro ao chamar a IA."
      });
    }

    const textoFinal =
      data.output_text ||
      (data.output || [])
        .flatMap(item => item.content || [])
        .filter(content => content.type === "output_text")
        .map(content => content.text)
        .join("\n");

    return res.status(200).json({
      ok: true,
      relatorio: textoFinal || "A IA respondeu, mas o texto não veio no formato esperado."
    });

  } catch (erro) {
    return res.status(500).json({
      erro: erro.message || "Erro interno."
    });
  }
}
