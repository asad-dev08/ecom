import { ConfigProvider, theme } from "antd";
import React, { createContext, useContext } from "react";
import { useSelector } from "react-redux";

export const ThemeContext = createContext();

export const useTheme = () => {
  const { currentTheme, settings, mode, scheme } = useSelector(
    (state) => state.theme
  );
  return {
    currentTheme: currentTheme || themes.normal_light,
    settings,
    mode,
    scheme,
    hexToRGBA,
    getTheme,
  };
};

export const themes = {
  normal_light: {
    colorBgBase: "#ffffff",
    colorPrimary: "#1677ff",
    colorInfo: "#1677ff",
    colorLink: "#1677ff",
    colorTextBase: "#000000",
    colorSuccess: "#52c41a",
    colorWarning: "#faad14",
    colorError: "#ff4d4f",
    colorBgLayout: "#f5f5f5",
    colorBgElevated: "#ffffff",
    colorBorder: "#d9d9d9",
    colorBgContainer: "#ffffff",
    // Button specific tokens
    colorPrimaryBg: "#1677ff",
    colorPrimaryBgHover: "#4096ff",
    colorPrimaryBorder: "#1677ff",
    colorPrimaryBorderHover: "#4096ff",
    colorPrimaryHover: "#4096ff",
    colorPrimaryActive: "#0958d9",
    colorPrimaryTextHover: "#4096ff",
    colorPrimaryText: "#1677ff",
    colorPrimaryTextActive: "#0958d9",
    // Menu colors
    colorBgMenu: "#ffffff",
    colorTextMenu: "#333333",
    colorTextMenuSelected: "#00875A",
    colorBgMenuSelected: "#E6F4F1",
    colorBgMenuHover: "#f5f5f5",

    // Alert colors
    colorSuccessBg: "#E6F4F1",
    colorSuccessText: "#006644",
    colorSuccessBorder: "#00A76F",

    colorWarningBg: "#FFF4E5",
    colorWarningText: "#7A4100",
    colorWarningBorder: "#FFA94D",

    colorErrorBg: "#FFE9E9",
    colorErrorText: "#B42318",
    colorErrorBorder: "#F04438",

    colorInfoBg: "#E6F4FF",
    colorInfoText: "#0958D9",
    colorInfoBorder: "#1677FF",
    controlItemBgActive: "#eff6ff", // Light blue active background
    controlItemBgActiveHover: "#e0f2fe", // Slightly darker on hover
  },
  normal_dark: {
    colorBgBase: "#141414",
    colorPrimary: "#1668dc",
    colorInfo: "#1668dc",
    colorLink: "#1668dc",
    colorTextBase: "#ffffff",
    colorSuccess: "#49aa19",
    colorWarning: "#d89614",
    colorError: "#dc4446",
    colorBgLayout: "#000000",
    colorBgElevated: "#1f1f1f",
    colorBorder: "#424242",
    colorBgContainer: "#141414",
    // Button specific tokens
    colorPrimaryBg: "#1668dc",
    colorPrimaryBgHover: "#1677ff",
    colorPrimaryBorder: "#1668dc",
    colorPrimaryBorderHover: "#1677ff",
    colorPrimaryHover: "#1677ff",
    colorPrimaryActive: "#1668dc",
    colorPrimaryTextHover: "#1677ff",
    colorPrimaryText: "#1668dc",
    colorPrimaryTextActive: "#1668dc",
    // Menu colors
    colorBgMenu: "#1F2937",
    colorTextMenu: "#E5E7EB",
    colorTextMenuSelected: "#00B77A",
    colorBgMenuSelected: "#1E3A34",
    colorBgMenuHover: "#2D3748",

    // Alert colors
    colorSuccessBg: "#1E3A34",
    colorSuccessText: "#00B77A",
    colorSuccessBorder: "#00875A",

    colorWarningBg: "#3A2E1B",
    colorWarningText: "#FDB022",
    colorWarningBorder: "#F79009",

    colorErrorBg: "#3A1F1F",
    colorErrorText: "#F97066",
    colorErrorBorder: "#F04438",

    colorInfoBg: "#1E293B",
    colorInfoText: "#3B82F6",
    colorInfoBorder: "#1677FF",
    controlItemBgActive: "#1e293b", // Dark blue active background
    controlItemBgActiveHover: "#334155", // Slightly lighter on hover
  },
  ocean_light: {
    colorPrimary: "#0EA5E9", // Bright blue
    colorBgContainer: "#ffffff",
    colorBgLayout: "#f0f9ff", // Very light blue
    colorText: "#0f172a", // Dark navy
    controlItemBgActive: "#e0f2fe", // Light sky blue active background
    controlItemBgActiveHover: "#bae6fd", // Slightly darker sky blue on hover

    // Alert colors
    colorSuccessBg: "#ecfdf5",
    colorSuccessText: "#047857",
    colorSuccessBorder: "#10b981",

    colorWarningBg: "#fff7ed",
    colorWarningText: "#9a3412",
    colorWarningBorder: "#f97316",

    colorErrorBg: "#fef2f2",
    colorErrorText: "#b91c1c",
    colorErrorBorder: "#ef4444",

    colorInfoBg: "#f0f9ff",
    colorInfoText: "#0369a1",
    colorInfoBorder: "#0ea5e9",

    // Additional colors
    colorBgElevated: "#ffffff",
    colorTextSecondary: "#334155",
    colorTextTertiary: "#64748b",
    colorBorder: "#e2e8f0",
    colorBorderSecondary: "#f1f5f9",
  },
  ocean_dark: {
    colorPrimary: "#38BDF8", // Light sky blue
    colorBgContainer: "#0c4a6e", // Dark ocean blue
    colorBgLayout: "#082f49", // Deeper ocean blue
    colorText: "#f0f9ff", // Very light blue
    controlItemBgActive: "#164e63", // Dark cyan active background
    controlItemBgActiveHover: "#155e75", // Slightly lighter cyan on hover

    // Alert colors
    colorSuccessBg: "#064e3b",
    colorSuccessText: "#34d399",
    colorSuccessBorder: "#059669",

    colorWarningBg: "#431407",
    colorWarningText: "#fb923c",
    colorWarningBorder: "#ea580c",

    colorErrorBg: "#450a0a",
    colorErrorText: "#f87171",
    colorErrorBorder: "#dc2626",

    colorInfoBg: "#0c4a6e",
    colorInfoText: "#7dd3fc",
    colorInfoBorder: "#0284c7",

    // Additional colors
    colorBgElevated: "#0e7490",
    colorTextSecondary: "#e0f2fe",
    colorTextTertiary: "#bae6fd",
    colorBorder: "#164e63",
    colorBorderSecondary: "#155e75",
  },
  forest_light: {
    colorPrimary: "#059669", // Emerald green
    colorBgContainer: "#ffffff",
    colorBgLayout: "#f0fdf4", // Very light green
    colorText: "#14532d", // Dark forest green
    controlItemBgActive: "#dcfce7", // Light mint active background
    controlItemBgActiveHover: "#bbf7d0", // Slightly darker mint on hover

    // Alert colors
    colorSuccessBg: "#ecfdf5",
    colorSuccessText: "#047857",
    colorSuccessBorder: "#10b981",

    colorWarningBg: "#fffbeb",
    colorWarningText: "#92400e",
    colorWarningBorder: "#f59e0b",

    colorErrorBg: "#fef2f2",
    colorErrorText: "#991b1b",
    colorErrorBorder: "#ef4444",

    colorInfoBg: "#f0fdf4",
    colorInfoText: "#166534",
    colorInfoBorder: "#059669",

    // Additional colors
    colorBgElevated: "#ffffff",
    colorTextSecondary: "#15803d",
    colorTextTertiary: "#22c55e",
    colorBorder: "#dcfce7",
    colorBorderSecondary: "#bbf7d0",
  },
  forest_dark: {
    colorPrimary: "#10B981", // Medium emerald
    colorBgContainer: "#14532d", // Dark forest green
    colorBgLayout: "#052e16", // Deeper forest green
    colorText: "#ecfdf5", // Very light green
    controlItemBgActive: "#166534", // Dark emerald active background
    controlItemBgActiveHover: "#15803d", // Slightly lighter emerald on hover

    // Alert colors
    colorSuccessBg: "#064e3b",
    colorSuccessText: "#34d399",
    colorSuccessBorder: "#059669",

    colorWarningBg: "#451a03",
    colorWarningText: "#fbbf24",
    colorWarningBorder: "#d97706",

    colorErrorBg: "#450a0a",
    colorErrorText: "#f87171",
    colorErrorBorder: "#dc2626",

    colorInfoBg: "#064e3b",
    colorInfoText: "#6ee7b7",
    colorInfoBorder: "#059669",

    // Additional colors
    colorBgElevated: "#166534",
    colorTextSecondary: "#d1fae5",
    colorTextTertiary: "#a7f3d0",
    colorBorder: "#166534",
    colorBorderSecondary: "#15803d",
  },
  nordic_light: {
    colorBgBase: "#ffffff",
    colorPrimary: "#5e81ac",
    colorInfo: "#5e81ac",
    colorLink: "#4c566a",
    colorTextBase: "#2e3440",
    colorSuccess: "#a3be8c",
    colorWarning: "#ebcb8b",
    colorError: "#bf616a",
    colorBgLayout: "#eceff4",
    colorBgElevated: "#ffffff",
    colorBorder: "#d8dee9",
    colorBgContainer: "#e5e9f0",
    // Button specific tokens
    colorPrimaryBg: "#5e81ac",
    colorPrimaryBgHover: "#81a1c1",
    colorPrimaryBorder: "#5e81ac",
    colorPrimaryBorderHover: "#81a1c1",
    colorPrimaryHover: "#81a1c1",
    colorPrimaryActive: "#4c566a",
    colorPrimaryTextHover: "#81a1c1",
    colorPrimaryText: "#5e81ac",
    colorPrimaryTextActive: "#4c566a",
    controlItemBgActive: "#e6f3f0", // Light mint active background
    controlItemBgActiveHover: "#d1e9e3", // Slightly darker mint on hover
    // Alert colors
    colorSuccessBg: "#ecfdf5",
    colorSuccessText: "#047857",
    colorWarningBg: "#fffbeb",
    colorWarningText: "#b45309",
    colorErrorBg: "#fef2f2",
    colorErrorText: "#991b1b",
    colorInfoBg: "#f0f9ff",
    colorInfoText: "#0c4a6e",
  },
  nordic_dark: {
    colorBgBase: "#2e3440",
    colorPrimary: "#88c0d0",
    colorInfo: "#88c0d0",
    colorLink: "#8fbcbb",
    colorTextBase: "#eceff4",
    colorSuccess: "#a3be8c",
    colorWarning: "#ebcb8b",
    colorError: "#bf616a",
    colorBgLayout: "#242933",
    colorBgElevated: "#2e3440",
    colorBorder: "#4c566a",
    colorBgContainer: "#2e3440",
    // Button specific tokens
    colorPrimaryBg: "#88c0d0",
    colorPrimaryBgHover: "#8fbcbb",
    colorPrimaryBorder: "#88c0d0",
    colorPrimaryBorderHover: "#8fbcbb",
    colorPrimaryHover: "#8fbcbb",
    colorPrimaryActive: "#81a1c1",
    colorPrimaryTextHover: "#8fbcbb",
    colorPrimaryText: "#88c0d0",
    colorPrimaryTextActive: "#81a1c1",
    controlItemBgActive: "#1e2d2b", // Dark mint active background
    controlItemBgActiveHover: "#263b38", // Slightly lighter mint on hover
    // Alert colors
    colorSuccessBg: "#064e3b",
    colorSuccessText: "#34d399",
    colorWarningBg: "#451a03",
    colorWarningText: "#fbbf24",
    colorErrorBg: "#450a0a",
    colorErrorText: "#f87171",
    colorInfoBg: "#082f49",
    colorInfoText: "#38bdf8",
  },
  vintage_light: {
    colorPrimary: "#C17055",
    colorBgContainer: "#fffcf5",
    colorBgLayout: "#fdf8f1",
    colorText: "#2c1810",
    controlItemBgActive: "#fdf0e9", // Light terracotta active background
    controlItemBgActiveHover: "#fbe3d7", // Slightly darker terracotta on hover
    // Alert colors
    colorSuccessBg: "#f3f9e7",
    colorSuccessText: "#3f6212",
    colorWarningBg: "#fef7e6",
    colorWarningText: "#854d0e",
    colorErrorBg: "#fef2f2",
    colorErrorText: "#991b1b",
    colorInfoBg: "#f5f8ff",
    colorInfoText: "#1e3a8a",
  },
  vintage_dark: {
    colorPrimary: "#E8B4A4",
    colorBgContainer: "#2c1810",
    colorBgLayout: "#1a0f0a",
    colorText: "#f5e6d8",
    controlItemBgActive: "#3d251c", // Dark terracotta active background
    controlItemBgActiveHover: "#4e3127", // Slightly lighter terracotta on hover
    // Alert colors
    colorSuccessBg: "#1c3311",
    colorSuccessText: "#a3e635",
    colorWarningBg: "#3f2009",
    colorWarningText: "#fbbf24",
    colorErrorBg: "#3f0f0f",
    colorErrorText: "#fca5a5",
    colorInfoBg: "#1e3a8a",
    colorInfoText: "#93c5fd",
  },
  modern_light: {
    colorPrimary: "#6366F1",
    colorBgContainer: "#ffffff",
    colorBgLayout: "#fafafa",
    colorText: "#18181b",
    controlItemBgActive: "#eef2ff", // Light indigo active background
    controlItemBgActiveHover: "#e0e7ff", // Slightly darker indigo on hover
    // Alert colors
    colorSuccessBg: "#f0fdf4",
    colorSuccessText: "#166534",
    colorWarningBg: "#fefce8",
    colorWarningText: "#854d0e",
    colorErrorBg: "#fef2f2",
    colorErrorText: "#991b1b",
    colorInfoBg: "#eef2ff",
    colorInfoText: "#3730a3",
  },
  modern_dark: {
    colorPrimary: "#818CF8",
    colorBgContainer: "#18181b",
    colorBgLayout: "#09090b",
    colorText: "#f4f4f5",
    controlItemBgActive: "#2e2e48", // Dark indigo active background
    controlItemBgActiveHover: "#3c3c5c", // Slightly lighter indigo on hover
    // Alert colors
    colorSuccessBg: "#052e16",
    colorSuccessText: "#4ade80",
    colorWarningBg: "#422006",
    colorWarningText: "#fbbf24",
    colorErrorBg: "#450a0a",
    colorErrorText: "#f87171",
    colorInfoBg: "#1e1b4b",
    colorInfoText: "#a5b4fc",
  },
};

