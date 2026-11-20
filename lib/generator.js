import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import _download from 'download-git-repo';
import chalk from 'chalk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 主题名称 -> 模板中的主题样式文件
const themeFileMap = {
    'Github': 'github.scss',
    'Vue': 'vue.scss',
    'Atom': 'atom.scss',
    'Customized': 'custom.scss'
};

const REPO_URL = 'https://github.com/TheWhistlers/asteroid.git#main';

// 异步的git clone
function download(repo, dest, options = {}) {
  return new Promise((resolve, reject) => {
    _download(repo, dest, options, (err) => {
      if (err) 
        reject(err);
      else 
        resolve();
    });
  });
}

/**
 * 生成项目
 * @param {string} projectName 项目名称（同时作为目标目录名）
 * @param {string} theme 主题风格：Github / Vue / Atom / Customized
 * @param {string[]} authors 作者名称列表
 * @returns {string} 生成的项目根目录绝对路径
 */
export async function generate(projectName, theme, authors) {
    const targetDir = path.resolve(process.cwd(), projectName);

    // 目标目录已存在则拒绝，避免覆盖用户数据
    if (fs.existsSync(targetDir)) {
        throw new Error(`Directory already exists: ${targetDir}`);
    }

    // clone github 远程仓库
    await download(
        `direct:${REPO_URL}`,
        targetDir,
        { clone: true }
    );

    // 将信息填入package.json
    const pkgPath = path.join(targetDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    pkg.name = projectName;
    pkg.author = authors.join(', ');
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');

    // 填入asteroid.config.json
    const configPath = path.join(targetDir, 'asteroid.config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    config.display.theme = `./src/styles/themes/${themeFileMap[theme]}`;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');

    return Promise.resolve(targetDir);
}
