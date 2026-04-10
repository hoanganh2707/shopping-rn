/**
 * @see https://m3.material.io/styles/typography/applying-type
 */
export const fontSizes = {
  displayLarge: 57,
  displayMedium: 45,
  displaySmall: 36,
  headlineLarge: 32,
  headlineMedium: 28,
  headlineSmall: 24,
  titleLarge: 22,
  titleMedium: 16,
  titleSmall: 14,
  bodyLarge: 16,
  bodyMedium: 14,
  bodySmall: 12,
  labelLarge: 14,
  labelMedium: 12,
  labelSmall: 11,
};

export const lineHeights = {
  displayLarge: 64,
  displayMedium: 52,
  displaySmall: 44,
  headlineLarge: 40,
  headlineMedium: 36,
  headlineSmall: 32,
  titleLarge: 28,
  titleMedium: 24,
  titleSmall: 20,
  bodyLarge: 24,
  bodyMedium: 20,
  bodySmall: 16,
  labelLarge: 20,
  labelMedium: 16,
  labelSmall: 16,
};

export const letterSpacings = {
  displayLarge: -0.2,
  displayMedium: 0.0,
  displaySmall: 0.0,
  headlineLarge: 0.0,
  headlineMedium: 0.0,
  headlineSmall: 0.0,
  titleLarge: 0.0,
  titleMedium: 0.2,
  titleSmall: 0.1,
  bodyLarge: 0.5,
  bodyMedium: 0.2,
  bodySmall: 0.4,
  labelLarge: 0.1,
  labelMedium: 0.5,
  labelSmall: 0.5,
};

export const fonts = {
  thin: {
    fontWeight: '100',
  },
  extraLight: {
    fontWeight: '200',
  },
  light: {
    fontWeight: '300',
  },
  regular: {
    fontWeight: '400',
  },
  medium: {
    fontWeight: '500',
  },
  semiBold: {
    fontWeight: '600',
  },
  bold: {
    fontWeight: '700',
  },
  extraBold: {
    fontWeight: '800',
  },
  black: {
    fontWeight: '900',
  },
  thinItalic: {
    fontWeight: '100',
    fontStyle: 'italic',
  },
  extraLightItalic: {
    fontWeight: '200',
    fontStyle: 'italic',
  },
  lightItalic: {
    fontWeight: '300',
    fontStyle: 'italic',
  },
  regularItalic: {
    fontWeight: '400',
    fontStyle: 'italic',
  },
  mediumItalic: {
    fontWeight: '500',
    fontStyle: 'italic',
  },
  semiBoldItalic: {
    fontWeight: '600',
    fontStyle: 'italic',
  },
  boldItalic: {
    fontWeight: '700',
    fontStyle: 'italic',
  },
  extraBoldItalic: {
    fontWeight: '800',
    fontStyle: 'italic',
  },
  blackItalic: {
    fontWeight: '900',
    fontStyle: 'italic',
  },
};

const regularFont = fonts['regular'];
const mediumFont = fonts['medium'];

export const typography = {
  displayLarge: {
    ...regularFont,
    fontSize: fontSizes.displayLarge,
    lineHeight: lineHeights.displayLarge,
    letterSpacing: letterSpacings.displayLarge,
  },
  displayMedium: {
    ...regularFont,
    fontSize: fontSizes.displayMedium,
    lineHeight: lineHeights.displayMedium,
    letterSpacing: letterSpacings.displayMedium,
  },
  displaySmall: {
    ...regularFont,
    fontSize: fontSizes.displaySmall,
    lineHeight: lineHeights.displaySmall,
    letterSpacing: letterSpacings.displaySmall,
  },
  headlineLarge: {
    ...regularFont,
    fontSize: fontSizes.headlineLarge,
    lineHeight: lineHeights.headlineLarge,
    letterSpacing: letterSpacings.headlineLarge,
  },
  headlineMedium: {
    ...regularFont,
    fontSize: fontSizes.headlineMedium,
    lineHeight: lineHeights.headlineMedium,
    letterSpacing: letterSpacings.headlineMedium,
  },
  headlineSmall: {
    ...regularFont,
    fontSize: fontSizes.headlineSmall,
    lineHeight: lineHeights.headlineSmall,
    letterSpacing: letterSpacings.headlineSmall,
  },
  titleLarge: {
    ...regularFont,
    fontSize: fontSizes.titleLarge,
    lineHeight: lineHeights.titleLarge,
    letterSpacing: letterSpacings.titleLarge,
  },
  titleMedium: {
    ...mediumFont,
    fontSize: fontSizes.titleMedium,
    lineHeight: lineHeights.titleMedium,
    letterSpacing: letterSpacings.titleMedium,
  },
  titleSmall: {
    ...mediumFont,
    fontSize: fontSizes.titleSmall,
    lineHeight: lineHeights.titleSmall,
    letterSpacing: letterSpacings.titleSmall,
  },
  bodyLarge: {
    ...regularFont,
    fontSize: fontSizes.bodyLarge,
    lineHeight: lineHeights.bodyLarge,
    letterSpacing: letterSpacings.bodyLarge,
  },
  bodyMedium: {
    ...regularFont,
    fontSize: fontSizes.bodyMedium,
    lineHeight: lineHeights.bodyMedium,
    letterSpacing: letterSpacings.bodyMedium,
  },
  bodySmall: {
    ...regularFont,
    fontSize: fontSizes.bodySmall,
    lineHeight: lineHeights.bodySmall,
    letterSpacing: letterSpacings.bodySmall,
  },
  labelLarge: {
    ...regularFont,
    fontSize: fontSizes.labelLarge,
    lineHeight: lineHeights.labelLarge,
    letterSpacing: letterSpacings.labelLarge,
  },
  labelMedium: {
    ...regularFont,
    fontSize: fontSizes.labelMedium,
    lineHeight: lineHeights.labelMedium,
    letterSpacing: letterSpacings.labelMedium,
  },
  labelSmall: {
    ...regularFont,
    fontSize: fontSizes.labelSmall,
    lineHeight: lineHeights.labelSmall,
    letterSpacing: letterSpacings.labelSmall,
  },
};