// Font size configurations
const FONT_SIZES = {
  xs: 12,
  sm: 13,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  "2xl": 20,
};

const HEADING_SCALES = {
  compact: {
    h1: 1.67, // ~24px when base is 14px
    h2: 1.5, // ~21px
    h3: 1.33, // ~19px
    h4: 1.17, // ~16px
    h5: 1.08, // ~15px
    h6: 1, // same as base
  },
  default: {
    h1: 2, // ~28px when base is 14px
    h2: 1.67, // ~24px
    h3: 1.5, // ~21px
    h4: 1.33, // ~19px
    h5: 1.17, // ~16px
    h6: 1.08, // ~15px
  },
  large: {
    h1: 2.5, // ~35px when base is 14px
    h2: 2, // ~28px
    h3: 1.67, // ~24px
    h4: 1.5, // ~21px
    h5: 1.33, // ~19px
    h6: 1.17, // ~16px
  },
};

function getFontSize(size) {
  return FONT_SIZES[size] || FONT_SIZES.base;
}

function getHeadingScale(scale = "default") {
  return HEADING_SCALES[scale] || HEADING_SCALES.default;
}

function getFontFamily(font) {
  switch (font) {
    case "roboto":
      return '"Roboto", -apple-system, BlinkMacSystemFont, sans-serif';
    case "opensans":
      return '"Open Sans", -apple-system, BlinkMacSystemFont, sans-serif';
    case "poppins":
      return '"Poppins", -apple-system, BlinkMacSystemFont, sans-serif';
    case "sourcesans":
      return '"Source Sans Pro", -apple-system, BlinkMacSystemFont, sans-serif';
    case "system":
      return '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial';
    default:
      return '"Inter", -apple-system, BlinkMacSystemFont, sans-serif';
  }
}

