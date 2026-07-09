import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf-8');
const envVars = envContent.split('\n').reduce((acc, line) => {
    const [key, value] = line.split('=');
    if (key && value) {
        acc[key.trim()] = value.trim().replace(/^"|"$|^'|'$/g, '');
    }
    return acc;
}, {});

const url = envVars['PUBLIC_SUPABASE_URL'] + '/rest/v1/?apikey=' + envVars['PUBLIC_SUPABASE_ANON_KEY'];

fetch(url)
    .then(res => res.json())
    .then(data => {
        if (!data.definitions || !data.definitions.users) {
            console.log('No users definition found. Data:', data);
            return;
        }
        const users = data.definitions.users.properties;
        const required = data.definitions.users.required || [];
        console.log('Required columns for users:', required);
        console.log('Columns:', Object.keys(users));
    })
    .catch(e => console.error(e));
