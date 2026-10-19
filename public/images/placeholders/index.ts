/**
 * Zewar Mahal — Image Asset Placeholders
 *
 * NOTE: Replace these placeholder identifiers with final high-resolution assets:
 * - splashBackground: require('@/assets/images/splash_bg.png')
 * - zewarMahalLogo: require('@/assets/images/logo_gold.png') or SVG component
 * - loginHero: require('@/assets/images/login_hero_bride.png')
 * - loginLowerBg: require('@/assets/images/login_lower_bg.png')
 * - otpJewellery: require('@/assets/images/otp_jewellery.png')
 * - otpLowerBg: require('@/assets/images/otp_lower_bg.png')
 *
 * Home Screen Placeholders:
 * - homeLogoPlaceholder
 * - goldBarPlaceholder
 * - silverBarPlaceholder
 * - homeHeroModelPlaceholder
 * - necklaceCategoryPlaceholder
 * - earringsCategoryPlaceholder
 * - ringsCategoryPlaceholder
 * - banglesCategoryPlaceholder
 * - chainsCategoryPlaceholder
 * - mangalsutraCategoryPlaceholder
 * - latestNecklacePlaceholder
 * - latestEarringsPlaceholder
 * - latestRingPlaceholder
 * - latestBanglePlaceholder
 * - festiveOfferJewelleryPlaceholder
 */

export const BRAND_LOGO_ASSET = require('../image.png');

export const NECKLACE_IMAGES = {
  necklace1: require('../necklaces/necklace-1.jpg'),
  necklace2: require('../necklaces/necklace-2.jpg'),
  necklace3: require('../necklaces/necklace-3.jpg'),
  necklace4: require('../necklaces/necklace-4.jpg'),
  necklace5: require('../necklaces/necklace-5.jpg'),
  necklace6: require('../necklaces/necklace-6.jpg'),
  necklace7: require('../necklaces/necklace-7.jpg'),
  necklace8: require('../necklaces/necklace-8.jpg'),
  necklace9: require('../necklaces/necklace-9.jpg'),
};

export const BANGLE_IMAGES = {
  bangle1: require('../bangles/bangle-1.jpg'),
  bangle2: require('../bangles/bangle-2.jpg'),
  bangle3: require('../bangles/bangle-3.jpg'),
  bangle4: require('../bangles/bangle-4.jpg'),
  bangle5: require('../bangles/bangle-5.jpg'),
};

export const RING_IMAGES = {
  ring1: require('../rings/ring-1.jpg'),
  ring2: require('../rings/ring-2.jpg'),
  ring3: require('../rings/ring-3.jpg'),
  ring4: require('../rings/ring-4.jpg'),
  ring5: require('../rings/ring-5.jpg'),
  pureRing1: require('../rings/ring-pure-1.jpg'),
  pureRing2: require('../rings/ring-pure-2.jpg'),
  pureRing3: require('../rings/ring-pure-3.jpg'),
};

export const BRIDAL_SET_IMAGES = {
  set1: require('../jewellery-sets/bridal-set-1.jpg'),
  set2: require('../jewellery-sets/bridal-set-2.jpg'),
  set3: require('../jewellery-sets/bridal-set-3.jpg'),
  set4: require('../jewellery-sets/bridal-set-4.jpg'),
  banner: require('../jewellery-sets/bridal-banner.jpg'),
};

export const EARRINGS_IMAGES = {
  earrings1: require('../earrings/earrings-1.jpg'),
  earrings2: require('../earrings/earrings-2.jpg'),
};

export const CHAIN_IMAGES = {
  chain1: require('../chains/chain-1.jpg'),
};

export const MANGALSUTRA_IMAGES = {
  mangalsutra1: require('../mangalsutra/mangalsutra-1.jpg'),
};

export const PENDANT_IMAGES = {
  pendant1: require('../pendants/pendant-1.jpg'),
};

export const BRACELET_IMAGES = {
  bracelet1: require('../bracelets/bracelet-1.jpg'),
};

export const NOSE_PIN_IMAGES = {
  nosePin1: require('../nose-pins/nose-pin-1.jpg'),
};

export const RATE_IMAGES = {
  goldBar: require('../rates/gold-bar.jpg'),
  silverBar: require('../rates/silver-bar.jpg'),
};

