const addressLine = 'Recife, Pernambuco';
const addressDisplay = `${addressLine}, Brasil`;

export const companyContact = {
  addressLine,
  addressDisplay,
  city: 'Recife',
  region: 'Pernambuco',
  regionCode: 'PE',
  countryCode: 'BR',
  phoneDisplay: '(81) 98793-1943',
  phoneHref: '+5581987931943',
  whatsappHref: 'https://wa.me/5581987931943',
  email: 'nudep@nudep.com.br',
  mapsHref: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressDisplay)}`,
} as const;
