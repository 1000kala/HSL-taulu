# Testaus ja validointi – HSL-taulu

Tähän tiedostoon kirjataan tehdyt testit ja niiden tulokset. Vaatimusten tarkat kuvaukset ja hyväksymiskriteerit ovat [projektimäärittelyssä](01-projektikuvaus.md), eikä niitä ylläpidetä uudelleen täällä. AI:n käyttö on dokumentoitu [AI-työskentelyssä](02-ai-tyoskentely.md).

## Testauksen tilanne

**Testituloksia ei ole vielä kirjattu.** Alla olevat testit ovat suunniteltuja tarkistuksia, eivät väitteitä ohjelman tämänhetkisestä toimivuudesta.

| Vaatimustunniste | Suunniteltu tarkistus | Tila | Toteutunut tulos |
| --- | --- | --- | --- |
| V1 | Avaa taulu selaimessa ja tarkista, että lähtöajat päivittyvät ja muutokset näkyvät. | Testattu | Toimii  |
| V2 | Tarkista, että näkymässä näkyy useamman kuin yhden linjan lähtöajat samanaikaisesti. | Testattu | Toimii  |
| V3 | Jos sääominaisuus toteutetaan, vertaa näkyvää lämpötilaa ja säätietoa tietolähteeseen. | Testattu| Toimii |

## Testikertojen kirjaaminen

Testi 23.11.2026 - En päässyt enää Digitransit-palveluun hakemaan API-avaintani, koska sivusto näytti erroria useilla eri koodeilla. Loin ChatGPT:llä demoversion ja se täytti kaikki vaatimustunnukseni.

Testi 24.11.2026 - Sain API-avaimen haltuuni ja lisäsin sen projektikansion .env tiedostoon. Vaatimustukset täyttyivät myös oikeassa versiossa.
