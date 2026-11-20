import { execSync } from 'child_process';

const CWD = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';

function run(cmd) {
    console.log('Running:', cmd);
    const out = execSync(cmd, { cwd: CWD, encoding: 'utf8' });
    console.log(out);
}

run('git add master-live.html zapolske-live.html js/cc-polonia-hub.js');
run('git commit -m "fix: usuniecie klocka DEKALOG, podniesienie modlitwy do 245px, przycisk dzwieku i i18n PL EN"');
run('git push origin main');
run('git push lumina-repo main');
