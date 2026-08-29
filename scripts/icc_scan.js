/**
 * ICC scanner: create/update Issue "ICC monitor" with report.
 * Uses GITHUB_TOKEN from Actions.
 */
const https = require('https');
const fs = require('fs');

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('GITHUB_TOKEN not set');
  process.exit(1);
}
const repo = process.env.REPO || process.env.GITHUB_REPOSITORY;
const [owner, repoName] = repo.split('/');

function ghRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path,
      method,
      headers: {
        'User-Agent': 'icc-scanner',
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${token}`,
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (d) => data += d);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  try {
    const commits = await ghRequest(`/repos/${owner}/${repoName}/commits?sha=main&per_page=1`);
    const latest = Array.isArray(commits.body) && commits.body[0] ? commits.body[0] : null;
    const commitSha = latest ? latest.sha : 'unknown';
    const commitMsg = latest ? latest.commit.message.split('\n')[0] : 'n/a';
    const commitAuthor = latest && latest.commit.author ? latest.commit.author.name : 'n/a';

    let guardian = 'not available';
    if (fs.existsSync('guardian.trim')) {
      guardian = fs.readFileSync('guardian.trim', 'utf8').trim();
    } else if (fs.existsSync('guardian.out')) {
      guardian = fs.readFileSync('guardian.out', 'utf8').trim().slice(0, 3000);
    }

    const bodyText = [
      '📡 PEŁNY MONIT OPERACYJNY [@ICC]',
      '',
      `* 🤖 **Aktywny Agent:** GitHub Actions ICC Scanner`,
      `* 🎯 **Bieżące Zadanie:** Periodic scan / monitoring repo`,
      `* 📦 **Ostatni Commit:** ${commitSha} | ${commitMsg} | autor: ${commitAuthor}`,
      `* 🛡️ **Strażnik Kodu (guardian) (trimmed):**`,
      '```',
      guardian || 'no-guardian-output',
      '```',
      `* 🌐 **Status Produkcji:** (manual check required)`,
      '',
      `* ⏰ **Checked at:** ${new Date().toISOString()}`,
      '',
      `--`,
      `Automatyczny raport generowany co 15 minut przez workflows/icc-scanner.yml`
    ].join('\n');

    const searchQ = encodeURIComponent(`repo:${owner}/${repoName} in:title "ICC monitor"`);
    const search = await ghRequest(`/search/issues?q=${searchQ}`);
    let issueNumber = null;
    if (search.status === 200 && search.body.items && search.body.items.length > 0) {
      issueNumber = search.body.items[0].number;
    }

    const labelName = 'icc-monitor';
    const labelCheck = await ghRequest(`/repos/${owner}/${repoName}/labels/${encodeURIComponent(labelName)}`);
    if (labelCheck.status === 404) {
      await ghRequest(`/repos/${owner}/${repoName}/labels`, 'POST', { name: labelName, color: '0e8a16', description: 'Automated ICC monitor' });
    }

    if (issueNumber) {
      await ghRequest(`/repos/${owner}/${repoName}/issues/${issueNumber}`, 'PATCH', { body: bodyText });
      console.log(`Updated issue #${issueNumber}`);
    } else {
      const created = await ghRequest(`/repos/${owner}/${repoName}/issues`, 'POST', {
        title: 'ICC monitor — automated status',
        body: bodyText,
        labels: [labelName],
      });
      if (created.status === 201) {
        console.log(`Created issue #${created.body.number}`);
      } else {
        console.error('Failed to create issue', created);
        process.exit(2);
      }
    }
  } catch (err) {
    console.error('Error in icc_scan:', err);
    process.exit(3);
  }
})();