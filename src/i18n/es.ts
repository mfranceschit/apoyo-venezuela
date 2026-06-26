export const es = {
  hero: {
    eyebrow: 'Diáspora venezolana',
    title: 'Apoyo Venezuela',
    subtitle: 'Encuentra centros de acopio y voluntariado cerca de ti',
    cta: 'Ver lugares',
    add: 'Agregar un lugar',
  },
  warning: {
    text: 'Verifica la información antes de acudir. Si vas a donar dinero, hazlo directamente en la web oficial de la ONG.',
  },
  filters: {
    all: 'Todos',
    country: 'País',
    type: 'Tipo',
    acopio: 'Centro de acopio',
    voluntariado: 'Voluntariado',
    countries: {
      España: 'España',
      Chile: 'Chile',
      Argentina: 'Argentina',
      Uruguay: 'Uruguay',
      México: 'México',
    } as Record<string, string>,
  },
  card: {
    confirmed: (n: number) =>
      `${n} ${n === 1 ? 'persona reportó' : 'personas reportaron'} haber estado aquí`,
    unconfirmed: 'Sin confirmaciones todavía',
    confirm: 'Confirmar visita',
  },
  addPlace: {
    title: 'Agregar un lugar',
    name: 'Nombre del lugar',
    type: 'Tipo',
    city: 'Ciudad',
    country: 'País',
    address: 'Dirección (opcional)',
    submit: 'Publicar',
    cancel: 'Cancelar',
    placeholder: {
      name: 'Ej. Asociación Venezuela Madrid',
      city: 'Ej. Madrid',
      address: 'Ej. Calle Mayor 1',
    },
  },
  confirmModal: {
    title: '¿Qué hiciste en este lugar?',
    action: 'Acción',
    when: '¿Cuándo?',
    whenPlaceholder: 'Ej. hoy, esta semana',
    submit: 'Confirmar',
    cancel: 'Cancelar',
    actions: {
      'dejé donativo': 'Dejé un donativo',
      'fui voluntario': 'Fui voluntario',
      'lo visité y sigue activo': 'Lo visité y sigue activo',
    } as Record<string, string>,
  },
  loading: 'Cargando lugares...',
  empty: 'No hay lugares registrados para estos filtros.',
  langToggle: 'EN',
} as const;
