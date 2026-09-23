---
layout: default
title: Personajes
description: PJ y PNJ del universo de Mistelar.
body_class: inner-page markdown-page character-gallery-page
section: personajes
footer_text: Mistelar · Rostros del firmamento
---

# Personajes

> La tripulación protagonista y los personajes que encuentra durante su viaje. Cada retrato abre la ficha individual del personaje.

<section id="pjs" class="character-subsection character-subsection-page" aria-labelledby="pjs-title">
<div class="character-subsection-heading">
<div>

<p class="card-label">Personajes jugadores</p>

<h2 id="pjs-title">PJ</h2>

</div>
<p>Los aventureros controlados por los jugadores y protagonistas de la campaña.</p>
</div>

{% include character-grid.html type="pj" empty_text="Todavía no hay PJ registrados. Añade una ficha en _personajes con character_type: pj." %}
</section>

<section id="pnjs" class="character-subsection character-subsection-page" aria-labelledby="pnjs-title">
<div class="character-subsection-heading">
<div>

<p class="card-label">Personajes no jugadores</p>

<h2 id="pnjs-title">PNJ</h2>

</div>
<p>Aliados, rivales, contactos y habitantes del universo controlados por el director de juego.</p>
</div>

{% include character-grid.html type="pnj" empty_text="Todavía no hay PNJ registrados. Las fichas sin character_type se consideran PNJ." %}
</section>

Para añadir un personaje, crea un Markdown dentro de `_personajes`. Usa `character_type: pj` para un PJ o `character_type: pnj` para un PNJ. Si omites el campo, se tratará como PNJ.
