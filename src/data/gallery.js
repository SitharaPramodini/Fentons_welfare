/* ===========================================================================
 * GALLERY
 *
 * Real photographs from society events, stored in  src/assets/events/
 *
 * HOW TO ADD MORE
 * ---------------
 * 1. Put the image file in  src/assets/events/  with a descriptive name -
 *    or, for a single occasion with a set of its own, a folder beside it
 *    (as  src/assets/diwali/  holds the Deepawali photographs).
 * 2. Import it at the top of this file.
 * 3. Add an entry below with that import as `src`.
 *
 * The array order is the order the tiles appear in, so the most recent
 * occasion leads; the `id` values are only keys and need not be in order.
 *
 * If `src` is left null, the tile falls back to an on-brand gradient
 * placeholder with its title and icon, so the grid never looks broken.
 * =========================================================================== */

/* --- Deepawali ----------------------------------------------------------- */
import diwaliGroupPhoto from "@/assets/diwali/diwali-group-photo.jpg";
import diwaliShrine from "@/assets/diwali/diwali-shrine.jpg";
import diwaliWelcomeTray from "@/assets/diwali/diwali-welcome-tray.jpg";
import diwaliNadaswaram from "@/assets/diwali/diwali-nadaswaram.jpg";
import diwaliOilLamps from "@/assets/diwali/diwali-oil-lamps.jpg";
import diwaliBlessing from "@/assets/diwali/diwali-blessing.jpg";
import diwaliShawls from "@/assets/diwali/diwali-shawls.jpg";
import diwaliPottu from "@/assets/diwali/diwali-pottu.jpg";

/* --- Ramadan Iftar ------------------------------------------------------- */
import iftarGroupPhoto from "@/assets/events/iftar-group-photo.jpg";
import iftarLongTable from "@/assets/events/iftar-long-table.jpg";
import iftarColleagues from "@/assets/events/iftar-colleagues.jpg";
import iftarTableSetting from "@/assets/events/iftar-table-setting.jpg";
import iftarTableScreen from "@/assets/events/iftar-table-screen.jpg";

/* --- Women's Day --------------------------------------------------------- */
import womensDayPerformance from "@/assets/events/womens-day-performance.jpg";
import womensDayHall from "@/assets/events/womens-day-hall.jpg";
import womensDayGift from "@/assets/events/womens-day-gift.jpg";
import womensDayAudience from "@/assets/events/womens-day-audience.jpg";
import womensDaySpeakers from "@/assets/events/womens-day-speakers.jpg";
import womensDayEntertainer from "@/assets/events/womens-day-entertainer.jpg";
import womensDayPortrait from "@/assets/events/womens-day-portrait.jpg";

/* --- Cricket ------------------------------------------------------------- */
import cricketWinnersCheque from "@/assets/events/cricket-winners-cheque.jpg";
import cricketBatting from "@/assets/events/cricket-batting.jpg";
import cricketWomensTrophy from "@/assets/events/cricket-womens-trophy.jpg";
import cricketTeamSelfie from "@/assets/events/cricket-team-selfie.jpg";
import cricketWicketCelebration from "@/assets/events/cricket-wicket-celebration.jpg";
import cricketPlayers from "@/assets/events/cricket-players.jpg";

/* --- Netball & sports day ------------------------------------------------ */
import netballTeam from "@/assets/events/netball-team.jpg";
import netballChampionship from "@/assets/events/netball-championship.jpg";
import sportsDayTeam from "@/assets/events/sports-day-team.jpg";
import sportsDayMensTeam from "@/assets/events/sports-day-mens-team.jpg";

export const galleryCategories = ["All", "Sports", "Celebrations", "Community"];

/* ---------------------------------------------------------------------------
 * The most recent occasion, shown above the grid.
 *
 * Past tense on purpose: this page records what has taken place, and the
 * Constitution sets no events calendar. When the next activity is held,
 * replace this block - or set it to null and the strip disappears.
 * ------------------------------------------------------------------------ */

