---
layout: default
title: Personajes
description: Aliados, rivales y habitantes del universo de Mistelar.
body_class: inner-page markdown-page character-gallery-page
section: personajes
footer_text: Mistelar · Rostros del firmamento
---

# Personajes

> Un registro de aliados, rivales y figuras memorables. Selecciona un retrato para consultar su historia y relación con la tripulación.

{% assign character_list = site.personajes | sort: "order" %}
<div class="character-grid">
{% for personaje in character_list %}
    {% assign portrait = personaje.portrait | default: '/personaje.svg' %}
    <a class="character-card" href="{{ personaje.url | relative_url }}" aria-label="Ver la ficha de {{ personaje.title | escape }}">
        <span class="character-card-portrait">
            <img
                src="{{ portrait | relative_url }}"
                alt="{{ personaje.portrait_alt | default: personaje.title | escape }}"
                width="480"
                height="600"
                loading="lazy"
            >
        </span>
        <span class="character-card-copy">
            <span class="character-card-role">{{ personaje.role | default: 'Personaje' }}</span>
            <strong>{{ personaje.title }}</strong>
            {% if personaje.summary %}<span>{{ personaje.summary }}</span>{% endif %}
            <span class="character-card-link">Abrir ficha <span aria-hidden="true">→</span></span>
        </span>
    </a>
{% endfor %}
</div>

Cada personaje se guarda como un archivo Markdown independiente dentro de `_personajes`. Para añadir otro, duplica la ficha de ejemplo y cambia sus datos.
