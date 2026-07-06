<script setup lang="ts">
import { RouterLink } from "vue-router";
import { design1 as d } from "../data/design1.ts";
import { onImageError } from "../utils/image.ts";
</script>

<template>
  <article class="design">
    <RouterLink to="/architecture" class="design__back">← Architecture</RouterLink>

    <!-- Title -->
    <header class="design__header">
      <p class="eyebrow">{{ d.id }}</p>
      <h1 class="design__title">{{ d.title }}</h1>
      <p class="design__subtitle">{{ d.subtitle }}</p>
      <p class="design__statement">{{ d.statement }}</p>
    </header>

    <!-- Full board overview -->
    <figure class="board">
      <img :src="d.board" alt="Full presentation board" @error="onImageError" />
      <figcaption>Full presentation board</figcaption>
    </figure>

    <!-- Concept -->
    <section class="sec">
      <h2 class="sec__title">Concept</h2>
      <div class="split">
        <figure class="media">
          <img :src="d.concept.image" alt="Bubble diagram" @error="onImageError" />
        </figure>
        <dl class="attrs">
          <div v-for="a in d.concept.attributes" :key="a.label" class="attrs__row">
            <dt>{{ a.label }}</dt>
            <dd>{{ a.value }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <!-- Site analysis -->
    <section class="sec">
      <h2 class="sec__title">Site Analysis</h2>
      <div class="split">
        <figure class="media">
          <img :src="d.site.image" alt="Site analysis" @error="onImageError" />
        </figure>
        <div class="swot">
          <div v-for="(items, key) in d.site.swot" :key="key" class="swot__cell">
            <h3>{{ key }}</h3>
            <ul>
              <li v-for="it in items" :key="it">{{ it }}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Development -->
    <section class="sec">
      <h2 class="sec__title">Development</h2>
      <div
        v-for="step in d.development"
        :key="step.title"
        class="split split--wide"
      >
        <figure class="media">
          <img :src="step.image" :alt="step.title" @error="onImageError" />
        </figure>
        <div class="prose">
          <h3>{{ step.title }}</h3>
          <p>{{ step.text }}</p>
        </div>
      </div>
    </section>

    <!-- Drawings -->
    <section class="sec">
      <h2 class="sec__title">Plans, Elevations &amp; Sections</h2>
      <div class="grid">
        <figure v-for="dr in d.drawings" :key="dr.title" class="drawing">
          <img :src="dr.image" :alt="dr.title" @error="onImageError" />
          <figcaption>
            <span>{{ dr.title }}</span>
            <span class="scale">Scale {{ dr.scale }}</span>
          </figcaption>
        </figure>
      </div>
    </section>

    <!-- External views -->
    <section class="sec">
      <h2 class="sec__title">External Views</h2>
      <div class="grid grid--2">
        <figure v-for="v in d.externalViews" :key="v.title" class="drawing">
          <img :src="v.image" :alt="v.title" @error="onImageError" />
          <figcaption><span>{{ v.title }}</span></figcaption>
        </figure>
      </div>
    </section>

    <!-- Details -->
    <section class="sec">
      <h2 class="sec__title">Details</h2>
      <ul class="details">
        <li v-for="dt in d.details" :key="dt.label">
          <span class="details__label">{{ dt.label }}</span>
          <span class="details__note">{{ dt.note }}</span>
        </li>
      </ul>
    </section>
  </article>
</template>

<style scoped>
/* Design pages use their own dark "board" palette, independent of the site. */
.design {
  margin: -2.5rem -1.25rem 0;
  padding: 0 1.25rem 4rem;
  background: #101010;
  color: #eae6df;
  min-height: 100vh;
}
.design__back {
  display: inline-block;
  margin: 1.5rem 0;
  font-size: 0.85rem;
  color: #b3aea4;
  text-decoration: none;
}
.design__back:hover { color: #eae6df; }

.eyebrow {
  font-family: "Space Grotesk", sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  font-size: 0.72rem;
  color: #b5563a;
  margin: 0 0 0.75rem;
}

.design__header {
  max-width: 48rem;
  margin: 1rem auto 2.5rem;
  text-align: center;
}
.design__title {
  font-family: "Space Grotesk", sans-serif;
  font-size: clamp(2.2rem, 6vw, 4rem);
  font-weight: 700;
  margin: 0 0 0.5rem;
  line-height: 1.05;
}
.design__subtitle {
  color: #b3aea4;
  font-size: 1.05rem;
  margin: 0 0 1.5rem;
}
.design__statement {
  color: #cfcabf;
  line-height: 1.75;
  margin: 0;
  text-align: left;
}

.board {
  margin: 0 auto 3.5rem;
  max-width: 72rem;
}
.board img {
  width: 100%;
  display: block;
  border: 1px solid #2a2a2a;
  border-radius: 4px;
  background: #0d0d0d;
}
.board figcaption,
.drawing figcaption {
  font-family: "Space Grotesk", sans-serif;
  font-size: 0.78rem;
  letter-spacing: 0.05em;
  color: #8f8a80;
  margin-top: 0.5rem;
}

.sec {
  max-width: 72rem;
  margin: 0 auto 3.5rem;
}
.sec__title {
  font-family: "Space Grotesk", sans-serif;
  font-size: 1.6rem;
  font-weight: 600;
  margin: 0 0 1.5rem;
  padding-bottom: 0.6rem;
  border-bottom: 2px solid #b5563a;
  display: inline-block;
}

.split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
  margin-bottom: 2rem;
}
.split--wide { grid-template-columns: 1.4fr 1fr; }

.media img {
  width: 100%;
  display: block;
  border: 1px solid #2a2a2a;
  border-radius: 4px;
  background: #0d0d0d;
}

.attrs { margin: 0; display: flex; flex-direction: column; gap: 0.9rem; }
.attrs__row {
  border-left: 2px solid #2a2a2a;
  padding-left: 1rem;
}
.attrs dt {
  font-family: "Space Grotesk", sans-serif;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #b5563a;
}
.attrs dd { margin: 0.15rem 0 0; color: #cfcabf; }

.swot {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.swot__cell {
  border: 1px solid #2a2a2a;
  border-radius: 4px;
  padding: 1rem;
}
.swot__cell h3 {
  font-family: "Space Grotesk", sans-serif;
  font-size: 0.9rem;
  margin: 0 0 0.5rem;
  color: #b5563a;
}
.swot__cell ul { margin: 0; padding-left: 1.1rem; color: #cfcabf; }
.swot__cell li { font-size: 0.9rem; line-height: 1.5; }

.prose h3 {
  font-family: "Space Grotesk", sans-serif;
  font-size: 1.2rem;
  margin: 0 0 0.6rem;
}
.prose p { color: #cfcabf; line-height: 1.7; margin: 0; }

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}
.grid--2 { grid-template-columns: 1fr 1fr; }
.drawing img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
  border: 1px solid #2a2a2a;
  border-radius: 4px;
  background: #0d0d0d;
}
.drawing figcaption { display: flex; justify-content: space-between; }
.scale { color: #6f6a61; }

.details {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem 2rem;
}
.details li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid #222;
  padding-bottom: 0.5rem;
}
.details__label { font-weight: 600; }
.details__note { color: #8f8a80; text-align: right; }

@media (max-width: 700px) {
  .split,
  .split--wide,
  .swot,
  .grid,
  .grid--2,
  .details { grid-template-columns: 1fr; }
}
</style>
