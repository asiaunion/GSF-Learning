const fs = require('fs');

const appJsPath = '/Users/gsf/Workspace/nihongo-flashcard/app.js';
let content = fs.readFileSync(appJsPath, 'utf-8');

// The new curriculum JSON
const newCurriculum = {
  appTitle: "にほんご フラッシュカード",
  phases: [
    {
      id: "hiragana",
      title: "히라가나",
      type: "hiragana", 
      lessons: [
        {
          id: 1, title: "Lesson 1", row: "あ行",
          cards: [
            { character: "あ", word: "あり", wordReading: "あり", meaningKo: "개미", image: "images/realistic/ari_realistic.webp", highlightIndex: 0 },
            { character: "い", word: "いぬ", wordReading: "いぬ", meaningKo: "강아지", image: "images/realistic/inu_realistic.webp", highlightIndex: 0 },
            { character: "う", word: "うさぎ", wordReading: "うさぎ", meaningKo: "토끼", image: "images/realistic/usagi_realistic.webp", highlightIndex: 0 },
            { character: "え", word: "えんぴつ", wordReading: "えんぴつ", meaningKo: "연필", image: "images/realistic/enpitsu_realistic.webp", highlightIndex: 0 },
            { character: "お", word: "おにぎり", wordReading: "おにぎり", meaningKo: "주먹밥", image: "images/realistic/onigiri_realistic.webp", highlightIndex: 0 }
          ]
        },
        {
          id: 2, title: "Lesson 2", row: "か行",
          cards: [
            { character: "か", word: "かえる", wordReading: "かえる", meaningKo: "개구리", image: "images/realistic/kaeru_realistic.webp", highlightIndex: 0 },
            { character: "き", word: "きりん", wordReading: "きりん", meaningKo: "기린", image: "images/realistic/kirin_realistic.webp", highlightIndex: 0 },
            { character: "く", word: "くるま", wordReading: "くるま", meaningKo: "자동차", image: "images/realistic/kuruma_realistic.webp", highlightIndex: 0 },
            { character: "け", word: "けむし", wordReading: "けむし", meaningKo: "애벌레", image: "images/realistic/kemushi_realistic.webp", highlightIndex: 0 },
            { character: "こ", word: "こねこ", wordReading: "こねこ", meaningKo: "아기 고양이", image: "images/realistic/koneko_realistic.webp", highlightIndex: 0 }
          ]
        },
        {
          id: 3, title: "Lesson 3", row: "さ行",
          cards: [
            { character: "さ", word: "さかな", wordReading: "さかな", meaningKo: "물고기", image: "images/realistic/sakana_realistic.webp", highlightIndex: 0 },
            { character: "し", word: "しまうま", wordReading: "しまうま", meaningKo: "얼룩말", image: "images/realistic/shimauma_realistic.webp", highlightIndex: 0 },
            { character: "す", word: "すいか", wordReading: "すいか", meaningKo: "수박", image: "images/realistic/suika_realistic.webp", highlightIndex: 0 },
            { character: "せ", word: "せんせい", wordReading: "せんせい", meaningKo: "선생님", image: "images/realistic/sensei_realistic.webp", highlightIndex: 0 },
            { character: "そ", word: "そら", wordReading: "そら", meaningKo: "하늘", image: "images/realistic/sora_realistic.webp", highlightIndex: 0 }
          ]
        },
        {
          id: 4, title: "Lesson 4", row: "た行",
          cards: [
            { character: "た", word: "たまご", wordReading: "たまご", meaningKo: "달걀", image: "images/realistic/tamago_realistic.webp", highlightIndex: 0 },
            { character: "ち", word: "ちきゅう", wordReading: "ちきゅう", meaningKo: "지구", image: "images/realistic/chikyuu_realistic.webp", highlightIndex: 0 },
            { character: "つ", word: "つき", wordReading: "つき", meaningKo: "달", image: "images/realistic/tsuki_realistic.webp", highlightIndex: 0 },
            { character: "て", word: "てんとうむし", wordReading: "てんとうむし", meaningKo: "무당벌레", image: "images/realistic/tentoumushi_realistic.webp", highlightIndex: 0 },
            { character: "と", word: "とけい", wordReading: "とけい", meaningKo: "시계", image: "images/realistic/tokei_realistic.webp", highlightIndex: 0 }
          ]
        },
        {
          id: 5, title: "Lesson 5", row: "な行",
          cards: [
            { character: "な", word: "なす", wordReading: "なす", meaningKo: "가지", image: "images/realistic/nasu_realistic.webp", highlightIndex: 0 },
            { character: "に", word: "にじ", wordReading: "にじ", meaningKo: "무지개", image: "images/realistic/niji_realistic.webp", highlightIndex: 0 },
            { character: "ぬ", word: "ぬいぐるみ", wordReading: "ぬいぐるみ", meaningKo: "인형", image: "images/realistic/nuigurumi_realistic.webp", highlightIndex: 0 },
            { character: "ね", word: "ねこ", wordReading: "ねこ", meaningKo: "고양이", image: "images/realistic/neko_realistic.webp", highlightIndex: 0 },
            { character: "の", word: "のり", wordReading: "のり", meaningKo: "김", image: "images/realistic/nori_realistic.webp", highlightIndex: 0 }
          ]
        },
        {
          id: 6, title: "Lesson 6", row: "は行",
          cards: [
            { character: "は", word: "はち", wordReading: "はち", meaningKo: "꿀벌", image: "images/realistic/hachi_realistic.webp", highlightIndex: 0 },
            { character: "ひ", word: "ひこうき", wordReading: "ひこうき", meaningKo: "비행기", image: "images/realistic/hikouki_realistic.webp", highlightIndex: 0 },
            { character: "ふ", word: "ふね", wordReading: "ふね", meaningKo: "배", image: "images/realistic/fune_realistic.webp", highlightIndex: 0 },
            { character: "へ", word: "へび", wordReading: "へび", meaningKo: "뱀", image: "images/realistic/hebi_realistic.webp", highlightIndex: 0 },
            { character: "ほ", word: "ほし", wordReading: "ほし", meaningKo: "별", image: "images/realistic/hoshi_realistic.webp", highlightIndex: 0 }
          ]
        },
        {
          id: 7, title: "Lesson 7", row: "ま行",
          cards: [
            { character: "ま", word: "まど", wordReading: "まど", meaningKo: "창문", image: "images/realistic/mado_realistic.webp", highlightIndex: 0 },
            { character: "み", word: "みかん", wordReading: "みかん", meaningKo: "귤", image: "images/realistic/mikan_realistic.webp", highlightIndex: 0 },
            { character: "む", word: "むし", wordReading: "むし", meaningKo: "벌레", image: "images/realistic/mushi_realistic.webp", highlightIndex: 0 },
            { character: "め", word: "めがね", wordReading: "めがね", meaningKo: "안경", image: "images/realistic/megane_realistic.webp", highlightIndex: 0 },
            { character: "も", word: "もも", wordReading: "もも", meaningKo: "복숭아", image: "images/realistic/momo_realistic.webp", highlightIndex: 0 }
          ]
        },
        {
          id: 8, title: "Lesson 8", row: "ら行",
          cards: [
            { character: "ら", word: "らっぱ", wordReading: "らっぱ", meaningKo: "나팔", image: "images/realistic/rappa_realistic.webp", highlightIndex: 0 },
            { character: "り", word: "りんご", wordReading: "りんご", meaningKo: "사과", image: "images/realistic/ringo_realistic.webp", highlightIndex: 0 },
            { character: "る", word: "さる", wordReading: "さる", meaningKo: "원숭이", image: "images/realistic/saru_realistic.webp", highlightIndex: 1 },
            { character: "れ", word: "れいぞうこ", wordReading: "れいぞうこ", meaningKo: "냉장고", image: "images/realistic/reizouko_realistic.webp", highlightIndex: 0 },
            { character: "ろ", word: "ろうそく", wordReading: "ろうそく", meaningKo: "양초", image: "images/realistic/rousoku_realistic.webp", highlightIndex: 0 }
          ]
        },
        {
          id: 9, title: "Lesson 9", row: "や・わ行",
          cards: [
            { character: "や", word: "やま", wordReading: "やま", meaningKo: "산", image: "images/realistic/yama_realistic.webp", highlightIndex: 0 },
            { character: "ゆ", word: "ゆき", wordReading: "ゆき", meaningKo: "눈", image: "images/realistic/yuki_realistic.webp", highlightIndex: 0 },
            { character: "よ", word: "よる", wordReading: "よる", meaningKo: "밤", image: "images/realistic/yoru_realistic.webp", highlightIndex: 0 },
            { character: "わ", word: "わに", wordReading: "わに", meaningKo: "악어", image: "images/realistic/wani_realistic.webp", highlightIndex: 0 },
            { character: "ん", word: "ほん", wordReading: "ほん", meaningKo: "책", image: "images/realistic/hon_realistic.webp", highlightIndex: 1 }
          ]
        },
        {
          id: 10, title: "Lesson 10", row: "が行 (탁음)",
          cards: [
            { character: "が", word: "がっこう", wordReading: "がっこう", meaningKo: "학교", image: "images/realistic/gakkou_realistic.webp", highlightIndex: 0 },
            { character: "ぎ", word: "かぎ", wordReading: "かぎ", meaningKo: "열쇠", image: "images/realistic/kagi_realistic.webp", highlightIndex: 1 },
            { character: "ぐ", word: "もぐら", wordReading: "もぐら", meaningKo: "두더지", image: "images/realistic/mogura_realistic.webp", highlightIndex: 1 },
            { character: "げ", word: "ひげ", wordReading: "ひげ", meaningKo: "수염", image: "images/realistic/hige_realistic.webp", highlightIndex: 1 },
            { character: "ご", word: "ごはん", wordReading: "ごはん", meaningKo: "밥", image: "images/realistic/gohan_realistic.webp", highlightIndex: 0 }
          ]
        },
        {
          id: 11, title: "Lesson 11", row: "ざ行 (탁음)",
          cards: [
            { character: "ざ", word: "ざぶとん", wordReading: "ざぶとん", meaningKo: "방석", image: "images/realistic/zabuton_realistic.webp", highlightIndex: 0 },
            { character: "じ", word: "じてんしゃ", wordReading: "じてんしゃ", meaningKo: "자전거", image: "images/realistic/jitensha_realistic.webp", highlightIndex: 0 },
            { character: "ず", word: "ちず", wordReading: "ちず", meaningKo: "지도", image: "images/realistic/chizu_realistic.webp", highlightIndex: 1 },
            { character: "ぜ", word: "かぜ", wordReading: "かぜ", meaningKo: "바람", image: "images/realistic/kaze_realistic.webp", highlightIndex: 1 },
            { character: "ぞ", word: "ぞう", wordReading: "ぞう", meaningKo: "코끼리", image: "images/realistic/zou_realistic.webp", highlightIndex: 0 }
          ]
        },
        {
          id: 12, title: "Lesson 12", row: "だ行 (탁음)",
          cards: [
            { character: "だ", word: "だいこん", wordReading: "だいこん", meaningKo: "무", image: "images/realistic/daikon_realistic.webp", highlightIndex: 0 },
            { character: "ぢ", word: "はなぢ", wordReading: "はなぢ", meaningKo: "코피", image: "images/realistic/hanaji_realistic.webp", highlightIndex: 2 },
            { character: "づ", word: "みかづき", wordReading: "みかづき", meaningKo: "초승달", image: "images/realistic/mikazuki_realistic.webp", highlightIndex: 2 },
            { character: "で", word: "でんわ", wordReading: "でんわ", meaningKo: "전화", image: "images/realistic/denwa_realistic.webp", highlightIndex: 0 },
            { character: "ど", word: "どんぐり", wordReading: "どんぐり", meaningKo: "도토리", image: "images/realistic/donguri_realistic.webp", highlightIndex: 0 }
          ]
        },
        {
          id: 13, title: "Lesson 13", row: "ば行 (탁음)",
          cards: [
            { character: "ば", word: "ばら", wordReading: "ばら", meaningKo: "장미", image: "images/realistic/bara_realistic.webp", highlightIndex: 0 },
            { character: "び", word: "はなび", wordReading: "はなび", meaningKo: "불꽃놀이", image: "images/realistic/hanabi_realistic.webp", highlightIndex: 2 },
            { character: "ぶ", word: "ぶた", wordReading: "ぶた", meaningKo: "돼지", image: "images/realistic/buta_realistic.webp", highlightIndex: 0 },
            { character: "べ", word: "なべ", wordReading: "なべ", meaningKo: "냄비", image: "images/realistic/nabe_realistic.webp", highlightIndex: 1 },
            { character: "ぼ", word: "ぼうし", wordReading: "ぼうし", meaningKo: "모자", image: "images/realistic/boushi_realistic.webp", highlightIndex: 0 }
          ]
        },
        {
          id: 14, title: "Lesson 14", row: "ぱ行 (반탁음)",
          cards: [
            { character: "ぱ", word: "はっぱ", wordReading: "はっぱ", meaningKo: "나뭇잎", image: "images/realistic/happa_realistic.webp", highlightIndex: 2 },
            { character: "ぴ", word: "えんぴつ", wordReading: "えんぴつ", meaningKo: "연필", image: "images/realistic/enpitsu_realistic.webp", highlightIndex: 2 },
            { character: "ぷ", word: "てんぷら", wordReading: "てんぷら", meaningKo: "튀김", image: "images/realistic/tenpura_realistic.webp", highlightIndex: 2 },
            { character: "ぺ", word: "ほっぺた", wordReading: "ほっぺた", meaningKo: "뺨", image: "images/realistic/hoppeta_realistic.webp", highlightIndex: 2 },
            { character: "ぽ", word: "たんぽぽ", wordReading: "たんぽぽ", meaningKo: "민들레", image: "images/realistic/tanpopo_realistic.webp", highlightIndex: 2 }
          ]
        }
      ]
    },
    {
      id: "katakana",
      title: "가타카나",
      type: "katakana",
      lessons: [
        {
          id: 15, title: "Lesson 15", row: "ア行",
          cards: [
            { character: "ア", word: "アイス", wordReading: "アイス", meaningKo: "아이스크림", image: "images/realistic/aisu_realistic.webp", highlightIndex: 0 },
            { character: "イ", word: "インク", wordReading: "インク", meaningKo: "잉크", image: "images/realistic/inku_realistic.webp", highlightIndex: 0 },
            { character: "ウ", word: "ウクレレ", wordReading: "ウクレレ", meaningKo: "우쿨렐레", image: "images/realistic/ukurere_realistic.webp", highlightIndex: 0 },
            { character: "エ", word: "エプロン", wordReading: "エプロン", meaningKo: "앞치마", image: "images/realistic/epuron_realistic.webp", highlightIndex: 0 },
            { character: "オ", word: "オレンジ", wordReading: "オレンジ", meaningKo: "오렌지", image: "images/realistic/orenji_realistic.webp", highlightIndex: 0 }
          ]
        },
        {
          id: 16, title: "Lesson 16", row: "カ行",
          cards: [
            { character: "カ", word: "カメラ", wordReading: "カメラ", meaningKo: "카메라", image: "images/realistic/kamera_realistic.webp", highlightIndex: 0 },
            { character: "キ", word: "キウイ", wordReading: "キウイ", meaningKo: "키위", image: "images/realistic/kiui_realistic.webp", highlightIndex: 0 },
            { character: "ク", word: "クッキー", wordReading: "クッキー", meaningKo: "쿠키", image: "images/realistic/kukkii_realistic.webp", highlightIndex: 0 },
            { character: "ケ", word: "ケーキ", wordReading: "ケーキ", meaningKo: "케이크", image: "images/realistic/keeki_realistic.webp", highlightIndex: 0 },
            { character: "コ", word: "コップ", wordReading: "コップ", meaningKo: "컵", image: "images/realistic/koppu_realistic.webp", highlightIndex: 0 }
          ]
        },
        {
          id: 17, title: "Lesson 17", row: "サ行",
          cards: [
            { character: "サ", word: "サラダ", wordReading: "サラダ", meaningKo: "샐러드", image: "images/realistic/sarada_realistic.webp", highlightIndex: 0 },
            { character: "シ", word: "シャツ", wordReading: "シャツ", meaningKo: "셔츠", image: "images/realistic/shatsu_realistic.webp", highlightIndex: 0 },
            { character: "ス", word: "スプーン", wordReading: "スプーン", meaningKo: "스푼", image: "images/realistic/supuun_realistic.webp", highlightIndex: 0 },
            { character: "セ", word: "セーター", wordReading: "セーター", meaningKo: "스웨터", image: "images/realistic/seetaa_realistic.webp", highlightIndex: 0 },
            { character: "ソ", word: "ソーセージ", wordReading: "ソーセージ", meaningKo: "소시지", image: "images/realistic/sooseeji_realistic.webp", highlightIndex: 0 }
          ]
        },
        {
          id: 18, title: "Lesson 18", row: "タ行",
          cards: [
            { character: "タ", word: "タオル", wordReading: "タオル", meaningKo: "수건", image: "images/realistic/taoru_realistic.webp", highlightIndex: 0 },
            { character: "チ", word: "チーズ", wordReading: "チーズ", meaningKo: "치즈", image: "images/realistic/chiizu_realistic.webp", highlightIndex: 0 },
            { character: "ツ", word: "ツリー", wordReading: "ツリー", meaningKo: "트리", image: "images/realistic/tsurii_realistic.webp", highlightIndex: 0 },
            { character: "テ", word: "テント", wordReading: "テント", meaningKo: "텐트", image: "images/realistic/tento_realistic.webp", highlightIndex: 0 },
            { character: "ト", word: "トマト", wordReading: "トマト", meaningKo: "토마토", image: "images/realistic/tomato_realistic.webp", highlightIndex: 0 }
          ]
        },
        {
          id: 19, title: "Lesson 19", row: "ナ行",
          cards: [
            { character: "ナ", word: "ナイフ", wordReading: "ナイフ", meaningKo: "나이프", image: "images/realistic/naifu_realistic.webp", highlightIndex: 0 },
            { character: "ニ", word: "ニット", wordReading: "ニット", meaningKo: "니트", image: "images/realistic/nitto_realistic.webp", highlightIndex: 0 },
            { character: "ヌ", word: "ヌードル", wordReading: "ヌードル", meaningKo: "국수", image: "images/realistic/nuudoru_realistic.webp", highlightIndex: 0 },
            { character: "ネ", word: "ネクタイ", wordReading: "ネクタイ", meaningKo: "넥타이", image: "images/realistic/nekutai_realistic.webp", highlightIndex: 0 },
            { character: "ノ", word: "ノート", wordReading: "ノート", meaningKo: "공책", image: "images/realistic/nooto_realistic.webp", highlightIndex: 0 }
          ]
        },
        {
          id: 20, title: "Lesson 20", row: "ハ行",
          cards: [
            { character: "ハ", word: "ハム", wordReading: "ハム", meaningKo: "햄", image: "images/realistic/hamu_realistic.webp", highlightIndex: 0 },
            { character: "ヒ", word: "ヒーター", wordReading: "ヒーター", meaningKo: "히터", image: "images/realistic/hiitaa_realistic.webp", highlightIndex: 0 },
            { character: "フ", word: "フォーク", wordReading: "フォーク", meaningKo: "포크", image: "images/realistic/fooku_realistic.webp", highlightIndex: 0 },
            { character: "ヘ", word: "ヘリコプター", wordReading: "ヘリコプター", meaningKo: "헬리콥터", image: "images/realistic/herikoputaa_realistic.webp", highlightIndex: 0 },
            { character: "ホ", word: "ホース", wordReading: "ホース", meaningKo: "호스", image: "images/realistic/hoosu_realistic.webp", highlightIndex: 0 }
          ]
        },
        {
          id: 21, title: "Lesson 21", row: "マ行",
          cards: [
            { character: "マ", word: "マイク", wordReading: "マイク", meaningKo: "마이크", image: "images/realistic/maiku_realistic.webp", highlightIndex: 0 },
            { character: "ミ", word: "ミルク", wordReading: "ミルク", meaningKo: "우유", image: "images/realistic/miruku_realistic.webp", highlightIndex: 0 },
            { character: "ム", word: "ムース", wordReading: "ムース", meaningKo: "무스", image: "images/realistic/muusu_realistic.webp", highlightIndex: 0 },
            { character: "メ", word: "メロン", wordReading: "メロン", meaningKo: "멜론", image: "images/realistic/meron_realistic.webp", highlightIndex: 0 },
            { character: "モ", word: "モニター", wordReading: "モニター", meaningKo: "모니터", image: "images/realistic/monitaa_realistic.webp", highlightIndex: 0 }
          ]
        },
        {
          id: 22, title: "Lesson 22", row: "ラ行",
          cards: [
            { character: "ラ", word: "ライオン", wordReading: "ライオン", meaningKo: "사자", image: "images/realistic/raion_realistic.webp", highlightIndex: 0 },
            { character: "リ", word: "リボン", wordReading: "リボン", meaningKo: "리본", image: "images/realistic/ribon_realistic.webp", highlightIndex: 0 },
            { character: "ル", word: "ルビー", wordReading: "ルビー", meaningKo: "루비", image: "images/realistic/rubii_realistic.webp", highlightIndex: 0 },
            { character: "レ", word: "レモン", wordReading: "レモン", meaningKo: "레몬", image: "images/realistic/remon_realistic.webp", highlightIndex: 0 },
            { character: "ロ", word: "ロボット", wordReading: "ロボット", meaningKo: "로봇", image: "images/realistic/robotto_realistic.webp", highlightIndex: 0 }
          ]
        },
        {
          id: 23, title: "Lesson 23", row: "ヤ・ワ行",
          cards: [
            { character: "ヤ", word: "タイヤ", wordReading: "タイヤ", meaningKo: "타이어", image: "images/realistic/taiya_realistic.webp", highlightIndex: 2 },
            { character: "ユ", word: "ユニフォーム", wordReading: "ユニフォーム", meaningKo: "유니폼", image: "images/realistic/yunifoomu_realistic.webp", highlightIndex: 0 },
            { character: "ヨ", word: "ヨーヨー", wordReading: "ヨーヨー", meaningKo: "요요", image: "images/realistic/yooyoo_realistic.webp", highlightIndex: 0 },
            { character: "ワ", word: "ワイン", wordReading: "ワイン", meaningKo: "와인", image: "images/realistic/wain_realistic.webp", highlightIndex: 0 },
            { character: "ン", word: "パン", wordReading: "パン", meaningKo: "빵", image: "images/realistic/pan_realistic.webp", highlightIndex: 1 }
          ]
        },
        {
          id: 24, title: "Lesson 24", row: "ガ行 (탁음)",
          cards: [
            { character: "ガ", word: "ガラス", wordReading: "ガラス", meaningKo: "유리", image: "images/realistic/garasu_realistic.webp", highlightIndex: 0 },
            { character: "ギ", word: "ギター", wordReading: "ギター", meaningKo: "기타", image: "images/realistic/gitaa_realistic.webp", highlightIndex: 0 },
            { character: "グ", word: "グラス", wordReading: "グラス", meaningKo: "유리잔", image: "images/realistic/gurasu_realistic.webp", highlightIndex: 0 },
            { character: "ゲ", word: "ゲーム", wordReading: "ゲーム", meaningKo: "게임", image: "images/realistic/geemu_realistic.webp", highlightIndex: 0 },
            { character: "ゴ", word: "ゴリラ", wordReading: "ゴリラ", meaningKo: "고릴라", image: "images/realistic/gorira_realistic.webp", highlightIndex: 0 }
          ]
        },
        {
          id: 25, title: "Lesson 25", row: "ザ行 (탁음)",
          cards: [
            { character: "ザ", word: "ピザ", wordReading: "ピザ", meaningKo: "피자", image: "images/realistic/piza_realistic.webp", highlightIndex: 1 },
            { character: "ジ", word: "ラジオ", wordReading: "ラジオ", meaningKo: "라디오", image: "images/realistic/rajio_realistic.webp", highlightIndex: 1 },
            { character: "ズ", word: "ズボン", wordReading: "ズボン", meaningKo: "바지", image: "images/realistic/zubon_realistic.webp", highlightIndex: 0 },
            { character: "ゼ", word: "ゼリー", wordReading: "ゼリー", meaningKo: "젤리", image: "images/realistic/zerii_realistic.webp", highlightIndex: 0 },
            { character: "ゾ", word: "パズル", wordReading: "パズル", meaningKo: "퍼즐", image: "images/realistic/pazuru_realistic.webp", highlightIndex: 1 }
          ]
        },
        {
          id: 26, title: "Lesson 26", row: "ダ行 (탁음)",
          cards: [
            { character: "ダ", word: "ダンス", wordReading: "ダンス", meaningKo: "춤", image: "images/realistic/dansu_realistic.webp", highlightIndex: 0 },
            { character: "デ", word: "デスク", wordReading: "デスク", meaningKo: "책상", image: "images/realistic/desuku_realistic.webp", highlightIndex: 0 },
            { character: "ド", word: "ドア", wordReading: "ドア", meaningKo: "문", image: "images/realistic/doa_realistic.webp", highlightIndex: 0 }
          ]
        },
        {
          id: 27, title: "Lesson 27", row: "バ行 (탁음)",
          cards: [
            { character: "バ", word: "バス", wordReading: "バス", meaningKo: "버스", image: "images/realistic/basu_realistic.webp", highlightIndex: 0 },
            { character: "ビ", word: "ビル", wordReading: "ビル", meaningKo: "빌딩", image: "images/realistic/biru_realistic.webp", highlightIndex: 0 },
            { character: "ブ", word: "ブロック", wordReading: "ブロック", meaningKo: "블록", image: "images/realistic/burokku_realistic.webp", highlightIndex: 0 },
            { character: "ベ", word: "ベッド", wordReading: "ベッド", meaningKo: "침대", image: "images/realistic/beddo_realistic.webp", highlightIndex: 0 },
            { character: "ボ", word: "ボタン", wordReading: "ボタン", meaningKo: "버튼", image: "images/realistic/botan_realistic.webp", highlightIndex: 0 }
          ]
        },
        {
          id: 28, title: "Lesson 28", row: "パ行 (반탁음)",
          cards: [
            { character: "パ", word: "パソコン", wordReading: "パソコン", meaningKo: "컴퓨터", image: "images/realistic/pasokon_realistic.webp", highlightIndex: 0 },
            { character: "ピ", word: "ピアノ", wordReading: "ピアノ", meaningKo: "피아노", image: "images/realistic/piano_realistic.webp", highlightIndex: 0 },
            { character: "プ", word: "プール", wordReading: "プール", meaningKo: "수영장", image: "images/realistic/puuru_realistic.webp", highlightIndex: 0 },
            { character: "ペ", word: "ペンギン", wordReading: "ペンギン", meaningKo: "펭귄", image: "images/realistic/pengin_realistic.webp", highlightIndex: 0 },
            { character: "ポ", word: "ポスト", wordReading: "ポスト", meaningKo: "우체통", image: "images/realistic/posuto_realistic.webp", highlightIndex: 0 }
          ]
        }
      ]
    }
  ]
};

const newContent = content.replace(/const CURRICULUM = \{[\s\S]*?\};\n\nclass FlashcardApp/, 'const CURRICULUM = ' + JSON.stringify(newCurriculum, null, 2) + ';\n\nclass FlashcardApp');

fs.writeFileSync(appJsPath, newContent);
console.log('Successfully updated app.js with expanded curriculum!');
