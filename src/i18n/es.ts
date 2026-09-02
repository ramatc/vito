import type { Dictionary } from './keys'

/**
 * The Spanish dictionary.
 *
 * Typed as `Dictionary` rather than inferred: that annotation is what turns a
 * missing translation into a compile error instead of a blank label someone
 * notices in production.
 */
export const ES: Dictionary = {
  'app.wordmark': 'Vito',

  'nav.today': 'Hoy',
  'nav.habits': 'Hábitos',
  'nav.closet': 'Ropero',
  'nav.settings': 'Ajustes',
  'nav.sidebar': 'Barra lateral principal',
  'nav.bottom': 'Principal',

  'home.title': 'Hoy',
  'home.description': 'De a uno. Vito crece con cada uno.',

  'common.close': 'Cerrar',
  'common.cancel': 'Cancelar',
  'common.confirm': 'Confirmar',
  'common.dismiss': 'Descartar',

  'settings.language.label': 'Idioma',
  'settings.theme.label': 'Tema',
  'settings.theme.light': 'Claro',
  'settings.theme.dark': 'Oscuro',

  'habits.today.progress': '{completed} de {scheduled} hechos hoy',

  'progress.streak.best.one': 'Tu mejor marca: {count} día',
  'progress.streak.best.other': 'Tu mejor marca: {count} días',
}
