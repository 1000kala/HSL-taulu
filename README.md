# HSL-taulu

## Projektin määrittely

Lue [projektin määrittely ja hyväksymiskriteerit](docs/01-projektikuvaus.md).

HSL-taulu on kotiin tarkoitettu selainpohjainen näyttö, josta näkee valittujen HSL-linjojen ajantasaiset lähtöajat. Projektin ensimmäinen tavoite on toimiva HTML-näkymä; Raspberry Pi -seinänäyttö ja sääominaisuus ovat mahdollisia jatkokehitysosia.

## Ohjelman ensimmäinen versio

Sovellus näyttää valittujen pysäkkien seuraavat HSL-lähdöt, erottaa ennustetun ja aikataulunmukaisen lähtöajan sekä päivittyy automaattisesti 30 sekunnin välein. Pysäkit valitaan hakemalla niitä nimellä. Linjanumerot voi rajata halutessaan, esimerkiksi `6, 7, 9`. Valinnat tallentuvat paikallisesti käytettyyn selaimeen. Lisäksi etusivulla on Helsingin keskustan lämpötila, säätila ja lämpötilan kehityssuunta (Open-Meteo).

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
7. Etsi sovelluksen alaosassa olevaan kenttään oma pysäkkisi (esim. Hakaniemi) ja valitse hakutuloksista oikea pysäkki. Poista halutessasi esimerkkipysäkki *Arkadian puisto*. Jos haluat nähdä vain raitiovaunun 6, kirjoita linjarajaukseen `6`. Muuten kaikki valittujen pysäkkien linjat näkyvät yhdessä taulussa.

Rajapintavirheissä käyttöliittymä kertoo, ettei lähtötietojen ajantasaisuutta voida varmistaa. Mikäli API-avain puuttuu tai ei toimi, tarkista `.env` ja API-portaalin tilaus.

### Testit

Automaattiset paikalliset testit ajetaan komennolla:

```bash
npm test
```

Testien ja varsinaisten hyväksymiskriteerien seuranta: [testaus ja validointi](docs/03-testaus-ja-validointi.md). AI-työskentelyn omat muistiinpanot: [AI-työskentely](docs/02-ai-tyoskentely.md).

### Mahdollinen Raspberry Pi -seinänäyttö

Sama palvelin ja selaimen osoite toimivat Raspberry Pi:ssä, kun Node.js on asennettuna ja avain on tallennettu Pi:n `.env`-tiedostoon. Oletuksena palvelin kuuntelee turvallisesti vain samalla koneella (`127.0.0.1`). Jos taulua käytetään kotiverkon toiselta laitteelta, palvelin voidaan käynnistää ympäristömuuttujalla `HOST=0.0.0.0`, mutta **älä avaa palvelinta julkiseen internetiin ilman lisäsuojausta**, jotta API-avainta käyttävää päätepistettä ei voida väärinkäyttää.

### Tekniikka

- HTML, CSS ja selaimen JavaScript: näyttö, pysäkkihaku, linjarajaus, automaattinen päivitys.
- Node.js:n sisäänrakennettu HTTP-palvelin: staattiset tiedostot ja Digitransitin turvallinen API-välitys.
- Digitransit Routing API v2: HSL:n aikataulut ja reaaliaikaennusteet. Aikataulu erotetaan ennusteesta tiedon perusteella.
- Open-Meteo: Helsingin keskustan säätiedot. Sään sijainti ei ole käyttäjän tarkka kotiosoite.

Projektin sovelluskoodin ensimmäinen versio voidaan testata paikallisesti, mutta **todellisia HSL-lähtöjä ei ole vahvistettu ilman käyttäjän omaa API-avainta**.
