# Testaus ja validointi – HSL-taulu

Tähän tiedostoon kirjataan tehdyt testit ja niiden tulokset. Vaatimusten tarkat kuvaukset ja hyväksymiskriteerit ovat [projektimäärittelyssä](01-projektikuvaus.md), eikä niitä ylläpidetä uudelleen täällä. AI:n käyttö on dokumentoitu [AI-työskentelyssä](02-ai-tyoskentely.md).

## Testauksen tilanne

**Testituloksia ei ole vielä kirjattu.** Alla olevat testit ovat suunniteltuja tarkistuksia, eivät väitteitä ohjelman tämänhetkisestä toimivuudesta.

| Vaatimustunniste | Suunniteltu tarkistus | Tila | Toteutunut tulos |
| --- | --- | --- | --- |
| V1 | Avaa taulu selaimessa ja tarkista, että lähtöajat päivittyvät ja muutokset näkyvät. | Ei testattu | Ei tulosta |
| V2 | Tarkista, että näkymässä näkyy useamman kuin yhden linjan lähtöajat samanaikaisesti. | Ei testattu | Ei tulosta |
| V3 | Jos sääominaisuus toteutetaan, vertaa näkyvää lämpötilaa ja säätietoa tietolähteeseen. | Ei testattu | Ei tulosta |

## Testikertojen kirjaaminen

Kun testi suoritetaan, merkitään tähän päivämäärä, testattu sovellusversio tai commit-tunniste, vaatimustunniste (V1–V3), testausolosuhteet, havaittu tulos sekä hyväksytty/hylätty-tilanne. Mahdolliset virheet ja korjausten uusintatestit kirjataan samaan dokumenttiin.

**Huomautus:** V3 on alkuperäisessä määrittelyssä mukana, mutta rajauksen mukaan vähimmäiskokonaisuus koskee HSL-lähtöaikoja. Jos sääominaisuutta ei toteuteta, sen testaustilaan voidaan myöhemmin merkitä ”Ei toteutettu / rajattu pois” perusteluineen.