export function hexToRGBA(hex, opacity) {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  opacity = Math.min(1, Math.max(0, opacity));
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Safe theme getter
export const getTheme = (scheme, mode) => {
  const themeKey = `${scheme}_${mode}`;
  return themes[themeKey] || themes.normal_light;
};

function ThemeProvider({ children }) {
  const { mode = "light", scheme = "normal" } = useSelector(
    (state) => state.theme
  );

  // Get the current theme based on mode and scheme
  const currentTheme = themes[`${scheme}_${mode}`] || themes.normal_light; // Fallback to normal_light if undefined

  return (
    <ConfigProvider
      theme={{
        algorithm:
          mode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          ...currentTheme,
        },
        components: {
          Menu: {
            itemBg: currentTheme.colorBgContainer,
            itemColor: currentTheme.colorText,
            itemHoverBg: currentTheme.controlItemBgActiveHover,
            itemHoverColor: currentTheme.colorPrimary,
            itemSelectedBg: currentTheme.controlItemBgActive,
            itemSelectedColor: currentTheme.colorPrimary,
            subMenuItemBg: currentTheme.colorBgContainer,
          },
          Alert: {
            colorInfo: currentTheme.colorInfoText,
            colorInfoBg: currentTheme.colorInfoBg,
            colorInfoBorder: currentTheme.colorInfoBorder,
            colorSuccess: currentTheme.colorSuccessText,
            colorSuccessBg: currentTheme.colorSuccessBg,
            colorSuccessBorder: currentTheme.colorSuccessBorder,
            colorWarning: currentTheme.colorWarningText,
            colorWarningBg: currentTheme.colorWarningBg,
            colorWarningBorder: currentTheme.colorWarningBorder,
            colorError: currentTheme.colorErrorText,
            colorErrorBg: currentTheme.colorErrorBg,
            colorErrorBorder: currentTheme.colorErrorBorder,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

export default ThemeProvider;
