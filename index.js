#!/usr/bin/env node

import chalk from 'chalk';
import figlet from 'figlet';
import clear from 'clear';

import { askTheme, askConfig } from './lib/inquirers.js';
import { generate } from './lib/generator.js';

// 清屏
clear();

// 输出Logo
console.log(chalk.whiteBright(
    figlet.textSync('Asteroid', {
        horizontalLayout: 'full',
        font: 'Standard'
    })
));

// 询问选项
const theme = await askTheme();
const { projectName, authors } = await askConfig();

console.log(chalk.greenBright(`Selected theme: ${theme}`));
console.log(chalk.greenBright(`Project Name: ${projectName}`));

const authorsArr = authors.split(',').map(author => author.trim()).filter(author => author !== '');
console.log(chalk.greenBright(`Author: [${authorsArr.join(', ')}]`));

// 生成项目
try {
    const targetDir = generate(projectName, theme, authorsArr);

    console.log('');
    console.log(chalk.cyanBright(`Project created at ${targetDir}`));
    console.log('');
    console.log(chalk.white('Next steps:'));
    console.log(chalk.white(`  cd ${projectName}`));
    console.log(chalk.white('  pnpm install'));
    console.log(chalk.white('  pnpm dev'));
} catch (err) {
    console.error(chalk.redBright(`Error: ${err.message}`));
    process.exit(1);
}
