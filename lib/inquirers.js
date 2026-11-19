import inquirer from 'inquirer';

const themePresets = [
    'Github',
    'Vue',
    'Atom',
    'Customized'
];

export async function askTheme() {
    const { theme } = await inquirer.prompt([
        {
            type: 'select',
            name: 'theme',
            message: 'Please select a theme:',
            choices: themePresets
        }
    ]);
    return theme;
}

export async function askConfig() {
    const questions = [
        {
            type: 'input',
            name: 'projectName',
            message: 'Enter the project name:',
            validate: function (input) {
                if (input.trim() === '') {
                    return 'Project name cannot be empty.';
                } else if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
                    return 'Project name can only contain letters, numbers, hyphens, and underscores.';
                }
                return true;
            }
        },
        {
            type: 'input',
            name: 'authors',
            message: 'Enter the author names (comma-separated):',
            validate: function (input) {
                if (input.trim() === '') {
                    return 'Author names cannot be empty.';
                }
                return true;
            }
        }
    ];
    const answers = await inquirer.prompt(questions);
    return answers;
}