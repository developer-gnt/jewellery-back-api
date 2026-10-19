import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source.js';
import { Category } from '../../modules/categories/entities/category.entity.js';
import { Product } from '../../modules/products/entities/product.entity.js';
import { ProductImage } from '../../modules/products/entities/product-image.entity.js';

export interface SeedCategoryItem {
  name: string;
  slug: string;
  description: string;
  image: string;
}

export interface SeedProductItem {
  name: string;
  slug: string;
  sku: string;
  categorySlug: string;
  description: string;
  price: number;
  metal: string;
  purity: string;
  weight: number;
  isFeatured: boolean;
  isLatest: boolean;
  images: string[];
}

export const SEED_CATEGORIES: SeedCategoryItem[] = [
  {
    name: 'Necklaces',
    slug: 'necklaces',
    description: '250+ Exquisite necklace designs crafted in hallmarked gold and diamonds',
    image: '/images/necklaces/necklace-2.jpg',
  },
  {
    name: 'Earrings',
    slug: 'earrings',
    description: '300+ Traditional & modern earrings including jhumkas, chandbalis and studs',
    image: '/images/earrings/earrings-1.jpg',
  },
  {
    name: 'Rings',
    slug: 'rings',
    description: '180+ Solitaire, cocktail & heritage gold and diamond rings',
    image: '/images/rings/ring-4.jpg',
  },
  {
    name: 'Bangles',
    slug: 'bangles',
    description: '220+ Handcrafted filigree gold bangles and broad kadas',
    image: '/images/bangles/bangle-4.jpg',
  },
  {
    name: 'Chains',
    slug: 'chains',
    description: '150+ Daily wear & ceremonial solid curb and rope gold chains',
    image: '/images/chains/chain-1.jpg',
  },
  {
    name: 'Mangalsutra',
    slug: 'mangalsutra',
    description: '120+ Auspicious traditional & modern diamond mangalsutras',
    image: '/images/mangalsutra/mangalsutra-1.jpg',
  },
  {
    name: 'Pendants',
    slug: 'pendants',
    description: '90+ Diamond & gemstone pendants in pure hallmarked gold',
    image: '/images/pendants/pendant-1.jpg',
  },
  {
    name: 'Bracelets',
    slug: 'bracelets',
    description: '110+ Elegant wrist bracelets with diamond clusters and floral links',
    image: '/images/bracelets/bracelet-1.jpg',
  },
  {
    name: 'Nose Pins',
    slug: 'nose-pins',
    description: '80+ Delicate diamond nose pins and bridal naths',
    image: '/images/nose-pins/nose-pin-1.jpg',
  },
  {
    name: 'Jewellery Sets',
    slug: 'jewellery-sets',
    description: '200+ Complete royal bridal & wedding jewellery sets',
    image: '/images/jewellery-sets/bridal-set-3.jpg',
  },
];

