import { Song } from "@/lib/types";

// Starter set — chord charts only (chord letters over lyric lines), no audio.
// Every chord used here is drawn from the A / E / Em / G / C / D family, or is
// one semitone-shift away from it (the app will surface that shift automatically).
// Add more over time by hand, or via the AI ingestion workflow described in the README.

export const SONGS: Song[] = [
  {
    id: "tujhe-dekha-to",
    title: "Tujhe Dekha To",
    singers: ["Lata Mangeshkar", "Kumar Sanu"],
    movie: "Dilwale Dulhania Le Jayenge",
    year: 1995,
    language: "Hindi",
    youtubeId: "aiOqzE_pJIU",
    chart: [
      "[G]Tujhe dekha to [D]yeh jaana sanam,",
      "[Em]Pyaar hota hai [C]deewana sanam",
      "[G]Ab yahan se [D]kahan jaayen hum,",
      "[Em]Teri baahon mein [C]mar jaayen hum",
    ],
    tags: ["romantic", "classic", "wedding"],
    addedVia: "seed",
  },
  {
    id: "kal-ho-naa-ho",
    title: "Kal Ho Naa Ho",
    singers: ["Sonu Nigam"],
    movie: "Kal Ho Naa Ho",
    year: 2003,
    language: "Hindi",
    youtubeId: "gjmVSfeGKlE",
    chart: [
      "[C]Har ghadi badal rahi hai [G]roop zindagi,",
      "[Am]Chhaanv kabhi [Em]dhoop zindagi",
      "[F]Har pal yahan jee bhar jiyo,",
      "[C]Jo hai [G]samaa [C]kal ho na ho",
    ],
    tags: ["emotional"],
    addedVia: "seed",
  },
  {
    id: "yeh-dosti",
    title: "Yeh Dosti",
    singers: ["Kishore Kumar", "Manna Dey"],
    movie: "Sholay",
    year: 1975,
    language: "Hindi",
    youtubeId: "qKUX3vjZHQ0",
    chart: [
      "[G]Yeh dosti hum [C]nahi todenge,",
      "[G]Todenge dum [D]magar,",
      "[Em]Teraa saath na [C]chhodenge",
      "[G]Yeh dosti hum [D]nahi [G]todenge",
    ],
    tags: ["friendship", "classic", "70s"],
    addedVia: "seed",
  },
  {
    id: "tum-hi-ho",
    title: "Tum Hi Ho",
    singers: ["Arijit Singh"],
    movie: "Aashiqui 2",
    year: 2013,
    language: "Hindi",
    youtubeId: "IJq0yyWug1k",
    chart: [
      "[Am]Hum tere bin ab [F]reh nahi sakte,",
      "[C]Tere bina kya [G]wajood mera",
      "[Am]Tum hi ho, [F]tum hi ho,",
      "[C]Tum hi ho, [G]ab tum hi ho",
    ],
    tags: ["romantic", "capo-needed"],
    addedVia: "seed",
  },
  {
    id: "ye-shaam-mastani",
    title: "Ye Shaam Mastani",
    singers: ["Kishore Kumar"],
    movie: "Kati Patang",
    year: 1970,
    language: "Hindi",
    youtubeId: "0v1p2f4kA4E",
    chart: [
      "[G]Ye shaam mastani, [D]madhosh kiye [G]jaaye,",
      "[C]Mujhe doob [G]jaane do,",
      "[D]Ae shaam mastani [G]doob jaane do",
    ],
    tags: ["classic", "70s"],
    addedVia: "seed",
  },
];
