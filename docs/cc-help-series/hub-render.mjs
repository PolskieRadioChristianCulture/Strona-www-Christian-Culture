import { catalogue } from './catalog-render.mjs';
import { topics } from './topics.mjs';

const escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const origin = 'https://polskieradio.cc';

export function renderHelpHub(html) {
  const eol = html.match(/\r?\n/)?.[0] ?? '\n';
  const preserveLineEndings = value => value.replace(/\r?\n/g, eol);
  const byRoute = new Map(topics.map(topic => ['/' + topic.route, topic.pl.lead]));
  const sections = catalogue.sections.map(section => ({
    ...section,
    items: section.items.filter(item => item.status === 'published' && item.route.pl)
  })).filter(section => section.items.length);
  const items = sections.flatMap(section => section.items);
  const description = item => byRoute.get(item.route.pl) ??
    'Pierwsze kroki i sprawdzone miejsca pomocy dla osób zadłużonych i ich bliskich.';
  const earlierCards = /<section class="help-category"[\s\S]*(?=<section class="help-volunteer-cta")/;
  const coaching = html.match(/<a class="help-card" href="\/holistyczny-coaching"[\s\S]*?<\/a>/)?.[0];
  const structuredData = /(<script type="application\/ld\+json">\s*)(\{[\s\S]*?\})(\s*<\/script>)/;
  if (!coaching || !earlierCards.test(html) || !structuredData.test(html)) {
    throw new Error('Missing expected CC Help hub sections');
  }

  const cards = sections.map(section => [
    '<section class="help-category" aria-labelledby="cat-' + section.id + '">',
    '  <h2 id="cat-' + section.id + '" class="help-cat-title">' + escapeHtml(section.title.pl) + '</h2>',
    '  <div class="help-cards-grid">',
    ...section.items.map(item => [
      '    <a class="help-card" href="' + escapeHtml(item.route.pl) + '" data-slug="' + escapeHtml(item.route.pl.slice(1)) + '" data-title="' + escapeHtml(item.title.pl) + '">',
      '      <strong class="help-card-title">' + escapeHtml(item.title.pl) + '</strong>',
      '      <span class="help-card-desc">' + escapeHtml(description(item)) + '</span>',
      '    </a>'
    ].join('\n')),
    '  </div>',
    '</section>'
  ].join('\n')).join('\n\n');

  const additional = [
    '<section class="help-category" aria-labelledby="cat-additional">',
    '  <h2 id="cat-additional" class="help-cat-title">Dodatkowe materiały</h2>',
    '  <div class="help-cards-grid">',
    '    ' + coaching,
    '  </div>',
    '</section>\n\n  '
  ].join('\n');
  const itemList = items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: origin + item.route.pl,
    name: item.title.pl,
    description: description(item)
  }));
  const pageDescription = 'Katalog CC Pomoc obejmuje ' + items.length + ' tematów. Zawiera praktyczne kroki i źródła wsparcia w Polsce.';
  return html
    .replace(earlierCards, () => preserveLineEndings(cards + '\n\n' + additional))
    .replace(/(<div class="help-hero-stat"><strong>)\d+(<\/strong><span>tematów<\/span><\/div>)/, (_, before, after) => before + items.length + after)
    .replace(/(<div class="help-hero-stat"><strong>)\d+(<\/strong><span>kategorii<\/span><\/div>)/, (_, before, after) => before + sections.length + after)
    .replace(structuredData, (_, before, json, after) => {
      const graph = JSON.parse(json);
      const list = graph['@graph'].find(entry => entry['@type'] === 'ItemList');
      const page = graph['@graph'].find(entry => entry['@type'] === 'CollectionPage');
      list.numberOfItems = items.length;
      list.itemListElement = itemList;
      page.description = pageDescription;
      return before + preserveLineEndings(JSON.stringify(graph, null, 2).replaceAll('<', '\\u003c')) + after;
    });
}

