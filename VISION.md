# Vito

## Qué es Vito

Vito es una app mobile-first de hábitos donde el progreso diario también se refleja en un compañero virtual. El usuario cuida su progreso; Vito lo acompaña visualmente. El objetivo no es maximizar rachas a cualquier costo, sino facilitar consistencia sostenible: hacer que volver a intentarlo mañana sea siempre más fácil que abandonar.

## Filosofía

**Pequeños pasos también cuentan.**

- Progreso antes que perfección: un hábito cumplido a medias sigue sumando.
- Acompañar antes que castigar: Vito nunca regaña, nunca se pone triste de forma punitiva.
- Feedback positivo sin culpa: cada interacción refuerza, ninguna avergüenza.
- Una mala jornada no destruye el progreso: el Impulso baja pero nunca se vacía, y una racha rota reinicia en 1, no en 0.
- Vito refleja el recorrido, no juzga al usuario: no existe un estado "roto" o "muerto" — el peor estado alcanzable es una siesta.

## Qué NO es Vito

Para evitar scope creep futuro, Vito explícitamente no busca ser:

- Un videojuego complejo.
- Una red social.
- Un sistema punitivo de productividad.
- Una app basada en culpa.
- Un RPG lleno de monedas o sistemas de progresión paralelos.
- Un reemplazo de herramientas complejas de project management.

## Loop principal

```
crear hábitos
  → completar pequeños objetivos
  → recibir feedback (XP, reacción de Vito)
  → ganar progreso (nivel, Impulso, racha)
  → Vito reacciona y evoluciona
  → personalizar a Vito (Ropero)
  → volver al día siguiente
```

## Principios de producto y diseño

1. Vito es el centro emocional; los hábitos son el centro funcional.
2. Emotion first, decoration second.
3. Feedback satisfactorio, nunca casino-like.
4. Mobile-first.
5. Interacciones rápidas y no bloqueantes.
6. Menos superficies, mejor jerarquía.
7. Rioplatense, cálido y directo.
8. Los assets de Vito deben seguir siendo composables (layers independientes, no sprites fusionados).
9. Mood persistente y reaction temporal son conceptos separados: uno describe cómo está Vito ahora, el otro es un festejo que pasa y se suelta solo.
10. Nuevas features deben justificar su complejidad.

## Vito 1.0 (lo que congelamos)

- Hábitos: creación, edición, archivado (soft delete), completado, undo.
- XP y niveles, derivados de XP total, nunca persistidos como valor propio.
- Impulso (momentum): sube con acción, baja con inactividad, con piso y techo fijos.
- Racha: extiende con actividad, se reinicia a 1 (no a 0) tras un corte.
- Moods de Vito: thriving, happy, content, sleepy, resting.
- Reactions temporales: celebrate, levelUp, unlock, wake, allDone.
- Vito composable: cuerpo, cara y cosmetics como capas independientes.
- Cosmetics: Sprout Cap, Explorer's Pack, Warm Glow — desbloqueo determinístico (nivel, XP o racha), nunca aleatorio.
- Ropero: gorras, mochilas y auras, con vista previa y equipar/desequipar por slot.
- Tema claro/oscuro y bottom navigation.
- Persistencia local completa (sin cuenta, sin backend).

## Arquitectura conceptual que debemos preservar

- Dominio (reglas de negocio puras) separado de representación visual.
- `mood` → estado visual persistente; `reaction` → override temporal con timeout de seguridad. Nunca se mezclan.
- Vito se dibuja como capas independientes (aura, mochila, cuerpo, cara, gorra), nunca como sprites fusionados por combinación.
- Assets con un mismo sistema de coordenadas, para que una capa nueva no rompa el resto.
- Cosmetics declarativos: catálogo de datos, no lógica ad-hoc por ítem.
- Nada que sea derivable (nivel, mood, evolución) se persiste — se recalcula siempre desde los datos crudos.
- Lógica de negocio portable: la migración a React Native debe buscar paridad con la web congelada, no reinterpretar reglas.

## Roadmap post-1.0 (no comprometido)

Ideas posibles después del lanzamiento, ninguna es requisito del MVP:

- Achievements simples.
- Estadísticas útiles.
- Comeback Boost / recuperación amable (ya existe una primera versión; podría crecer).
- Nuevos cosmetics.
- Más expresiones o reacciones, cuando aporten valor real.
- Mundo de Vito.
- Mejoras basadas en uso real, no en especulación.

## Regla para futuras features

Antes de agregar algo nuevo, preguntar:

1. ¿Ayuda al usuario a sostener hábitos?
2. ¿Hace que Vito se sienta más vivo sin agregar complejidad excesiva?
3. ¿Podemos explicarlo en pocos segundos?
4. ¿Vale el costo de mantenerlo en web y en mobile?
5. ¿Lo estamos agregando por necesidad observada o solo porque suena divertido?

Si no supera ese filtro, no entra todavía.
