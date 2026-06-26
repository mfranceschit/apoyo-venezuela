export const en = {
  hero: {
    eyebrow: 'Venezuelan diaspora',
    title: 'Apoyo Venezuela',
    subtitle: 'Find drop-off centers and volunteer opportunities near you',
    cta: 'See locations',
    add: 'Add a location',
  },
  warning: {
    text: 'Verify information before going. If donating money, do so directly on the official NGO website.',
  },
  filters: {
    all: 'All',
    country: 'Country',
    type: 'Type',
    acopio: 'Drop-off center',
    voluntariado: 'Volunteering',
    countries: {
      España: 'Spain',
      Chile: 'Chile',
      Argentina: 'Argentina',
      Uruguay: 'Uruguay',
      México: 'Mexico',
    } as Record<string, string>,
  },
  card: {
    confirmed: (n: number) =>
      `${n} ${n === 1 ? 'person reported' : 'people reported'} being here`,
    unconfirmed: 'No confirmations yet',
    confirm: 'Confirm visit',
  },
  addPlace: {
    title: 'Add a location',
    name: 'Location name',
    type: 'Type',
    city: 'City',
    country: 'Country',
    address: 'Address (optional)',
    submit: 'Publish',
    cancel: 'Cancel',
    placeholder: {
      name: 'E.g. Venezuela Association Madrid',
      city: 'E.g. Madrid',
      address: 'E.g. 1 Main Street',
    },
  },
  confirmModal: {
    title: 'What did you do at this location?',
    action: 'Action',
    when: 'When?',
    whenPlaceholder: 'E.g. today, this week',
    submit: 'Confirm',
    cancel: 'Cancel',
    actions: {
      'dejé donativo': 'I dropped off a donation',
      'fui voluntario': 'I volunteered',
      'lo visité y sigue activo': "I visited and it's still active",
    } as Record<string, string>,
  },
  loading: 'Loading locations...',
  empty: 'No locations registered for these filters.',
  langToggle: 'ES',
} as const;
