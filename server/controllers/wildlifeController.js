const speciesData = [
  {
    id: 'black-panther',
    slug: 'black-panther',
    name: 'Black Panther (Melanistic Leopard)',
    kannadaName: 'ಕಪ್ಪು ಚಿರತೆ (Kappu Chirathe)',
    scientificName: 'Panthera pardus fusca',
    famousIndividual: 'Saya - The Ghost of Kabini',
    tagline: 'The Legendary Shadow of the Kabini Rainforest',
    status: 'Vulnerable (IUCN)',
    population_note: 'One of the rarest wildlife sights in the world; Nagarhole is renowned globally for Saya.',
    image: '/images/black-panther.jpg',
    gallery: [
      '/images/black-panther.jpg',
      'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1549480017-d76466a4b7e8?auto=format&fit=crop&w=800&q=80'
    ],
    habitat: 'Dense tropical moist deciduous canopy, riverine thickets along the Kabini backwaters.',
    bestSightingTime: '06:30 AM - 08:00 AM & 04:30 PM - 06:15 PM (Zone A & B transition corridors)',
    sightingProbability: '35% (High during dry summer months March - May near water holes)',
    behavior: 'Solitary, stealth predator. Known to perch on towering teak and rosewood branches, blending seamlessly into dappled shadows.',
    sound: 'Deep guttural sawing rasps and territorial marking chuffs.',
    photographyTips: [
      'Use high ISO (1600 - 6400) due to low light under dense canopy.',
      'Fast shutter speed (1/1000s or faster) with spot metering on the eyes.',
      'Recommended lens: 400mm f/2.8 or 600mm f/4 prime for ultimate subject separation.'
    ],
    facts: [
      'Melanism in leopards is caused by a recessive gene that causes excessive melanin pigmentation.',
      'If viewed under bright sunlight or close inspection, faint rosette patterns (spots) are visible beneath the dark coat.',
      'Saya has ruled the Kabini territory for over a decade, mating with normal spotted female leopards.'
    ]
  },
  {
    id: 'asian-elephant',
    slug: 'asian-elephant',
    name: 'Asian Elephant',
    kannadaName: 'ಏಷ್ಯನ್ ಆನೆ (Asian Aane)',
    scientificName: 'Elephas maximus',
    famousIndividual: 'Kabini Tusker Matriarchs & Giant Bulls',
    tagline: 'The Gentle Giants of the Nilgiri Biosphere',
    status: 'Endangered (IUCN)',
    population_note: 'Kabini hosts the largest wild Asian elephant congregation in Asia during summer.',
    image: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581852017103-68ac65514cf7?auto=format&fit=crop&w=800&q=80'
    ],
    habitat: 'Bamboo clusters, marshy riverbanks, and open lush grasslands across the Kabini basin.',
    bestSightingTime: 'All day, peak activity around 03:00 PM - 06:00 PM along water channels.',
    sightingProbability: '95% (Almost guaranteed sighting during Kabini boat and jeep safaris)',
    behavior: 'Highly intelligent and social herd animals led by the oldest matriarch. Playful calves often splash in mud baths.',
    sound: 'Low-frequency infrasound rumbles and high-pitched celebratory trumpeting.',
    photographyTips: [
      'Capture wide-angle habitat environmental portraits with backwater reflections.',
      'Wait for water splashes and dust bath moments for dynamic action shots.',
      'Recommended lens: 70-200mm f/2.8 or 100-400mm zoom.'
    ],
    facts: [
      'Kabini backwaters provide fresh grass and mineral-rich sediment when reservoir waters recede in summer.',
      'Asian elephant herds can walk up to 20 km daily grazing on bamboo shoots and wild grasses.'
    ]
  },
  {
    id: 'indian-leopard',
    slug: 'indian-leopard',
    name: 'Indian Leopard',
    kannadaName: 'ಚಿರತೆ (Chirathe)',
    scientificName: 'Panthera pardus fusca',
    famousIndividual: 'Kabini Tree Masters',
    tagline: 'Agile Acrobats of the Western Ghats Forest Canopy',
    status: 'Vulnerable (IUCN)',
    population_note: 'High density in Nagarhole National Park due to abundant prey base.',
    image: 'https://images.unsplash.com/photo-1456926631375-92c8ce872def?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1456926631375-92c8ce872def?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1549480017-d76466a4b7e8?auto=format&fit=crop&w=800&q=80'
    ],
    habitat: 'Dry deciduous tree forks, granite boulders, and thick lantana undergrowth.',
    bestSightingTime: 'Dawn (06:00 AM - 08:30 AM) and Dusk (04:00 PM - 06:30 PM)',
    sightingProbability: '70% across multiple safari drives',
    behavior: 'Master climbers capable of hoisting prey equal to their body weight up into high branches.',
    sound: 'Distinct sawing call echoing across the jungle.',
    photographyTips: [
      'Look for the tail dangling through tree branches when tracking.',
      'Use aperture f/4 to keep both eyes and whiskers sharp against green bokeh foliage.'
    ],
    facts: [
      'Leopards are adaptable predators capable of hunting everything from langurs to chital deer.',
      'Their rosette patterns are unique like human fingerprints.'
    ]
  },
  {
    id: 'spotted-deer',
    slug: 'spotted-deer',
    name: 'Spotted Deer (Chital)',
    kannadaName: 'ಚುಕ್ಕೆ ಜಿಂಕೆ (Chukke Jinke)',
    scientificName: 'Axis axis',
    famousIndividual: 'The Velvet Antler Guardians',
    tagline: 'The Graceful Sentinels of the Jungle Meadow',
    status: 'Least Concern (IUCN)',
    population_note: 'Abundant herbivore forming symbiotic lookout teams with Hanuman Langurs.',
    image: 'https://images.unsplash.com/photo-1484406566174-9da000fda645?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1484406566174-9da000fda645?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506898667547-42e22a46e125?auto=format&fit=crop&w=800&q=80'
    ],
    habitat: 'Open grasslands, clearing edges, and water meadows.',
    bestSightingTime: 'Throughout the day, especially early mornings grazing in morning mist.',
    sightingProbability: '99% on any safari drive',
    behavior: 'Alert and fast runners. Emits sharp alarm barks that notify the entire jungle of a nearby predator.',
    sound: 'High-pitched alarm bark "Dhank! Dhank!" when a tiger or leopard approaches.',
    photographyTips: [
      'Shoot early morning back-lit against sunrays piercing morning mist.',
      'Look for stag interaction or velvet shedding behavior.'
    ],
    facts: [
      'Hanuman langurs drop fruits and leaves from tree canopies which chital feed on, while chital watch ground predators.'
    ]
  },
  {
    id: 'bengal-tiger',
    slug: 'bengal-tiger',
    name: 'Royal Bengal Tiger',
    kannadaName: 'ಹುಲಿ (Huli)',
    scientificName: 'Panthera tigris tigris',
    famousIndividual: 'Tigers of Nagarhole & Bandipur',
    tagline: 'The Sovereign Apex Predator of Indian Jungles',
    status: 'Endangered (IUCN)',
    population_note: 'Karnataka is home to one of the largest wild tiger populations on Earth.',
    image: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=800&q=80'
    ],
    habitat: 'Moist evergreen corridors, dense bamboo brakes, and waterhole shores.',
    bestSightingTime: 'Early morning 06:15 AM - 08:30 AM & 04:00 PM - 06:00 PM',
    sightingProbability: '60% during summer months around water tanks',
    behavior: 'Solitary, powerful swimmer, dominant territory patroller marking scents along safari tracks.',
    sound: 'Thunderous roar capable of traveling over 3 kilometers.',
    photographyTips: [
      'Be prepared with continuous burst mode when the tiger crosses the safari track.',
      'Keep eye-level perspective from open gypsy.'
    ],
    facts: [
      'A tiger can consume up to 40 kg of meat in a single feast.',
      'No two tigers have the exact same stripe pattern.'
    ]
  }
];

// @desc    Get all wildlife encyclopedia species
// @route   GET /api/wildlife
exports.getAllWildlife = (req, res) => {
  res.status(200).json({ success: true, count: speciesData.length, data: speciesData });
};

// @desc    Get single wildlife species by slug
// @route   GET /api/wildlife/:slug
exports.getWildlifeBySlug = (req, res) => {
  const item = speciesData.find((s) => s.slug === req.params.slug || s.id === req.params.slug);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Wildlife species profile not found' });
  }
  res.status(200).json({ success: true, data: item });
};
