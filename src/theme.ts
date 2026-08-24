import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Drawer,
  Menu,
  Modal,
  NumberInput,
  Pagination,
  Paper,
  PasswordInput,
  Progress,
  SegmentedControl,
  Select,
  Switch,
  Table,
  Tabs,
  TextInput,
  Textarea,
  Tooltip,
  createTheme,
} from "@mantine/core";
import classes from "@/styles/General.module.css";
import inputClasses from "@/styles/Input.module.css";
import PasswordToggleIcon from "@/components/elements/password-toggle";

/**
 * Brand ramp built around the app's accent (`#FF8A00`, index 6, Mantine's
 * default `primaryShade` for dark scheme).
 */
const faajii: [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
] = [
  "#fff4e2",
  "#ffe8cc",
  "#ffcf99",
  "#ffb562",
  "#ff9e35",
  "#ff9018",
  "#ff8a00",
  "#e37700",
  "#cb6900",
  "#b05900",
];

/** Neutral ramp sampled from the mobile dark tokens. */
const carbon: [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
] = [
  "#f5f5f7",
  "#e4e4e8",
  "#c6c6ce",
  "#a8a8b3",
  "#8e8e9b",
  "#747482",
  "#4a4a55",
  "#35353a",
  "#22242a",
  "#1a1a1d",
];

type MantineRamp = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

/**
 * Builds a 10-stop Mantine ramp from a single brand colour by mixing toward
 * white for the light end and black for the dark end. Index 6 is the input
 * colour, which is the shade Mantine resolves for `variant="filled"` in dark
 * mode — so a ramp always renders the exact token you passed in.
 */
function ramp(base: string): MantineRamp {
  const r = parseInt(base.slice(1, 3), 16);
  const g = parseInt(base.slice(3, 5), 16);
  const b = parseInt(base.slice(5, 7), 16);

  const toHex = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, "0");

  const shade = (amount: number) => {
    // amount > 0 lightens toward white, < 0 darkens toward black.
    const t = amount > 0 ? 255 : 0;
    const k = Math.abs(amount);
    return `#${toHex(r + (t - r) * k)}${toHex(g + (t - g) * k)}${toHex(
      b + (t - b) * k,
    )}`;
  };

  return [
    shade(0.92),
    shade(0.84),
    shade(0.66),
    shade(0.46),
    shade(0.28),
    shade(0.13),
    base,
    shade(-0.14),
    shade(-0.28),
    shade(-0.42),
  ];
}

