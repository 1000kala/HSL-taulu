# HSL-taulu kotiin

## Projektin nimi ja määrittely, käyttäjä tarve ja hyöty

Oma HSL-Taulu, jonka saa esimerkiksi Raspberry PI:llä ja pienellä näytöllä seinälle. Siinä näkyy itselleni ajankohtaisimpien HSL-linjojen lähtöajat, kuten HSL:än omissakin pysäkkikohtaisissa tauluissa. Kiireessä tai nopean lähdön tilanteessa ei tarvitse kuin vilkaista valmista taulua, jos tietää että tarvitsee taululla esiintyvää linjaa. Lisäksi taulussa voi olla lämpötila ja sään trendi.

## Käyttäjäskenaariot

1. Tarvitsee nopeasti tietää monelta raitiovaunulinja 6 lähtee ja puhelin on hukassa, joten voi vilkaista taulua.
2. HSL-apista uloskirjautuminen syystä tai toisesta ja et muista salasanaa, joten voi tarkastaa HSL-ajoneuvon lähtöajan taululta ja jatkaa kirjautumisyrityksiä pysäkillä.
3. Jos luottaa siihen, että viime iltana katsottu lähtöaika pitää paikkansa vielä aamulla, sen näkee heti taululta, onko joukkoliikennevälineisiin tullut myöhästymisiä/aikaistuksia.

## Vaatimukset ja hyväksymiskriteerit

| Tunniste | Vaatimus | Hyväksymiskriteeri | Prioriteetti |
| --- | --- | --- | --- |
| V1 | Reaaliaikaisesti päivittyvät aikataulut | Näkyvät vaihdokset aikatauluissa | Pääsen html:än avulla oikeaan aikaan joukkoliikennevälineen kyytiin |
| V2 | Useampi kuin yksi linja | Näen html:ssä useamman linjan | Nähdä usean linjan aikatauluineen samanaikaisesti |
| V3 | Lämpötila ja sää | Lämpötila ja sää on havaittavissa html:ssä | Lämpötila ja sää pitävät paikkansa |

## Rajaus

Vähimmäiskokonaisuus on toimiva html, jossa näkyy selvästi haluamani linjojen lähtöajat. Html:län voi halutessaan jatkaa Raspberry PI:llä toimivaksi erilliseksi tauluksi asuntoon.

## Toteutuksen rakenne, oletukset ja riskit

Käytössä on Digitransitin API-rajapinnat jota julkaistaan Githubilla näkyväksi html muotoon. Digitransitin rajapinnoissa on vaatimuksena rekisteröiytymispakko sekä pyyntömäärien rajoituksia. Vikakoodi 403 voi tulla ylikuormituksesta.

## Merkittävät muutokset ja perustelut
