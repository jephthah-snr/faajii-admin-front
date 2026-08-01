import {
  Button,
  Drawer,
  Menu,
  Modal,
  NumberInput,
  PasswordInput,
  Select,
  Tabs,
  TextInput,
  Textarea,
  createTheme,
} from "@mantine/core";
import classes from "@/styles/General.module.css";
import inputClasses from "@/styles/Input.module.css";
const theme = createTheme({
  breakpoints: {
    xs: "30em",
    sm: "40em",
    md: "48em",
    lg: "64em",
    xl: "80em",
    "2xl": "96em",
  },
  colors: {
    "pp-primary": [
      "#ebeeff",
      "#d4d9ff",
      "#a6b0f6",
      "#7685ee",
      "#4d60e8",
      "#3349e4",
      "#243de4",
      "#152fcb",
      "#0d2ab6",
      "#0023a1",
    ],
  },
  components: {
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
    Button: Button.extend({
      classNames: {
        root: classes.btnRoot,
        label: classes.btnLabel,
      },
      defaultProps: {
        size: "md",
      },
    }),
    Modal: Modal.extend({
      defaultProps: { keepMounted: false },
      classNames: {
        content: classes.modalContent,
        header: classes.modalHeader,
        title: classes.modalTitle,
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
    TextInput: TextInput.extend({
      classNames: {
        input: inputClasses.textInput,
        label: inputClasses.textInputLabel,
      },
    }),
    PasswordInput: PasswordInput.extend({
      classNames: {
        input: inputClasses.textInput,
        label: inputClasses.textInputLabel,
      },
    }),
    NumberInput: NumberInput.extend({
      classNames: {
        input: inputClasses.textInput,
        label: inputClasses.textInputLabel,
        control: inputClasses.numberInputControl,
      },
    }),
    Textarea: Textarea.extend({
      classNames: {
        input: inputClasses.textAreaInput,
        label: inputClasses.textInputLabel,
      },
    }),
    Select: Select.extend({
      classNames: {
        input: inputClasses.textInput,
        label: inputClasses.textInputLabel,
      },
    }),
  },
});

export default theme;
