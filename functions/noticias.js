export async function onRequest() {
    const urlGeBahia = 'https://ge.globo.com/ba/futebol/times/bahia/';

    try {
        const resposta = await fetch(urlGeBahia, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!resposta.ok) {
            return new Response(JSON.stringify({ erro: `Status ${resposta.status}` }), { status: 502 });
        }

        const html = await resposta.text();
        
        // Extrai links e títulos das matérias publicadas na página do Bahia no GE
        const regex = /<a[^>]+href="(https:\/\/ge\.globo\.com\/ba\/futebol\/times\/bahia\/noticia\/[^"]+)"[^>]*>([^<]+)<\/a>/g;
        const noticias = [];
        const linksVistos = new Set();
        let match;

        while ((match = regex.exec(html)) !== null) {
            const link = match[1];
            const titulo = match[2].trim();

            if (titulo.length > 20 && !linksVistos.has(link)) {
                linksVistos.add(link);
                noticias.push({
                    titulo: titulo,
                    link: link,
                    fonte: 'ge.globo',
                    data: 'Recente'
                });
            }
        }

        return new Response(JSON.stringify(noticias.slice(0, 18)), {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Cache-Control': 'public, max-age=300'
            }
        });
    } catch (erro) {
        return new Response(JSON.stringify({ erro: erro.message }), { status: 500 });
    }
}
