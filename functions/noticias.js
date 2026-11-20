export async function onRequest() {
    const query = encodeURIComponent('EC Bahia mercado da bola OR contratação OR reforço');
    const bingRssUrl = `https://bing.com{query}&format=rss&mkt=pt-BR`;

    try {
        const resposta = await fetch(bingRssUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!resposta.ok) {
            return new Response(`Erro na fonte: ${resposta.status}`, { status: 502 });
        }

        const xmlTexto = await resposta.text();

        return new Response(xmlTexto, {
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=600'
            }
        });
    } catch (erro) {
        return new Response(`Falha interna: ${erro.message}`, { status: 500 });
    }
}

