const logSettings = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  text: {
    gray: '\x1b[38;2;170;170;170m',
    white: '\x1b[38;2;240;240;240m',

    blue: '\x1b[38;2;59;130;246m',
    green: '\x1b[38;2;34;197;94m',
    yellow: '\x1b[38;2;251;191;36m',
    red: '\x1b[38;2;239;68;68m',
    purple: '\x1b[38;2;139;92;246m',
  },

  background: {
    gray: '\x1b[48;2;35;35;35m',
    blue: '\x1b[48;2;30;64;175m',
    green: '\x1b[48;2;21;128;61m',
    yellow: '\x1b[48;2;146;64;14m',
    red: '\x1b[48;2;153;27;27m',
    purple: '\x1b[48;2;76;29;149m',
  },
};

interface LogInfo {
  backgroundColor?: keyof typeof logSettings.background;
  textColor?: keyof typeof logSettings.text;
  bold?: boolean;
  dim?: boolean;
}

export const log = (text: string, info: LogInfo = {}) => {
  const isVerbose = process.env.VERBOSE === 'true';

  if (!isVerbose) return;

  const { backgroundColor, textColor, bold, dim } = info;

  let style = '';

  if (bold) style += logSettings.bright;
  if (dim) style += logSettings.dim;

  if (backgroundColor) style += logSettings.background[backgroundColor];

  if (textColor) style += logSettings.text[textColor];

  console.log(`${style}%s${logSettings.reset}`, text);
};

export const logger = {
  info: (text: string) => log(text, { textColor: 'blue', bold: true }),

  success: (text: string) => log(text, { textColor: 'green', bold: true }),

  warn: (text: string) => log(text, { textColor: 'yellow', bold: true }),

  error: (text: string) => log(text, { textColor: 'red', bold: true }),

  debug: (text: string) => log(text, { textColor: 'purple' }),

  gray: (text: string) => log(text, { textColor: 'gray', dim: true }),
};
