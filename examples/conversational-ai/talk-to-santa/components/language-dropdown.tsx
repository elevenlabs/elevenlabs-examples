"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const LANGUAGES = [
  {
    code: "en",
    name: "English",
    firstSentence:
      "Ho, ho, ho! Merry Christmas, my friend. Tell me, what is your name?",
  },
  {
    code: "ar",
    name: "Arabic",
    firstSentence: "هو، هو، هو! عيد ميلاد مجيد يا صديقي. قل لي، ما اسمك؟",
  },
  {
    code: "bg",
    name: "Bulgarian",
    firstSentence:
      "Хо, хо, хо! Весела Коледа, приятелю. Кажи ми, как се казваш?",
  },
  {
    code: "zh",
    name: "Chinese",
    firstSentence: "呵呵呵！圣诞快乐，我的朋友。告诉我，你叫什么名字？",
  },
  {
    code: "hr",
    name: "Croatian",
    firstSentence:
      "Ho, ho, ho! Sretan Božić, prijatelju. Reci mi, kako se zoveš?",
  },
  {
    code: "cs",
    name: "Czech",
    firstSentence:
      "Ho, ho, ho! Veselé Vánoce, příteli. Řekni mi, jak se jmenuješ?",
  },
  {
    code: "da",
    name: "Danish",
    firstSentence:
      "Ho, ho, ho! Glædelig jul, min ven. Fortæl mig, hvad er dit navn?",
  },
  {
    code: "nl",
    name: "Dutch",
    firstSentence:
      "Ho, ho, ho! Vrolijk kerstfeest, mijn vriend. Vertel me, wat is je naam?",
  },
  {
    code: "fi",
    name: "Finnish",
    firstSentence:
      "Ho, ho, ho! Hyvää joulua, ystäväni. Kerro minulle, mikä sinun nimesi on?",
  },
  {
    code: "fr",
    name: "French",
    firstSentence:
      "Ho, ho, ho ! Joyeux Noël, mon ami. Dis-moi, quel est ton nom ?",
  },
  {
    code: "de",
    name: "German",
    firstSentence:
      "Ho, ho, ho! Frohe Weihnachten, mein Freund. Sag mir, wie heißt du?",
  },
  {
    code: "el",
    name: "Greek",
    firstSentence:
      "Χο, χο, χο! Καλά Χριστούγεννα, φίλε μου. Πες μου, πώς σε λένε;",
  },
  {
    code: "hi",
    name: "Hindi",
    firstSentence:
      "हो, हो, हो! मेरी क्रिसमस, मेरे दोस्त। मुझे बताओ, तुम्हारा नाम क्या है?",
  },
  {
    code: "hu",
    name: "Hungarian",
    firstSentence: "Ho, ho, ho! Boldog karácsonyt, barátom. Mondd, mi a neved?",
  },
  {
    code: "id",
    name: "Indonesian",
    firstSentence:
      "Ho, ho, ho! Selamat Natal, temanku. Katakan padaku, siapa namamu?",
  },
  {
    code: "it",
    name: "Italian",
    firstSentence: "Ho, ho, ho! Buon Natale, amico mio. Dimmi, come ti chiami?",
  },
  {
    code: "ja",
    name: "Japanese",
    firstSentence:
      "ホーホーホー！メリークリスマス、私の友よ。教えて、お名前は何ですか？",
  },
  {
    code: "ko",
    name: "Korean",
    firstSentence:
      "호, 호, 호! 메리 크리스마스, 내 친구야. 말해줘, 네 이름이 뭐니?",
  },
  {
    code: "ms",
    name: "Malay",
    firstSentence:
      "Ho, ho, ho! Selamat Hari Natal, kawan. Beritahu saya, siapa nama awak?",
  },
  {
    code: "no",
    name: "Norwegian",
    firstSentence: "Ho, ho, ho! God jul, min venn. Fortell meg, hva heter du?",
  },
  {
    code: "pl",
    name: "Polish",
    firstSentence:
      "Ho, ho, ho! Wesołych Świąt, mój przyjacielu. Powiedz mi, jak masz na imię?",
  },
  {
    code: "pt",
    name: "Portuguese",
    firstSentence:
      "Ho, ho, ho! Feliz Natal, meu amigo. Diga-me, qual é o seu nome?",
  },
  {
    code: "ro",
    name: "Romanian",
    firstSentence:
      "Ho, ho, ho! Crăciun fericit, prietenul meu. Spune-mi, cum te cheamă?",
  },
  {
    code: "ru",
    name: "Russian",
    firstSentence:
      "Хо, хо, хо! С Рождеством, мой друг. Скажи мне, как тебя зовут?",
  },
  {
    code: "sk",
    name: "Slovak",
    firstSentence:
      "Ho, ho, ho! Veselé Vianoce, priateľ môj. Povedz mi, ako sa voláš?",
  },
  {
    code: "es",
    name: "Spanish",
    firstSentence:
      "¡Jo, jo, jo! Feliz Navidad, mi amigo. Dime, ¿cómo te llamas?",
  },
  {
    code: "sv",
    name: "Swedish",
    firstSentence: "Ho, ho, ho! God jul, min vän. Säg mig, vad heter du?",
  },
  {
    code: "ta",
    name: "Tamil",
    firstSentence:
      "ஹோ, ஹோ, ஹோ! கிறிஸ்துமஸ் வாழ்த்துக்கள், என் நண்பரே. சொல்லுங்கள், உங்கள் பெயர் என்ன?",
  },
  {
    code: "tr",
    name: "Turkish",
    firstSentence: "Ho, ho, ho! Mutlu Noeller, dostum. Söyle bakalım, adın ne?",
  },
  {
    code: "uk",
    name: "Ukrainian",
    firstSentence:
      "Хо, хо, хо! З Різдвом, мій друже. Скажи мені, як тебе звати?",
  },
  {
    code: "vi",
    name: "Vietnamese",
    firstSentence:
      "Ho, ho, ho! Giáng sinh vui vẻ, bạn của tôi. Hãy cho tôi biết, tên bạn là gì?",
  },
];

interface LanguageDropdownProps {
  setLanguage: (language: string) => void;
  language: string | null;
  languages: typeof LANGUAGES;
}

export function LanguageDropdown({
  setLanguage,
  language,
  languages,
}: LanguageDropdownProps) {
  const currentLanguage = languages.find(lang => lang.code === language)?.name;

  return (
    <div
      className="h-10 opacity-0 transition-opacity duration-300 ease-in-out"
      style={{ opacity: language ? 1 : 0 }}
    >
      {language && (
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-[180px] transition-colors">
            <SelectValue placeholder="Select Language">
              {currentLanguage}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {languages.map(lang => (
              <SelectItem
                key={lang.code}
                value={lang.code}
                className="hover:bg-red-100 focus:bg-red-100 cursor-pointer"
              >
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
