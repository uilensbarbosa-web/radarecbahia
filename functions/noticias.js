export async function onRequest() {
    // Feed oficial do GE Globo sobre o Bahia (aberto e sem bloqueios de nuvem)
    const feedUrl = 'https://globo.com';

    try {
        const resposta = await fetch(feedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/rss+xml, application/xml, text/xml, */*'
            }
        });

        if (!resposta.ok) {
            return new Response(`Erro na fonte GE: ${resposta.status}`, { status: 502 });
        }

        const xmlTexto = await resposta.text();

        return new Response(xmlTexto, {
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=300'
            }
        });
    } catch (erro) {
        return new Response(`Falha interna: ${erro.message}`, { status: 500 });
    }
}