export const SEED_PRODUCTS: SeedProductItem[] = [
  // ── Necklaces ─────────────────────────────────────────────────────────────
  {
    name: 'Royal Diamond Necklace',
    slug: 'royal-diamond-necklace',
    sku: 'NECK-DIA-001',
    categorySlug: 'necklaces',
    description: 'A timeless masterpiece crafted with precision, featuring brilliant diamonds and elegant pearls. Perfect for weddings and festive occasions.',
    price: 124000,
    metal: 'diamond',
    purity: '22K (916)',
    weight: 22.4,
    isFeatured: true,
    isLatest: true,
    images: ['/images/necklaces/necklace-1.jpg', '/images/necklaces/necklace-2.jpg'],
  },
  {
    name: 'Traditional Gold Necklace',
    slug: 'traditional-gold-necklace',
    sku: 'NECK-GLD-002',
    categorySlug: 'necklaces',
    description: 'Exquisite traditional gold necklace crafted in rich 22K hallmarked gold with temple-inspired motifs and auspicious pearls.',
    price: 98000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 26.8,
    isFeatured: true,
    isLatest: false,
    images: ['/images/necklaces/necklace-2.jpg'],
  },
  {
    name: 'Floral Gold Motif Necklace',
    slug: 'floral-gold-motif-necklace',
    sku: 'NECK-DIA-003',
    categorySlug: 'necklaces',
    description: 'Delicate botanical floral clusters sculpted with brilliant marquise diamonds in an 18K gold setting with matching designer earrings.',
    price: 92000,
    metal: 'diamond',
    purity: '18K (750)',
    weight: 18.6,
    isFeatured: false,
    isLatest: false,
    images: ['/images/necklaces/necklace-3.jpg'],
  },
  {
    name: 'Temple Lattice Gold Necklace',
    slug: 'temple-lattice-gold-necklace',
    sku: 'NECK-TMP-004',
    categorySlug: 'necklaces',
    description: 'Intricately carved geometric lattice temple jewelry adorned with natural rubies and antique matte gold finish.',
    price: 156000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 32.5,
    isFeatured: false,
    isLatest: true,
    images: ['/images/necklaces/necklace-4.jpg'],
  },
  {
    name: 'Royal Medallion Pendant Necklace',
    slug: 'royal-medallion-pendant-necklace',
    sku: 'NECK-GLD-005',
    categorySlug: 'necklaces',
    description: 'Opulent long filigree medallion necklace with auspicious floral motifs and dangling drops, paired with matching drop earrings.',
    price: 84500,
    metal: 'gold',
    purity: '22K (916)',
    weight: 20.4,
    isFeatured: false,
    isLatest: false,
    images: ['/images/necklaces/necklace-5.jpg'],
  },
  {
    name: 'Bridal Wing Filigree Necklace',
    slug: 'bridal-wing-filigree-necklace',
    sku: 'NECK-GLD-006',
    categorySlug: 'necklaces',
    description: 'A showstopping V-shaped wing feather filigree necklace handcrafted in pure 22K gold with dangling golden bead tassels.',
    price: 138000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 29.6,
    isFeatured: true,
    isLatest: false,
    images: ['/images/necklaces/necklace-6.jpg'],
  },
  {
    name: 'Antique Mandala Drop Necklace',
    slug: 'antique-mandala-drop-necklace',
    sku: 'NECK-TMP-007',
    categorySlug: 'necklaces',
    description: 'Exquisite double-strand gold necklace with intricate mandala filigree centerpiece and teardrop charms.',
    price: 112000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 25.2,
    isFeatured: false,
    isLatest: false,
    images: ['/images/necklaces/necklace-7.jpg'],
  },
  {
    name: 'Modern Petal Bib Necklace',
    slug: 'modern-petal-bib-necklace',
    sku: 'NECK-MOD-008',
    categorySlug: 'necklaces',
    description: 'Radiant fan-style petal bib necklace with lustrous diamond-cut facets that catch the light from every angle.',
    price: 95000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 21.8,
    isFeatured: false,
    isLatest: false,
    images: ['/images/necklaces/necklace-8.jpg'],
  },
  {
    name: 'Grand Floral Bridal Choker',
    slug: 'grand-floral-bridal-choker',
    sku: 'NECK-GLD-009',
    categorySlug: 'necklaces',
    description: 'Royal collar choker necklace featuring an intricate blossom medallion centerpiece and cascading articulated golden bell tassel drops.',
    price: 168000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 36.4,
    isFeatured: true,
    isLatest: false,
    images: ['/images/necklaces/necklace-9.jpg'],
  },

  // ── Earrings ──────────────────────────────────────────────────────────────
  {
    name: 'Royal Heritage Jhumkas',
    slug: 'royal-heritage-jhumkas',
    sku: 'EAR-TRD-001',
    categorySlug: 'earrings',
    description: 'Classic handcrafted antique gold jhumkas with pearl drops, filigree dome and intricate temple carvings.',
    price: 48500,
    metal: 'gold',
    purity: '22K (916)',
    weight: 18.2,
    isFeatured: true,
    isLatest: true,
    images: ['/images/earrings/earrings-1.jpg'],
  },
  {
    name: 'Royal Chandbali Pearl Earrings',
    slug: 'royal-chandbali-pearl-earrings',
    sku: 'EAR-TRD-002',
    categorySlug: 'earrings',
    description: 'Opulent 22K gold chandbali crescent earrings with uncut polki and lustrous cultured pearls.',
    price: 58000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 21.0,
    isFeatured: true,
    isLatest: false,
    images: ['/images/earrings/earrings-2.jpg'],
  },
  {
    name: 'Peacock Blossom Gold Jhumkas',
    slug: 'peacock-blossom-gold-jhumkas',
    sku: 'EAR-TRD-003',
    categorySlug: 'earrings',
    description: 'Majestic peacock filigree stud with hanging bell jhumka and delicate pearl tassels.',
    price: 52000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 19.5,
    isFeatured: false,
    isLatest: true,
    images: ['/images/earrings/earrings-1.jpg'],
  },
  {
    name: 'Floral Polki Chandelier Earrings',
    slug: 'floral-polki-chandelier-earrings',
    sku: 'EAR-DIA-004',
    categorySlug: 'earrings',
    description: 'Stunning tiered chandelier earrings with radiant polki diamond clusters and 22K gold accents.',
    price: 64000,
    metal: 'diamond',
    purity: '22K (916)',
    weight: 22.8,
    isFeatured: false,
    isLatest: false,
    images: ['/images/earrings/earrings-2.jpg'],
  },

  // ── Rings ─────────────────────────────────────────────────────────────────
  {
    name: 'Royal Gold Ring',
    slug: 'royal-gold-ring',
    sku: 'RNG-TRD-001',
    categorySlug: 'rings',
    description: 'Traditional 22K polki floral royal signet ring with hand-chiseled petals and lustrous polish.',
    price: 62000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 8.5,
    isFeatured: true,
    isLatest: true,
    images: ['/images/rings/ring-2.jpg'],
  },
  {
    name: 'Solitaire Diamond Ring',
    slug: 'solitaire-diamond-ring',
    sku: 'RNG-DIA-002',
    categorySlug: 'rings',
    description: 'Certified brilliant cut solitaire diamond ring in 18K dual tone yellow and white gold shank.',
    price: 62000,
    metal: 'diamond',
    purity: '18K (750)',
    weight: 6.4,
    isFeatured: true,
    isLatest: false,
    images: ['/images/rings/ring-1.jpg'],
  },
  {
    name: 'Royal Cushion Gemstone Ring',
    slug: 'royal-cushion-gemstone-ring',
    sku: 'RNG-GEM-003',
    categorySlug: 'rings',
    description: 'Exquisite multi-gemstone statement ring featuring royal ruby and sapphire stones encircled by brilliant halos.',
    price: 42000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 6.8,
    isFeatured: false,
    isLatest: false,
    images: ['/images/rings/ring-1.jpg'],
  },
  {
    name: 'Solitaire Floral Gold Ring',
    slug: 'solitaire-floral-gold-ring',
    sku: 'RNG-MOD-004',
    categorySlug: 'rings',
    description: 'Romantic heart motif and petal lattice solitaire ring in glowing yellow gold accented with micro-pave crystals.',
    price: 36500,
    metal: 'gold',
    purity: '22K (916)',
    weight: 5.4,
    isFeatured: false,
    isLatest: false,
    images: ['/images/rings/ring-2.jpg'],
  },
  {
    name: 'Geometric Filigree Ring Set',
    slug: 'geometric-filigree-ring-set',
    sku: 'RNG-FLG-005',
    categorySlug: 'rings',
    description: 'Art deco lattice and geometric motif diamond-studded rings with textured gold bands and dual-tone shimmer.',
    price: 49000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 7.9,
    isFeatured: false,
    isLatest: false,
    images: ['/images/rings/ring-3.jpg'],
  },
  {
    name: 'Traditional Floral Cluster Gold Ring',
    slug: 'traditional-floral-cluster-gold-ring',
    sku: 'RNG-TRD-006',
    categorySlug: 'rings',
    description: 'Majestic heritage dome ring with all-gold floral jali lattice and high-shine polished accents.',
    price: 54000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 8.8,
    isFeatured: false,
    isLatest: false,
    images: ['/images/rings/ring-4.jpg'],
  },
  {
    name: 'Imperial Heritage Dome Rings Set',
    slug: 'imperial-heritage-dome-rings-set',
    sku: 'RNG-HRT-007',
    categorySlug: 'rings',
    description: 'Royal statement oval and leaf filigree cocktail ring set crafted with intricate bridal openwork.',
    price: 68000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 11.2,
    isFeatured: true,
    isLatest: false,
    images: ['/images/rings/ring-5.jpg'],
  },

  // ── Bangles ───────────────────────────────────────────────────────────────
  {
    name: 'Designer Gold Bangle',
    slug: 'designer-gold-bangle',
    sku: 'BNG-GLD-001',
    categorySlug: 'bangles',
    description: 'Handcrafted 22K filigree gold bangle with diamond-cut facets and intricate embossed motifs.',
    price: 89000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 28.0,
    isFeatured: true,
    isLatest: true,
    images: ['/images/bangles/bangle-2.jpg'],
  },
  {
    name: 'Twisted Wave Mesh Gold Bangles',
    slug: 'twisted-wave-mesh-gold-bangles',
    sku: 'BNG-MOD-002',
    categorySlug: 'bangles',
    description: 'Contemporary dual-tone twisted wave bangles featuring intricate laser-cut lattice mesh with alternating satin and high-polish facets.',
    price: 84000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 24.5,
    isFeatured: true,
    isLatest: false,
    images: ['/images/bangles/bangle-1.jpg'],
  },
  {
    name: 'Chevron Etched Broad Gold Kadas',
    slug: 'chevron-etched-broad-gold-kadas',
    sku: 'BNG-TRD-003',
    categorySlug: 'bangles',
    description: 'Majestic broad gold kadas crafted with diagonal chevron diamond-cut engraving and micro-mesh filigree side accents.',
    price: 118000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 34.2,
    isFeatured: false,
    isLatest: false,
    images: ['/images/bangles/bangle-2.jpg'],
  },
  {
    name: 'Wheel & Floral Filigree Gold Kadas',
    slug: 'wheel-floral-filigree-gold-kadas',
    sku: 'BNG-TMP-004',
    categorySlug: 'bangles',
    description: 'Artisanal temple-inspired gold kadas with circular rosette wheel filigree and two-tone matte diamond facets.',
    price: 98500,
    metal: 'gold',
    purity: '22K (916)',
    weight: 28.0,
    isFeatured: false,
    isLatest: true,
    images: ['/images/bangles/bangle-3.jpg'],
  },
  {
    name: 'Royal Floral Lattice Broad Kadas',
    slug: 'royal-floral-lattice-broad-kadas',
    sku: 'BNG-TRD-005',
    categorySlug: 'bangles',
    description: 'Showstopping royal bridal broad kadas featuring diamond star floral jaali openwork, bordered with fine ribbed flute carving.',
    price: 142000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 42.6,
    isFeatured: true,
    isLatest: false,
    images: ['/images/bangles/bangle-4.jpg'],
  },
  {
    name: 'Floral Openwork Gold Bangles',
    slug: 'floral-openwork-gold-bangles',
    sku: 'BNG-GLD-006',
    categorySlug: 'bangles',
    description: 'Delicate yet durable pair of lightweight daily-luxury gold bangles adorned with continuous blossom openwork.',
    price: 76000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 22.0,
    isFeatured: false,
    isLatest: false,
    images: ['/images/bangles/bangle-5.jpg'],
  },

  // ── Chains ────────────────────────────────────────────────────────────────
  {
    name: 'Royal Curb Gold Chain',
    slug: 'royal-curb-gold-chain',
    sku: 'CHN-MOD-001',
    categorySlug: 'chains',
    description: 'Classic diamond-cut solid curb chain in 22K hallmarked gold with secure lobster lock clasp.',
    price: 52000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 16.0,
    isFeatured: true,
    isLatest: true,
    images: ['/images/chains/chain-1.jpg'],
  },
  {
    name: 'Classic Singapore Twist Gold Chain',
    slug: 'classic-singapore-twist-gold-chain',
    sku: 'CHN-TRD-002',
    categorySlug: 'chains',
    description: 'Shimmering Singapore twisted links that reflect light elegantly from every direction.',
    price: 44000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 12.5,
    isFeatured: false,
    isLatest: false,
    images: ['/images/chains/chain-1.jpg'],
  },
  {
    name: 'Heavy Box Link Men Gold Chain',
    slug: 'heavy-box-link-men-gold-chain',
    sku: 'CHN-MOD-003',
    categorySlug: 'chains',
    description: 'Substantial solid geometric square box link chain designed for distinguished gentlemen.',
    price: 78000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 24.0,
    isFeatured: true,
    isLatest: false,
    images: ['/images/chains/chain-1.jpg'],
  },
  {
    name: 'Delicate Rope Link Gold Chain',
    slug: 'delicate-rope-link-gold-chain',
    sku: 'CHN-DLY-004',
    categorySlug: 'chains',
    description: 'Smooth woven French rope gold chain suitable for pendants or standalone daily wear.',
    price: 32000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 9.8,
    isFeatured: false,
    isLatest: false,
    images: ['/images/chains/chain-1.jpg'],
  },

  // ── Mangalsutra ───────────────────────────────────────────────────────────
  {
    name: 'Auspicious Floral Diamond Mangalsutra',
    slug: 'auspicious-floral-diamond-mangalsutra',
    sku: 'MNG-DIA-001',
    categorySlug: 'mangalsutra',
    description: 'Sacred and radiant traditional Indian mangalsutra with multi-strand black beads and brilliant diamond floral gold pendant.',
    price: 88000,
    metal: 'diamond',
    purity: '22K (916)',
    weight: 18.5,
    isFeatured: true,
    isLatest: true,
    images: ['/images/mangalsutra/mangalsutra-1.jpg'],
  },
  {
    name: 'Traditional Dual Wati Gold Mangalsutra',
    slug: 'traditional-dual-wati-gold-mangalsutra',
    sku: 'MNG-TRD-002',
    categorySlug: 'mangalsutra',
    description: 'Authentic Maharashtrian dual wati cups with auspicious black beads and textured gold wire accents.',
    price: 76000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 20.0,
    isFeatured: true,
    isLatest: false,
    images: ['/images/mangalsutra/mangalsutra-1.jpg'],
  },
  {
    name: 'Modern Solitaire Minimalist Mangalsutra',
    slug: 'modern-solitaire-minimalist-mangalsutra',
    sku: 'MNG-MOD-003',
    categorySlug: 'mangalsutra',
    description: 'Sleek contemporary single bezel diamond mangalsutra on a lightweight single black bead gold chain.',
    price: 54000,
    metal: 'diamond',
    purity: '18K (750)',
    weight: 11.2,
    isFeatured: false,
    isLatest: false,
    images: ['/images/mangalsutra/mangalsutra-1.jpg'],
  },
  {
    name: 'Royal Kundan Temple Mangalsutra',
    slug: 'royal-kundan-temple-mangalsutra',
    sku: 'MNG-TMP-004',
    categorySlug: 'mangalsutra',
    description: 'Regal temple-style uncut kundan pendant with emerald bead drop and intricate floral borders.',
    price: 95000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 24.5,
    isFeatured: false,
    isLatest: true,
    images: ['/images/mangalsutra/mangalsutra-1.jpg'],
  },

  // ── Pendants ──────────────────────────────────────────────────────────────
  {
    name: 'Royal Filigree Teardrop Diamond Pendant',
    slug: 'royal-filigree-teardrop-diamond-pendant',
    sku: 'PND-DIA-001',
    categorySlug: 'pendants',
    description: 'Captivating pear-cut solitaire diamond surrounded by intricate vintage filigree lace halo in 22K yellow gold.',
    price: 64000,
    metal: 'diamond',
    purity: '22K (916)',
    weight: 9.2,
    isFeatured: true,
    isLatest: true,
    images: ['/images/pendants/pendant-1.jpg'],
  },
  {
    name: 'Antique Lord Ganesha Gold Temple Pendant',
    slug: 'antique-lord-ganesha-gold-temple-pendant',
    sku: 'PND-TMP-002',
    categorySlug: 'pendants',
    description: 'Auspicious embossed deity pendant crafted with antique matte gold and ruby accents.',
    price: 48000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 12.5,
    isFeatured: true,
    isLatest: false,
    images: ['/images/pendants/pendant-1.jpg'],
  },
  {
    name: 'Solitaire Emerald Floral Gold Pendant',
    slug: 'solitaire-emerald-floral-gold-pendant',
    sku: 'PND-MOD-003',
    categorySlug: 'pendants',
    description: 'Vibrant natural Zambian emerald center framed by radiant marquise diamond petals.',
    price: 38500,
    metal: 'gold',
    purity: '18K (750)',
    weight: 7.4,
    isFeatured: false,
    isLatest: false,
    images: ['/images/pendants/pendant-1.jpg'],
  },
  {
    name: 'Peacock Motif Meenakari Gold Pendant',
    slug: 'peacock-motif-meenakari-gold-pendant',
    sku: 'PND-TRD-004',
    categorySlug: 'pendants',
    description: 'Exquisite royal Jaipur meenakari hand-enamelled peacock pendant with hanging pearl drop.',
    price: 51000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 10.8,
    isFeatured: false,
    isLatest: true,
    images: ['/images/pendants/pendant-1.jpg'],
  },

  // ── Bracelets ─────────────────────────────────────────────────────────────
  {
    name: 'Floral Filigree Diamond Link Bracelet',
    slug: 'floral-filigree-diamond-link-bracelet',
    sku: 'BRC-DIA-001',
    categorySlug: 'bracelets',
    description: 'Artisanal openwork floral blossom links with pavé diamond petals and secure concealed clasp.',
    price: 112000,
    metal: 'diamond',
    purity: '22K (916)',
    weight: 26.0,
    isFeatured: true,
    isLatest: true,
    images: ['/images/bracelets/bracelet-1.jpg'],
  },
  {
    name: 'Modern Tennis Diamond Gold Bracelet',
    slug: 'modern-tennis-diamond-gold-bracelet',
    sku: 'BRC-MOD-002',
    categorySlug: 'bracelets',
    description: 'Dazzling continuous line of certified round brilliant cut diamonds set in flexible four-prong 18K yellow gold.',
    price: 135000,
    metal: 'diamond',
    purity: '18K (750)',
    weight: 21.5,
    isFeatured: true,
    isLatest: false,
    images: ['/images/bracelets/bracelet-1.jpg'],
  },
  {
    name: 'Traditional Kada Style Cuff Bracelet',
    slug: 'traditional-kada-style-cuff-bracelet',
    sku: 'BRC-TRD-003',
    categorySlug: 'bracelets',
    description: 'Hinged cuff bracelet featuring elephant head terminal caps and rich antique carved details.',
    price: 94000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 28.0,
    isFeatured: false,
    isLatest: false,
    images: ['/images/bracelets/bracelet-1.jpg'],
  },
  {
    name: 'Delicate Heart Charm Gold Bracelet',
    slug: 'delicate-heart-charm-gold-bracelet',
    sku: 'BRC-DLY-004',
    categorySlug: 'bracelets',
    description: 'Playful and elegant charm bracelet with dangling polished gold hearts on an adjustable link chain.',
    price: 42000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 12.0,
    isFeatured: false,
    isLatest: true,
    images: ['/images/bracelets/bracelet-1.jpg'],
  },

  // ── Nose Pins ─────────────────────────────────────────────────────────────
  {
    name: 'Heritage Royal Pearl Nath & Nose Pin',
    slug: 'heritage-royal-pearl-nath-nose-pin',
    sku: 'NOS-TRD-001',
    categorySlug: 'nose-pins',
    description: 'Traditional handcrafted bridal floral nath with central brilliant diamond cluster and pearl-embellished chain.',
    price: 34000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 5.6,
    isFeatured: true,
    isLatest: true,
    images: ['/images/nose-pins/nose-pin-1.jpg'],
  },
  {
    name: 'Single Solitaire Floral Diamond Nose Pin',
    slug: 'single-solitaire-floral-diamond-nose-pin',
    sku: 'NOS-DIA-002',
    categorySlug: 'nose-pins',
    description: 'Minimalist sparkling six-prong diamond nose stud in 18K yellow gold with screw back.',
    price: 18500,
    metal: 'diamond',
    purity: '18K (750)',
    weight: 1.8,
    isFeatured: false,
    isLatest: false,
    images: ['/images/nose-pins/nose-pin-1.jpg'],
  },
  {
    name: 'Traditional Maharashtrian Brahmani Nath',
    slug: 'traditional-maharashtrian-brahmani-nath',
    sku: 'NOS-TRD-003',
    categorySlug: 'nose-pins',
    description: 'Classic paisley design studded with Basra pearls and red ruby stones.',
    price: 28000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 4.5,
    isFeatured: true,
    isLatest: false,
    images: ['/images/nose-pins/nose-pin-1.jpg'],
  },
  {
    name: 'Star Blossom 7-Diamond Nose Stud',
    slug: 'star-blossom-7-diamond-nose-stud',
    sku: 'NOS-DIA-004',
    categorySlug: 'nose-pins',
    description: 'Floral starburst cluster featuring 7 high-brilliance natural diamonds.',
    price: 22000,
    metal: 'diamond',
    purity: '18K (750)',
    weight: 2.2,
    isFeatured: false,
    isLatest: true,
    images: ['/images/nose-pins/nose-pin-1.jpg'],
  },

  // ── Jewellery Sets ────────────────────────────────────────────────────────
  {
    name: 'Traditional Bridal Choker',
    slug: 'traditional-bridal-choker',
    sku: 'SET-TRD-001',
    categorySlug: 'jewellery-sets',
    description: 'Grand royal wedding choker suite with handcrafted meenakari and antique gold finish.',
    price: 148500,
    metal: 'gold',
    purity: '22K (916)',
    weight: 42.2,
    isFeatured: true,
    isLatest: true,
    images: ['/images/jewellery-sets/bridal-set-2.jpg'],
  },
  {
    name: 'Royal Heritage Bridal Choker Set',
    slug: 'royal-heritage-bridal-choker-set',
    sku: 'SET-TRD-002',
    categorySlug: 'jewellery-sets',
    description: 'Extravagant grand bridal choker set with matching earrings and maang tikka, adorned with uncut polki and lustrous pearls.',
    price: 185000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 58.0,
    isFeatured: true,
    isLatest: false,
    images: ['/images/jewellery-sets/bridal-set-1.jpg'],
  },
  {
    name: 'Kundan Polki Grand Bridal Set',
    slug: 'kundan-polki-grand-bridal-set',
    sku: 'SET-TRD-003',
    categorySlug: 'jewellery-sets',
    description: 'Magnificent handcrafted royal bridal necklace suite featuring elaborate meenakari reverse work and emerald drops.',
    price: 240000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 72.5,
    isFeatured: true,
    isLatest: false,
    images: ['/images/jewellery-sets/bridal-set-2.jpg'],
  },
  {
    name: 'Temple Floral Gold Bridal Set',
    slug: 'temple-floral-gold-bridal-set',
    sku: 'SET-TMP-004',
    categorySlug: 'jewellery-sets',
    description: 'Traditional South Indian temple wedding set with intricately carved deities and floral filigree drops.',
    price: 215000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 64.0,
    isFeatured: false,
    isLatest: false,
    images: ['/images/jewellery-sets/bridal-set-3.jpg'],
  },
  {
    name: 'Antique Rajwadi Bridal Collection',
    slug: 'antique-rajwadi-bridal-collection',
    sku: 'SET-TRD-005',
    categorySlug: 'jewellery-sets',
    description: 'Heirloom quality antique bridal set with layered necklaces, chandelier jhumkas, and royal hathphool.',
    price: 275000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 85.0,
    isFeatured: false,
    isLatest: true,
    images: ['/images/jewellery-sets/bridal-set-4.jpg'],
  },
  {
    name: 'Imperial Royal Wedding Full Suite',
    slug: 'imperial-royal-wedding-full-suite',
    sku: 'SET-TRD-006',
    categorySlug: 'jewellery-sets',
    description: 'The crown jewel of Zewar Mahal bridal collections. Complete bridal master suite designed for high royalty weddings.',
    price: 320000,
    metal: 'gold',
    purity: '22K (916)',
    weight: 98.0,
    isFeatured: true,
    isLatest: false,
    images: ['/images/jewellery-sets/bridal-banner.jpg'],
  },
];

