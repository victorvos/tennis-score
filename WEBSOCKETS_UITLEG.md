# Uitleg Websockets & De Werking in de App

## Wat zijn Websockets?

Normaal gesproken als je op internet surft, vraag je een pagina op en krijg je antwoord. Als er daarna iets verandert op de server, zie je dat pas als je de pagina ververst (F5). Je kunt dit vergelijken met het sturen van een brief: je doet een verzoek op de post en wacht op antwoord.

**Websockets** werken anders. Ze maken een **permanente verbinding** tussen jouw browser en de server. Het is meer als een telefoongesprek: de lijn blijft open. Hierdoor kan de server op elk moment een berichtje sturen naar de browser ("Hé, de score is veranderd!"), zonder dat jij iets hoeft te doen. Dit zorgt voor die snelle, "live" ervaring.

---

## Hoe werkt dit in de Tennis Score App?

In deze applicatie gebruiken we websockets zodat **kijkers** (viewers) direct de score zien veranderen wanneer de **scheidsrechter** (host) een punt telt.

Er zijn twee rollen:

1.  **De Host (Scheidsrechter):** Degene die de score bedient.
2.  **De Luisteraars (Kijkers):** Mensen die de wedstrijd live volgen op hun eigen telefoon of scherm via een Match ID.

### Het Proces

1.  **Verbinding maken:**
    Zodra de app start, probeert `SocketManager.js` verbinding te maken met de centrale server. Dit is de "telefoonlijn" die open wordt gezet.

2.  **Een wedstrijd starten (Host):**
    *   Wanneer je op "Host" klikt, stuurt de app een signaal: `addhost`.
    *   De server maakt een nieuwe "kamer" aan en geeft een **Match ID** terug (bijv. nummer 123).
    *   Dit nummer geef je aan de kijkers.

3.  **Een wedstrijd volgen (Viewer):**
    *   Kijkers klikken op "Join" en voeren het Match ID (123) in.
    *   De app stuurt een signaal: `addlistener` met nummer 123.
    *   De server voegt ze toe aan de "kamer" van die wedstrijd.

4.  **Live Updates:**
    *   Als de Host op "Speler 1 scoort" drukt, stuurt de app de nieuwe stand naar de server (`client_updates_state`).
    *   De server ziet dit bericht en stuurt het direct door naar *iedereen* die in kamer 123 luistert (`server_updates_state`).
    *   De schermen van de kijkers worden direct bijgewerkt met de nieuwe score.

---

## De Code in het kort

De meeste magie gebeurt in `js/socket-manager.js`. Hier is, in simpele taal, wat de belangrijkste functies doen:

*   **`connect()`**: "Bel de server op."
*   **`socket.emit('bericht')`**: "Zeg iets tegen de server." (Bijvoorbeeld: "Ik wil score 15-0 doorgeven").
*   **`socket.on('bericht')`**: "Luister of de server iets tegen mij zegt." (Bijvoorbeeld: "De server zegt dat de score nu 15-0 is").

### Soorten berichten

Er vliegen constant json-pakketjes (stukjes data) heen en weer:

*   **Configuratie updates:** Als de host de namen van spelers verandert ("Nadal" vs "Federer"), krijgen alle kijkers direct de nieuwe namen te zien.
*   **Status updates:** De eigenlijke score (punten, games, sets).

Door deze techniek hoeft niemand op "verversen" te drukken en "verspringt" de score overal tegelijkertijd.
