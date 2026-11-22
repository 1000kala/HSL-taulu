# HSL-taulu kotiin – projektin määrittely

**Toteutusmuoto:** yksilöprojekti  
**Projektin GitHub-repo:** [1000kala/HSL-taulu](https://github.com/1000kala/HSL-taulu)

## Käyttäjä, tarve ja hyöty

Projektissa toteutetaan kotiin tarkoitettu HSL-lähtöaikataulu, jota voi seurata suoraan verkkoselaimesta. Sovellus näyttää käyttäjän valitsemien HSL-linjojen seuraavat lähdöt tietyiltä pysäkeiltä mahdollisimman ajantasaisina, samaan tapaan kuin pysäkeillä olevat sähköiset aikataulunäytöt.

Ensisijainen käyttäjä olen minä itse. Tarkoitus on nähdä esimerkiksi raitiovaunulinjan 6 seuraava lähtö nopeasti ilman puhelimen etsimistä tai HSL-sovelluksen avaamista. Näytön avulla on helpompi arvioida, milloin kotoa pitää lähteä, ja huomata mahdolliset muutokset lähtöajoissa.

Ensimmäisessä vaiheessa toteutetaan toimiva HTML-pohjainen selainkäyttöliittymä. Myöhemmin sen voi halutessaan näyttää Raspberry Pi -tietokoneella ja pienellä seinälle asennettavalla näytöllä. Lämpötila- ja säätiedot ovat mahdollisia lisäominaisuuksia.

## Käyttäjäskenaariot

1. **Nopea lähtö kotoa:** Olen lähdössä raitiovaunulla 6, mutta puhelin ei ole käden ulottuvilla. Vilkaisen HSL-taulua ja näen seuraavan lähdön, jotta osaan lähteä pysäkille oikeaan aikaan.
2. **HSL-sovellus ei ole käytettävissä:** En pääse HSL-sovellukseen esimerkiksi kirjautumisongelman vuoksi. Tarkistan tarvitsemieni linjojen lähtöajat HSL-taulun selainnäkymästä.
3. **Aikataulun muuttuminen:** Olen katsonut lähtöajan edellisenä iltana, mutta aikataulu tai ennuste on muuttunut aamuun mennessä. Taululta näen viimeisimmän saatavilla olevan lähtötiedon ennen lähtöä.

## Vaatimukset ja hyväksymiskriteerit

| Tunniste | Vaatimus | Hyväksymiskriteeri | Prioriteetti |
| --- | --- | --- | --- |
| V1 | Taulu näyttää valittujen HSL-linjojen ajantasaiset lähtöajat määritetyiltä pysäkeiltä. | Selain näyttää vähintään yhden valitun linjan seuraavat lähdöt ja niiden pysäkin. Tiedot haetaan Digitransitin rajapinnasta ja päivitetään automaattisesti vähintään kerran minuutissa. Näytettyjä tietoja voi verrata saman pysäkin ajantasaisiin lähtötietoihin. | Pakollinen |
| V2 | Taulu näyttää useamman kuin yhden linjan samanaikaisesti. | Selainnäkymässä näkyy vähintään kahden eri HSL-linjan lähdöt niin, että linjat ja lähtöajat erottuvat toisistaan. | Pakollinen |
| V3 | Taulu voi näyttää lämpötilan ja säätilan tai sääennusteen suunnan. | Jos lisäominaisuus toteutetaan, selainnäkymässä näkyy ulkoisesta sääpalvelusta saatu lämpötila sekä ymmärrettävä säätilatieto tai ennuste. | Valinnainen |
| V4 | Lähtöajat ovat helposti luettavissa tavallisessa selaimessa. | HTML-näkymä avautuu ilman erillistä mobiilisovellusta. Linjat, pysäkit ja lähtöajat näkyvät selkeästi 1280 × 720 -kokoisessa selainikkunassa. | Pakollinen |
| V5 | Käyttäjä huomaa, jos lähtötieto ei päivity. | Näkymä näyttää viimeisimmän onnistuneen päivityksen ajan. Rajapintavirheen tai verkkokatkoksen jälkeen käyttäjälle näkyy ilmoitus, ettei tietojen ajantasaisuutta voida varmistaa. | Pakollinen |
| V6 | Selainnäkymän voi myöhemmin siirtää erilliselle näytölle. | Jos lisätavoite toteutetaan, sama aikataulunäkymä avautuu Raspberry Pi -laitteeseen liitetyllä näytöllä. Laitteisto ei ole ensimmäisen version hyväksymisen ehto. | Valinnainen |

**Prioriteetit:** Pakolliset vaatimukset muodostavat projektin vähimmäistoteutuksen. Valinnaiset vaatimukset toteutetaan vain, jos aikaa ja teknisiä mahdollisuuksia jää.

## Rajaus

**Vähimmäiskokonaisuus:** toimiva HTML-, CSS- ja JavaScript-pohjainen selainkäyttöliittymä, joka hakee määritettyjen pysäkkien HSL-lähtötiedot ja näyttää samanaikaisesti vähintään kahden valitun linjan seuraavat lähdöt. Näkymän pitää päivittyä automaattisesti sekä ilmoittaa selvästi tilanteesta, jossa ajantasaista tietoa ei saada.

Ensimmäiseen toteutukseen **ei kuulu** reittiopas, lipunosto, käyttäjätunnukset, mobiilisovellus eikä kaikkien HSL-linjojen kattava haku. Ensivaiheessa linjat ja pysäkit voidaan määrittää ohjelman asetuksissa tai koodissa; käyttäjän tekemä laaja asetusten hallinta ei ole pakollinen. Raspberry Pi -laitteiston rakentaminen sekä sääominaisuus jäävät mahdollisiksi jatkokehitysosiksi.

## Toteutuksen rakenne, oletukset ja riskit

- **Käyttöliittymä:** HTML muodostaa näkymän, CSS huolehtii selkeydestä ja JavaScript hakee sekä päivittää lähtötietoja.
- **Aikataulutiedot:** HSL-alueen tiedot saadaan [Digitransitin Routing API -rajapinnasta](https://www.digitransit.fi/en/developers/apis/1-routing-api/). Rajapintaa käytetään pysäkkikohtaisiin lähtötietokyselyihin.
- **Tietovirta:** määritetty pysäkki ja linja → rajapintapyyntö → lähtötietojen käsittely → selaimessa näkyvä aikataulutaulu → automaattinen päivitys.
- **Julkaisu:** koodi ja dokumentaatio säilytetään GitHub-repossa. Mahdollinen verkkosivun julkaisutapa päätetään toteutuksessa.

**Oletukset ja riskit:**

1. Digitransitin tuotantorajapinta edellyttää rekisteröitymistä ja API-avainta. Käyttöön liittyy pyyntömäärärajoituksia, ja esimerkiksi HTTP 403 -virhe voi liittyä käyttöoikeuteen tai rajoituksiin. Virhetilanteisiin täytyy varautua.
2. Koska GitHub-repo on julkinen, mahdollisia salassa pidettäviä API-avaimia ei tallenneta suoraan repon koodiin. Selainkäytön turvallinen tapa tehdä rajapintapyynnöt täytyy selvittää ennen julkaisua.
3. Kaikista lähdöistä ei välttämättä ole reaaliaikaista ennustetta. Näkymän tulee esittää rajapinnasta saatu tieto eikä luvata suurempaa tarkkuutta kuin tiedon lähde mahdollistaa.
4. Verkkoyhteyden tai rajapinnan häiriö voi estää uusien lähtöaikojen saamisen. Tällöin sovellus kertoo päivitysongelmasta eikä esitä vanhoja tietoja varmasti ajantasaisina.
5. Sääominaisuuden toteutus edellyttää erillisen säätietolähteen valintaa ja sen käyttöehtojen tarkistamista.

Digitransitin API-avainten käytöstä ja rajoituksista: [API-rekisteröinti ja avaimet](https://www.digitransit.fi/en/developers/api-registration/).

## Merkittävät muutokset ja perustelut

Määrittelyn ensimmäinen versio rajaa pakollisen toteutuksen selainpohjaiseen lähtöaikatauluun. Raspberry Pi -seinänäyttö sekä sääominaisuus on jätetty valinnaisiksi, jotta projektin vähimmäiskokonaisuus on toteutettavissa yksilötyönä.

Mahdolliset myöhemmät vaatimusten ja rajauksen muutokset kirjataan tähän osioon perusteluineen. Testien toteutuneet tulokset dokumentoidaan erikseen tiedostoon `docs/03-testaus-ja-validointi.md` samoilla vaatimustunnisteilla (V1–V6).
