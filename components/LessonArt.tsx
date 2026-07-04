"use client";

// Classic public-domain gospel artwork, one painting per Come, Follow Me week.
// Files live in /public/art (downloaded from Wikimedia Commons at 1200px);
// see /public/art/ATTRIBUTION.md for sources. Ships with the app — no network
// dependency (GOSPEL.md principle 4).

export type Artwork = { title: string; artist: string; file: string };

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const A = (title: string, artist: string, week: number, ext = "jpg"): Artwork => ({
  title,
  artist,
  file: `${BASE_PATH}/art/week-${String(week).padStart(2, "0")}.${ext}`,
});

export const ARTWORKS: Record<number, Artwork> = {
  1: A("Moses with the Tablets of the Law", "Rembrandt", 1),
  2: A("The Creation of Adam", "Michelangelo", 2),
  3: A("The Creation of Light", "John Martin", 3),
  4: A("Expulsion from the Garden of Eden", "Thomas Cole", 4),
  5: A("The Eve of the Deluge", "John Martin", 5),
  6: A("The Plains of Heaven", "John Martin", 6),
  7: A("Noah's Ark", "Edward Hicks", 7),
  8: A("Journey of the Family of Abraham", "Giovanni Benedetto Castiglione", 8),
  9: A("The Sacrifice of Isaac", "Rembrandt", 9),
  10: A("Jacob's Dream", "Jusepe de Ribera", 10),
  11: A("Joseph and his Brothers", "Abraham Bloemaert", 11),
  12: A("Joseph and His Brethren Welcomed by Pharaoh", "James Tissot", 12),
  13: A("Moses in the Bulrushes", "Elizabeth Jane Gardner", 13),
  14: A("The Resurrection", "Carl Bloch", 14),
  15: A("The Departure of the Israelites", "David Roberts", 15),
  16: A("The Destruction of Pharaoh's Host", "John Martin", 16),
  17: A("Moses with the Ten Commandments", "Philippe de Champaigne", 17),
  18: A("Moses and Joshua in the Tabernacle", "James Tissot", 18),
  19: A("The Brazen Serpent", "Peter Paul Rubens", 19),
  20: A("Moses Sees the Promised Land from Afar", "James Tissot", 20),
  21: A("Joshua Commanding the Sun to Stand Still", "John Martin", 21),
  22: A("Samson and Delilah", "Peter Paul Rubens", 22),
  23: A("Ruth and Naomi", "Philip Hermogenes Calderon", 23),
  24: A("The Anointment of David", "Paolo Veronese", 24),
  25: A("David and Goliath", "Osmar Schindler", 25),
  26: A("The Judgment of Solomon", "Nicolas Poussin", 26),
  27: A("Elijah in the Desert", "Washington Allston", 27),
  28: A("Elijah Taken Up in a Chariot of Fire", "Giuseppe Angeli", 28),
  29: A("The Flight of the Prisoners", "James Tissot", 29),
  30: A("The Israelites Slaughter the Syrians", "Gustave Doré", 30),
  31: A("Nehemiah Views the Ruins of Jerusalem's Walls", "Gustave Doré", 31),
  32: A("Esther before Ahasuerus", "Artemisia Gentileschi", 32),
  33: A("Job and his Friends", "Ilya Repin", 33),
  34: A("King David Playing the Harp", "Gerard van Honthorst", 34),
  35: A("Saul and David", "Rembrandt", 35),
  36: A("David Playing the Harp", "Jan de Bray", 36),
  37: A("King Solomon in Old Age", "Gustave Doré", 37),
  38: A("Isaiah", "Michelangelo", 38),
  39: A("The Prophet Isaiah", "Raphael", 39),
  40: A("Peaceable Kingdom", "Edward Hicks", 40),
  41: A("The Prophet Isaiah", "Gustave Doré", 41),
  42: A("The Prophet Isaiah", "Giovanni Battista Tiepolo", 42),
  43: A("Jeremiah Lamenting the Destruction of Jerusalem", "Rembrandt", 43),
  44: A("Baruch Writes Jeremiah's Prophecies", "Gustave Doré", 44),
  45: A("Ezekiel's Vision of the Valley of Dry Bones", "Gustave Doré", 45),
  46: A("Daniel in the Lions' Den", "Briton Rivière", 46),
  47: A("The Infant Samuel at Prayer", "Sir Joshua Reynolds", 47),
  48: A("Jonah and the Whale", "Pieter Lastman", 48),
  49: A("The Fall of Nineveh", "John Martin", 49),
  50: A("The Rebuilding of the Temple Is Begun", "Gustave Doré", 50),
  51: A("The Prophet Malachi", "Duccio di Buoninsegna", 51),
  52: A("The Shepherds and the Angel", "Carl Bloch", 52),
};

export function artworkFor(week: number): Artwork {
  return ARTWORKS[week] ?? ARTWORKS[1];
}

export default function LessonArt({
  week,
  className,
}: {
  week: number;
  className?: string;
}) {
  const art = artworkFor(week);
  return (
    <img
      src={art.file}
      alt={`“${art.title}” by ${art.artist}`}
      title={`“${art.title}” by ${art.artist}`}
      loading="lazy"
      className={`block object-cover ${className ?? ""}`}
    />
  );
}
