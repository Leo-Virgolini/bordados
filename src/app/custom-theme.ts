
import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

export const MyPreset = definePreset(Aura,
    {
        semantic: {
            primary: {
                50: '{sky.50}',
                100: '{sky.100}',
                200: '{sky.200}',
                300: '{sky.300}',
                400: '{sky.400}',
                500: '{sky.500}',
                600: '{sky.600}',
                700: '{sky.700}',
                800: '{sky.800}',
                900: '{sky.900}',
                950: '{sky.950}'
            },
            colorScheme: {
                light: {
                    surface: {
                        0: '#ffffff',
                        50: '{zinc.50}',
                        100: '{zinc.100}',
                        200: '{zinc.200}',
                        300: '{zinc.300}',
                        400: '{zinc.400}',
                        500: '{zinc.500}',
                        600: '{zinc.600}',
                        700: '{zinc.700}',
                        800: '{zinc.800}',
                        900: '{zinc.900}',
                        950: '{zinc.950}'
                    }
                },
                dark: {
                    surface: {
                        0: '#ffffff',
                        50: '{slate.50}',
                        100: '{slate.100}',
                        200: '{slate.200}',
                        300: '{slate.300}',
                        400: '{slate.400}',
                        500: '{slate.500}',
                        600: '{slate.600}',
                        700: '{slate.700}',
                        800: '{slate.800}',
                        900: '{slate.900}',
                        950: '{slate.950}'
                    }
                }
            }
        },
        components: {
            togglebutton: {
                colorScheme: {
                    light: {
                        root: {
                            checkedBackground: '{sky.400}',
                            // borderColor: '{sky.500}',
                            // checkedColor: '{sky.500}',
                            // checkedBorderColor: '{sky.500}',
                            // color: '{sky.500}',
                        },
                        content: {
                            // borderRadius: '10px',
                            // checkedBackground: '{sky.500}'
                        },
                        icon: {
                            // color: '{sky.500}',
                            // hoverColor: '{sky.700}',
                            // checkedColor: '{sky.900}'
                        }
                    },
                    dark: {
                        root: {
                            checkedBackground: '{sky.100}',
                            // borderColor: '{sky.500}',
                            // checkedColor: '{sky.500}',
                            // checkedBorderColor: '{sky.500}',
                            // color: '{sky.500}',
                        },
                        content: {
                            // borderRadius: '10px',
                            // checkedBackground: '{sky.500}'
                        },
                        icon: {
                            // color: '{sky.500}',
                            // hoverColor: '{sky.700}',
                            // checkedColor: '{sky.900}'
                        }
                    }
                }
            },
            panel: {
                colorScheme: {
                    light: {
                        root: {
                            background: '{sky.50}'
                        }
                    },
                    dark: {
                        root: {
                            background: '{sky.950}'
                        }
                    }
                }
            }
        }
    });