const theme = createTheme({
  primaryColor: "faajii",
  primaryShade: { light: 6, dark: 6 },
  defaultRadius: "md",
  autoContrast: true,
  luminanceThreshold: 0.4,
  fontFamily: "var(--font-grotesk), system-ui, sans-serif",
  headings: {
    fontFamily: "var(--font-grotesk), system-ui, sans-serif",
    fontWeight: "700",
  },
  breakpoints: {
    xs: "30em",
    sm: "40em",
    md: "48em",
    lg: "64em",
    xl: "80em",
    "2xl": "96em",
  },
  colors: {
    faajii,
    carbon,
    // Mantine's stock teal/red/yellow are re-pointed at the token palette, so
    // the many existing `color="teal"` badges pick up the brand statuses
    // without every call site having to change.
    teal: ramp("#1ED69E"),
    green: ramp("#1ED69E"),
    red: ramp("#FF5C66"),
    yellow: ramp("#FF8A00"),
    orange: ramp("#FF8A00"),
    blue: ramp("#74C0FC"),
    cyan: ramp("#74C0FC"),
    violet: ramp("#D0BFFF"),
    grape: ramp("#F45797"),
    pink: ramp("#F45797"),
    gray: carbon,
  },
  radius: {
    xs: "6px",
    sm: "10px",
    md: "14px",
    lg: "18px",
    xl: "24px",
  },
  /** Exposed to components that need a token in JS rather than CSS. */
  other: {
    bg: "var(--fj-bg)",
    surface: "var(--fj-surface)",
    surfaceCard: "var(--fj-surface-card)",
    surfaceElevated: "var(--fj-surface-elevated)",
    border: "var(--fj-border)",
    borderSubtle: "var(--fj-border-subtle)",
    textPrimary: "var(--fj-text-primary)",
    textSecondary: "var(--fj-text-secondary)",
    textMuted: "var(--fj-text-muted)",
    accent: "var(--fj-accent)",
    danger: "var(--fj-danger)",
    success: "var(--fj-success)",
    viz: [
      "var(--fj-viz-1)",
      "var(--fj-viz-2)",
      "var(--fj-viz-3)",
      "var(--fj-viz-4)",
      "var(--fj-viz-5)",
    ],
  },
  components: {
    /* ------------------------------------------------------------ Surfaces */
    // Card and Paper carry the app's single card treatment, so pages no longer
    // need to pass `bg`/`withBorder`/`radius` — and can no longer drift.
    Card: Card.extend({
      defaultProps: { radius: "lg", padding: "lg" },
      classNames: { root: classes.surfaceCard },
    }),
    Paper: Paper.extend({
      defaultProps: { radius: "lg" },
      classNames: { root: classes.surfaceCard },
    }),

    /* ---------------------------------------------------------------- Nav */
    Tabs: Tabs.extend({
      defaultProps: { keepMounted: false },
      classNames: {
        list: classes.tabList,
        tab: classes.tab,
        tabLabel: classes.tabLabel,
        panel: classes.tabPanel,
      },
    }),
    Menu: Menu.extend({
      classNames: {
        dropdown: classes.menuDropdown,
        divider: classes.menuDivider,
        item: classes.menuItem,
      },
    }),
    Pagination: Pagination.extend({
      defaultProps: { radius: "sm" },
      classNames: {
        control: classes.paginationControl,
        dots: classes.paginationDots,
      },
    }),

    /* ------------------------------------------------------------ Actions */
    Button: Button.extend({
      classNames: { root: classes.btnRoot, label: classes.btnLabel },
      defaultProps: { size: "md", radius: "xl" },
    }),
    ActionIcon: ActionIcon.extend({
      defaultProps: { variant: "subtle", color: "gray", radius: "md" },
    }),

    /* ------------------------------------------------------------ Overlays */
    Modal: Modal.extend({
      defaultProps: { keepMounted: false, centered: true, radius: "lg" },
      classNames: {
        content: classes.modalContent,
        header: classes.modalHeader,
        title: classes.modalTitle,
        overlay: classes.modalOverlay,
      },
    }),
    Drawer: Drawer.extend({
      defaultProps: {
        keepMounted: false,
        offset: 0,
        radius: 0,
        position: "right",
        size: "lg",
      },
      classNames: {
        title: classes.rightDrawerTitle,
        header: classes.rightDrawerHeader,
        overlay: classes.rightDrawerOverlay,
        content: classes.rightDrawerContent,
        close: classes.rightDrawerClose,
      },
    }),
    Tooltip: Tooltip.extend({
      defaultProps: { radius: "sm", withArrow: true, color: "dark" },
    }),

    /* -------------------------------------------------------------- Inputs */
    // `size: lg` across the board, matching the app's 52px-tall fields.
    TextInput: TextInput.extend({
      defaultProps: { size: "lg", radius: "md" },
      classNames: {
        root: inputClasses.inputRoot,
        input: inputClasses.textInput,
        label: inputClasses.floatingLabel,
        required: inputClasses.floatingLabelRequired,
        description: inputClasses.inputDescription,
        error: inputClasses.inputError,
        section: inputClasses.inputSection,
      },
    }),
    PasswordInput: PasswordInput.extend({
      // The reveal toggle is wired in here so no screen can accidentally drop
      // it — the sign-in page had been passing `rightSection={<></>}`, which
      // silently replaced Mantine's built-in toggle with nothing.
      defaultProps: {
        size: "lg",
        radius: "md",
        visibilityToggleIcon: PasswordToggleIcon,
      },
      classNames: {
        root: inputClasses.inputRoot,
        input: inputClasses.textInput,
        label: inputClasses.floatingLabel,
        required: inputClasses.floatingLabelRequired,
        description: inputClasses.inputDescription,
        error: inputClasses.inputError,
        section: inputClasses.inputSection,
      },
    }),
    NumberInput: NumberInput.extend({
      defaultProps: { size: "lg", radius: "md" },
      classNames: {
        root: inputClasses.inputRoot,
        input: inputClasses.textInput,
        label: inputClasses.floatingLabel,
        required: inputClasses.floatingLabelRequired,
        description: inputClasses.inputDescription,
        error: inputClasses.inputError,
        section: inputClasses.inputSection,
        control: inputClasses.numberInputControl,
      },
    }),
    Textarea: Textarea.extend({
      defaultProps: { size: "lg", radius: "md" },
      classNames: {
        root: inputClasses.inputRoot,
        input: inputClasses.textAreaInput,
        label: inputClasses.floatingLabel,
        required: inputClasses.floatingLabelRequired,
        description: inputClasses.inputDescription,
        error: inputClasses.inputError,
      },
    }),
    Select: Select.extend({
      defaultProps: {
        size: "lg",
        radius: "md",
        comboboxProps: { shadow: "md" },
      },
      classNames: {
        root: inputClasses.inputRoot,
        input: inputClasses.textInput,
        label: inputClasses.floatingLabel,
        required: inputClasses.floatingLabelRequired,
        description: inputClasses.inputDescription,
        error: inputClasses.inputError,
        section: inputClasses.inputSection,
      },
    }),
    Checkbox: Checkbox.extend({
      defaultProps: { radius: "xs" },
    }),
    Switch: Switch.extend({
      defaultProps: { size: "md", color: "faajii" },
    }),
    SegmentedControl: SegmentedControl.extend({
      defaultProps: { radius: "md", size: "md" },
    }),

    /* -------------------------------------------------------------- Data */
    Table: Table.extend({
      defaultProps: {
        verticalSpacing: "md",
        horizontalSpacing: "lg",
        highlightOnHover: false,
      },
    }),
    Badge: Badge.extend({
      defaultProps: { radius: "sm", variant: "light" },
    }),
    Progress: Progress.extend({
      defaultProps: { radius: "xl", size: "sm" },
    }),
    Alert: Alert.extend({
      defaultProps: { radius: "lg", variant: "light" },
    }),
  },
});

export default theme;
