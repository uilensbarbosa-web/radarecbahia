// Salve este arquivo como: functions/noticias.js
export async function onRequest() {
    const query = encodeURIComponent('EC Bahia contratação OR reforço OR mercado OR empréstimo');
    const rssUrl = `https://google.com{query}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;

    try {
        const resposta = await fetch(rssUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; RadarBahiaBot/1.0)'
            }
        });
        const xmlTexto = await resposta.text();

        return new Response(xmlTexto, {
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (erro) {
        return new Response('Erro ao buscar feed', { status: 500 });
    }
}
