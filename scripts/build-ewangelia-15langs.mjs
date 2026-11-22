import fs from 'node:fs';
import path from 'node:path';

// Load existing i18n to keep pl, en, de, uk, es, ru exactly intact
import { EWANGELIA_I18N as EXISTING_I18N } from '../Ewangelia/i18n.js';

console.log('Existing languages:', Object.keys(EXISTING_I18N));

// Now define the 9 new world languages: zh, fr, pt, ar, hi, id, it, ja, ko
const newLangs = {
  zh: {
    langName: '中文 (简体)',
    metaTitle: '福音 — 佳音 | 将生命奉献给耶稣基督的祷告 | Radio CC',
    metaDescription: '福音佳音。聆听耶稣基督的信息，收听音频并阅读将生命奉献给耶稣基督的决志祷告。',
    nav: {
      start: '首页',
      goodNews: '福音佳音',
      audio: '音频录制',
      prayer: '决志祷告',
      values: '核心价值',
      about: '关于项目'
    },
    hero: {
      kicker: '改变生命的话语',
      title1: '福音',
      title2: '佳音',
      intro: '关于生命、盼望和永恒真理的对话。探索永不过时的救恩好消息。',
      verseText: '「我来了，是要叫羊得生命，并且得的更丰盛。」',
      verseCite: '— 约翰福音 10:10 (和合本)',
      listenBtn: '聆听福音好消息',
      prayerBtn: '生命奉献决志祷告 ↓',
      radioPlay: '收听 CC 电台',
      radioStop: '停止 CC 电台',
      counterLink: '迈向第一个百万 ↗',
      strap: '聆听 · 分享 · 改变生命'
    },
    player: {
      miniTitle: '生命的对话',
      title: '福音佳音',
      subtitle: 'CC 电台 · 福音',
      share: '分享',
      download: '下载 MP3',
      favorite: '加入收藏',
      support: '支持事工'
    },
    values: {
      title: '福音的核心价值',
      v1Title: '盼望',
      v1Desc: '赐予每一天',
      v2Title: '意义',
      v2Desc: '在日常生活中',
      v3Title: '生命',
      v3Desc: '丰盛有余'
    },
    prayer: {
      kicker: '信仰的决志与救恩',
      title: '将生命奉献给耶稣基督的祷告',
      subtitle: '悔改、信心以及藉着相信耶稣基督为独一救主和生命之主而白白得救的祷告。',
      langLabel: '选择祷告语言：',
      verseEphText: '「你们得救是本乎恩，也因着信；这并不是出于自己，乃是神所赐的；也不是出于行为，免得有人自夸。」',
      verseEphCite: '— 以弗所书 2:8–9 (和合本)',
      intro: '如果你渴望真心将生命交托给耶稣基督，可以用以下的话语向祂祷告。重要的不是背诵这些词句，而是内心的真实信心、痛悔以及对救主的全然依靠。',
      stanzas: [
        {
          heading: '主耶稣基督，永生神的儿子！',
          paragraphs: [
            '今天我照着本相来到祢面前——带着我全部的过去、我的罪愆、软弱、恐惧、疑惑和渴望。',
            '我来到祢面前，因为我需要祢。我需要祢的爱、祢的赦免、祢的恩典和祢的救赎。',
            '<strong>主耶稣，我信祢是神的儿子，是应许的弥赛亚，是世人唯一的救主，也是通往父神的唯一道路。</strong>',
            '我信祢出于对我的爱降临人世，取了人的样式，一生完全顺服天父，从未犯过任何罪。',
            '我信祢甘愿在各各他的十字架上舍命，为担当我罪的刑罚，使我与神和好。',
            '我信祢为我受死，被埋葬，并在第三天从死里复活，战胜了罪恶、死亡和撒但的权势。',
            '我信祢永远活着，是我们在天父面前唯一的坚固中保，唯独在祢里面，我能获得罪得赦免、救恩与永生。'
          ]
        },
        {
          heading: '主耶稣，我在祢面前承认我是个罪人。',
          paragraphs: [
            '我在心思、言语、行为和当行未行的事上得罪了神。我多次随从自己的私欲行事，忽略了祢的真理和诫命。',
            '我没有常常尽心、尽性、尽意爱主我的神；也没有常常爱人如己。',
            '我深知靠自己无法拯救自己。我的任何善行、宗教仪轨、努力或功劳，都无法洗去我的罪孽，也不能换取永生。',
            '我不想再掩饰或为自己的过犯辩解。我真心为罪痛悔，在祢面前坦诚认罪。'
          ]
        },
        {
          heading: '主耶稣，开恩可怜我这个罪人。',
          paragraphs: [
            '求祢赦免我一切的罪——无论是明知的还是无意识犯下的，无论是过去的还是现在的。',
            '求祢在十字架上所流的宝血洗净我。',
            '求祢释放我脱离罪咎与定罪。医治我受伤的心灵，洗净我的良心，使我与天父完全和好。',
            '我决心离开罪恶，离弃没有祢的生活。我不再走那条远离神生命的道路。',
            '求祢更新我的心，让我越来越憎恶罪恶，爱慕公义、真理与圣洁。',
            '我知道靠着自己微弱的力量无法活出圣洁的生活。因此，我完全仰赖祢丰盛的恩典与能力。'
          ]
        },
        {
          heading: '主耶稣，此时此刻我凭信心接受祢为我唯一的救主和生命之主。',
          paragraphs: [
            '我单单信靠祢，并信靠祢在十字架上成就的完全祭物。',
            '我信祢的受死已为我的罪付清了代价，祢的复活带给我永生的确据与盼望。',
            '我不再把得救的希望建立在自己的善行、功劳或宗教表现上。',
            '<strong>我接受救恩为祢恩典白白赐予的礼物，唯独藉着对祢的信心。</strong>',
            '感谢祢，我不需要去赚取祢的爱，而是可以满怀感恩地领受它。',
            '我相信祢信实的应许：凡到祢这里来的，祢总不丢弃。',
            '因此，我满怀信靠来到祢面前，将我的一生完全托付给祢。'
          ]
        },
        {
          heading: '耶稣基督，我尊祢为我唯一的生命之主、万王之王和救主。',
          paragraphs: [
            '我不再仅仅为自己而活。',
            '我将我的心灵、思想、良知、意志和身体完全献给祢。',
            '我把我的过去、现在和未来交在祢手中。',
            '我把我的计划、梦想、抉择、人际关系、家庭、工作、健康、忧虑以及生活的所有层面都交托给祢。',
            '无论是我引以为荣的，还是深感羞愧的，我都带到祢面前；我的胜利与挫折、我的希望与恐惧，全交与祢。',
            '在祢面前，我不愿保留生命的任何一个角落。',
            '我渴望从今以后，祢在我心中居首位。',
            '做我心思、言语、行为、选择和意念的主宰。',
            '教导我不仅称呼祢为主，更真切照着祢的旨意生活。'
          ]
        },
        {
          heading: '天父，奉耶稣基督的名，求祢接纳我成为祢的儿女。',
          paragraphs: [
            '感谢天父深爱世人，甚至将祢的独生子赐给我们，叫一切信祂的，不致灭亡，反得永生。',
            '我渴望归属于祢的属灵大家庭，常在祢的同在里生活，每一天更深认识祢。'
          ]
        },
        {
          heading: '圣灵，求祢使我重生，内住在我心里。',
          paragraphs: [
            '赐给我一颗新心、新的圣洁渴望和崭新的生命。',
            '引领我明白圣经所启示的全部真理。',
            '开通我的心窍以明白神的话语，塑造我的品格效法基督，教导我在爱心、谦卑、圣洁和顺服神中度日。',
            '赐我力量胜过试探，远离一切违背祢心意的事。',
            '当我跌倒软弱时，求祢不容我绝望退后，而是引导我坦然认罪、悔改，重新抓住祢丰富的恩典。',
            '教导我饶恕他人，正如祢已经饶恕了我一样。',
            '教导我以祢的爱去爱周围的人，广行善事，为祢的真理作美好的见证。'
          ]
        },
        {
          heading: '主耶稣，从今天起我愿做祢忠心的门徒。',
          paragraphs: [
            '我渴望藉着每天的祷告、查考圣经和与祢亲密相交来认识祢。',
            '我渴望在信心里成长，常在祢的话语中扎根，并加入真心爱祢、遵守祢诫命的信徒群体。',
            '我也渴望在人前公开承认我的信仰，照着祢的吩咐接受洗礼，见证我的悔改、与过去的旧生命同死，并在祢里面开启荣耀的新生命。',
            '愿我的顺服不是为了赚取救恩，而是源于得救信心的感恩与爱慕之果。'
          ]
        },
        {
          heading: '主耶稣，从这一刻起，我将我的救恩与永恒完全托付给祢。',
          paragraphs: [
            '我不再依靠自己的感觉、自己的微力或瞬息万变的环境。',
            '我要坚立在祢永不改变的应许、祢的信实和祢完全的牺牲之上。',
            '感谢祢，祢的恩典远大过我一切的过犯。',
            '感谢祢，在祢里面有完全的赦免、与神的和好、新造的生命和复活的荣耀盼望。',
            '感谢祢让我能藉着祢来到天父面前，祢常活着，为凡靠着祢进到神面前的人祈求。',
            '求祢保守我在信心里坚忍到底，常在祢的爱中，至死忠心。',
            '我愿儆醒等候祢荣耀的再临，并在祢重临那日欢然迎见祢。'
          ]
        },
        {
          heading: '信仰告白与全然交托',
          isCulmination: true,
          paragraphs: [
            '<strong>主耶稣基督，祢是我唯一的救主和生命之主。</strong>',
            '<strong>在祢里面，我寄托得救的全部指望。</strong>',
            '<strong>我将我的心全然归祢。</strong>',
            '<strong>我将我的一生完全交托与祢。</strong>',
            '<strong>我将我的永恒稳妥托付与祢。</strong>',
            '愿我的人生从此属祢，荣耀祢圣洁尊贵的名。',
            '感谢祢丰盛不尽的恩典，感谢祢浩大无边的慈爱，以及我凭信所领受的宝贵救恩。',
            '<strong>奉我唯一的救主、救赎主与生命之主耶稣基督的圣名祷告。</strong>',
            '<strong class="prayer-amen">阿们！</strong>'
          ]
        }
      ],
      aftermath: {
        title: '真心作完此祷告的人，应当明白什么？',
        lead: '最核心的真理在于：<strong>拯救人的不是祷告词本身，而是耶稣基督。</strong>祷告是真实信心的表达，是心灵对神恩典的诚恳回应。',
        promisesTitle: '圣经给信靠基督的人立定了清晰确凿的应许：',
        promises: [
          '<strong>以弗所书 2:8–9</strong> — 救恩是出于恩典，藉着信心领受的礼物，绝非靠立功行善所换取的报酬。',
          '<strong>罗马书 10:9–10</strong> — 心里相信神叫基督从死里复活，口里承认耶稣为主，就必得救。',
          '<strong>约翰福音 1:12</strong> — 凡接待祂的，就是信祂名的人，祂就赐他们权柄作神的儿女。',
          '<strong>约翰福音 6:37</strong> — 耶稣亲口应许：到我这里来的，我总不丢弃他。',
          '<strong>约翰一书 1:9</strong> — 我们若认自己的罪，神是信实的，是公义的，必要赦免我们的罪，洗净我们一切的不义。',
          '<strong>哥林多后书 5:17</strong> — 若有人在基督里，他就是新造的人，旧事已过，都变成新的了。',
          '<strong>使徒行传 2:38</strong> — 对福音的回应包括悔改、奉耶稣基督的名受洗、叫罪得赦，并必领受所赐的圣灵。'
        ],
        truthTitle: '请将这真理牢记在心',
        truthMain: '你得救不是因为你作了一个无瑕疵的祷告，也不是因为你足够善良优秀。救恩之所以成全，是因为耶稣基督为你的罪死在十字架上，并且已经荣耀复活。你是单单因着恩典、藉着信靠祂而蒙恩得救。',
        truthSub: '真实的信心必然结出悔改、新生命、爱心与顺服基督的甘美果子——这不是赚取救恩的筹码，而是蒙恩者自然的感恩流露（以弗所书 2:10；约翰福音 14:15）。',
        truthQuote: '「我将这些话写给你们信奉神儿子之名的人，要叫你们知道自己有永生。」',
        truthCite: '— 约翰一书 5:13 (和合本)'
      }
    }
  },

  fr: {
    langName: 'Français',
    metaTitle: 'Bonne Nouvelle — Évangile | Prière de consécration à Jésus-Christ | Radio CC',
    metaDescription: 'La Bonne Nouvelle. Découvrez le message de Jésus-Christ, écoutez l’enregistrement et lisez la prière pour consacrer votre vie à Jésus-Christ.',
    nav: {
      start: 'Accueil',
      goodNews: 'Bonne Nouvelle',
      audio: 'Enregistrement',
      prayer: 'Prière de consécration',
      values: 'Valeurs',
      about: 'À propos'
    },
    hero: {
      kicker: 'DES PAROLES QUI CHANGENT LA VIE',
      title1: 'Bonne',
      title2: 'Nouvelle',
      intro: 'Une conversation sur la vie, l’espérance et ce qui compte réellement. Découvrez un message toujours actuel.',
      verseText: '« Je suis venu afin que les brebis aient la vie, et qu’elles soient dans l’abondance. »',
      verseCite: '— Évangile selon Jean 10:10 (LSG)',
      listenBtn: 'Écouter la Bonne Nouvelle',
      prayerBtn: 'Prier la prière de consécration ↓',
      radioPlay: 'Écouter Radio CC',
      radioStop: 'Arrêter Radio CC',
      counterLink: 'Objectif premier million ↗',
      strap: 'ÉCOUTER · PARTAGER · TRANSFORMER DES VIES'
    },
    player: {
      miniTitle: 'CONVERSATION SUR LA VIE',
      title: 'Bonne Nouvelle',
      subtitle: 'Radio CC · Évangile',
      share: 'Partager',
      download: 'Télécharger MP3',
      favorite: 'Ajouter aux favoris',
      support: 'Soutenir ce projet'
    },
    values: {
      title: 'Les valeurs de la Bonne Nouvelle',
      v1Title: 'Espérance',
      v1Desc: 'pour chaque jour',
      v2Title: 'Sens',
      v2Desc: 'dans le quotidien',
      v3Title: 'Vie',
      v3Desc: 'en abondance'
    },
    prayer: {
      kicker: 'DÉCISION DE FOI ET SALUT',
      title: 'Prière pour donner sa vie à Jésus-Christ',
      subtitle: 'Prière de repentance, de foi et d’accueil du salut par grâce, par la foi en Jésus-Christ comme seul Seigneur et Sauveur personnel.',
      langLabel: 'Choisissez la langue de la prière :',
      verseEphText: '« Car c’est par la grâce que vous êtes sauvés, par le moyen de la foi. Et cela ne vient pas de vous, c’est le don de Dieu. Ce n’est point par les œuvres, afin que personne ne se glorifie. »',
      verseEphCite: '— Éphésiens 2:8–9 (LSG)',
      intro: 'Si vous désirez sincèrement consacrer votre vie à Jésus-Christ, vous pouvez vous adresser à Lui avec les paroles suivantes. Il ne s’agit pas de prononcer une formule magique, mais d’une foi authentique, d’un cœur brisé et d’une confiance absolue envers le Sauveur.',
      stanzas: [
        {
          heading: 'Seigneur Jésus-Christ, Fils du Dieu vivant !',
          paragraphs: [
            'Je viens aujourd’hui à Toi tel que je suis — avec tout mon passé, mes péchés, mes faiblesses, mes angoisses, mes doutes et mes désirs.',
            'Je viens parce que j’ai besoin de Toi. J’ai besoin de Ton amour, de Ton pardon, de Ta grâce et de Ton salut.',
            '<strong>Je crois, Seigneur Jésus, que Tu es le Fils de Dieu, le Messie promis, l’unique Sauveur du monde et le seul chemin vers Dieu le Père.</strong>',
            'Je crois que par amour pour moi Tu es venu dans ce monde, que Tu as pris notre condition humaine et mené une vie d’obéissance parfaite au Père, sans commettre aucun péché.',
            'Je crois que Tu as offert volontairement Ta vie sur la croix du Calvaire pour subir le châtiment que méritaient mes péchés et me réconcilier avec Dieu.',
            'Je crois que Tu es mort pour moi, que Tu as été enseveli et que Tu es ressuscité le troisième jour, triomphant du péché, de la mort et de la puissance de Satan.',
            'Je crois que Tu es vivant pour l’éternité, que Tu es mon seul Médiateur auprès du Père et qu’en Toi seul je reçois le pardon de mes péchés, le salut et la vie éternelle.'
          ]
        },
        {
          heading: 'Seigneur Jésus, je reconnais devant Toi que je suis un pécheur.',
          paragraphs: [
            'J’ai péché contre Dieu en pensées, en paroles, en actes et par omission. Bien souvent, j’ai suivi ma propre volonté en méprisant Ta vérité et Tes commandements.',
            'Je n’ai pas toujours aimé Dieu de tout mon cœur, de toute mon âme et de toute ma pensée. Je n’ai pas toujours aimé mon prochain comme moi-même.',
            'Je reconnais que je suis totalement incapable de me sauver moi-même. Aucune de mes bonnes œuvres, pratiques religieuses, efforts ou mérites ne peut effacer mes fautes ni m’assurer la vie éternelle.',
            'Je ne veux plus chercher d’excuses ni dissimuler mes péchés. Je m’en repens sincèrement et je les confesse devant Toi.'
          ]
        },
        {
          heading: 'Seigneur Jésus, aie pitié de moi, pécheur.',
          paragraphs: [
            'Je Te prie de me pardonner tous mes péchés — conscients et inconscients, commis autrefois comme aujourd’hui.',
            'Purifie-moi par Ton sang précieux versé sur la croix.',
            'Libère-moi de la culpabilité et de la condamnation. Guéris mon cœur blessé, purifie ma conscience et réconcilie-moi pleinement avec mon Père céleste.',
            'Je me détourne du péché et d’une vie menée sans Toi. Je ne veux plus emprunter la voie qui m’éloigne de Dieu.',
            'Je Te demande de transformer mon cœur afin que j’aie le péché en haine et que j’aime la justice, la vérité et la sainteté.',
            'Je sais que par mes propres forces, je ne peux vivre comme je le devrais. C’est pourquoi je m’appuie entièrement sur Ta grâce et sur Ta puissance.'
          ]
        },
        {
          heading: 'Seigneur Jésus, en cet instant, je Te reçois par la foi comme mon unique Seigneur et Sauveur personnel.',
          paragraphs: [
            'Je mets ma confiance uniquement en Toi et en Ton parfait sacrifice accompli à la croix.',
            'Je crois que Ta mort est le paiement complet pour mes péchés et que Ta résurrection est la victoire qui m’ouvre l’espérance de la vie éternelle.',
            'Je ne fonde pas mon salut sur ma propre bonté, sur mes actes ou sur ma dévotion.',
            '<strong>Je reçois le salut comme un don gratuit et immérité de Ta grâce, par la foi en Toi seul.</strong>',
            'Merci parce que je n’ai pas à mériter Ton amour : je peux l’accueillir avec reconnaissance.',
            'Je crois en Ta promesse : Tu ne rejetteras jamais celui qui vient à Toi.',
            'C’est pourquoi je m’approche de Toi avec confiance et je Te confie ma vie tout entière.'
          ]
        },
        {
          heading: 'Jésus-Christ, je Te proclame mon seul Seigneur, Roi et Sauveur.',
          paragraphs: [
            'Je ne veux plus vivre pour moi-même.',
            'Je Te donne mon cœur, mon esprit, ma conscience, ma volonté et mon corps.',
            'Je Te remets mon passé, mon présent et mon avenir.',
            'Je Te confie mes projets, mes rêves, mes décisions, mes relations, ma famille, mon travail, ma santé, mes soucis et tous les domaines de mon existence.',
            'Je Te donne ce qui est bon et ce dont j’ai honte. Je Te remets mes victoires et mes échecs, mes espoirs et mes craintes.',
            'Je ne désire rien retenir pour moi.',
            'Je désire que Tu occupes désormais la première place dans mon cœur.',
            'Sois le Maître de mes pensées, de mes paroles, de mes actes, de mes choix et de mes désirs.',
            'Apprends-moi non seulement à T’appeler Seigneur, mais à vivre en conformité avec Ta sainte volonté.'
          ]
        },
        {
          heading: 'Père céleste, au nom de Jésus-Christ, accueille-moi comme Ton enfant.',
          paragraphs: [
            'Merci d’avoir tant aimé le monde que Tu as donné Ton Fils unique, afin que quiconque croit en Lui ne périsse point, mais qu’il ait la vie éternelle.',
            'Je désire appartenir à Ta famille, vivre en Ta sainte présence et Te connaître chaque jour davantage.'
          ]
        },
        {
          heading: 'Saint-Esprit, fais-moi naître de nouveau et viens habiter dans mon cœur.',
          paragraphs: [
            'Donne-moi un cœur nouveau, des désirs renouvelés et une vie sainte.',
            'Conduis-moi dans toute la vérité révélée dans l’Écriture Sainte.',
            'Ouvre mon intelligence pour comprendre la Parole de Dieu, façonne mon caractère à la ressemblance du Christ et enseigne-moi à vivre dans l’amour, l’humilité, la sainteté et l’obéissance.',
            'Aide-moi à triompher des tentations et à fuir tout ce qui s’oppose à Ta volonté.',
            'Si je viens à trébucher, ne me laisse pas fuir loin de Toi dans le désespoir. Conduis-moi à une confession sincère, à la repentance et à une nouvelle saisie de Ta grâce.',
            'Enseigne-moi à pardonner aux autres comme Tu m’as pardonné.',
            'Enseigne-moi à aimer mon prochain de Ton amour, à faire le bien et à rendre témoignage de Ta vérité.'
          ]
        },
        {
          heading: 'Seigneur Jésus, je désire être dès aujourd’hui Ton disciple.',
          paragraphs: [
            'Je désire Te connaître chaque jour par la prière, l’étude des Saintes Écritures et la communion avec Toi.',
            'Je désire grandir dans la foi, demeurer dans Ta Parole et m’unir à la communauté de ceux qui T’aiment sincèrement et gardent Tes commandements.',
            'Je désire également confesser publiquement ma foi et recevoir le baptême selon Ton ordre, en témoignage de ma conversion, de ma mort à mon ancienne vie et du commencement d’une vie nouvelle avec Toi.',
            'Que mon obéissance ne soit jamais une vaine tentative de mériter le salut, mais le fruit joyeux de ma gratitude et d’une foi vivante.'
          ]
        },
        {
          heading: 'Seigneur Jésus, dès cet instant, je Te confie pleinement mon salut et mon éternité.',
          paragraphs: [
            'Je ne veux pas dépendre de mes sentiments passagers, de mes propres forces ou des aléas de l’existence.',
            'Je choisis de m’appuyer sur Tes promesses immuables, sur Ta fidélité et sur Ton sacrifice parfait.',
            'Merci parce que Ta grâce est infiniment plus grande que tous mes péchés.',
            'Merci car en Toi se trouvent le pardon, la réconciliation avec Dieu, une vie nouvelle et l’espérance glorieuse de la résurrection.',
            'Merci de pouvoir m’approcher du Père par Toi, Toi qui es toujours vivant pour intercéder en faveur de ceux qui s’approchent de Dieu.',
            'Aide-moi à persévérer dans la foi, à demeurer dans Ton amour et à Te rester fidèle jusqu’au bout.',
            'Je désire vivre dans l’attente de Ton glorieux retour et T’accueillir avec joie le jour où Tu viendras.'
          ]
        },
        {
          heading: 'Confession de foi et engagement',
          isCulmination: true,
          paragraphs: [
            '<strong>Seigneur Jésus-Christ, Tu es mon seul Seigneur et mon Sauveur personnel.</strong>',
            '<strong>En Toi seul je place toute l’espérance de mon salut.</strong>',
            '<strong>À Toi je donne mon cœur.</strong>',
            '<strong>À Toi je confie toute ma vie.</strong>',
            '<strong>À Toi je remets mon éternité.</strong>',
            'Que désormais ma vie T’appartienne et apporte gloire à Ton saint nom.',
            'Merci pour Ta grâce imméritée, pour Ton amour infini et pour le don du salut que je reçois par la foi.',
            '<strong>Au nom de Jésus-Christ, mon seul Seigneur, Rédempteur et Sauveur, je Te prie de tout mon cœur.</strong>',
            '<strong class="prayer-amen">Amen.</strong>'
          ]
        }
      ],
      aftermath: {
        title: 'Que doit savoir la personne qui a prononcé cette prière avec sincérité ?',
        lead: 'La vérité fondamentale est celle-ci : <strong>ce n’est pas la prière en elle-même qui sauve, mais Jésus-Christ.</strong> La prière est l’expression d’une foi sincère et la réponse du cœur à la grâce de Dieu.',
        promisesTitle: 'L’Écriture Sainte donne au croyant des promesses inébranlables :',
        promises: [
          '<strong>Éphésiens 2:8–9</strong> — Le salut est un don gratuit de la grâce reçu par la foi, et non un salaire obtenu par des mérites.',
          '<strong>Romains 10:9–10</strong> — Croire de cœur au Christ ressuscité et Le confesser de la bouche comme Seigneur conduisent au salut.',
          '<strong>Jean 1:12</strong> — À tous ceux qui L’ont reçu, à ceux qui croient en Son nom, Il a donné le pouvoir de devenir enfants de Dieu.',
          '<strong>Jean 6:37</strong> — Jésus promet : je ne mettrai point dehors celui qui vient à moi.',
          '<strong>1 Jean 1:9</strong> — Si nous confessons nos péchés, Il est fidèle et juste pour nous les pardonner et nous purifier de toute iniquité.',
          '<strong>2 Corinthiens 5:17</strong> — Si quelqu’un est en Christ, il est une nouvelle créature. Les choses anciennes sont passées ; voici, toutes choses sont devenues nouvelles.',
          '<strong>Actes 2:38</strong> — La réponse à l’Évangile comprend la repentance, le baptême au nom de Jésus-Christ pour le pardon des péchés et la promesse du don du Saint-Esprit.'
        ],
        truthTitle: 'Grave cette vérité dans ton cœur',
        truthMain: 'Tu n’es pas sauvé parce que tu as prononcé une formule parfaite. Tu n’es pas sauvé parce que tu serais assez bon. Le salut est possible parce que Jésus-Christ est mort pour tes péchés et qu’Il est ressuscité. Tu le reçois par grâce, par le moyen de la foi en Lui.',
        truthSub: 'La foi véritable produit la repentance, une vie transformée, l’amour et l’obéissance au Christ — non comme le prix du salut, mais comme le fruit bienfaisant de Sa grâce (Éphésiens 2:10 ; Jean 14:15).',
        truthQuote: '« Je vous ai écrit ces choses, afin que vous sachiez que vous avez la vie éternelle, vous qui croyez au nom du Fils de Dieu. »',
        truthCite: '— 1 Jean 5:13 (LSG)'
      }
    }
  },

  pt: {
    langName: 'Português',
    metaTitle: 'Boas Novas — Evangelho | Oração de Entrega de Vida a Jesus Cristo | Rádio CC',
    metaDescription: 'Boas Novas. Conheça a mensagem de Jesus Cristo, ouça a gravação e faça a oração de entrega da sua vida a Jesus Cristo.',
    nav: {
      start: 'Início',
      goodNews: 'Boas Novas',
      audio: 'Gravação',
      prayer: 'Oração de Entrega',
      values: 'Valores',
      about: 'Sobre'
    },
    hero: {
      kicker: 'PALAVRAS QUE TRANSFORMAM VIDAS',
      title1: 'Boas',
      title2: 'Novas',
      intro: 'Uma conversa sobre a vida, a esperança e o que realmente importa. Descubra a mensagem que permanece viva e atual.',
      verseText: '“Eu vim para que tenham vida e a tenham em abundância.”',
      verseCite: '— João 10:10 (ARC)',
      listenBtn: 'Ouvir as Boas Novas',
      prayerBtn: 'Orar a oração de entrega de vida ↓',
      radioPlay: 'Ouvir Rádio CC',
      radioStop: 'Parar Rádio CC',
      counterLink: 'Rumo ao primeiro milhão ↗',
      strap: 'OUVIR · COMPARTILHAR · TRANSFORMAR VIDAS'
    },
    player: {
      miniTitle: 'CONVERSA SOBRE A VIDA',
      title: 'Boas Novas',
      subtitle: 'Rádio CC · Evangelho',
      share: 'Compartilhar',
      download: 'Baixar MP3',
      favorite: 'Favoritar',
      support: 'Apoiar o projeto'
    },
    values: {
      title: 'Valores das Boas Novas',
      v1Title: 'Esperança',
      v1Desc: 'para cada dia',
      v2Title: 'Propósito',
      v2Desc: 'no cotidiano',
      v3Title: 'Vida',
      v3Desc: 'em abundância'
    },
    prayer: {
      kicker: 'DECISÃO DE FÉ E SALVAÇÃO',
      title: 'Oração de Entrega de Vida a Jesus Cristo',
      subtitle: 'Oração de arrependimento, fé e recepção da salvação pela graça mediante a fé em Jesus Cristo como único Senhor e Salvador pessoal.',
      langLabel: 'Escolha o idioma da oração:',
      verseEphText: '“Porque pela graça sois salvos, por meio da fé; e isto não vem de vós, é dom de Deus; não vem das obras, para que ninguém se glorie.”',
      verseEphCite: '— Efésios 2:8–9 (ARC)',
      intro: 'Se você deseja sinceramente entregar sua vida a Jesus Cristo, pode se dirigir a Ele em oração com as palavras abaixo. Não se trata de repetir uma fórmula exterior, mas de uma fé viva, arrependimento sincero e confiança plena no Salvador.',
      stanzas: [
        {
          heading: 'Senhor Jesus Cristo, Filho do Deus vivo!',
          paragraphs: [
            'Venho hoje a Ti exatamente como sou — com todo o meu passado, meus pecados, fraquezas, medos, dúvidas e anseios.',
            'Venho porque preciso de Ti. Preciso do Teu amor, do Teu perdão, da Tua graça e da Tua salvação.',
            '<strong>Creio, Senhor Jesus, que Tu és o Filho de Deus, o Messias prometido, o único Salvador do mundo e o único caminho para Deus Pai.</strong>',
            'Creio que por amor a mim vieste a este mundo, assumiste a nossa humanidade e viveste em perfeita obediência ao Pai, sem cometer pecado algum.',
            'Creio que entregaste voluntariamente a Tua vida na cruz do Calvário para pagar a pena dos meus pecados e me reconciliar com Deus.',
            'Creio que morreste por mim, foste sepultado e ao terceiro dia ressuscitaste, vencendo o pecado, a morte e o poder de Satanás.',
            'Creio que vives para sempre, que és o meu único Mediador diante do Pai e que somente em Ti posso receber o perdão dos pecados, a salvação e a vida eterna.'
          ]
        },
        {
          heading: 'Senhor Jesus, confesso diante de Ti que sou pecador.',
          paragraphs: [
            'Pequei contra Deus por pensamentos, palavras, ações e omissões. Muitas vezes andei segundo a minha própria vontade, desprezando a Tua verdade e os Teus mandamentos.',
            'Nem sempre amei a Deus de todo o coração, de toda a alma e de todo o entendimento. Nem sempre amei o meu próximo como a mim mesmo.',
            'Reconheço que sou totalmente incapaz de me salvar a mim mesmo. Nenhuma das minhas boas obras, práticas religiosas, esforços ou méritos pode apagar os meus pecados ou me garantir a vida eterna.',
            'Não quero mais justificar as minhas faltas nem escondê-las. Arrependo-me sinceramente delas e as confesso diante de Ti.'
          ]
        },
        {
          heading: 'Senhor Jesus, tem misericórdia de mim, pecador.',
          paragraphs: [
            'Peço-Te que perdoes todos os meus pecados — conscientes e inconscientes, cometidos no passado e no presente.',
            'Purifica-me com o Teu sangue precioso derramado na cruz.',
            'Liberta-me da culpa e da condenação. Cura o meu coração ferido, purifica a minha consciência e reconcilia-me plenamente com o meu Pai Celeste.',
            'Afasto-me do pecado e de uma vida longe de Ti. Não quero mais seguir caminhos que me distanciem de Deus.',
            'Peço-Te que transformes o meu coração, para que eu aborreça o pecado e ame a justiça, a verdade e a santidade.',
            'Sei que por minhas próprias forças não consigo viver como convém. Por isso, descanso inteiramente na Tua graça e no Teu poder.'
          ]
        },
        {
          heading: 'Senhor Jesus, neste momento, pela fé, recebo-Te como meu único Senhor e Salvador pessoal.',
          paragraphs: [
            'Confio unicamente em Ti e no Teu sacrifício perfeito consumado na cruz.',
            'Creio que a Tua morte é pagamento suficiente pelos meus pecados e que a Tua ressurreição me dá a certeza e a esperança da vida eterna.',
            'Não coloco a esperança da minha salvação na minha própria bondade, em obras ou em religiosidade.',
            '<strong>Recebo a salvação como dom imerecido da Tua graça, exclusivamente pela fé em Ti.</strong>',
            'Obrigado porque não preciso comprar o Teu amor, mas posso recebê-lo com profunda gratidão.',
            'Creio na Tua promessa de que não rejeitarás aquele que vier a Ti.',
            'Por isso, aproximo-me de Ti com inteira confiança e entrego-Te toda a minha vida.'
          ]
        },
        {
          heading: 'Jesus Cristo, reconheço-Te como meu único Senhor, Rei e Salvador.',
          paragraphs: [
            'Não quero mais viver apenas para mim mesmo.',
            'Entrego-Te o meu coração, a minha mente, a minha consciência, a minha vontade e o meu corpo.',
            'Entrego-Te o meu passado, o meu presente e o meu futuro.',
            'Confio-Te os meus planos, sonhos, decisões, relacionamentos, família, trabalho, saúde, preocupações e todas as áreas do meu ser.',
            'Entrego-Te o que tenho de bom e aquilo de que me envergonho; as minhas vitórias e derrotas, esperanças e temores.',
            'Não quero reter nenhuma parte de mim longe de Ti.',
            'Desejo que ocupes para sempre o primeiro lugar em meu coração.',
            'Sê o Senhor dos meus pensamentos, palavras, atitudes, escolhas e desejos.',
            'Ensina-me não apenas a Te chamar de Senhor, mas a viver de acordo com a Tua santa vontade.'
          ]
        },
        {
          heading: 'Pai Celeste, em nome de Jesus Cristo, acolhe-me como Teu filho.',
          paragraphs: [
            'Obrigado por teres amado o mundo de tal maneira que deste o Teu Filho unigênito, para que todo aquele que n’Ele crê não pereça, mas tenha a vida eterna.',
            'Desejo pertencer à Tua família, viver em Tua presença e conhecer-Te a cada dia mais profundamente.'
          ]
        },
        {
          heading: 'Espírito Santo, regenera-me e habita no meu coração.',
          paragraphs: [
            'Dá-me um coração novo, novos desejos e uma vida nova.',
            'Guia-me em toda a verdade revelada nas Sagradas Escrituras.',
            'Abre o meu entendimento para compreender a Palavra de Deus, molda o meu caráter à semelhança de Cristo e ensina-me a andar em amor, humildade, santidade e obediência a Deus.',
            'Ajuda-me a vencer as tentações e a afastar-me de tudo o que desagrada à Tua vontade.',
            'Quando eu fraquejar, não permitas que eu fuja em desespero, mas conduz-me à confissão sincera, ao arrependimento e a agarrar-me de novo à Tua graça.',
            'Ensina-me a perdoar aos outros assim como Tu me perdoaste.',
            'Ensina-me a amar o próximo com o Teu amor, a praticar o bem e a ser testemunha da Tua verdade.'
          ]
        },
        {
          heading: 'Senhor Jesus, desejo ser desde hoje o Teu discípulo.',
          paragraphs: [
            'Desejo conhecer-Te diariamente através da oração, do estudo da Palavra e da comunhão Contigo.',
            'Desejo crescer na fé, permanecer na Tua Palavra e unir-me à comunidade daqueles que Te amam sinceramente e guardam os Teus mandamentos.',
            'Desejo também confessar a minha fé diante dos homens e receber o batismo conforme o Teu mandamento, como testemunho público da minha conversão, morte para a velha vida e ressurreição para uma nova vida Contigo.',
            'Que a minha obediência não seja uma tentativa de merecer a salvação, mas fruto alegre do amor e da fé salvadora.'
          ]
        },
        {
          heading: 'Senhor Jesus, a partir deste instante, confio plenamente a Ti a minha salvação e a minha eternidade.',
          paragraphs: [
            'Não quero depender dos meus sentimentos instáveis, das minhas forças ou de circunstâncias passageiras.',
            'Quero firmar-me nas Tuas promessas imutáveis, na Tua fidelidade e no Teu sacrifício perfeito.',
            'Obrigado porque a Tua graça é infinitamente maior do que todos os meus pecados.',
            'Obrigado porque em Ti há perdão, reconciliação com Deus, novidade de vida e a bendita esperança da ressurreição.',
            'Obrigado porque posso chegar ao Pai por meio de Ti, que vives eternamente para interceder por nós.',
            'Ajuda-me a perseverar na fé, a permanecer no Teu amor e a ser-Te fiel até o fim.',
            'Quero viver aguardando o Teu glorioso retorno e encontrar-Te com alegria quando voltares.'
          ]
        },
        {
          heading: 'Confissão de fé e entrega',
          isCulmination: true,
          paragraphs: [
            '<strong>Senhor Jesus Cristo, Tu és o meu único Senhor e Salvador pessoal.</strong>',
            '<strong>Em Ti deposito toda a esperança da minha salvação.</strong>',
            '<strong>A Ti consagro o meu coração.</strong>',
            '<strong>A Ti entrego toda a minha vida.</strong>',
            '<strong>A Ti confio a minha eternidade.</strong>',
            'Que desde agora a minha vida Te pertença e glorifique o Teu santo nome.',
            'Obrigado pela Tua graça imerecida, pelo Teu amor eterno e pelo dom da salvação que recebo pela fé.',
            '<strong>Em nome de Jesus Cristo, meu único Senhor, Redentor e Salvador, oro de todo o meu coração.</strong>',
            '<strong class="prayer-amen">Amém.</strong>'
          ]
        }
      ],
      aftermath: {
        title: 'O que deve saber aquele que orou esta oração com sinceridade?',
        lead: 'A verdade primordial é esta: <strong>não é a oração em si mesma que salva o ser humano, mas Jesus Cristo.</strong> A oração é a expressão da fé sincera e a resposta do coração à graça de Deus.',
        promisesTitle: 'A Sagrada Escritura dá ao crente promessas infalíveis:',
        promises: [
          '<strong>Efésios 2:8–9</strong> — A salvação é dom gratuito da graça recebido pela fé, e não salário por obras.',
          '<strong>Romanos 10:9–10</strong> — A fé no Cristo ressurreto e a confissão pública d’Ele como Senhor operam a salvação.',
          '<strong>João 1:12</strong> — A todos quantos O receberam, aos que creem no Seu nome, deu-lhes o poder de serem feitos filhos de Deus.',
          '<strong>João 6:37</strong> — Jesus garante: o que vem a mim de maneira nenhuma o lançarei fora.',
          '<strong>1 João 1:9</strong> — Se confessarmos os nossos pecados, Ele é fiel e justo para nos perdoar e nos purificar de toda injustiça.',
          '<strong>2 Coríntios 5:17</strong> — Se alguém está em Cristo, nova criatura é; as coisas velhas já passaram; eis que tudo se fez novo.',
          '<strong>Atos 2:38</strong> — A resposta ao Evangelho envolve arrependimento, batismo em nome de Jesus Cristo e a promessa do dom do Espírito Santo.'
        ],
        truthTitle: 'Guarda esta verdade em teu coração',
        truthMain: 'Tu não és salvo por teres pronunciado uma oração perfeita. Não és salvo porque és suficientemente bom. A salvação é possível unicamente porque Jesus Cristo morreu pelos teus pecados e ressuscitou dos mortos. Tu a recebes pela graça, mediante a fé n’Ele.',
        truthSub: 'A fé genuína frutifica em arrependimento, nova vida, amor e obediência a Cristo — não como preço da salvação, mas como fruto bendito da Sua graça (Efésios 2:10; João 14:15).',
        truthQuote: '“Estas coisas vos escrevi, a vós que credes no nome do Filho de Deus, para que saibais que tendes a vida eterna.”',
        truthCite: '— 1 João 5:13 (ARC)'
      }
    }
  },

  ar: {
    langName: 'العربية',
    metaTitle: 'الخبر السار — الإنجيل | صلاة تسليم الحياة ليسوع المسيح | راديو CC',
    metaDescription: 'الخبر السار. اكتشف رسالة يسوع المسيح، استمع إلى التسجيل الصوتي واقرأ صلاة تسليم حياتك ليسوع المسيح المخلص.',
    nav: {
      start: 'الرئيسية',
      goodNews: 'الخبر السار',
      audio: 'التسجيل',
      prayer: 'صلاة تسليم الحياة',
      values: 'القيم',
      about: 'عن المشروع'
    },
    hero: {
      kicker: 'كلمات تغيّر الحياة',
      title1: 'الخبر',
      title2: 'السار',
      intro: 'حديث عن الحياة والرجاء وما يهم حقًا. اكتشف الرسالة التي ما زالت تنبض بالحياة اليوم.',
      verseText: '«أَمَّا أَنَا فَقَدْ أَتَيْتُ لِتَكُونَ لَهُمْ حَيَاةٌ وَلِيَكُونَ لَهُمْ أَفْضَلُ.»',
      verseCite: '— إنجيل يوحنا 10: 10',
      listenBtn: 'استمع إلى الخبر السار',
      prayerBtn: 'صلاة تسليم الحياة للمسيح ↓',
      radioPlay: 'تشغيل راديو CC',
      radioStop: 'إيقاف راديو CC',
      counterLink: 'نحو المليون الأول ↗',
      strap: 'استمع · شارك · غيّر الحياة'
    },
    player: {
      miniTitle: 'حديث عن الحياة',
      title: 'الخبر السار',
      subtitle: 'راديو CC · الإنجيل',
      share: 'مشاركة',
      download: 'تحميل MP3',
      favorite: 'إضافة للمفضلة',
      support: 'ادعم هذا العمل'
    },
    values: {
      title: 'قيم الخبر السار',
      v1Title: 'الرجاء',
      v1Desc: 'لكل يوم جديد',
      v2Title: 'المعنى',
      v2Desc: 'في صلب الحياة',
      v3Title: 'الحياة',
      v3Desc: 'بفيض وبركة'
    },
    prayer: {
      kicker: 'قرار الإيمان والخلاص',
      title: 'صلاة تسليم الحياة للرب يسوع المسيح',
      subtitle: 'صلاة التوبة والإيمان ونيل الخلاص بالنعمة من خلال الإيمان بالرب يسوع المسيح مخلصًا شخصيًا وسيدًا وحيدًا.',
      langLabel: 'اختر لغة الصلاة:',
      verseEphText: '«لأَنَّكُمْ بِالنِّعْمَةِ مُخَلَّصُونَ، بِالإِيمَانِ، وَذلِكَ لَيْسَ مِنْكُمْ. هُوَ عَطِيَّةُ اللهِ. لَيْسَ مِنْ أَعْمَال كَيْلاَ يَفْتَخِرَ أَحَدٌ.»',
      verseEphCite: '— رسالة أفسس 2: 8–9',
      intro: 'إذا كنت ترغب من كل قلبك في تسليم حياتك ليسوع المسيح، يمكنك أن تتوجه إليه بالصلاة بهذه الكلمات. فالأمر لا يتعلق بمجرد ترديد نص، بل بإيمان حقيقي وتوبة قلبية وثقة كاملة في الفادي.',
      stanzas: [
        {
          heading: 'أيها الرب يسوع المسيح، ابن الله الحي!',
          paragraphs: [
            'آتي إليك اليوم كما أنا — بكل ماضيّ، وخطاياي، وضعفاتي، ومخاوفي، وشكوكي، وأشواقي.',
            'آتي لأنني بحاجة ماسة إليك. أحتاج إلى محبتك، وغفرانك، ونعمتك، وخلاصك الأبدي.',
            '<strong>أؤمن يا رب يسوع أنك ابن الله، والمسيح الموعود، والمخلص الوحيد للعالم، والطريق الوحيد إلى الله الآب.</strong>',
            'أؤمن أنك بمحبتك لي نزلت إلى أرضنا، وأخذت طبيعتنا البشرية، وعشت حياة الطاعة الكاملة للآب دون أن ترتكب أي خطية.',
            'أؤمن أنك بذلت نفسك طوعًا على صليب الجلجثة لتحمل عقاب خطاياي وتصالحني مع الله القدوس.',
            'أؤمن أنك متّ من أجلي، ودُفنت، وقمت في اليوم الثالث منتصرًا على الخطية والموت وسلطان إبليس.',
            'أؤمن أنك حي إلى الأبد، وأنك وسيطي الوحيد عند الآب، وأنه فيك وحدك أنال مغفرة الخطايا والخلاص والحياة الأبدية.'
          ]
        },
        {
          heading: 'يا رب يسوع، أعترف أمامك بأنني إنسان خاطئ.',
          paragraphs: [
            'لقد أخطأت إلى الله بالفكر والقول والعمل والتقصير. ومرات عديدة سرت بحسب مشيئتي الخاصة متجاهلاً حقك ووصاياك المقدسة.',
            'لم أحب الرب إلهي دائمًا من كل قلبي وكل نفسي وكل فكري، ولم أحب قريبي كنفسي.',
            'أقرّ بأني عاجز تمامًا عن خلاص نفسي. فليس لأي عمل صالح، أو ممارسة دينية، أو جهد شخصي أن يغسل خطاياي أو يضمن لي الحياة الأبدية.',
            'لا أريد أن أبرر خطاياي أو أخفيها بعد الآن. إني أندم عليها من قلبي وأعترف بها أمامك.'
          ]
        },
        {
          heading: 'يا رب يسوع، ارحمني أنا الخاطئ.',
          paragraphs: [
            'أرجوك أن تغفر لي جميع خطاياي — ما علمت منها وما غفلت عنه، ما كان في الماضي وما هو حاضر.',
            'طهرني بدمك الكريم الزكي الذي سُفك على الصليب.',
            'حررني من الذنب والدينونة. اشفِ قلبي الجريح، وطهر ضميري، وصالحني مع أبي السماوي.',
            'أتوب وأرجع عن الخطية وعن حياة البعد عنك. لا أريد بعد اليوم أن أسلك في طريق يبعدني عن الله.',
            'أسألك أن تجدد قلبي لكي أبغض الخطية وأحب البر والحق والقداسة.',
            'أعلم أنني بقوتي الذاتية لا أستطيع أن أحيا كما يليق. لذلك أعتمد كليًا على فيض نعمتك وقوتك.'
          ]
        },
        {
          heading: 'يا رب يسوع، في هذه اللحظة أقبلك بالإيمان ربًا وحيدًا ومخلصًا شخصيًا لحياتي.',
          paragraphs: [
            'أتوكل عليك وحدك وعلى ذبيحتك الكاملة التامة المنجزة على عود الصليب.',
            'أؤمن أن موتك كفارة تامة ووافية عن خطاياي، وأن قيامتك نصرة تمنحني رجاء الحياة الأبدية.',
            'لا أبني رجاء خلاصي على برّي الذاتي، أو أعمالي، أو تديني.',
            '<strong>أقبل الخلاص كعطية مجانية من نعمتك، بالإيمان بك وحدك دون سواك.</strong>',
            'أشكرك لأنك لا تطالبني بكسب محبتك، بل تمنحني إياها لأقبلها بكل شكر وامتنان.',
            'أثق بوعدك الصادق: أن من يُقبل إليك لا تخرجه خارجًا أبدًا.',
            'لذلك آتي إليك بكل ثقة وأستودعك حياتي كلها.'
          ]
        },
        {
          heading: 'يا يسوع المسيح، أعلنك ربًا وملِكًا ومخلصًا أوحد على حياتي.',
          paragraphs: [
            'لا أريد بعد الآن أن أعيش لنفسي فقط.',
            'أسلمك قلبي، وفكري، وضميري، وإرادتي، وجسدي.',
            'أسلمك ماضيّ، وحاضري، ومستقبلي.',
            'أضع بين يديك خططي، وأحلامي، وقراراتي، وعلاقاتي، وعائلتي، وعملي، وصحتي، وهمومي، وكافة مجالات حياتي.',
            'أسلمك ما هو صالح وما أخجل منه؛ انتصاراتي وانكساراتي، آمالي ومخاوفي.',
            'لا أريد أن أحجب عنك أي ركن من أركان حياتي.',
            'أشتاق أن تكون أنت الأول وصاحب المكانة العليا في قلبي.',
            'كن سيدًا على أفكاري، وأقوالي، وأفعالي، واختياراتي، ورغباتي.',
            'علّمني ليس فقط أن أدعوك ربًا، بل أن أعيش بأمانة وفق مشيئتك الصالحة.'
          ]
        },
        {
          heading: 'أيها الآب السماوي، باسم يسوع المسيح، اقبلني ابنًا لك.',
          paragraphs: [
            'أشكرك لأنك هكذا أحببت العالم حتى بذلت ابنك الوحيد، لكي لا يهلك كل من يؤمن به، بل تكون له الحياة الأبدية.',
            'أشتاق أن أنتمي إلى عائلتك الروحية، وأن أحيا في حضرتك، وأعرفك في كل يوم معرفة أعمق وأقوى.'
          ]
        },
        {
          heading: 'أيها الروح القدس، جددني بالولادة الجديدة واسكن في قلبي.',
          paragraphs: [
            'امنحني قلبًا نقيًا جديدًا، وأشواقًا مقدسة، وحياة وليدة.',
            'اهدني إلى جميع الحقائق المعلنة في الأسفار الإلهية المقدسة.',
            'افتح بصيرتي لأفهم كلمة الله، وصُغ شخصيتي لتكون على شبه المسيح، وعلّمني أن أسلك في المحبة والتواضع والقداسة والطاعة لله.',
            'أعني على التغلب على التجارب والابتعاد عن كل ما يعارض مشيئتك الطاهرة.',
            'وإذا ما سقطت، لا تدعني أهرب في يأس وقنوط، بل قدني إلى الاعتراف الصادق والتوبة والتمسك بنعمتك من جديد.',
            'علّمني أن أغفر للآخرين كما غفرت لي.',
            'علّمني أن أحب الناس بمحبتك، وأن أصنع الخير، وأكون شاهدًا أمينًا لحقك.'
          ]
        },
        {
          heading: 'يا رب يسوع، أرغب أن أكون منذ اليوم تلميذًا مخلصًا لك.',
          paragraphs: [
            'أرغب في التعرف عليك يوميًا من خلال الصلاة، ودراسة الكلمة المقدسة، والشركة الدائمة معك.',
            'أرغب في النمو في الإيمان، والثبات في كلامك، والانتماء إلى جماعة المؤمنين الذين يحبونك بصدق ويحفظون وصاياك.',
            'أرغب أيضًا أن أعترف بإيماني جهارًا أمام الناس، وأن أعتمد بحسب أمرك، شهادةً لتوبتي وموتي عن الحياة القديمة وقيامتي لحياة جديدة معك.',
            'لتكن طاعتي ثمرة محبة وشكر لإيماني الخلاصي، لا محاولة لكسب النعمة بالأعمال.'
          ]
        },
        {
          heading: 'يا رب يسوع، منذ هذه اللحظة أستودعك خلاصي وأبديتي بالكامل.',
          paragraphs: [
            'لا أريد أن أعتمد على مشاعري المتقلبة، أو قوتي الضعيفة، أو ظروفي المتغيرة.',
            'بل أثبت على مواعيدك الصادقة الثابتة، وأمانتك الأبدية، وذبيحتك الكاملة.',
            'أشكرك لأن نعمتك أعظم بكثير من كل خطاياي.',
            'أشكرك لأن فيك الغفران، والصلح مع الله، والحياة المتجددة، والرجاء المبارك بالقيامة.',
            'أشكرك لأني أستطيع أن آتي إلى الآب من خلالك، وأنت حي في كل حين لتشفع في القادمين بك إلى الله.',
            'ثبتني في الإيمان، واحفظني في محبتك، وامنحني الأمانة حتى النهاية.',
            'أريد أن أحيا مترقبًا مجيئك الثاني المجيد، لألقاك بفرح حين تأتي.'
          ]
        },
        {
          heading: 'إقرار الإيمان والتسليم الكامل',
          isCulmination: true,
          paragraphs: [
            '<strong>أيها الرب يسوع المسيح، أنت وحدك ربي ومخلصي الشخصي.</strong>',
            '<strong>فيك وحدك أضع كل رجائي لخلاصي.</strong>',
            '<strong>لك أسلّم قلبي.</strong>',
            '<strong>بين يديك أستودع حياتي برمتها.</strong>',
            '<strong>وإليك أفوّض أبديتي.</strong>',
            'لتكن حياتي من الآن فصاعدًا ملكًا لك، تمجد اسمك القدوس المبارك.',
            'أشكرك على نعمتك المجانية، ومحبتك اللامتناهية، وعطية الخلاص التي أنالها بالإيمان.',
            '<strong>باسم يسوع المسيح، ربي وفاديّ ومخلصي الأوحد، أصلي من صميم قلبي.</strong>',
            '<strong class="prayer-amen">آمين.</strong>'
          ]
        }
      ],
      aftermath: {
        title: 'ما الذي ينبغي أن يدركه من صلى هذه الصلاة بصدق؟',
        lead: 'الحقيقة العظمى الراسخة هي: <strong>ليست الصلاة في حد ذاتها هي التي تخلص الإنسان، بل يسوع المسيح.</strong> فالصلاة تعبير نقي عن إيمان حي، واستجابة قلبية طائعة لنعمة الله الغنية.',
        promisesTitle: 'يمنح الكتاب المقدس للمؤمن مواعيد يقينية راسخة:',
        promises: [
          '<strong>أفسس 2: 8–9</strong> — الخلاص هبة مجانية بالنعمة يُنال بالإيمان، وليس جزاءً لأعمال نقوم بها.',
          '<strong>رومية 10: 9–10</strong> — الإيمان القلبي بالمسيح القائم والاعتراف الفموي بسيادته يقودان إلى الخلاص.',
          '<strong>يوحنا 1: 12</strong> — وأما كل الذين قبلوه فأعطاهم سلطانًا أن يصيروا أولاد الله، أي المؤمنون باسمه.',
          '<strong>يوحنا 6: 37</strong> — يَعِد يسوع: ومَنْ يُقبل إليَّ لا أخرجه خارجًا أبدًا.',
          '<strong>1 يوحنا 1: 9</strong> — إن اعترفنا بخطايانا فهو أمين وعادل، حتى يغفر لنا خطايانا ويطهرنا من كل إثم.',
          '<strong>2 كورنثوس 5: 17</strong> — إذاً إن كان أحد في المسيح فهو خليقة جديدة: الأشياء العتيقة قد مضت، هوذا الكل قد صار جديدًا.',
          '<strong>أعمال الرسل 2: 38</strong> — تشمل الاستجابة للبشارة التوبة، والمعمودية باسم يسوع المسيح لغفران الخطايا، ونيل عطية الروح القدس.'
        ],
        truthTitle: 'احفظ هذه الحقيقة في صميم قلبك',
        truthMain: 'أنت لم تخلص لأنك رددت صلاة متقنة البلاغة، ولا لأنك صالح بما فيه الكفاية. بل لأن يسوع المسيح مات فداءً عن خطاياك وقام منتصرًا من بين الأموات. وإنك تنال هذا الخلاص بنعمته المجانية، من خلال الإيمان به.',
        truthSub: 'إن الإيمان الحقيقي يثمر توبة صادقة، وحياة جديدة، ومحبة عملية، وطاعة للمسيح — ليس كثمن للخلاص، بل كثمرة طبيعية شاكرة لفيض نعمته (أفسس 2: 10؛ يوحنا 14: 15).',
        truthQuote: '«كَتَبْتُ هذَا إِلَيْكُمْ، أَنْتُمُ الْمُؤْمِنِينَ بِاسْمِ ابْنِ اللهِ، لِكَيْ تَعْلَمُوا أَنَّ لَكُمْ حَيَاةً أَبَدِيَّةً».',
        truthCite: '— 1 يوحنا 5: 13'
      }
    }
  },

  hi: {
    langName: 'हिन्दी',
    metaTitle: 'सुसमाचार — गॉस्पेल | यीशु मसीह को जीवन समर्पित करने की प्रार्थना | रेडियो CC',
    metaDescription: 'सुसमाचार। यीशु मसीह का संदेश जानें, ऑडियो सुनें और यीशु मसीह को अपना जीवन समर्पित करने की प्रार्थना पढ़ें।',
    nav: {
      start: 'मुखपृष्ठ',
      goodNews: 'सुसमाचार',
      audio: 'ऑडियो',
      prayer: 'समर्पण की प्रार्थना',
      values: 'मूल्य',
      about: 'परिचय'
    },
    hero: {
      kicker: 'जीवन बदलने वाले वचन',
      title1: 'शुभ',
      title2: 'समाचार',
      intro: 'जीवन, आशा और जो वास्तव में महत्वपूर्ण है उस पर एक आत्मीय संवाद। उस संदेश को जानें जो आज भी उतना ही प्रासंगिक है।',
      verseText: '“मैं इसलिये आया कि वे जीवन पाएँ, और बहुतायत से पाएँ।”',
      verseCite: '— यूहन्ना 10:10 (पवित्र बाइबिल)',
      listenBtn: 'सुसमाचार सुनें',
      prayerBtn: 'जीवन समर्पण की प्रार्थना करें ↓',
      radioPlay: 'रेडियो CC चलाएँ',
      radioStop: 'रेडियो CC रोकें',
      counterLink: 'पहले दस लाख का लक्ष्य ↗',
      strap: 'सुनें · साझा करें · जीवन बदलें'
    },
    player: {
      miniTitle: 'जीवन की बात',
      title: 'सुसमाचार',
      subtitle: 'रेडियो CC · गॉस्पेल',
      share: 'साझा करें',
      download: 'MP3 डाउनलोड करें',
      favorite: 'पसंदीदा में जोड़ें',
      support: 'सहयोग दें'
    },
    values: {
      title: 'सुसमाचार के मूल मूल्य',
      v1Title: 'आशा',
      v1Desc: 'हर नए दिन के लिए',
      v2Title: 'सार्थकता',
      v2Desc: 'दैनिक जीवन में',
      v3Title: 'जीवन',
      v3Desc: 'प्रचुरता और शांति में'
    },
    prayer: {
      kicker: 'विश्वास और उद्धार का निर्णय',
      title: 'यीशु मसीह को अपना जीवन समर्पित करने की प्रार्थना',
      subtitle: 'पश्चाताप, विश्वास और अनुग्रह से उद्धार पाने की प्रार्थना — यीशु मसीह को एकमात्र प्रभु और व्यक्तिगत उद्धारकर्ता मानकर।',
      langLabel: 'प्रार्थना की भाषा चुनें:',
      verseEphText: '“क्योंकि विश्वास के द्वारा अनुग्रह ही से तुम्हारा उद्धार हुआ है; और यह तुम्हारी ओर से नहीं, वरन परमेश्वर का दान है; और न कर्मों के कारण, ऐसा न हो कि कोई घमण्ड करे।”',
      verseEphCite: '— इफिसियों 2:8–9 (पवित्र बाइबिल)',
      intro: 'यदि आप सच्चे मन से अपना जीवन यीशु मसीह को सौंपना चाहते हैं, तो आप इन शब्दों के माध्यम से उनसे प्रार्थना कर सकते हैं। यह केवल शब्दों को दोहराना नहीं है, बल्कि सच्चे विश्वास, पश्चातापी हृदय और उद्धारकर्ता पर पूर्ण भरोसे की पुकार है।',
      stanzas: [
        {
          heading: 'प्रभु यीशु मसीह, जीवते परमेश्वर के पुत्र!',
          paragraphs: [
            'मैं आज आपके पास वैसा ही आता हूँ जैसा मैं हूँ — अपने पूरे अतीत, अपने पापों, कमजोरियों, भयों, संदेहों और इच्छाओं के साथ।',
            'मैं इसलिए आता हूँ क्योंकि मुझे आपकी सख्त जरूरत है। मुझे आपके प्रेम, आपकी क्षमा, आपके अनुग्रह और आपके उद्धार की आवश्यकता है।',
            '<strong>प्रभु यीशु, मैं विश्वास करता हूँ कि आप परमेश्वर के पुत्र हैं, प्रतिज्ञा किए हुए मसीहा हैं, जगत के एकमात्र उद्धारकर्ता और पिता परमेश्वर तक पहुँचने का एकमात्र मार्ग हैं।</strong>',
            'मैं विश्वास करता हूँ कि मेरे लिए अपने अपार प्रेम के कारण आप इस संसार में आए, मनुष्य का रूप धारण किया और बिना कोई पाप किए पिता की परिपूर्ण आज्ञाकारिता में जीवन बिताया।',
            'मैं विश्वास करता हूँ कि आपने कलवरी के क्रूस पर स्वेच्छा से अपना प्राण दिया ताकि मेरे पापों का दंड सह सकें और मुझे परमेश्वर से मिला सकें।',
            'मैं विश्वास करता हूँ कि आप मेरे लिए मरे, गाड़े गए और तीसरे दिन मरे हुओं में से जी उठे, और पाप, मृत्यु और शैतान की शक्ति पर विजय प्राप्त की।',
            'मैं विश्वास करता हूँ कि आप युगानुयुग जीवित हैं, पिता के सम्मुख मेरे एकमात्र मध्यस्थ हैं और केवल आप में ही मुझे पापों की क्षमा, उद्धार और अनंत जीवन मिल सकता है।'
          ]
        },
        {
          heading: 'प्रभु यीशु, मैं आपके सामने स्वीकार करता हूँ कि मैं एक पापी हूँ।',
          paragraphs: [
            'मैंने विचारों, वचनों, कर्मों और उपेक्षा से परमेश्वर के विरुद्ध पाप किया है। कई बार मैंने आपके सत्य और आज्ञाओं की उपेक्षा करके अपनी मर्जी से जीवन जिया है।',
            'मैंने अपने पूरे हृदय, आत्मा और बुद्धि से हमेशा परमेश्वर से प्रेम नहीं किया। मैंने अपने पड़ोसी से हमेशा अपने समान प्रेम नहीं किया।',
            'मैं स्वीकार करता हूँ कि मैं स्वयं अपना उद्धार करने में पूरी तरह असमर्थ हूँ। मेरे अच्छे कर्म, धार्मिक अनुष्ठान, प्रयास या योग्यताएँ मेरे पापों को मिटा नहीं सकतीं और न ही मुझे अनंत जीवन दे सकती हैं।',
            'मैं अपने पापों को छिपाना या उचित ठहराना नहीं चाहता। मुझे उन पर सच्चा पश्चाताप है और मैं उन्हें आपके सम्मुख अंगीकार करता हूँ।'
          ]
        },
        {
          heading: 'हे प्रभु यीशु, मुझ पापी पर दया कीजिए।',
          paragraphs: [
            'मैं आपसे विनती करता हूँ कि मेरे सारे पाप क्षमा करें — जाने-अनजाने, अतीत में और वर्तमान में किए गए सब पाप।',
            'क्रूस पर बहाए गए अपने बहुमूल्य लहू से मुझे शुद्ध कीजिए।',
            'मुझे अपराधबोध और दंड की भावना से मुक्त कीजिए। मेरे घायल मन को चंगा कीजिए, मेरे विवेक को शुद्ध कीजिए और मुझे स्वर्गीय पिता के साथ मिला दीजिए।',
            'मैं पाप से और आपके बिना जीने के जीवन से मुड़ता हूँ। मैं अब उस मार्ग पर नहीं चलना चाहता जो मुझे परमेश्वर से दूर ले जाता है।',
            'मेरे हृदय को बदल दीजिए ताकि मैं पाप से घृणा करूँ और धार्मिकता, सच्चाई और पवित्रता से प्रेम करूँ।',
            'मैं जानता हूँ कि अपनी शक्ति से मैं वैसा जीवन नहीं जी सकता जैसा मुझे जीना चाहिए। इसलिए मैं पूरी तरह आपके अनुग्रह और सामर्थ्य पर निर्भर रहता हूँ।'
          ]
        },
        {
          heading: 'प्रभु यीशु, इस समय मैं विश्वास के साथ आपको अपना एकमात्र प्रभु और व्यक्तिगत उद्धारकर्ता स्वीकार करता हूँ।',
          paragraphs: [
            'मैं केवल आप पर और क्रूस पर पूरे किए गए आपके सिद्ध बलिदान पर भरोसा रखता हूँ।',
            'मैं विश्वास करता हूँ कि आपकी मृत्यु मेरे पापों का पूर्ण मूल्य है और आपका जी उठना वह जय है जो मुझे अनंत जीवन की आशा देता है।',
            'मैं अपने उद्धार की आशा अपनी भलाई, कर्मों या धार्मिकता पर नहीं रखता।',
            '<strong>मैं केवल आप पर विश्वास के द्वारा, आपके अनुग्रह के मुफ्त वरदान के रूप में उद्धार को ग्रहण करता हूँ।</strong>',
            'मैं आपका धन्यवाद करता हूँ कि मुझे आपके प्रेम को कमाने की आवश्यकता नहीं है, बल्कि मैं इसे कृतज्ञतापूर्वक स्वीकार कर सकता हूँ।',
            'मुझे आपकी इस प्रतिज्ञा पर भरोसा है कि जो कोई आपके पास आएगा, उसे आप कभी न निकालेंगे।',
            'इसलिए मैं पूरे भरोसे के साथ आपके पास आता हूँ और अपना पूरा जीवन आपको सौंपता हूँ।'
          ]
        },
        {
          heading: 'यीशु मसीह, मैं आपको अपना एकमात्र प्रभु, राजा और उद्धारकर्ता स्वीकार करता हूँ।',
          paragraphs: [
            'अब मैं केवल अपने लिए नहीं जीना चाहता।',
            'मैं अपना हृदय, मन, विवेक, इच्छा और शरीर आपको सौंपता हूँ।',
            'मैं अपना अतीत, वर्तमान और भविष्य आपके हाथों में सौंपता हूँ।',
            'मैं अपनी योजनाएँ, सपने, निर्णय, संबंध, परिवार, काम, स्वास्थ्य, चिंताएँ और अपने जीवन के सभी क्षेत्र आपको समर्पित करता हूँ।',
            'जो कुछ अच्छा है और जिससे मुझे लज्जा आती है, सब आपको अर्पित करता हूँ; अपनी जीत और हार, आशाएँ और डर आपको सौंपता हूँ।',
            'मैं अपने जीवन का कोई भी हिस्सा आपसे छिपाकर नहीं रखना चाहता।',
            'मेरी अभिलाषा है कि आप अब से मेरे दिल में पहला स्थान रखें।',
            'मेरे विचारों, वचनों, कार्यों, चुनावों और इच्छाओं के स्वामी बनिए।',
            'मुझे केवल आपको प्रभु कहना ही नहीं, बल्कि आपकी इच्छा के अनुसार जीना भी सिखाइए।'
          ]
        },
        {
          heading: 'स्वर्गीय पिता, यीशु मसीह के नाम में, मुझे अपनी संतान के रूप में स्वीकार कीजिए।',
          paragraphs: [
            'धन्यवाद कि आपने जगत से ऐसा प्रेम रखा कि अपना एकलौता पुत्र दे दिया, ताकि जो कोई उस पर विश्वास करे वह नाश न हो, परंतु अनंत जीवन पाए।',
            'मैं आपके आत्मिक परिवार का अंग बनना चाहता हूँ, आपकी उपस्थिति में जीना चाहता हूँ और प्रतिदिन आपको और अधिक गहराई से जानना चाहता हूँ।'
          ]
        },
        {
          heading: 'पवित्र आत्मा, मुझे नया जन्म दीजिए और मेरे हृदय में वास कीजिए।',
          paragraphs: [
            'मुझे एक नया मन, नई पवित्र अभिलाषाएँ और एक नया जीवन दीजिए।',
            'पवित्र शास्त्र में प्रकट किए गए संपूर्ण सत्य में मेरी अगुवाई कीजिए।',
            'परमेश्वर के वचन को समझने के लिए मेरी समझ को खोलिए, मसीह के स्वरूप में मेरे चरित्र को ढालिए और मुझे प्रेम, नम्रता, पवित्रता और आज्ञाकारिता में चलना सिखाइए।',
            'परीक्षाओं पर जय पाने में और आपकी इच्छा के विरुद्ध हर बात से दूर रहने में मेरी सहायता कीजिए।',
            'जब मैं गिर जाऊँ, तो मुझे निराशा में आपसे दूर न भागने दीजिए, बल्कि सच्चे अंगीकार, पश्चाताप और आपके अनुग्रह को फिर से थामने की ओर मेरी अगुवाई कीजिए।',
            'दूसरों को क्षमा करना सिखाइए जैसे आपने मुझे क्षमा किया है।',
            'लोगों से आपके प्रेम के साथ प्रेम करना, भलाई करना और आपके सत्य का गवाह बनना सिखाइए।'
          ]
        },
        {
          heading: 'प्रभु यीशु, मैं आज से आपका सच्चा चेला बनना चाहता हूँ।',
          paragraphs: [
            'मैं प्रार्थना, वचन के अध्ययन और आपके साथ संगति द्वारा प्रतिदिन आपको जानना चाहता हूँ।',
            'मैं विश्वास में बढ़ना चाहता हूँ, आपके वचन में बने रहना चाहता हूँ और उन लोगों की संगति में रहना चाहता हूँ जो आपसे सच्चा प्रेम करते हैं और आपकी आज्ञाओं को मानते हैं।',
            'मैं लोगों के सामने अपने विश्वास को अंगीकार करना और आपकी आज्ञा के अनुसार बपतिस्मा लेना चाहता हूँ — अपने पश्चाताप, पुराने जीवन की मृत्यु और आपके साथ नए जीवन के आरंभ के प्रमाण के रूप में।',
            'मेरी आज्ञाकारिता उद्धार कमाने का प्रयास न हो, बल्कि उद्धार पाने वाले विश्वास और कृतज्ञता का स्वाभाविक फल हो।'
          ]
        },
        {
          heading: 'प्रभु यीशु, इस क्षण से मैं अपना उद्धार और अपनी अनंतता पूरी तरह आपको सौंपता हूँ।',
          paragraphs: [
            'मैं अपनी भावनाओं, अपनी शक्ति या बदलती परिस्थितियों पर भरोसा नहीं करना चाहता।',
            'मैं आपकी अटल प्रतिज्ञाओं, आपकी सच्चाई और आपके सिद्ध बलिदान पर भरोसा करना चाहता हूँ।',
            'धन्यवाद कि आपका अनुग्रह मेरे सब पापों से कहीं अधिक बड़ा है।',
            'धन्यवाद कि आप में क्षमा, परमेश्वर से मेलमिलाप, नया जीवन और पुनरुत्थान की जीवित आशा है।',
            'धन्यवाद कि मैं आपके माध्यम से पिता के पास आ सकता हूँ और आप उन लोगों के लिए निरंतर मध्यस्थता करने को तैयार रहते हैं जो आपके द्वारा परमेश्वर के पास आते हैं।',
            'विश्वास में स्थिर रहने, आपके प्रेम में बने रहने और अंत तक आपके प्रति निष्ठावान रहने में मेरी सहायता कीजिए।',
            'मैं आपके महिमामय आगमन की बाट जोहते हुए जीना चाहता हूँ और जब आप आएँ तो आनंद से आपसे मिलना चाहता हूँ।'
          ]
        },
        {
          heading: 'विश्वास का अंगीकार और पूर्ण समर्पण',
          isCulmination: true,
          paragraphs: [
            '<strong>प्रभु यीशु मसीह, आप ही मेरे एकमात्र प्रभु और व्यक्तिगत उद्धारकर्ता हैं।</strong>',
            '<strong>आप ही में मैं अपने उद्धार की पूरी आशा रखता हूँ।</strong>',
            '<strong>मैं अपना हृदय आपको समर्पित करता हूँ।</strong>',
            '<strong>मैं अपना पूरा जीवन आपको सौंपता हूँ।</strong>',
            '<strong>मैं अपनी अनंतता आपको सौंपता हूँ।</strong>',
            'अब से मेरा जीवन आपका हो और आपके पवित्र नाम की महिमा करे।',
            'आपके मुफ्त अनुग्रह, आपके अनंत प्रेम और उद्धार के उस उपहार के लिए धन्यवाद, जिसे मैं विश्वास से ग्रहण करता हूँ।',
            '<strong>अपने एकमात्र प्रभु, छुड़ाने वाले और उद्धारकर्ता यीशु मसीह के नाम में, मैं सच्चे हृदय से प्रार्थना करता हूँ।</strong>',
            '<strong class="prayer-amen">आमीन।</strong>'
          ]
        }
      ],
      aftermath: {
        title: 'जिसने सच्चे मन से यह प्रार्थना की है, उसे क्या जानना चाहिए?',
        lead: 'सबसे मुख्य सत्य यह है: <strong>प्रार्थना अपने आप में मनुष्य का उद्धार नहीं करती, बल्कि यीशु मसीह उद्धार करते हैं।</strong> प्रार्थना सच्चे विश्वास की अभिव्यक्ति और परमेश्वर के अनुग्रह के प्रति हृदय का उत्तर है।',
        promisesTitle: 'पवित्र शास्त्र विश्वास करने वाले को ठोस प्रतिज्ञाएँ देता है:',
        promises: [
          '<strong>इफिसियों 2:8–9</strong> — उद्धार विश्वास के द्वारा अनुग्रह का दान है, कर्मों का फल नहीं।',
          '<strong>रोमियों 10:9–10</strong> — जी उठे मसीह पर विश्वास करना और उन्हें प्रभु मानकर अंगीकार करना उद्धार लाता है।',
          '<strong>यूहन्ना 1:12</strong> — जितनों ने उन्हें ग्रहण किया, उन्हें उन्होंने परमेश्वर की संतान होने का अधिकार दिया, अर्थात् उन्हें जो उनके नाम पर विश्वास रखते हैं।',
          '<strong>यूहन्ना 6:37</strong> — यीशु प्रतिज्ञा करते हैं: जो कोई मेरे पास आएगा, उसे मैं कभी न निकालूँगा।',
          '<strong>1 यूहन्ना 1:9</strong> — यदि हम अपने पापों को मान लें, तो वह हमारे पापों को क्षमा करने और हमें सब अधर्म से शुद्ध करने में विश्वासयोग्य और धर्मी है।',
          '<strong>2 कुरिन्थियों 5:17</strong> — यदि कोई मसीह में है तो वह नई सृष्टि है: पुरानी बातें बीत गईं; देखो, सब बातें नई हो गईं।',
          '<strong>प्रेरितों के काम 2:38</strong> — सुसमाचार का उत्तर पश्चाताप, पापों की क्षमा के लिए यीशु मसीह के नाम से बपतिस्मा और पवित्र आत्मा के दान की प्रतिज्ञा है।'
        ],
        truthTitle: 'इस सत्य को अपने हृदय में संजो कर रखें',
        truthMain: 'आप इसलिए उद्धार नहीं पाए हैं कि आपने एक आदर्श प्रार्थना की है। आप इसलिए उद्धार नहीं पाए हैं कि आप काफी अच्छे हैं। उद्धार इसलिए संभव है क्योंकि यीशु मसीह आपके पापों के लिए मरे और जी उठे। आप इसे केवल उन पर विश्वास करके, अनुग्रह से पाते हैं।',
        truthSub: 'सच्चा विश्वास पश्चाताप, नए जीवन, प्रेम और मसीह की आज्ञाकारिता की ओर ले जाता है — उद्धार की कीमत के रूप में नहीं, बल्कि उनके अनुग्रह के फल के रूप में (इफिसियों 2:10; यूहन्ना 14:15)।',
        truthQuote: '“मैंने ये बातें तुम्हें इसलिए लिखी हैं जो परमेश्वर के पुत्र के नाम पर विश्वास करते हो, ताकि तुम जानो कि तुम्हें अनंत जीवन प्राप्त है।”',
        truthCite: '— 1 यूहन्ना 5:13 (पवित्र बाइबिल)'
      }
    }
  },

  id: {
    langName: 'Bahasa Indonesia',
    metaTitle: 'Kabar Baik — Injil | Doa Penyerahan Hidup kepada Yesus Kristus | Radio CC',
    metaDescription: 'Kabar Baik. Temukan pesan Yesus Kristus, dengarkan rekamannya, dan panjatkan Doa Penyerahan Hidup kepada Yesus Kristus.',
    nav: {
      start: 'Beranda',
      goodNews: 'Kabar Baik',
      audio: 'Rekaman',
      prayer: 'Doa Penyerahan',
      values: 'Nilai-Nilai',
      about: 'Tentang'
    },
    hero: {
      kicker: 'KATA-KATA YANG MENGUBAH HIDUP',
      title1: 'Kabar',
      title2: 'Baik',
      intro: 'Percakapan tentang kehidupan, pengharapan, dan apa yang sungguh berarti. Temukan pesan yang senantiasa relevan.',
      verseText: '“Aku datang, supaya mereka mempunyai hidup, dan mempunyainya dalam segala kelimpahan.”',
      verseCite: '— Yohanes 10:10 (TB)',
      listenBtn: 'Dengarkan Kabar Baik',
      prayerBtn: 'Doa penyerahan hidup kepada Yesus ↓',
      radioPlay: 'Putar Radio CC',
      radioStop: 'Hentikan Radio CC',
      counterLink: 'Menuju satu juta pendengar ↗',
      strap: 'DENGARKAN · BAGIKAN · UBAH HIDUP'
    },
    player: {
      miniTitle: 'PERCAKAPAN TENTANG HIDUP',
      title: 'Kabar Baik',
      subtitle: 'Radio CC · Injil',
      share: 'Bagikan',
      download: 'Unduh MP3',
      favorite: 'Tambahkan ke Favorit',
      support: 'Dukung Kami'
    },
    values: {
      title: 'Nilai-Nilai Kabar Baik',
      v1Title: 'Pengharapan',
      v1Desc: 'untuk setiap hari baru',
      v2Title: 'Makna',
      v2Desc: 'dalam keseharian',
      v3Title: 'Hidup',
      v3Desc: 'dalam kelimpahan'
    },
    prayer: {
      kicker: 'KEPUTUSAN IMAN DAN KESELAMATAN',
      title: 'Doa Penyerahan Hidup kepada Yesus Kristus',
      subtitle: 'Doa pertobatan, iman, dan menerima keselamatan karena kasih karunia melalui iman kepada Yesus Kristus sebagai satu-satunya Tuhan dan Juruselamat pribadi.',
      langLabel: 'Pilih bahasa doa:',
      verseEphText: '“Sebab karena kasih karunia kamu diselamatkan oleh iman; itu bukan hasil usahamu, tetapi pemberian Allah, itu bukan hasil pekerjaanmu: jangan ada orang yang memegahkan diri.”',
      verseEphCite: '— Efesus 2:8–9 (TB)',
      intro: 'Jika Anda rindu dengan sungguh-sungguh menyerahkan hidup Anda kepada Yesus Kristus, Anda dapat berdoa kepada-Nya dengan kata-kata di bawah ini. Ini bukan sekadar mengulang rumus kata, melainkan ungkapan iman yang tulus, penyesalan hati, dan ketergantungan penuh kepada Juruselamat.',
      stanzas: [
        {
          heading: 'Tuhan Yesus Kristus, Anak Allah yang hidup!',
          paragraphs: [
            'Hari ini aku datang kepada-Mu apa adanya — dengan seluruh masa laluku, dosa-dosaku, kelemahanku, rasa takutku, keraguanku, dan segala kerinduanku.',
            'Aku datang karena aku membutuhkan Engkau. Aku butuh kasih-Mu, pengampunan-Mu, kasih karunia-Mu, dan keselamatan dari-Mu.',
            '<strong>Aku percaya, Tuhan Yesus, bahwa Engkau adalah Anak Allah, Mesias yang dijanjikan, satu-satunya Juruselamat dunia dan satu-satunya jalan kepada Allah Bapa.</strong>',
            'Aku percaya bahwa karena kasih-Mu kepadaku, Engkau telah datang ke dunia ini, mengenakan rupa manusia, dan menjalani hidup dalam ketaatan sempurna kepada Bapa tanpa berbuat dosa sedikit pun.',
            'Aku percaya bahwa Engkau rela menyerahkan nyawa-Mu di kayu salib Golgota untuk menanggung hukuman atas dosa-dosaku dan memperdamaikan aku dengan Allah.',
            'Aku percaya Engkau mati untukku, dikuburkan, dan bangkit pada hari yang ketiga, mengalahkan dosa, maut, dan kuasa iblis.',
            'Aku percaya Engkau hidup selama-lamanya, bahwa Engkau adalah satu-satunya Pengantara bagi kami di hadapan Bapa, dan hanya di dalam Engkau aku beroleh pengampunan dosa, keselamatan, dan hidup kekal.'
          ]
        },
        {
          heading: 'Tuhan Yesus, aku mengaku di hadapan-Mu bahwa aku adalah orang berdosa.',
          paragraphs: [
            'Aku telah berdosa terhadap Allah dalam pikiran, perkataan, perbuatan, dan kelalaianku. Sering kali aku hidup menuruti kehendakku sendiri, mengabaikan kebenaran dan perintah-Mu.',
            'Aku tidak selalu mengasihi Tuhan Allahku dengan segenap hatiku, jiwaku, dan akal budiku. Aku tidak selalu mengasihi sesamaku seperti diriku sendiri.',
            'Aku mengakui bahwa aku sama sekali tidak berdaya untuk menyelamatkan diriku sendiri. Tidak ada perbuatan baik, upacara keagamaan, usaha, atau jasaku yang sanggup menghapus dosaku atau menjamin hidup yang kekal.',
            'Aku tidak mau lagi membela diri atau menyembunyikan pelanggaranku. Aku sungguh-sungguh menyesalinya dan mengakuinya di hadapan-Mu.'
          ]
        },
        {
          heading: 'Tuhan Yesus, kasihanilah aku, orang berdosa ini.',
          paragraphs: [
            'Aku mohon ampunilah segala dosaku — yang kusadari maupun yang tidak kusadari, yang kulakukan di masa lalu maupun saat ini.',
            'Sucikanlah aku dengan darah-Mu yang kudus dan berharga yang tercurah di kayu salib.',
            'Bebaskanlah aku dari rasa bersalah dan penghukuman. Sembuhkanlah hatiku yang terluka, bersihkanlah nuraniku, dan perdamaikanlah aku sepenuhnya dengan Bapa Surgawi.',
            'Aku berbalik dari dosa dan dari cara hidup tanpa Engkau. Aku tidak mau lagi menempuh jalan yang menjauhkanku dari Allah.',
            'Ubahlah hatiku, agar aku semakin membenci dosa dan mencintai kebenaran, keadilan, serta kekudusan.',
            'Aku tahu bahwa dengan kekuatanku sendiri aku tidak sanggup hidup sebagaimana mestinya. Karena itu, aku sepenuhnya bersandar pada kasih karunia dan kuasa-Mu.'
          ]
        },
        {
          heading: 'Tuhan Yesus, saat ini dengan iman aku menyambut Engkau sebagai satu-satunya Tuhan dan Juruselamat pribadiku.',
          paragraphs: [
            'Aku percaya hanya kepada-Mu dan kepada korban-Mu yang sempurna di atas kayu salib.',
            'Aku percaya bahwa kematian-Mu adalah tebusan yang lunas bagi dosa-dosaku dan kebangkitan-Mu memberi aku kepastian hidup kekal.',
            'Aku tidak menyandarkan keselamatanku pada kebaikanku sendiri, amal perbuatan, atau kesalehanku.',
            '<strong>Aku menerima keselamatan sebagai anugerah cuma-cuma dari kasih karunia-Mu, semata-mata oleh iman kepada-Mu.</strong>',
            'Terima kasih karena aku tidak perlu membeli kasih-Mu, melainkan dapat menerimanya dengan penuh ucapan syukur.',
            'Aku percaya pada janji-Mu bahwa barangsiapa datang kepada-Mu, tidak akan pernah Kaubuang.',
            'Sebab itu, aku datang kepada-Mu dengan penuh keyakinan dan menyerahkan seluruh hidupku kepada-Mu.'
          ]
        },
        {
          heading: 'Yesus Kristus, aku mengakui Engkau sebagai satu-satunya Tuhan, Raja, dan Juruselamatku.',
          paragraphs: [
            'Aku tidak mau lagi hidup hanya untuk diriku sendiri.',
            'Kuserahkan kepada-Mu hatiku, pikiranku, hati nuraniku, kehendakku, dan tubuhku.',
            'Kuserahkan masa laluku, masa kiniku, dan masa depanku.',
            'Kuserahkan rencana-rancanaku, impianku, keputusanku, relasiku, keluargaku, pekerjaanku, kesehatanku, kekhawatiranku, dan seluruh bidang hidupku.',
            'Kuserahkan apa yang baik dan apa yang memalukan bagiku; kemenangan dan kegagalanku, harapan dan ketakutanku.',
            'Aku tidak mau menahan bagian apa pun dari hidupku di hadapan-Mu.',
            'Aku rindu Engkau menempati tempat utama di dalam hatiku mulai hari ini.',
            'Jadilah Penguasa atas pikiran, perkataan, tindakan, pilihan, dan keinginanku.',
            'Ajarlah aku bukan hanya memanggil-Mu Tuhan, tetapi juga hidup taat melakukan kehendak-Mu.'
          ]
        },
        {
          heading: 'Bapa Surgawi, di dalam nama Yesus Kristus, terimalah aku sebagai anak-Mu.',
          paragraphs: [
            'Terima kasih karena Engkau begitu mengasihi dunia ini, sehingga Engkau telah mengaruniakan Anak-Mu yang tunggal, supaya setiap orang yang percaya kepada-Nya tidak binasa, melainkan beroleh hidup yang kekal.',
            'Aku rindu menjadi bagian dari keluarga-Mu, hidup di hadirat-Mu, dan mengenal-Mu semakin dalam setiap hari.'
          ]
        },
        {
          heading: 'Roh Kudus, perbaharuilah aku dan tinggallah di dalam hatiku.',
          paragraphs: [
            'Berikanlah aku hati yang baru, kerinduan yang kudus, dan hidup yang baru.',
            'Pimpinlah aku ke dalam seluruh kebenaran yang dinyatakan dalam Alkitab.',
            'Bukalah pengertianku untuk memahami Firman Allah, bentuklah karakterku menjadi serupa dengan Kristus, dan ajarlah aku hidup dalam kasih, kerendahan hati, kekudusan, dan ketaatan kepada Allah.',
            'Tolonglah aku mengalahkan pencobaan dan menjauhkan diri dari segala hal yang bertentangan dengan kehendak-Mu.',
            'Bila aku jatuh, jangan biarkan aku lari dalam keputusasaan, melainkan bimbinglah aku untuk mengakui dosa, bertobat, dan berpegang kembali pada kasih karunia-Mu.',
            'Ajarlah aku mengampuni orang lain sama seperti Engkau telah mengampuni aku.',
            'Ajarlah aku mengasihi sesama dengan kasih-Mu, berbuat baik, dan menjadi saksi kebenaran-Mu.'
          ]
        },
        {
          heading: 'Tuhan Yesus, mulai hari ini aku rindu menjadi murid-Mu yang setia.',
          paragraphs: [
            'Aku rindu mengenal-Mu setiap hari melalui doa, membaca Firman Tuhan, dan bersekutu dengan-Mu.',
            'Aku rindu bertumbuh dalam iman, tinggal dalam Firman-Mu, dan bergabung dalam persekutuan orang-orang yang sungguh-sungguh mengasihi-Mu dan memelihara perintah-Mu.',
            'Aku juga rindu mengakui imanku di hadapan sesama dan dibaptis sesuai perintah-Mu, sebagai tanda pertobatanku, kematian terhadap hidup lama, dan awal kehidupan baru bersama-Mu.',
            'Biarlah ketaatanku bukan merupakan usaha untuk membeli keselamatan, melainkan buah ucapan syukur dan kasih yang lahir dari iman yang menyelamatkan.'
          ]
        },
        {
          heading: 'Tuhan Yesus, mulai saat ini aku memercayakan keselamatan dan kekekalanku seutuhnya kepada-Mu.',
          paragraphs: [
            'Aku tidak mau bergantung pada perasaanku yang berubah-ubah, kekuatanku sendiri, atau keadaan yang fana.',
            'Aku mau berpegang teguh pada janji-janji-Mu yang abadi, kesetiaan-Mu, dan korban-Mu yang sempurna.',
            'Terima kasih karena kasih karunia-Mu jauh lebih besar daripada seluruh dosaku.',
            'Terima kasih karena di dalam Engkau ada pengampunan, pendamaian dengan Allah, hidup baru, dan pengharapan kebangkitan.',
            'Terima kasih karena aku dapat menghampiri Bapa melalui Engkau, yang senantiasa hidup untuk mendoakan orang-orang yang datang kepada Allah melalui diri-Mu.',
            'Peliharalah aku dalam iman, jagalah aku dalam kasih-Mu, dan tolonglah aku tetap setia sampai akhir.',
            'Aku rindu hidup menantikan kedatangan-Mu kembali yang mulia dan menyambut-Mu dengan sukacita saat Engkau datang.'
          ]
        },
        {
          heading: 'Pengakuan Iman dan Penyerahan Total',
          isCulmination: true,
          paragraphs: [
            '<strong>Tuhan Yesus Kristus, Engkaulah satu-satunya Tuhan dan Juruselamat pribadiku.</strong>',
            '<strong>Hanya di dalam Engkau kuletakkan seluruh pengharapan keselamatanku.</strong>',
            '<strong>Kepada-Mu kuserahkan hatiku.</strong>',
            '<strong>Kepada-Mu kuserahkan seluruh hidupku.</strong>',
            '<strong>Kepada-Mu kupasrahkan kekekalanku.</strong>',
            'Kiranya mulai saat ini hidupku menjadi milik-Mu seutuhnya dan memuliakan nama-Mu yang kudus.',
            'Terima kasih atas kasih karunia-Mu yang melimpah, kasih-Mu yang tiada berkesudahan, dan anugerah keselamatan yang kuterima melalui iman.',
            '<strong>Di dalam nama Yesus Kristus, satu-satunya Tuhan, Penebus, dan Juruselamatku, aku berdoa dengan segenap hatiku.</strong>',
            '<strong class="prayer-amen">Amin.</strong>'
          ]
        }
      ],
      aftermath: {
        title: 'Apa yang harus dipahami oleh orang yang telah memanjatkan doa ini dengan sungguh-sungguh?',
        lead: 'Kebenaran yang paling mendasar adalah: <strong>bukan doa itu sendiri yang menyelamatkan manusia, melainkan Yesus Kristus.</strong> Doa adalah ungkapan iman yang tulus dan respons hati terhadap kasih karunia Allah.',
        promisesTitle: 'Kitab Suci memberikan janji-janji yang teguh bagi orang percaya:',
        promises: [
          '<strong>Efesus 2:8–9</strong> — Keselamatan adalah anugerah cuma-cuma yang diterima oleh iman, bukan upah dari usaha perbuatan kita.',
          '<strong>Roma 10:9–10</strong> — Percaya dalam hati bahwa Allah telah membangkitkan Kristus dari antara orang mati dan mengaku dengan mulut bahwa Dia adalah Tuhan, membawa kepada keselamatan.',
          '<strong>Yohanes 1:12</strong> — Semua orang yang menerima-Nya diberi-Nya kuasa supaya menjadi anak-anak Allah, yaitu mereka yang percaya dalam nama-Nya.',
          '<strong>Yohanes 6:37</strong> — Yesus berjanji: Barangsiapa datang kepada-Ku, ia tidak akan Kubuang.',
          '<strong>1 Yohanes 1:9</strong> — Jika kita mengaku dosa kita, maka Ia adalah setia dan adil, sehingga Ia akan mengampuni segala dosa kita dan menyucikan kita dari segala kejahatan.',
          '<strong>2 Korintus 5:17</strong> — Jadi siapa yang ada di dalam Kristus, ia adalah ciptaan baru: yang lama sudah berlalu, sesungguhnya yang baru sudah datang.',
          '<strong>Kisah Para Rasul 2:38</strong> — Sambutan terhadap Injil meliputi pertobatan, baptisan dalam nama Yesus Kristus untuk pengampunan dosa, dan penerimaan karunia Roh Kudus.'
        ],
        truthTitle: 'Peganglah kebenaran ini di dalam hatimu',
        truthMain: 'Engkau diselamatkan bukan karena mengucapkan doa yang sempurna. Engkau diselamatkan bukan karena engkau sudah cukup baik. Keselamatan terwujud karena Yesus Kristus telah mati menanggung dosamu dan telah bangkit. Engkau menerimanya semata-mata karena anugerah, melalui iman kepada-Nya.',
        truthSub: 'Iman yang sejati menumbuhkan pertobatan, hidup baru, kasih, dan ketaatan kepada Kristus — bukan sebagai harga pembeli keselamatan, melainkan sebagai buah manis kasih karunia-Nya (Efesus 2:10; Yohanes 14:15).',
        truthQuote: '“Semuanya ini kutuliskan kepada kamu, supaya kamu yang percaya kepada nama Anak Allah, tahu, bahwa kamu memiliki hidup yang kekal.”',
        truthCite: '— 1 Yohanes 5:13 (TB)'
      }
    }
  },

  it: {
    langName: 'Italiano',
    metaTitle: 'Buona Notizia — Vangelo | Preghiera di consacrazione a Gesù Cristo | Radio CC',
    metaDescription: 'La Buona Notizia. Scopri il messaggio di Gesù Cristo, ascolta la registrazione e leggi la preghiera per donare la tua vita a Gesù Cristo.',
    nav: {
      start: 'Home',
      goodNews: 'Buona Notizia',
      audio: 'Registrazione',
      prayer: 'Preghiera di consacrazione',
      values: 'Valori',
      about: 'Chi siamo'
    },
    hero: {
      kicker: 'PAROLE CHE TRASFORMANO LA VITA',
      title1: 'Buona',
      title2: 'Notizia',
      intro: 'Un dialogo sulla vita, la speranza e ciò che conta veramente. Scopri un messaggio sempre vivo e attuale.',
      verseText: '«Io sono venuto perché abbiano la vita e l’abbiano in abbondanza.»',
      verseCite: '— Vangelo di Giovanni 10:10',
      listenBtn: 'Ascolta la Buona Notizia',
      prayerBtn: 'Prega la preghiera di consacrazione ↓',
      radioPlay: 'Ascolta Radio CC',
      radioStop: 'Ferma Radio CC',
      counterLink: 'Obiettivo primo milione ↗',
      strap: 'ASCOLTA · CONDIVIDI · TRASFORMA LA VITA'
    },
    player: {
      miniTitle: 'DIALOGO SULLA VITA',
      title: 'Buona Notizia',
      subtitle: 'Radio CC · Vangelo',
      share: 'Condividi',
      download: 'Scarica MP3',
      favorite: 'Aggiungi ai preferiti',
      support: 'Sostieni il progetto'
    },
    values: {
      title: 'I valori della Buona Notizia',
      v1Title: 'Speranza',
      v1Desc: 'per ogni nuovo giorno',
      v2Title: 'Senso',
      v2Desc: 'nel quotidiano',
      v3Title: 'Vita',
      v3Desc: 'in abbondanza'
    },
    prayer: {
      kicker: 'DECISIONE DI FEDE E SALVEZZA',
      title: 'Preghiera per donare la vita a Gesù Cristo',
      subtitle: 'Preghiera di ravvedimento, fede e accoglienza della salvezza per grazia mediante la fede in Gesù Cristo come solo Signore e Salvatore personale.',
      langLabel: 'Scegli la lingua della preghiera:',
      verseEphText: '«Infatti è per grazia che siete stati salvati, mediante la fede; e ciò non viene da voi; è il dono di Dio. Non è in virtù di opere affinché nessuno se ne vanti.»',
      verseEphCite: '— Efesini 2:8–9',
      intro: 'Se desideri sinceramente affidare la tua vita a Gesù Cristo, puoi rivolgerti a Lui in preghiera con le seguenti parole. Non si tratta di recitare una formula magica, ma di una fede autentica, di un cuore contrito e di una fiducia incrollabile nel Salvatore.',
      stanzas: [
        {
          heading: 'Signore Gesù Cristo, Figlio del Dio vivente!',
          paragraphs: [
            'Vengo oggi a Te esattamente come sono — con tutto il mio passato, i miei peccati, le mie debolezze, le mie paure, i miei dubbi e i miei desideri.',
            'Vengo perché ho disperato bisogno di Te. Ho bisogno del Tuo amore, del Tuo perdono, della Tua grazia e della Tua salvezza.',
            '<strong>Credo, Signore Gesù, che Tu sei il Figlio di Dio, il Messia promesso, l’unico Salvatore del mondo e la sola via verso Dio Padre.</strong>',
            'Credo che per amore verso di me sei venuto in questo mondo, hai assunto la nostra natura umana e hai vissuto una vita di perfetta obbedienza al Padre, senza commettere alcun peccato.',
            'Credo che hai offerto volontariamente la Tua vita sulla croce del Calvario per pagare il castigo dei miei peccati e riconciliarmi con Dio.',
            'Credo che sei morto per me, sei stato sepolto e il terzo giorno sei risuscitato, trionfando sul peccato, sulla morte e sulla potenza di Satana.',
            'Credo che Tu vivi per sempre, che sei il mio unico Mediatore presso il Padre e che solo in Te posso ricevere il perdono dei peccati, la salvezza e la vita eterna.'
          ]
        },
        {
          heading: 'Signore Gesù, confesso davanti a Te di essere un peccatore.',
          paragraphs: [
            'Ho peccato contro Dio in pensieri, parole, opere e omissioni. Molte volte ho seguito la mia volontà, disprezzando la Tua verità e i Tuoi comandamenti.',
            'Non ho sempre amato Dio con tutto il cuore, con tutta l’anima e con tutta la mente. Non ho sempre amato il mio prossimo come me stesso.',
            'Riconosco di essere del tutto incapace di salvare me stesso. Nessuna delle mie buone opere, pratiche religiose, sforzi o meriti può cancellare i miei peccati né assicurarmi la vita eterna.',
            'Non voglio più giustificare le mie colpe né nasconderle. Me ne pento sinceramente e le confesso davanti a Te.'
          ]
        },
        {
          heading: 'Signore Gesù, abbi pietà di me, peccatore.',
          paragraphs: [
            'Ti prego di perdonare tutti i miei peccati — coscienti e inconsapevoli, commessi nel passato o nel presente.',
            'Purificami con il Tuo sangue prezioso versato sulla croce.',
            'Liberami dalla colpa e dalla condanna. Guarisci il mio cuore ferito, monda la mia coscienza e riconciliami pienamente con il Padre mio celeste.',
            'Mi allontano dal peccato e da una vita lontana da Te. Non voglio più percorrere strade che mi separano da Dio.',
            'Ti chiedo di trasformare il mio cuore, affinché io detesti il peccato e ami la giustizia, la verità e la santità.',
            'So che con le mie sole forze non posso vivere come dovrei. Per questo mi affido totalmente alla Tua grazia e alla Tua potenza.'
          ]
        },
        {
          heading: 'Signore Gesù, in questo momento ricevo Te con fede come mio unico Signore e personale Salvatore.',
          paragraphs: [
            'Ripongo la mia fiducia unicamente in Te e nel Tuo perfetto sacrificio compiuto sulla croce.',
            'Credo che la Tua morte sia il riscatto sufficiente per i miei peccati e che la Tua risurrezione mi doni la certezza della vita eterna.',
            'Non fondo la speranza della mia salvezza sulla mia bontà, sulle mie opere o sulla mia devozione.',
            '<strong>Accolgo la salvezza come dono gratuito e immeritato della Tua grazia, unicamente mediante la fede in Te.</strong>',
            'Ti ringrazio perché non devo guadagnarmi il Tuo amore, ma posso riceverlo con profonda gratitudine.',
            'Credo alla Tua promessa che non respingerai mai colui che viene a Te.',
            'Perciò mi accosto a Te con piena fiducia e Ti affido tutta la mia vita.'
          ]
        },
        {
          heading: 'Gesù Cristo, Ti proclamo mio unico Signore, Re e Salvatore.',
          paragraphs: [
            'Non voglio più vivere solo per me stesso.',
            'Ti dono il mio cuore, la mia mente, la mia coscienza, la mia volontà e il mio corpo.',
            'Ti affido il mio passato, il mio presente e il mio futuro.',
            'Ti consegno i miei progetti, i miei sogni, le mie decisioni, le mie relazioni, la mia famiglia, il mio lavoro, la mia salute, le mie ansie e ogni sfera della mia vita.',
            'Ti dono ciò che ho di buono e ciò di cui mi vergogno; le mie vittorie e le mie cadute, le mie speranze e i miei timori.',
            'Non desidero trattenere nulla lontano da Te.',
            'Desidero che d’ora in poi Tu occupi il primo posto nel mio cuore.',
            'Sii il Signore dei miei pensieri, delle mie parole, delle mie azioni, delle mie scelte e dei miei desideri.',
            'Insegnami non solo a chiamarTi Signore, ma a vivere secondo la Tua volontà.'
          ]
        },
        {
          heading: 'Padre celeste, nel nome di Gesù Cristo, accoglimi come Tuo figlio.',
          paragraphs: [
            'Ti ringrazio per aver tanto amato il mondo da donare il Tuo unigenito Figlio, affinché chiunque crede in Lui non perisca, ma abbia vita eterna.',
            'Desidero appartenere alla Tua famiglia, vivere alla Tua presenza e conoscerTi ogni giorno di più.'
          ]
        },
        {
          heading: 'Spirito Santo, rigenerami e vieni ad abitare nel mio cuore.',
          paragraphs: [
            'Donami un cuore nuovo, desideri santi e una vita nuova.',
            'Guidami in tutta la verità rivelata nella Sacra Scrittura.',
            'Apri la mia mente a comprendere la Parola di Dio, plasma il mio carattere a somiglianza di Cristo e insegnami a vivere nell’amore, nell’umiltà, nella santità e nell’obbedienza a Dio.',
            'Aiutami a vincere le tentazioni e a fuggire tutto ciò che si oppone alla Tua volontà.',
            'Se dovessi cadere, non permettere che io fugga nella disperazione, ma conducimi a una sincera confessione, al ravvedimento e ad afferrare di nuovo la Tua grazia.',
            'Insegnami a perdonare gli altri come Tu hai perdonato me.',
            'Insegnami ad amare il prossimo con il Tuo amore, a compiere il bene e a essere testimone della Tua verità.'
          ]
        },
        {
          heading: 'Signore Gesù, desidero essere da oggi Tuo discepolo.',
          paragraphs: [
            'Desidero conoscerTi ogni giorno attraverso la preghiera, lo studio delle Scritture e la comunione con Te.',
            'Desidero crescere nella fede, dimorare nella Tua Parola e unirmi alla comunità di coloro che Ti amano sinceramente e osservano i Tuoi comandamenti.',
            'Desidero inoltre confessare la mia fede davanti agli uomini e ricevere il battesimo secondo il Tuo ordine, a testimonianza della mia conversione, della morte alla vecchia vita e della risurrezione a vita nuova con Te.',
            'La mia obbedienza non sia il tentativo di meritare la salvezza, ma il frutto lieto della gratitudine e della fede salvifica.'
          ]
        },
        {
          heading: 'Signore Gesù, da questo istante affido interamente a Te la mia salvezza e la mia eternità.',
          paragraphs: [
            'Non voglio poggiare sui miei sentimenti mutevoli, sulle mie forze deboli o su circostanze passeggere.',
            'Voglio fondarmi sulle Tue promesse infallibili, sulla Tua fedeltà e sul Tuo sacrificio perfetto.',
            'Grazie perché la Tua grazia è immensamente più grande di tutti i miei peccati.',
            'Grazie perché in Te c’è perdono, riconciliazione con Dio, una vita nuova e la speranza beata della risurrezione.',
            'Grazie perché posso accostarmi al Padre per mezzo Tuo, che vivi per sempre per intercedere per noi.',
            'Aiutami a perseverare nella fede, a rimanere nel Tuo amore e a rimanerTi fedele fino alla fine.',
            'Desidero vivere nell’attesa del Tuo ritorno glorioso e accoglierTi con gioia quando verrai.'
          ]
        },
        {
          heading: 'Professione di fede e affidamento totale',
          isCulmination: true,
          paragraphs: [
            '<strong>Signore Gesù Cristo, Tu sei il mio solo Signore e Salvatore personale.</strong>',
            '<strong>In Te ripongo ogni speranza della mia salvezza.</strong>',
            '<strong>A Te dono il mio cuore.</strong>',
            '<strong>A Te affido tutta la mia vita.</strong>',
            '<strong>A Te consegno la mia eternità.</strong>',
            'La mia vita d’ora in poi Ti appartenga e dia gloria al Tuo santo nome.',
            'Grazie per la Tua grazia gratuita, per il Tuo amore infinito e per il dono della salvezza che ricevo mediante la fede.',
            '<strong>Nel nome di Gesù Cristo, mio unico Signore, Redentore e Salvatore, prego con tutto il mio cuore.</strong>',
            '<strong class="prayer-amen">Amen.</strong>'
          ]
        }
      ],
      aftermath: {
        title: 'Cosa deve sapere chi ha pronunciato sinceramente questa preghiera?',
        lead: 'La verità fondamentale è questa: <strong>non è la preghiera in se stessa che salva l’uomo, ma Gesù Cristo.</strong> La preghiera è l’espressione di una fede autentica e la risposta del cuore alla grazia di Dio.',
        promisesTitle: 'La Sacra Scrittura offre al credente promesse certe:',
        promises: [
          '<strong>Efesini 2:8–9</strong> — La salvezza è dono gratuito della grazia ricevuto mediante la fede, non salario per le opere.',
          '<strong>Romani 10:9–10</strong> — La fede nel Cristo risorto e la confessione pubblica della Sua signoria conducono alla salvezza.',
          '<strong>Giovanni 1:12</strong> — A tutti quelli che L’hanno ricevuto Egli ha dato il diritto di diventare figli di Dio, a quelli cioè che credono nel Suo nome.',
          '<strong>Giovanni 6:37</strong> — Gesù promette: colui che viene a me, io non lo caccerò fuori.',
          '<strong>1 Giovanni 1:9</strong> — Se confessiamo i nostri peccati, Egli è fedele e giusto da perdonarci i peccati e purificarci da ogni iniquità.',
          '<strong>2 Corinzi 5:17</strong> — Se dunque uno è in Cristo, egli è una nuova creatura; le cose vecchie sono passate: ecco, sono diventate nuove.',
          '<strong>Atti 2:38</strong> — La risposta all’Evangelo comprende il ravvedimento, il battesimo nel nome di Gesù Cristo per il perdono dei peccati e il dono dello Spirito Santo.'
        ],
        truthTitle: 'Custodisci questa verità nel tuo cuore',
        truthMain: 'Non sei salvato perché hai pronunciato una preghiera perfetta. Non sei salvato perché sei abbastanza buono. La salvezza è possibile perché Gesù Cristo è morto per i tuoi peccati ed è risorto. La ricevi per grazia, mediante la fede in Lui.',
        truthSub: 'La vera fede produce ravvedimento, vita nuova, amore e obbedienza a Cristo — non come prezzo per il riscatto, ma come frutto beato della Sua grazia (Efesini 2:10; Giovanni 14:15).',
        truthQuote: '«Vi ho scritto queste cose affinché sappiate che avete la vita eterna, voi che credete nel nome del Figlio di Dio.»',
        truthCite: '— 1 Giovanni 5:13'
      }
    }
  },

  ja: {
    langName: '日本語',
    metaTitle: '福音 — 素晴らしい知らせ | イエス・キリストに生涯を委ねる祈り | Radio CC',
    metaDescription: '福音、良き知らせ。イエス・キリストのメッセージを知り、音声を聴き、生涯をイエス・キリストに委ねる祈りを捧げましょう。',
    nav: {
      start: 'ホーム',
      goodNews: '福音の知らせ',
      audio: '音声録音',
      prayer: '献身の祈り',
      values: '価値観',
      about: 'プロジェクト概要'
    },
    hero: {
      kicker: '人生を変える御言葉',
      title1: '素晴らしい',
      title2: '知らせ',
      intro: 'いのち、希望、そして本当に大切なことについての対話。今も生き続ける福音のメッセージに出会ってください。',
      verseText: '「わたしが来たのは、羊がいのちを得、またそれを豊かに持つためです。」',
      verseCite: '— ヨハネの福音書 10:10',
      listenBtn: '福音の知らせを聴く',
      prayerBtn: '生涯を委ねる祈りを捧げる ↓',
      radioPlay: 'Radio CC を聴く',
      radioStop: 'Radio CC を停止',
      counterLink: '最初の100万人を目指して ↗',
      strap: '聴く · 分かち合う · 人生を変える'
    },
    player: {
      miniTitle: 'いのちの対話',
      title: '福音の知らせ',
      subtitle: 'Radio CC · 福音',
      share: '共有する',
      download: 'MP3をダウンロード',
      favorite: 'お気に入りに追加',
      support: '支援する'
    },
    values: {
      title: '福音の核となる価値観',
      v1Title: '希望',
      v1Desc: '毎日の歩みのために',
      v2Title: '意義',
      v2Desc: '日々の生活の中に',
      v3Title: 'いのち',
      v3Desc: '豊かで満ちあふれるもの'
    },
    prayer: {
      kicker: '信仰の決断と救い',
      title: 'イエス・キリストに生涯を委ねる祈り',
      subtitle: '唯一の主であり個人的な救い主であるイエス・キリストへの信仰により、恵みによって救いを受ける悔い改めと信仰の祈り。',
      langLabel: '祈りの言語を選択：',
      verseEphText: '「あなたがたは、恵みのゆえに、信仰によって救われたのです。それは、自分自身から出たことではなく、神の賜物です。行いによるのではありません。だれも誇ることがないためです。」',
      verseEphCite: '— エペソ人への手紙 2:8–9',
      intro: 'もしあなたが心からイエス・キリストに人生をお委ねしたいと願うなら、次の言葉をもって主に向かって祈ることができます。形式的な文句を唱えることではなく、真実な信仰、心の悔い改め、そして救い主への全き信頼こそが何よりも尊いものです。',
      stanzas: [
        {
          heading: '生ける神の御子、主イエス・キリストよ！',
          paragraphs: [
            '私は今日、ありのままの姿であなたのもとにまいります。私の過去、私の罪、弱さ、恐れ、疑い、そして心の願いのすべてを携えて。',
            'あなたを必要としているがゆえに、私はみもとにまいります。私にはあなたの愛、赦し、恵み、そして救いが必要です。',
            '<strong>主イエスよ、あなたが神の御子であり、約束されたメシヤ、世の唯一の救い主、そして父なる神に至る唯一の道であることを信じます。</strong>',
            'あなたが私への愛のゆえにこの世に来られ、人としての性質を取り、罪を犯すことなく、父への完全な従順の生涯を歩まれたことを信じます。',
            'あなたが私の罪の罰を代わりに負い、私を神と和解させるために、ゴルゴタの十字架の上で進んでその命を捨ててくださったことを信じます。',
            'あなたが私のために死に、葬られ、三日目によみがえり、罪と死とサタンの力に勝利されたことを信じます。',
            'あなたが永遠に生きておられ、父なる神の御前で私の唯一の執り成し手であり、あなたにあってのみ私が罪の赦し、救い、永遠のいのちを得ることができると信じます。'
          ]
        },
        {
          heading: '主イエスよ、私は自分が罪人であることを告白します。',
          paragraphs: [
            '私は思いにおいて、言葉において、行動において、またなすべきことを怠ることによって、神に対して罪を犯しました。あなたの真理と戒めを軽んじ、自分の思いどおりに歩んだことが幾度もありました。',
            '私はいつも心を尽くし、思いを尽くし、知力を尽くして主なる神を愛していたわけではありませんでした。隣人を自分のように愛していなかったことも告白します。',
            '私には自分自身を救う力が全くないことを認めます。私のいかなる善行も、宗教的儀式も、努力や功績も、私の罪をぬぐい去ることはできず、永遠のいのちをもたらすことはできません。',
            'もはや自分の罪を弁解したり、隠したりすることをやめます。心からそれらを悔い改め、み前に言い表します。'
          ]
        },
        {
          heading: '主イエスよ、罪人である私をあわれんでください。',
          paragraphs: [
            'どうか私のすべての罪をお赦しください。意識して犯した罪も、気づかずに犯した罪も、過去の罪も現在の罪も。',
            '十字架の上で流された尊い血潮によって、私をきよめてください。',
            '罪責感とさばきの恐れから私を解放してください。傷ついた心を癒やし、良心をきよめ、天の父と完全に和解させてください。',
            '私は罪から離れ、あなたから離れた生活に背を向けます。もはや神から遠ざかる道を歩むことを望みません。',
            'どうか私の心を変革し、罪を憎み、義と真理と聖さを深く愛する者としてください。',
            '自分の力ではあるべき歩みを全うできないことを知っています。それゆえ、私はただあなたの豊かな恵みと御力にすべてをお委ねします。'
          ]
        },
        {
          heading: '主イエスよ、今この時、信仰によってあなたを私の唯一の主、個人的な救い主としてお迎えいたします。',
          paragraphs: [
            '私はただあなたのみを信頼し、十字架の上で成し遂げられた完全ないけにえに寄り頼みます。',
            'あなたの死が私の罪の十分なあがないであり、あなたの復活が私に永遠のいのちの希望を与える勝利であることを信じます。',
            '自分の善良さ、行い、宗教心に救いの望みを置くことは決していたしません。',
            '<strong>あなたへの信仰のみによって、あなたの恵みの無代価の賜物として救いを受け取ります。</strong>',
            'あなたの愛を得るために努力する必要はなく、感謝をもってそれを受け取ることができることを心から感謝します。',
            'ご自身のもとに来る者を決して追い出されないというあなたの真実な約束を固く信じます。',
            'それゆえ、私は確信をもってあなたのもとにまいり、私の全生涯をあなたに委ねます。'
          ]
        },
        {
          heading: 'イエス・キリストよ、あなたを私の唯一の主、王、救い主としてお認めいたします。',
          paragraphs: [
            'もはや自分のためだけに生きることを望みません。',
            '私の心、知性、良心、意志、そして肉体のすべてをあなたにお捧げします。',
            '私の過去、現在、そして未来をあなたに委ねます。',
            '私の計画、夢、決断、人間関係、家族、仕事、健康、思い煩い、人生のあらゆる領域を御手に委ねます。',
            '善きものも、恥じるべきものもすべてを御前に差し出します。私の勝利も挫折も、希望も恐れも、すべてあなたにお渡しします。',
            '私の人生のいかなる部分も、あなたに対して隠し留めておくことは望みません。',
            'これから私の心の中で、あなたが常に第一の座を占めてくださることを切に願います。',
            '私の思い、言葉、行動、選択、そして願いの主となってください。',
            '単にあなたを「主よ」と呼ぶだけでなく、あなたの御心に従って生きることを教えてください。'
          ]
        },
        {
          heading: '天の父なる神よ、イエス・キリストの御名によって、私をご自身の子としてお受け入れください。',
          paragraphs: [
            '神がそのひとり子をお与えになったほどに世を愛してくださり、御子を信じる者が一人も滅びることなく、永遠のいのちを持つ道を開いてくださったことを心から感謝します。',
            'あなたの霊的な家族に連なり、あなたの臨在の中に生き、日ごとにあなたをさらに深く知る者となりたいと願います。'
          ]
        },
        {
          heading: '聖霊よ、私を新たに生まれ変わらせ、私の心に住まわせてください。',
          paragraphs: [
            '私に新しい心、新しい聖なる願い、そして新しいいのちを与えてください。',
            '聖書に示されているすべての真理へと私をお導きください。',
            '神の御言葉を理解するために私の心を開き、私の人格をキリストに似たものへと造り変え、愛、謙遜、聖さ、神への従順のうちに歩むことを教えてください。',
            '誘惑に打ち勝ち、あなたの御心に反するすべてのものから遠ざかることができるよう助けてください。',
            '万一私が倒れることがあっても、絶望してあなたから逃げ出すことがないようにしてください。真実な告白と悔い改めへと私を導き、あなたの恵みを再び固く握らせてください。',
            'あなたが私を赦してくださったように、私も人を赦すことができるよう教えてください。',
            'あなたの愛をもって人々を愛し、善を行い、あなたの真理の証人となることができるよう導いてください。'
          ]
        },
        {
          heading: '主イエスよ、今日からあなたの誠実な弟子となることを願います。',
          paragraphs: [
            '祈り、聖書の学び、そしてあなたとの親しい交わりを通して、日々あなたを知ることを切に望みます。',
            '信仰において成長し、あなたの御言葉のうちにとどまり、あなたを心から愛し戒めを守る信仰者たちの交わりに加わることを願います。',
            'また、人々の前で信仰を言い表し、あなたの命じられたとおりにバプテスマを受け、私の回心、古い自分への死、そしてあなたとともにある新しい歩みの始まりを証ししたいと願います。',
            '私の従順が救いを得るための努力ではなく、救いをもたらす信仰とあふれる感謝の愛の結実となりますように。'
          ]
        },
        {
          heading: '主イエスよ、この瞬間から、私の救いと永遠をすべてあなたにお委ねします。',
          paragraphs: [
            '自分の移ろいやすい感情や、自分自身の弱き力、あるいは変わりゆく状況に頼ることはいたしません。',
            'あなたの変わらない約束、あなたの真実、そしてあなたの完全ないけにえの上に固く立ちます。',
            'あなたの恵みが私のすべての罪にまさって遥かに大きいことを感謝します。',
            'あなたにあって罪の赦し、神との和解、新しいいのち、そして復活の栄光ある希望があることを感謝します。',
            'あなたを通して父のみもとに近づくことができ、あなたがご自身によって神に近づく者たちのためにいつも生きて執り成してくださっていることを感謝します。',
            '信仰に堅く立ち続け、あなたの愛のうちにとどまり、最後まで忠実であり続けることができるよう助けてください。',
            '栄光に満ちたあなたの再臨を待ち望みつつ生き、あなたが再び来られるその日、喜んであなたをお迎えしたいと願います。'
          ]
        },
        {
          heading: '信仰の告白と全き献身',
          isCulmination: true,
          paragraphs: [
            '<strong>主イエス・キリストよ、あなたこそ私の唯一の主、私の個人的な救い主です。</strong>',
            '<strong>あなたに私の救いのすべての希望を置きます。</strong>',
            '<strong>私の心をすべてあなたにお捧げします。</strong>',
            '<strong>私の生涯のすべてをあなたに委ねます。</strong>',
            '<strong>私の永遠をあなたに託します。</strong>',
            'これからの私の人生があなたのものとなり、尊い聖なる御名に栄光を帰することができますように。',
            '無代価の恵み、終わりなき愛、そして信仰によって受ける救いの賜物を心から感謝します。',
            '<strong>私の唯一の主、贖い主、救い主であられるイエス・キリストの御名によって、心からの祈りを捧げます。</strong>',
            '<strong class="prayer-amen">アーメン。</strong>'
          ]
        }
      ],
      aftermath: {
        title: '心からこの祈りを捧げた人が知るべき大切なこと',
        lead: '最も根源的な真理は次のとおりです。<strong>人を救うのは祈りの言葉そのものではなく、イエス・キリストです。</strong>祈りは生きた信仰の真実な表現であり、神の恵みに対する心の応答です。',
        promisesTitle: '聖書は信じる者に確実な約束を与えています：',
        promises: [
          '<strong>エペソ人への手紙 2:8–9</strong> — 救いは行いへの報酬ではなく、信仰によって受ける恵みの賜物です。',
          '<strong>ローマ人への手紙 10:9–10</strong> — よみがえられたキリストを心で信じ、口で主と告白することが救いをもたらします。',
          '<strong>ヨハネの福音書 1:12</strong> — しかし、この方を受け入れた人々、すなわち、その名を信じた人々には、神の子どもとされる特権をお与えになった。',
          '<strong>ヨハネの福音書 6:37</strong> — イエスは約束しておられます。「わたしのもとに来る者を、わたしは決して捨てません。」',
          '<strong>ヨハネの手紙第一 1:9</strong> — 私たちが自分の罪を告白するなら、神は真実で正しい方ですから、その罪を赦し、すべての不義から私たちをきよめてくださいます。',
          '<strong>コリント人への手紙第二 5:17</strong> — だれでもキリストのうちにあるなら、その人は新しく造られた者です。古いものは過ぎ去った、見よ、すべてが新しくなったのです。',
          '<strong>使徒の働き 2:38</strong> — 福音への応答には、悔い改め、罪の赦しを得るためのイエス・キリストの御名によるバプテスマ、そして聖霊の賜物の約束が含まれます。'
        ],
        truthTitle: 'この真理を心に留めてください',
        truthMain: '完全な祈りを唱えたから救われたのではありません。あなたが十分に善人だから救われたのでもありません。イエス・キリストがあなたの罪のために死に、復活されたからこそ、救いが可能となったのです。あなたはただ恵みにより、主への信仰によってそれを受け取ったのです。',
        truthSub: '本物の信仰は、悔い改め、新しきいのち、愛、そしてキリストへの従順の実を結びます。それは救いを買う代価としてではなく、あふれる恵みへの感謝の実として現れるものです（エペソ 2:10；ヨハネ 14:15）。',
        truthQuote: '「神の御子の名を信じているあなたがたに、これらのことを書いたのは、永遠のいのちを持っていることを、あなたがたに分からせるためです。」',
        truthCite: '— ヨハネの手紙第一 5:13'
      }
    }
  },

  ko: {
    langName: '한국어',
    metaTitle: '복음 — 기쁜 소식 | 예수 그리스도께 삶을 드리는 기도 | Radio CC',
    metaDescription: '기쁜 소식, 복음. 예수 그리스도의 메시지를 만나고 오디오를 들으며 예수 그리스도께 삶을 드리는 헌신과 영접의 기도를 드리세요.',
    nav: {
      start: '홈',
      goodNews: '기쁜 소식',
      audio: '오디오',
      prayer: '삶을 드리는 기도',
      values: '핵심 가치',
      about: '소개'
    },
    hero: {
      kicker: '삶을 변화시키는 말씀',
      title1: '기쁜',
      title2: '소식',
      intro: '생명과 소망, 그리고 진정으로 중요한 것에 관한 대화. 지금도 살아 역사하는 복음의 메시지를 만나보세요.',
      verseText: '“내가 온 것은 양으로 생명을 얻게 하고 더 풍성히 얻게 하려는 것이라”',
      verseCite: '— 요한복음 10:10 (개역개정)',
      listenBtn: '기쁜 소식 듣기',
      prayerBtn: '삶을 드리는 영접 기도하기 ↓',
      radioPlay: 'Radio CC 재생',
      radioStop: 'Radio CC 정지',
      counterLink: '첫 100만 명을 향하여 ↗',
      strap: '듣기 · 나누기 · 삶의 변화'
    },
    player: {
      miniTitle: '생명에 관한 대화',
      title: '기쁜 소식',
      subtitle: 'Radio CC · 복음',
      share: '공유하기',
      download: 'MP3 다운로드',
      favorite: '즐겨찾기 추가',
      support: '후원하기'
    },
    values: {
      title: '복음의 핵심 가치',
      v1Title: '소망',
      v1Desc: '새로운 매일을 위한',
      v2Title: '의미',
      v2Desc: '일상의 삶 속에서',
      v3Title: '생명',
      v3Desc: '풍성하고 넘치는'
    },
    prayer: {
      kicker: '믿음의 결단과 구원',
      title: '예수 그리스도께 삶을 드리는 기도',
      subtitle: '유일한 주님이시며 개인의 구주이신 예수 그리스도를 믿음으로 말미암아 은혜로 구원을 받는 회개와 믿음의 영접 기도.',
      langLabel: '기도 언어 선택:',
      verseEphText: '“너희는 그 은혜에 의하여 믿음으로 말미암아 구원을 받았으니 이것은 너희에게서 난 것이 아니요 하나님의 선물이라 행위에서 난 것이 아니니 이는 누구든지 자랑하지 못하게 함이라”',
      verseEphCite: '— 에베소서 2:8–9 (개역개정)',
      intro: '만일 당신이 진심으로 당신의 삶을 예수 그리스도께 맡기기를 원하신다면, 아래의 말씀으로 주님께 기도드릴 수 있습니다. 이는 단순히 정해진 문구를 읊는 것이 아니라, 진실한 믿음과 마음의 회개, 그리고 구주를 향한 전적인 신뢰의 고백입니다.',
      stanzas: [
        {
          heading: '살아 계신 하나님의 아들, 주 예수 그리스도님!',
          paragraphs: [
            '저는 오늘 저의 있는 모습 그대로 주님 앞에 나아옵니다 — 저의 모든 과거와 죄악, 연약함과 두려움, 의심과 소망을 품은 채로.',
            '저는 주님이 필요하기에 나아옵니다. 주님의 사랑과 용서, 주님의 은혜와 구원이 제게 절실히 필요합니다.',
            '<strong>주 예수님, 저는 주님이 하나님의 아들이시며 약속된 메시아이시고 온 세상의 유일한 구원자이시며 하나님 아버지께로 나아가는 유일한 길임을 믿습니다.</strong>',
            '저를 향한 사랑 때문에 주님이 이 세상에 오셨고, 인간의 몸을 입으셨으며, 죄를 범치 않으시고 아버지께 온전한 순종의 삶을 사셨음을 믿습니다.',
            '제 죄의 형벌을 대신 받으시고 저를 하나님과 화목하게 하시기 위해, 골고다 십자가 위에서 기꺼이 목숨을 내어주셨음을 믿습니다.',
            '저를 위해 죽으시고 장사되셨으며, 사흘 만에 부활하셔서 죄와 사망과 사탄의 권세를 이기셨음을 믿습니다.',
            '주님이 영원히 살아 계시며, 아버지 앞에서 저의 유일한 중보자이시고, 오직 주님 안에서만 제가 죄 사함과 구원과 영생을 얻을 수 있음을 믿습니다.'
          ]
        },
        {
          heading: '주 예수님, 저는 주님 앞에서 죄인임을 고백합니다.',
          paragraphs: [
            '저는 생각과 말과 행위와 마땅히 행할 바를 행치 아니함으로 하나님께 죄를 범하였습니다. 주님의 진리와 계명을 저버리고 제 뜻대로 행한 적이 많았습니다.',
            '마음을 다하고 목숨을 다하고 뜻을 다하여 하나님을 온전히 사랑하지 못했습니다. 제 이웃을 제 몸과 같이 사랑하지 못했습니다.',
            '제 힘으로는 스스로를 결코 구원할 수 없음을 인정합니다. 저의 그 어떤 선행이나 종교적 의식, 노력이나 공로도 제 죄를 씻을 수 없으며 영원한 생명을 보장할 수 없습니다.',
            '더 이상 제 죄를 변명하거나 숨기려 하지 않겠습니다. 진심으로 죄를 뉘우치며 주님 앞에 고백합니다.'
          ]
        },
        {
          heading: '주 예수님, 죄인인 저를 불쌍히 여겨 주옵소서.',
          paragraphs: [
            '저의 모든 죄를 용서하여 주옵소서 — 알고 지은 죄와 모르고 지은 죄, 과거와 현재의 모든 죄를 사하여 주옵소서.',
            '십자가에서 흘리신 보배로운 피로 저를 정결하게 씻어 주옵소서.',
            '죄책감과 정죄에서 저를 자유케 하옵소서. 상한 제 마음을 치유하시고, 양심을 깨끗하게 하시며, 하늘 아버지와 저를 온전히 화목하게 하옵소서.',
            '죄에서 돌이키며 주님 없는 삶의 방식에서 떠납니다. 하나님으로부터 멀어지는 길을 더 이상 걷지 않기를 원합니다.',
            '제 마음을 변화시켜 주셔서 죄를 미워하고 의와 진리와 거룩함을 더욱 사랑하게 하옵소서.',
            '제 자신의 힘으로는 마땅히 살아야 할 바대로 살 수 없음을 압니다. 그러므로 오직 주님의 넘치는 은혜와 능력만을 전적으로 의지합니다.'
          ]
        },
        {
          heading: '주 예수님, 지금 이 순간 믿음으로 주님을 저의 유일한 주님이시며 개인의 구주로 영접합니다.',
          paragraphs: [
            '오직 주님만을 의지하며 십자가에서 완성하신 온전한 희생 제사만을 신뢰합니다.',
            '주님의 죽으심이 제 죄를 위한 완전한 대속이며, 주님의 부활이 제게 영생의 산 소망을 주는 승리임을 믿습니다.',
            '제 자신의 선함이나 행위, 종교적 열심에 구원의 소망을 두지 않습니다.',
            '<strong>오직 주님을 믿는 믿음으로 말미암아, 주님의 은혜로 거저 주시는 선물로서 구원을 받아들입니다.</strong>',
            '주님의 사랑을 행위로 살 필요 없이 감사함으로 영접할 수 있게 해 주시니 감사드립니다.',
            '주님께 나아오는 자를 결코 내쫓지 아니하시겠다는 신실한 약속을 믿습니다.',
            '그러므로 온전한 신뢰로 주님께 나아와 제 삶 전체를 주님께 의탁합니다.'
          ]
        },
        {
          heading: '예수 그리스도님, 주님을 저의 유일한 주, 왕, 구원자로 인정합니다.',
          paragraphs: [
            '더 이상 제 자신만을 위하여 살지 않겠습니다.',
            '저의 마음과 생각, 양심과 의지, 그리고 육신을 온전히 주님께 드립니다.',
            '저의 과거와 현재와 미래를 주님의 손에 맡깁니다.',
            '저의 계획과 꿈, 결정과 관계, 가족과 일터, 건강과 염려, 그리고 제 삶의 모든 영역을 주님께 맡겨 드립니다.',
            '저의 좋은 면도, 부끄러운 면도 다 주님께 드립니다. 저의 승리와 실패, 희망과 두려움까지 주님께 내려놓습니다.',
            '제 삶의 그 어떤 부분도 주님 앞에 남겨두지 않겠습니다.',
            '이제부터 주님이 제 마음의 첫 자리를 차지하여 주옵소서.',
            '제 생각과 말과 행동, 선택과 소원의 주인이 되어 주옵소서.',
            '주님을 부르기만 하는 자가 아니라 주님의 거룩한 뜻대로 순종하며 사는 법을 가르쳐 주옵소서.'
          ]
        },
        {
          heading: '하늘에 계신 아버지, 예수 그리스도의 이름으로 저를 자녀로 맞아 주옵소서.',
          paragraphs: [
            '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심에 감사드립니다.',
            '주님의 영적 가족에 속하여 주님의 임재 안에 살며 매일 주님을 더욱 깊이 알아가기를 소원합니다.'
          ]
        },
        {
          heading: '성령 하나님, 저를 거듭나게 하시고 제 마음 안에 내주하여 주옵소서.',
          paragraphs: [
            '새 마음과 거룩한 소원과 새로운 생명을 제게 부어 주옵소서.',
            '성경에 계시된 모든 진리 가운데로 저를 인도하여 주옵소서.',
            '하나님의 말씀을 깨닫도록 제 영의 눈을 여시고, 제 성품을 그리스도를 닮아가도록 빚어 주시며, 사랑과 겸손과 거룩함과 순종 가운데 살아가는 법을 가르쳐 주옵소서.',
            '유혹을 넉넉히 이기고 주님의 뜻에 거스르는 모든 것으로부터 떠날 수 있도록 도와주옵소서.',
            '혹여 넘어지더라도 절망 중에 주님을 떠나지 않게 하옵소서. 진실한 자백과 회개로 주님의 은혜를 다시 붙들도록 이끌어 주옵소서.',
            '주님이 저를 용서하신 것처럼 저 또한 다른 사람들을 용서하는 법을 가르쳐 주옵소서.',
            '주님의 사랑으로 사람들을 사랑하며 선을 행하고 주님의 진리의 신실한 증인이 되게 하옵소서.'
          ]
        },
        {
          heading: '주 예수님, 오늘부터 주님의 참된 제자가 되기를 결단합니다.',
          paragraphs: [
            '기도와 말씀 묵상, 주님과의 깊은 교제를 통해 날마다 주님을 더 깊이 알아가기를 원합니다.',
            '믿음 안에서 자라나며, 주님의 말씀 안에 거하고, 주님을 진심으로 사랑하며 주님의 계명을 지키는 신앙의 공동체에 함께하기를 원합니다.',
            '사람들 앞에서 제 믿음을 시인하고 주님의 명령을 따라 침례(세례)를 받기를 원합니다 — 회개와 옛사람의 죽음, 주님과 함께하는 새 생명의 시작을 증언하기 위함입니다.',
            '저의 순종이 결코 구원을 얻기 위한 공로가 아니라, 구원받은 믿음과 사랑에서 우러나오는 감사의 열매가 되게 하옵소서.'
          ]
        },
        {
          heading: '주 예수님, 지금 이 순간부터 저의 구원과 영원을 주님께 온전히 의탁합니다.',
          paragraphs: [
            '요동치는 제 감정이나 연약한 힘, 변하는 환경에 의지하지 않겠습니다.',
            '주님의 변치 않는 약속과 주님의 신실하심, 그리고 십자가의 완전한 제사만을 의지하겠습니다.',
            '주님의 은혜가 저의 모든 죄보다 측량할 수 없이 크심을 감사드립니다.',
            '주님 안에 용서와 하나님과의 화목, 새로운 생명과 부활의 복된 소망이 있음을 감사드립니다.',
            '주님을 통해 아버지께 담대히 나아갈 수 있고, 주님께서 하나님께 나아가는 자들을 위해 항상 살아 계셔서 간구해 주심을 감사드립니다.',
            '믿음 안에 굳게 서서 주님의 사랑 안에 거하며 끝까지 충성할 수 있도록 붙들어 주옵소서.',
            '영광스러운 주님의 다시 오심을 고대하며 살아가고, 주님 다시 오실 때에 기쁨으로 맞이하게 하옵소서.'
          ]
        },
        {
          heading: '신앙 고백과 온전한 헌신',
          isCulmination: true,
          paragraphs: [
            '<strong>주 예수 그리스도님, 주님은 저의 유일한 주님이시며 개인의 구원자이십니다.</strong>',
            '<strong>오직 주님께만 제 구원의 모든 소망을 둡니다.</strong>',
            '<strong>주님께 제 마음을 온전히 바칩니다.</strong>',
            '<strong>주님께 제 삶 전체를 맡겨 드립니다.</strong>',
            '<strong>주님께 제 영원을 의탁합니다.</strong>',
            '이제부터 제 삶이 온전히 주님의 것이 되어 주님의 거룩한 이름을 영화롭게 하옵소서.',
            '값없이 주시는 넘치는 은혜와 끝없는 사랑, 그리고 믿음으로 받는 귀한 구원의 선물에 감사드립니다.',
            '<strong>저의 유일한 주님이시며 구속자이시고 구주이신 예수 그리스도의 이름으로 온 마음을 다하여 기도드립니다.</strong>',
            '<strong class="prayer-amen">아멘.</strong>'
          ]
        }
      ],
      aftermath: {
        title: '진심으로 이 기도를 드린 사람이 알아야 할 것은 무엇인가?',
        lead: '가장 본질적인 진리는 이것입니다: <strong>기도 자체가 사람을 구원하는 것이 아니라, 오직 예수 그리스도께서 구원하십니다.</strong> 기도는 진실한 믿음의 표현이며 하나님의 은혜를 향한 마음의 응답입니다.',
        promisesTitle: '성경은 믿는 자에게 확고하고 변치 않는 약속을 주십니다:',
        promises: [
          '<strong>에베소서 2:8–9</strong> — 구원은 행위의 대가가 아니라 믿음으로 받는 하나님의 은혜의 선물입니다.',
          '<strong>로마서 10:9–10</strong> — 부활하신 그리스도를 마음에 믿고 입으로 주로 시인할 때 구원에 이릅니다.',
          '<strong>요한복음 1:12</strong> — 영접하는 자 곧 그 이름을 믿는 자들에게는 하나님의 자녀가 되는 권세를 주셨습니다.',
          '<strong>요한복음 6:37</strong> — 예수님은 약속하셨습니다: “내게 오는 자는 내가 결코 내쫓지 아니하리라.”',
          '<strong>요한일서 1:9</strong> — 만일 우리가 우리 죄를 자백하면 그는 미쁘시고 의로우사 우리 죄를 사하시며 우리를 모든 불의에서 깨끗하게 하실 것입니다.',
          '<strong>고린도후서 5:17</strong> — 그런즉 누구든지 그리스도 안에 있으면 새로운 피조물이라 이전 것은 지나갔으니 보라 새 것이 되었도다.',
          '<strong>사도행전 2:38</strong> — 복음에 대한 응답은 회개, 죄 사함을 받기 위한 예수 그리스도의 이름의 세례(침례), 그리고 성령의 선물을 받는 약속을 포함합니다.'
        ],
        truthTitle: '이 진리를 마음에 깊이 새기십시오',
        truthMain: '완벽한 기도를 읊었기 때문에 구원받은 것이 아닙니다. 당신이 충분히 착해서 구원받은 것도 아닙니다. 예수 그리스도께서 당신의 죄를 위해 죽으시고 다시 살아나셨기 때문에 구원이 가능한 것입니다. 당신은 오직 은혜로, 주님을 믿는 믿음으로 구원을 받았습니다.',
        truthSub: '참된 믿음은 회개와 새로운 삶, 사랑과 그리스도를 향한 순종으로 열매 맺습니다 — 구원을 사기 위한 값이 아니라 은혜에 대한 감사의 열매입니다 (에베소서 2:10; 요한복음 14:15).',
        truthQuote: '“내가 하나님의 아들의 이름을 믿는 너희에게 이것을 쓴 것은 너희로 하여금 너희에게 영생이 있음을 알게 하려 함이라.”',
        truthCite: '— 요한일서 5:13 (개역개정)'
      }
    }
  }
};

// Combine existing languages with new languages
const completeI18n = {
  ...EXISTING_I18N,
  ...newLangs
};

console.log('Total languages in combined dictionary:', Object.keys(completeI18n).length);
console.log('Languages:', Object.keys(completeI18n).join(', '));

// Generate the output file content
const outputContent = `/**
 * Christian Culture — Ewangelia Multilingual Translations (i18n)
 * 15 World Languages:
 * PL, EN, DE, UK, ES, RU, ZH, FR, PT, AR, HI, ID, IT, JA, KO
 */
export const EWANGELIA_I18N = ${JSON.stringify(completeI18n, null, 2)};

if (typeof window !== 'undefined') {
  window.EWANGELIA_I18N = EWANGELIA_I18N;
}
`;

fs.writeFileSync(path.resolve('Ewangelia/i18n.js'), outputContent, 'utf8');
console.log('Successfully wrote Ewangelia/i18n.js with 15 world languages!');