/**
 * Seed all 10 categories and full catalogue products into database
 */
export async function seedCatalogue(dataSource: DataSource): Promise<{
  categoriesCount: number;
  productsCount: number;
}> {
  const categoryRepo = dataSource.getRepository(Category);
  const productRepo = dataSource.getRepository(Product);
  const imageRepo = dataSource.getRepository(ProductImage);

  console.log('💎 Starting Category & Catalogue Seeding...');

  // 1. Upsert Categories
  const categoryMap = new Map<string, Category>();

  for (const catData of SEED_CATEGORIES) {
    let category = await categoryRepo.findOne({ where: { slug: catData.slug } });

    if (!category) {
      category = categoryRepo.create({
        name: catData.name,
        slug: catData.slug,
        description: catData.description,
        image: catData.image,
        isActive: true,
      });
    } else {
      category.name = catData.name;
      category.description = catData.description;
      category.image = catData.image;
      category.isActive = true;
    }

    category = await categoryRepo.save(category);
    categoryMap.set(catData.slug, category);
  }

  console.log(`✅ Upserted ${categoryMap.size} Categories.`);

  // 2. Clean up old test products with dummy names
  const legacyDummies = ['mubasshir', 'bangel', 'memory', 'royal-diamond-bangles'];
  for (const dummySlug of legacyDummies) {
    const existing = await productRepo.findOne({ where: { slug: dummySlug } });
    if (existing) {
      await productRepo.remove(existing);
      console.log(`🗑️ Removed legacy test product: ${dummySlug}`);
    }
  }

  // 3. Upsert Catalogue Products
  let productsSeeded = 0;

  for (const p of SEED_PRODUCTS) {
    const category = categoryMap.get(p.categorySlug);
    if (!category) {
      console.warn(`Category "${p.categorySlug}" not found for product "${p.name}". Skipping.`);
      continue;
    }

    let product = await productRepo.findOne({
      where: { slug: p.slug },
      relations: { images: true },
    });

    if (!product) {
      product = productRepo.create({
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        description: p.description,
        price: p.price,
        metal: p.metal,
        purity: p.purity,
        weight: p.weight,
        categoryId: category.id,
        isPublished: true,
        isFeatured: p.isFeatured,
        isLatest: p.isLatest,
      });
    } else {
      product.name = p.name;
      product.sku = p.sku;
      product.description = p.description;
      product.price = p.price;
      product.metal = p.metal;
      product.purity = p.purity;
      product.weight = p.weight;
      product.categoryId = category.id;
      product.isPublished = true;
      product.isFeatured = p.isFeatured;
      product.isLatest = p.isLatest;
    }

    product = await productRepo.save(product);

    // Clean existing images for this product and re-seed clean images
    await imageRepo.delete({ productId: product.id });

    if (p.images && p.images.length > 0) {
      const imageEntities = p.images.map((url, idx) =>
        imageRepo.create({
          productId: product.id,
          url,
          isPrimary: idx === 0,
          order: idx,
        }),
      );
      await imageRepo.save(imageEntities);
    }

    productsSeeded++;
  }

  console.log(`✅ Upserted ${productsSeeded} Catalogue Products.`);
  return { categoriesCount: categoryMap.size, productsCount: productsSeeded };
}

// Standalone runner execution
if (process.argv[1]?.endsWith('catalogue.seed.ts') || process.argv[1]?.endsWith('catalogue.seed.js')) {
  (async () => {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      await seedCatalogue(AppDataSource);
      console.log('🎉 Seeding successfully finished!');
      process.exit(0);
    } catch (err) {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    }
  })();
}
