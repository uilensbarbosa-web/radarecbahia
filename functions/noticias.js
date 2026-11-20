export async function onRequest() {
    const noticias = [];
    const linksVistos = new Set();

    const limparTexto = (str) => str
        .replace(/<!\[CDATA\[|\]\]>/g, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, '&')
        .trim();

    // Fonte 1: Bahia Notícias (RSS Oficial de Esportes)
    try {
        const resBN = await fetch('https://www.bahianoticias.com.br/esportes/rss.xml', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        if (resBN.ok) {
            const xml = await resBN.text();
            const items = xml.split('<item>').slice(1);
            for (const item of items) {
                const tituloMatch = item.match(/<title>([\s\S]*?)<\/title>/);
                const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/);
                const dataMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/);

                if (tituloMatch && linkMatch) {
                    const titulo = limparTexto(tituloMatch[1]);
                    const link = limparTexto(linkMatch[1]);
                    // Filtra apenas notícias relacionadas ao Bahia
                    if (/bahia|esquadrão|tricolor|ceni/i.test(titulo) && !linksVistos.has(link)) {
                        linksVistos.add(link);
                        noticias.push({
                            titulo,
                            link,
                            fonte: 'Bahia Notícias',
                            data: dataMatch ? new Date(limparTexto(dataMatch[1])).toLocaleDateString('pt-BR') : 'Recente'
                        });
                    }
                }
            }
        }
    } catch (e) {}

    // Fonte 2: ECBahia.com (Seção Mercado da Bola)
    try {
        const resECB = await fetch('https://ecbahia.com', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        if (resECB.ok) {
            const html = await resECB.text();
            const regex = /<a[^>]+href="(https:\/\/www\.ecbahia\.com\/[^"]+)"[^>]*>([^<]{25,140})<\/a>/g;
            let match;
            while ((match = regex.exec(html)) !== null) {
                const link = match[1];
                const titulo = limparTexto(match[2]);
                if (!link.includes('/category/') && !link.includes('/tag/') && !linksVistos.has(link)) {
                    linksVistos.add(link);
                    noticias.push({
                        titulo,
                        link,
                        fonte: 'ECBahia.com',
                        data: 'Mercado'
                    });
                }
            }
        }
    } catch (e) {}

    // Fonte 3: Futebol Baiano (Feed RSS da tag EC Bahia)
    try {
        const resFB = await fetch('https://futebolbahiano.org', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        if (resFB.ok) {
            const xml = await resFB.text();
            const items = xml.split('<item>').slice(1);
            for (const item of items) {
                const tituloMatch = item.match(/<title>([\s\S]*?)<\/title>/);
                const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/);
                const dataMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/);

                if (tituloMatch && linkMatch) {
                    const titulo = limparTexto(tituloMatch[1]);
                    const link = limparTexto(linkMatch[1]);
                    if (!linksVistos.has(link)) {
                        linksVistos.add(link);
                        noticias.push({
                            titulo,
                            link,
                            fonte: 'Futebol Baiano',
                            data: dataMatch ? new Date(limparTexto(dataMatch[1])).toLocaleDateString('pt-BR') : 'Recente'
                        });
                    }
                }
            }
        }
    } catch (e) {}

    return new Response(JSON.stringify(noticias.slice(0, 24)), {
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'public, max-age=300'
        }
    });
}
