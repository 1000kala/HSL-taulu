# AI-työskentely – HSL-taulu

Tämä dokumentti kertoo, miten tekoälyä on käytetty projektissa. Varsinainen projektin sisältö ja vaatimukset löytyvät [projektimäärittelystä](01-projektikuvaus.md). Testien tulokset kirjataan [testaus- ja validointidokumenttiin](03-testaus-ja-validointi.md).

## Alkuprompti ja lähtöaineisto

Projektin määrittelyn lähtöaineistona oli itse kirjoittamani Word-dokumentti **HSL-taulu kotiin**. Toin sen ChatGPT-keskusteluun viestillä: ”tossa on mitä haluan mmäirttelyyn”.

Pyysin myöhemmin: ”laita se mun määrittely kuten se oli mun word tiedostossa”.

Nämä ovat dokumentaation käsittelyyn käytettyjä kehotteita. **Varsinaisen ohjelmiston toteutuksen alkupromptia ei ole vielä dokumentoitu tähän tiedostoon.** Se lisätään tänne, kun ohjelmiston toteutuksessa käytetään tekoälyä.

## Käytetyt AI-työkalut

- **ChatGPT (OpenAI):** Word-tiedostoon kirjoitetun projektimäärittelyn muuntaminen GitHubiin sopivaksi Markdown-tiedostoksi, dokumentaation linkittäminen ja GitHub-tiedostojen käsittely.
- **GitHub-yhteys ChatGPT:ssä:** tiedostomuutosten tallentaminen projektin GitHub-repoon.

Tässä vaiheessa ei ole dokumentoitua AI:lla tuotettua tai testattua ohjelmakoodia.

## Työskentelyprosessi

1. Kirjoitin HSL-taulun alkuperäisen projektikuvauksen Word-tiedostoon.
2. Toimitin Word-tiedoston ChatGPT:lle ja kerroin projektin GitHub-repon osoitteen.
3. ChatGPT muokkasi kuvauksen ensin laajemmaksi GitHub-dokumentiksi ja lisäsi README-tiedostoon linkin.
4. Pyysin palauttamaan projektimäärittelyn oman Word-tiedostoni mukaiseksi. ChatGPT päivitti saman tiedoston `docs/01-projektikuvaus.md` GitHubissa.
5. Dokumentaation rakennetta täydennettiin erillisillä AI-työskentelyn ja testauksen tiedostoilla. Projektin varsinaiset vaatimukset pidetään vain [projektimäärittelyssä](01-projektikuvaus.md).

## Oman työn ja AI:n työn erottelu

Projektin aihe, käyttötarkoitus, käyttäjäskenaariot, vaatimukset ja rajaus perustuvat omaan Word-tiedostoon. ChatGPT:tä käytettiin dokumentin Markdown-muotoiluun ja GitHub-tiedostojen ylläpitoon. Tekoälyn aiemmin ehdottamat ylimääräiset vaatimukset poistettiin käyttäjän pyynnöstä.

Tätä dokumenttia täydennetään myöhemmin toteutusvaiheessa käytetyillä täsmällisillä prompteilla, AI:n tuottamilla ehdotuksilla sekä omilla tarkistuksilla ja muokkauksilla.