export const ASSET_PLACEHOLDERS = {
  /** Fullscreen splash background photo */
  splashBackgroundPlaceholder: BRIDAL_SET_IMAGES.banner as number | null,

  /** Foreground jewellery close-up or layered jewellery crop */
  splashJewelleryPlaceholder: NECKLACE_IMAGES.necklace2 as number | null,

  /** Official transparent vector/PNG gold logo of Zewar Mahal */
  zewarMahalLogoPlaceholder: BRAND_LOGO_ASSET as number | null,

  /** Home brand header logo asset */
  homeLogoPlaceholder: BRAND_LOGO_ASSET as number | null,

  /** Login bridal model photo */
  loginHeroPlaceholder: BRIDAL_SET_IMAGES.banner as number | null,

  /** Login lower decorative background */
  loginLowerBackgroundPlaceholder: null as number | null,

  /** Google 'G' icon asset */
  googleIconPlaceholder: null as number | null,

  /** Apple logo icon asset */
  appleIconPlaceholder: null as number | null,

  /** India Flag mini asset */
  indiaFlagPlaceholder: null as number | null,

  /** OTP upper-right jewellery photograph */
  otpJewelleryPlaceholder: NECKLACE_IMAGES.necklace1 as number | null,

  /** OTP lower decorative background */
  otpLowerBackgroundPlaceholder: null as number | null,

  /* ======================================================================== */
  /* HOME SCREEN PLACEHOLDERS                                                 */
  /* ======================================================================== */

  /** Gold ingot / bar 3D asset placeholder (24K Gold Rate) */
  goldBarPlaceholder: RATE_IMAGES.goldBar as number | null,

  /** Silver bar / ingot 3D asset placeholder (1Kg Silver Rate) */
  silverBarPlaceholder: RATE_IMAGES.silverBar as number | null,

  /** Hero promotional model photograph: Indian bride with royal gold necklace & jhumkas */
  homeHeroModelPlaceholder: BRIDAL_SET_IMAGES.banner as number | null,

  /** Category thumbnail: Royal gold necklace */
  necklaceCategoryPlaceholder: NECKLACE_IMAGES.necklace2 as number | null,

  /** Category thumbnail: Traditional jhumka earrings */
  earringsCategoryPlaceholder: EARRINGS_IMAGES.earrings1 as number | null,

  /** Category thumbnail: Polki diamond floral ring */
  ringsCategoryPlaceholder: RING_IMAGES.ring4 as number | null,

  /** Category thumbnail: Handcrafted filigree gold bangles */
  banglesCategoryPlaceholder: BANGLE_IMAGES.bangle4 as number | null,

  /** Category thumbnail: Elegant pendant chain */
  chainsCategoryPlaceholder: CHAIN_IMAGES.chain1 as number | null,

  /** Category thumbnail: Traditional gold mangalsutra */
  mangalsutraCategoryPlaceholder: MANGALSUTRA_IMAGES.mangalsutra1 as number | null,

  /** Latest Designs 1: Elegant Diamond Necklace */
  latestNecklacePlaceholder: NECKLACE_IMAGES.necklace1 as number | null,

  /** Latest Designs 2: Traditional Jhumka Earrings */
  latestEarringsPlaceholder: EARRINGS_IMAGES.earrings1 as number | null,

  /** Latest Designs 3: Royal Gold Ring */
  latestRingPlaceholder: RING_IMAGES.ring2 as number | null,

  /** Latest Designs 4: Designer Bangle */
  latestBanglePlaceholder: BANGLE_IMAGES.bangle2 as number | null,

  /** Festive Offers banner right photograph: Antique jewellery on velvet/silk */
  festiveOfferJewelleryPlaceholder: BRIDAL_SET_IMAGES.set4 as number | null,

  /* ======================================================================== */
  /* CATEGORIES SCREEN PLACEHOLDERS                                           */
  /* ======================================================================== */

  /** Categories Screen: Replaceable pendant jewellery category thumbnail */
  pendantsCategoryPlaceholder: PENDANT_IMAGES.pendant1 as number | null,

  /** Categories Screen: Replaceable bracelet jewellery category thumbnail */
  braceletsCategoryPlaceholder: BRACELET_IMAGES.bracelet1 as number | null,

  /** Categories Screen: Replaceable nose pin jewellery category thumbnail */
  nosePinsCategoryPlaceholder: NOSE_PIN_IMAGES.nosePin1 as number | null,

  /** Categories Screen: Replaceable jewellery sets category thumbnail */
  jewellerySetsCategoryPlaceholder: BRIDAL_SET_IMAGES.set3 as number | null,

  /** Categories Screen: Bridal collection promotional banner photograph */
  bridalCollectionBannerPlaceholder: BRIDAL_SET_IMAGES.banner as number | null,

  /** Categories Screen: Botanical decorative motif (upper-right of heading) */
  botanicalDecorationPlaceholder: null as number | null,

  /* ======================================================================== */
  /* BROWSE NECKLACE LISTING PLACEHOLDERS                                     */
  /* ======================================================================== */

  necklaceListingLogoPlaceholder: BRAND_LOGO_ASSET as number | null,
  necklaceHeroPlaceholder: NECKLACE_IMAGES.necklace2,
  necklaceBotanicalDecorationPlaceholder: null as number | null,
  royalDiamondNecklacePlaceholder: NECKLACE_IMAGES.necklace1,
  traditionalGoldNecklacePlaceholder: NECKLACE_IMAGES.necklace2,
  floralDiamondNecklacePlaceholder: NECKLACE_IMAGES.necklace3,
  templeGoldNecklacePlaceholder: NECKLACE_IMAGES.necklace4,
  modernGoldNecklacePlaceholder: NECKLACE_IMAGES.necklace5,
  bridalDiamondNecklacePlaceholder: NECKLACE_IMAGES.necklace6,
  antiqueMandalaNecklacePlaceholder: NECKLACE_IMAGES.necklace7,
  modernPetalNecklacePlaceholder: NECKLACE_IMAGES.necklace8,
  grandFloralChokerPlaceholder: NECKLACE_IMAGES.necklace9,

  /* ======================================================================== */
  /* PRODUCT DETAIL SCREEN GALLERY PLACEHOLDERS                               */
  /* ======================================================================== */

  productMainImagePlaceholder: NECKLACE_IMAGES.necklace2,
  productGalleryImagePlaceholder: NECKLACE_IMAGES.necklace1,
  productThumbnailModelPlaceholder: NECKLACE_IMAGES.necklace3,
  productThumbnailNecklacePlaceholder: NECKLACE_IMAGES.necklace4,
  productThumbnailPendantPlaceholder: NECKLACE_IMAGES.necklace5,
  productThumbnailEarringsPlaceholder: NECKLACE_IMAGES.necklace6,
  productThumbnailStandPlaceholder: NECKLACE_IMAGES.necklace7,

  /* ======================================================================== */
  /* SEARCH RESULTS SCREEN PLACEHOLDERS                                       */
  /* ======================================================================== */

  searchResultsLogoPlaceholder: BRAND_LOGO_ASSET as number | null,
  bridalGoldNecklacePlaceholder: NECKLACE_IMAGES.necklace6,

  /* ======================================================================== */
  /* LIVE GOLD & SILVER RATES SCREEN PLACEHOLDERS                             */
  /* ======================================================================== */

  ratesLogoPlaceholder: BRAND_LOGO_ASSET as number | null,
  goldSilverHeroPlaceholder: null as number | null,
  ratesBotanicalDecorationPlaceholder: null as number | null,

  /* ======================================================================== */
  /* MY SHOP RATES SCREEN PLACEHOLDERS                                        */
  /* ======================================================================== */

  shopRatesLogoPlaceholder: BRAND_LOGO_ASSET as number | null,
  goldTogglePlaceholder: null as number | null,
  silverTogglePlaceholder: null as number | null,

  /* ======================================================================== */
  /* PRODUCT ENQUIRY FORM SCREEN PLACEHOLDERS                                 */
  /* ======================================================================== */

  enquiryScreenLogoPlaceholder: BRAND_LOGO_ASSET as number | null,
  enquiryProductImagePlaceholder: null as number | null,

  /* ======================================================================== */
  /* ENQUIRY SUCCESS SCREEN PLACEHOLDERS                                      */
  /* ======================================================================== */

  successScreenLogoPlaceholder: BRAND_LOGO_ASSET as number | null,
  successProductImagePlaceholder: null as number | null,

  /* ======================================================================== */
  /* SEARCH EMPTY STATE SCREEN PLACEHOLDERS                                   */
  /* ======================================================================== */

  searchEmptyStateIllustrationPlaceholder: null as number | null,

  /* ======================================================================== */
  /* NOTIFICATIONS SCREEN PLACEHOLDERS                                        */
  /* ======================================================================== */

  notificationsScreenLogoPlaceholder: BRAND_LOGO_ASSET as number | null,
  notificationsEmptyIllustrationPlaceholder: null as number | null,

  /* ======================================================================== */
  /* NETWORK ERROR SCREEN PLACEHOLDERS                                        */
  /* ======================================================================== */

  networkErrorScreenLogoPlaceholder: BRAND_LOGO_ASSET as number | null,
  networkErrorIllustrationPlaceholder: null as number | null,

  /* ======================================================================== */
  /* EDIT PROFILE SCREEN PLACEHOLDERS                                         */
  /* ======================================================================== */

  editProfileLogoPlaceholder: BRAND_LOGO_ASSET as number | null,
  profileAvatarPlaceholder: null as number | null,

  /* ======================================================================== */
  /* PRIVACY POLICY SCREEN PLACEHOLDERS                                       */
  /* ======================================================================== */

  privacyPolicyLogoPlaceholder: BRAND_LOGO_ASSET as number | null,

  /* ======================================================================== */
  /* TERMS & CONDITIONS SCREEN PLACEHOLDERS                                   */
  /* ======================================================================== */

  termsConditionsLogoPlaceholder: BRAND_LOGO_ASSET as number | null,

  /* ======================================================================== */
  /* PROFILE SCREEN PLACEHOLDERS                                              */
  /* ======================================================================== */

  profileLogoPlaceholder: BRAND_LOGO_ASSET as number | null,
};
