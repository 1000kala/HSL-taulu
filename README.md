# HSL-taulu

## Projektin määrittely

Lue [projektin määrittely ja hyväksymiskriteerit](docs/01-projektikuvaus.md).

HSL-taulu on kotiin tarkoitettu selainpohjainen näyttö, josta näkee valittujen HSL-linjojen ajantasaiset lähtöajat. Projektin ensimmäinen tavoite on toimiva HTML-näkymä; Raspberry Pi -seinänäyttö ja sääominaisuus ovat mahdollisia jatkokehitysosia.

## Pikakäynnistys ilman API-avainta (demotila)

Jos Digitransitin API-portaali on häiriötilassa, sovellusta voi esitellä ilman avainta:

1. Asenna Node.js 20 tai uudempi.
2. Avaa komentokehote projektikansiossa ja aja `npm start`.
3. Avaa selaimessa **http://127.0.0.1:3000**.

Kun API-avain puuttuu, palvelin käyttää automaattisesti **keksittyjä esimerkkilähtöjä**. Sivulla näkyy selvä DEMO-varoitus. Valitut kolme lähtöryhmää ja 30 sekunnin automaattinen päivitys toimivat demodatalla. Demotila **ei todista reaaliaikaisten Digitransit-lähtöjen toimivuutta**, ja oikean rajapintayhteyden testaaminen jää tehtäväksi, kun avain saadaan.

Kun saat Digitransitin API-avaimen, lisää se paikalliseen `.env`-tiedostoon README:n alempien ohjeiden mukaan. Silloin ohjelma käyttää oikeaa APIa automaattisesti. Voit tarvittaessa pakottaa demotilan asettamalla `.env`-tiedostoon `HSL_DEMO_MODE=1`. Älä lisää API-avainta GitHubiin.

## Valitut linjat ja suunnat (24.11.2026)

Kotitaulun ensisijainen näkymä on asetettu seuraaville lähdöille:

- **59** Junatie (H2180) → **Malminkartano**. Huomioidaan myös uuden päätepysäkin nimi Sydänpuunpuisto.
- **M1 ja M2** Sörnäisten metroasema → **länteen**, eli Kivenlahden/Tapiolan (tai vastaavan läntisen päätepysäkin) suuntaan.
- **Raitiovaunu 6** Sörnäinen (M) → **molemmat ajosuunnat**, koska pyydettyä laiturinumeroa 12 ei ole vielä varmistettu raitiovaunulaituriksi. Suunta näkyy rivin määränpäässä (Arabia tai Eiranranta).

Kun Digitransitin API-avain saadaan, ohjelma hakee pysäkkien varsinaiset HSL-tunnukset nimellä ja suodattaa lähdöt linjan sekä määränpään perusteella. Raitiovaunun täsmällinen laituri ja koko reaaliaikaisen tietovirran toimivuus vaativat tarkistuksen oikealla API-yhteydellä. Pelkässä demotilassa näyttö on toimiva, mutta ajat ovat *keksittyjä esimerkkejä*.

## Ohjelman ensimmäinen versio

Sovellus näyttää yllä määriteltyjen kolmen lähtöryhmän seuraavat lähdöt, erottaa ennustetun ja aikataulunmukaisen lähtöajan sekä päivittyy automaattisesti 30 sekunnin välein. Lisäksi etusivulla on Helsingin keskustan lämpötila, säätila ja lämpötilan kehityssuunta (Open-Meteo).

**Tärkeää:** Pelkkä HTML-tiedoston avaaminen tai GitHub Pages ei käynnistä tätä versiota. Digitransitin API-avain on pidettävä yksityisenä, joten taulun mukana on pieni paikallinen Node.js-palvelin. Avainta ei tule koskaan kirjoittaa HTML-/JavaScript-tiedostoihin eikä julkaista GitHubissa.

### Käynnistys (Node.js 20 tai uudempi)

1. Asenna [Node.js](https://nodejs.org/) koneellesi, jos sitä ei vielä ole.
2. Hanki Digitransitin API-avain [API-portaalista](https://portal-api.digitransit.fi/) (rekisteröidy ja tilaa tarvittava API-tuote). Ohje: [Digitransitin API-rekisteröinti](https://www.digitransit.fi/en/developers/api-registration/).
3. Tee projektin juureen `.env`-tiedosto `.env.example`-tiedoston pohjalta. Esimerkiksi Windowsin komentokehotteessa `copy .env.example .env` tai Macilla/Linuxilla `cp .env.example .env`. Voit myös tehdä kopion tiedostonhallinnassa.
4. Korvaa `.env`-tiedostossa `liitä_oma_avain_tähän` oikealla avaimellasi. **Älä julkaise `.env`-tiedostoa.** Se on `.gitignore`-listalla.
5. Avaa pääte projektikansiossa ja suorita:

   ```bash
   npm start
   ```

6. Avaa selaimessa **http://127.0.0.1:3000**.
7. Etusivu näyttää automaattisesti kolme yllä määriteltyä lähtöryhmää. Ne voi muuttaa myöhemmin tiedostossa `favorites.mjs`.

Rajapintavirheissä käyttöliittymä kertoo, ettei lähtötietojen ajantasaisuutta voida varmistaa. Jos API-avain puuttuu, käytetään demotilaa. Jos annettu avain ei toimi, tarkista `.env` ja API-portaalin tilaus; palvelin ei vaihda automaattisesti demoon virheellisellä avaimella.

### Testit

Automaattiset paikalliset testit ajetaan komennolla:

```bash
npm test
```

Testien ja varsinaisten hyväksymiskriteerien seuranta: [testaus ja validointi](docs/03-testaus-ja-validointi.md). AI-työskentelyn omat muistiinpanot: [AI-työskentely](docs/02-ai-tyoskentely.md).

### Mahdollinen Raspberry Pi -seinänäyttö

Sama palvelin ja selaimen osoite toimivat Raspberry Pi:ssä, kun Node.js on asennettuna ja avain on tallennettu Pi:n `.env`-tiedostoon. Oletuksena palvelin kuuntelee turvallisesti vain samalla koneella (`127.0.0.1`). Jos taulua käytetään kotiverkon toiselta laitteelta, palvelin voidaan käynnistää ympäristömuuttujalla `HOST=0.0.0.0`, mutta **älä avaa palvelinta julkiseen internetiin ilman lisäsuojausta**, jotta API-avainta käyttävää päätepistettä ei voida väärinkäyttää.

### Tekniikka

- HTML, CSS ja selaimen JavaScript: kolmen lähtöryhmän näyttö ja automaattinen päivitys.
- `favorites.mjs`: pysäkkien, linjojen ja ajosuuntien määritys; palvelin hakee todelliset pysäkkitunnukset API:sta.
- Node.js:n sisäänrakennettu HTTP-palvelin: staattiset tiedostot ja Digitransitin turvallinen API-välitys.
- Digitransit Routing API v2: HSL:n aikataulut ja reaaliaikaennusteet. Aikataulu erotetaan ennusteesta tiedon perusteella.
- Open-Meteo: Helsingin keskustan säätiedot. Sään sijainti ei ole käyttäjän tarkka kotiosoite.

Projektin sovelluskoodin ensimmäinen versio voidaan testata paikallisesti, mutta **todellisia HSL-lähtöjä ei ole vahvistettu ilman käyttäjän omaa API-avainta**.