export const latestActivity = {
  eyebrow: "Most recent",
  title: "Deepawali 2026",
  lead: "An evening of festivity, laughter and togetherness, celebrating the joy and traditions of Deepawali. Colleagues came in festive traditional dress - sarees and kurtas, and veshti for the men - and the mehendi corner drew a queue all afternoon.",
  image: diwaliGroupPhoto,
  facts: [
    { icon: "CalendarCheck", label: "Held on", value: "16 November 2026" },
    { icon: "Clock", label: "Time", value: "3.30 - 4.30 p.m." },
    { icon: "MapPin", label: "Where", value: "Main Lobby" },
  ],
};

export const gallery = [
  /* Deepawali, 16 November 2026 - the most recent occasion, so it leads. */
  {
    id: "d1",
    src: diwaliGroupPhoto,
    title: "Deepawali at head office - everyone together",
    category: "Celebrations",
    year: "2026",
    icon: "Users",
    tone: "amber",
    span: "wide",
  },
  {
    id: "d2",
    src: diwaliShrine,
    title: "The shrine, garlanded for Deepawali",
    category: "Celebrations",
    year: "2026",
    icon: "Flower2",
    tone: "rose",
    span: "normal",
  },
  {
    id: "d3",
    src: diwaliWelcomeTray,
    title: "The traditional welcome at the door",
    category: "Celebrations",
    year: "2026",
    icon: "HeartHandshake",
    tone: "emerald",
    span: "normal",
  },
  {
    id: "d4",
    src: diwaliNadaswaram,
    title: "Nadaswaram and drums lead the way in",
    category: "Celebrations",
    year: "2026",
    icon: "Music",
    tone: "violet",
    span: "wide",
  },
  {
    id: "d5",
    src: diwaliOilLamps,
    title: "Oil lamps and the poojah table, ready for the lighting",
    category: "Celebrations",
    year: "2026",
    icon: "Flame",
    tone: "amber",
    span: "normal",
  },
  {
    id: "d6",
    src: diwaliBlessing,
    title: "A blessing as the guests arrive",
    category: "Celebrations",
    year: "2026",
    icon: "Sparkles",
    tone: "rose",
    span: "normal",
  },
  {
    id: "d7",
    src: diwaliShawls,
    title: "Shawls for the team at the entrance",
    category: "Celebrations",
    year: "2026",
    icon: "Users",
    tone: "cyan",
    span: "normal",
  },
  {
    id: "d8",
    src: diwaliPottu,
    title: "Marking the forehead before the ceremony begins",
    category: "Celebrations",
    year: "2026",
    icon: "Heart",
    tone: "violet",
    span: "normal",
  },

  {
    id: "g1",
    src: iftarGroupPhoto,
    title: "Iftar at head office - everyone together",
    category: "Community",
    year: "2026",
    icon: "Users",
    tone: "amber",
    span: "wide", // wide | tall | normal - controls the masonry footprint
  },
  {
    id: "g2",
    src: womensDayPerformance,
    title: "Women's Day - the live band gets everyone up",
    category: "Celebrations",
    year: "2026",
    icon: "Music",
    tone: "violet",
    span: "normal",
  },
  {
    id: "g3",
    src: cricketWinnersCheque,
    title: "Six-a-side cricket - the squad with the winners' cheque",
    category: "Sports",
    year: "2026",
    icon: "Trophy",
    tone: "amber",
    span: "wide",
  },
  {
    id: "g4",
    src: netballTeam,
    title: "The netball team before the first whistle",
    category: "Sports",
    year: "2026",
    icon: "Target",
    tone: "sky",
    span: "tall",
  },
  {
    id: "g5",
    src: iftarLongTable,
    title: "Breaking the fast together in the auditorium",
    category: "Community",
    year: "2026",
    icon: "HeartHandshake",
    tone: "amber",
    span: "wide",
  },
  {
    id: "g6",
    src: womensDayHall,
    title: "A full house for the Women's Day programme",
    category: "Celebrations",
    year: "2026",
    icon: "PartyPopper",
    tone: "violet",
    span: "normal",
  },
  {
    id: "g7",
    src: cricketBatting,
    title: "Clearing the ropes in the six-a-side",
    category: "Sports",
    year: "2026",
    icon: "Zap",
    tone: "emerald",
    span: "normal",
  },
  {
    id: "g8",
    src: womensDayGift,
    title: "Women's Day gifts for every member",
    category: "Celebrations",
    year: "2026",
    icon: "Gift",
    tone: "rose",
    span: "normal",
  },
  {
    id: "g9",
    src: sportsDayTeam,
    title: "The full Fentons squad at Moors Sports Club",
    category: "Sports",
    year: "2026",
    icon: "Users",
    tone: "sky",
    span: "wide",
  },
  {
    id: "g10",
    src: cricketWomensTrophy,
    title: "The women's team collect their trophy",
    category: "Sports",
    year: "2026",
    icon: "Award",
    tone: "violet",
    span: "normal",
  },
  {
    id: "g11",
    src: womensDayAudience,
    title: "Applause from the floor on Women's Day",
    category: "Celebrations",
    year: "2026",
    icon: "Sparkles",
    tone: "rose",
    span: "normal",
  },
  {
    id: "g12",
    src: iftarColleagues,
    title: "Colleagues at the Iftar table",
    category: "Community",
    year: "2026",
    icon: "CookingPot",
    tone: "emerald",
    span: "normal",
  },
  {
    id: "g13",
    src: netballChampionship,
    title: "Spirit of Victory - the netball championship squad",
    category: "Sports",
    year: "2026",
    icon: "Medal",
    tone: "amber",
    span: "normal",
  },
  {
    id: "g14",
    src: cricketTeamSelfie,
    title: "The team selfie after the final",
    category: "Sports",
    year: "2026",
    icon: "Camera",
    tone: "cyan",
    span: "normal",
  },
  {
    id: "g15",
    src: womensDaySpeakers,
    title: "Singing along at the Women's Day celebration",
    category: "Celebrations",
    year: "2026",
    icon: "Music",
    tone: "violet",
    span: "normal",
  },
  {
    id: "g16",
    src: sportsDayMensTeam,
    title: "Flying the flag on sports day",
    category: "Sports",
    year: "2026",
    icon: "Medal",
    tone: "emerald",
    span: "tall",
  },
  {
    id: "g17",
    src: cricketWicketCelebration,
    title: "Celebrating a wicket",
    category: "Sports",
    year: "2026",
    icon: "Trophy",
    tone: "sky",
    span: "normal",
  },
  {
    id: "g18",
    src: iftarTableSetting,
    title: "The Iftar table, set and waiting",
    category: "Community",
    year: "2026",
    icon: "CookingPot",
    tone: "amber",
    span: "normal",
  },
  {
    id: "g19",
    src: womensDayEntertainer,
    title: "The entertainer works the room",
    category: "Celebrations",
    year: "2026",
    icon: "Music",
    tone: "rose",
    span: "normal",
  },
  {
    id: "g20",
    src: cricketPlayers,
    title: "Waiting to bowl in the afternoon heat",
    category: "Sports",
    year: "2026",
    icon: "Target",
    tone: "amber",
    span: "normal",
  },
  {
    id: "g21",
    src: womensDayPortrait,
    title: "A moment for a photograph on Women's Day",
    category: "Celebrations",
    year: "2026",
    icon: "Heart",
    tone: "violet",
    span: "normal",
  },
  {
    id: "g22",
    src: iftarTableScreen,
    title: "Dessert and quiet conversation at Iftar",
    category: "Community",
    year: "2026",
    icon: "CookingPot",
    tone: "cyan",
    span: "normal",
  },
];
