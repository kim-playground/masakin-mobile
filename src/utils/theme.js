// Theme configuration for Masakin mobile app
export const colors = {
  primary: "#F4A261",
  background: "#FFF4E6",
  accent: "#6A994E",
  text: "#5C4033",
  white: "#FFFFFF",
  gray: "#E0E0E0",
  lightGray: "#F5F5F5",
  darkGray: "#757575",
  black: "#000000",
  error: "#E74C3C",
  success: "#27AE60",
  transparent: "transparent",
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text,
  },
  h2: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
  },
  h4: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  body: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.text,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.text,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400",
    color: colors.darkGray,
  },
  button: {
    fontSize: 16,
    fontWeight: "600",
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

export const shadows = {
  small: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};
