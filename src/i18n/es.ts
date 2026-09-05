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
  'app.storageError':
    'Vito no puede guardar en este navegador ahora mismo, así que el progreso de hoy puede perderse. Fijate que los datos de sitio estén permitidos y que haya espacio.',
  'app.error.title': 'Algo salió mal.',
  'app.error.hint': 'Probá recargar la página.',

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
  'common.xp': '{count} XP',
  'common.xpGain': '+{count} XP',
  'common.and': 'y',
  'common.error.save': 'No se pudo guardar, probá de nuevo.',

  'settings.language.label': 'Idioma',
  'settings.theme.label': 'Tema',
  'settings.theme.light': 'Claro',
  'settings.theme.dark': 'Oscuro',

  'settings.title': 'Ajustes',
  'settings.description': 'Tus datos se quedan en este dispositivo.',
  'settings.storage.title': 'Dónde viven tus datos',
  'settings.storage.body':
    'Vito guarda todo en este navegador. No hay cuenta, no se sube nada y nadie más puede verlo.',
  'settings.storage.caveat':
    'La contracara: si borrás los datos de sitio de este navegador, o abrís Vito en otro, empezás de cero. Exportar y sincronizar no están en esta versión.',

  'settings.reset.title': 'Empezar de nuevo',
  'settings.reset.description':
    'Borra tus hábitos, tu historial y todo lo que Vito ganó, y lo deja de nuevo en el día uno. Esto no se puede deshacer.',
  'settings.reset.action': 'Reiniciar el progreso',
  'settings.reset.pending': 'Empezando de nuevo…',
  'settings.reset.done': 'Todo volvió al día uno.',
  'settings.reset.confirm': 'Empezar de nuevo',
  'settings.reset.confirmTitle': '¿Empezar de nuevo con Vito?',
  'settings.reset.confirmMessage':
    'Esto borra tus hábitos, tu historial de completados y todo lo que Vito ganó y desbloqueó. No hay copia en ningún otro lado, así que no se puede recuperar.',
  'settings.reset.keep': 'Conservar mi progreso',

  'habits.title': 'Hábitos',
  'habits.description':
    'Todo lo que estás construyendo. Los hábitos archivados conservan su historial.',
  'habits.new': 'Nuevo',
  'habits.empty.title': 'Todavía no hay hábitos',
  'habits.empty.description': 'Empezá con una cosa chica que puedas hacer hoy.',
  'habits.empty.action': 'Agregá tu primer hábito',
  'habits.archive.title': '¿Archivar este hábito?',
  'habits.archive.message':
    '"{name}" sale de tu lista a partir de hoy. Todo lo que ya ganó queda exactamente como está.',
  'habits.archive.confirm': 'Archivar',

  'habits.card.edit': 'Editar {name}',
  'habits.card.archive': 'Archivar {name}',
  'habits.card.complete': 'Completar {name}',
  'habits.card.uncheck': 'Desmarcar {name}',

  'habits.today.label': 'Hábitos de hoy',
  'habits.today.progress': '{completed} de {scheduled} hechos hoy',
  'habits.today.allDone': 'Eso es todo por hoy. Vito está encantado.',
  'habits.today.restTitle': 'Hoy no hay nada agendado',
  'habits.today.restDescription':
    'Vito se la está tomando con calma. Listo cuando vos quieras.',
  'habits.today.emptyDescription': 'Agregá el primero y Vito va a crecer con vos.',
  'habits.today.goToHabits': 'Ir a hábitos',

  'habits.form.newTitle': 'Hábito nuevo',
  'habits.form.editTitle': 'Editar hábito',
  'habits.form.editDescription':
    'Los cambios valen a partir de hoy. Las completadas anteriores conservan la XP que ganaron.',
  'habits.form.name': 'Nombre',
  'habits.form.namePlaceholder': 'Tomar agua',
  'habits.form.nameError': 'Ponele un nombre a tu hábito para guardarlo.',
  'habits.form.icon': 'Ícono',
  'habits.form.category': 'Categoría',
  'habits.form.repeats': 'Se repite',
  'habits.form.daysError': 'Elegí al menos un día — un hábito sin días nunca aparecería.',
  'habits.form.difficulty': 'Dificultad',
  'habits.form.create': 'Agregar hábito',
  'habits.form.save': 'Guardar cambios',

  'habits.frequency.daily': 'Todos los días',
  'habits.frequency.weekdays': 'Ciertos días',

  'habits.difficulty.easy': 'Fácil',
  'habits.difficulty.normal': 'Normal',
  'habits.difficulty.hard': 'Difícil',

  'habits.category.health': 'Salud',
  'habits.category.movement': 'Movimiento',
  'habits.category.mind': 'Mente',
  'habits.category.learning': 'Aprendizaje',
  'habits.category.home': 'Casa',
  'habits.category.work': 'Trabajo',
  'habits.category.connection': 'Vínculos',

  'habits.icon.sparkles': 'Destellos',
  'habits.icon.droplet': 'Agua',
  'habits.icon.apple': 'Comida',
  'habits.icon.coffee': 'Café',
  'habits.icon.dumbbell': 'Fuerza',
  'habits.icon.footprints': 'Caminata',
  'habits.icon.bike': 'Bici',
  'habits.icon.bookOpen': 'Lectura',
  'habits.icon.penLine': 'Escritura',
  'habits.icon.brain': 'Concentración',
  'habits.icon.music': 'Música',
  'habits.icon.leaf': 'Naturaleza',
  'habits.icon.heart': 'Cuidado',
  'habits.icon.moon': 'Sueño',
  'habits.icon.sun': 'Mañana',
  'habits.icon.target': 'Meta',

  'habits.toast.levelUp': '{xp} — ¡nivel {level}! Vito está creciendo.',
  'habits.toast.unlock': '{xp} — hay algo nuevo esperando en el ropero.',
  'habits.toast.comeback': '{xp} — bonus de bienvenida.',
  'habits.toast.undo': 'Desmarcado por hoy.',

  'closet.title': 'Ropero',
  'closet.description':
    'Todo lo que Vito se ganó. Ponele lo que quieras: nada se gasta nunca.',
  'closet.worn.none': 'Hoy Vito va como él mismo.',
  'closet.worn.some': 'Vito lleva puesto {items}.',
  'closet.worn.hint':
    'Lo lleva puesto en la pantalla de Hoy. Cada espacio es independiente, así que una gorra nueva no le saca nada más.',
  'closet.slots.label': 'Espacios de accesorios',
  'closet.slot.hat': 'Gorras',
  'closet.slot.backpack': 'Mochilas',
  'closet.slot.aura': 'Auras',
  'closet.rarity.common': 'Común',
  'closet.rarity.rare': 'Rara',
  'closet.rarity.legendary': 'Legendaria',
  'closet.unlock.level': 'Se desbloquea en el nivel {value}',
  'closet.unlock.xp': 'Se desbloquea con {value} XP',
  'closet.unlock.streak': 'Se desbloquea con una racha de {value} días',
  'closet.item.worn': 'Puesto — tocá para sacarlo',
  'closet.item.wear': 'Tocá para ponerlo',

  'cosmetic.hatSprout.name': 'Gorra Brote',
  'cosmetic.backpackExplorer.name': 'Mochila de Explorador',
  'cosmetic.auraGlow.name': 'Brillo Cálido',

  'vito.avatar.wearing': ', con {items} puesto',

  'vito.stage.1': 'un brote pequeño',
  'vito.stage.2': 'un brote que crece',
  'vito.stage.3': 'un compañero frondoso',
  'vito.stage.4': 'un compañero ya crecido',

  'progress.section': 'Tu progreso',
  'progress.level': 'Nivel {level}',
  'progress.topLevel': 'Nivel máximo',
  'progress.xpToLevel': '{current} / {total} XP para el nivel {level}',
  'progress.momentum.label': 'Impulso',
  'progress.momentum.caption':
    'El impulso baja cuando todo se aquieta, y nunca se vacía.',
  'progress.streak.current.one': 'Racha de {count} día',
  'progress.streak.current.other': 'Racha de {count} días',
  'progress.streak.none': 'Hoy puede ser el día uno',
  'progress.streak.best.one': 'Tu mejor marca: {count} día',
  'progress.streak.best.other': 'Tu mejor marca: {count} días',
  'progress.streak.bestNone': 'Acá va a aparecer tu mejor marca',
  'progress.boost.one':
    'Bonus de bienvenida: el próximo hábito que completes suma XP extra.',
  'progress.boost.other':
    'Bonus de bienvenida: los próximos {count} hábitos que completes suman XP extra.',
}
