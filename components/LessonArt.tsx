"use client";

import { useState } from "react";

interface Artwork {
  title: string;
  artist: string;
  filename: string;
}

function commonsImage(filename: string) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=960`;
}

const ARTWORKS: Record<number, Artwork> = {
  1: {
    title: "Moses with the Tablets of the Law",
    artist: "Rembrandt",
    filename: "Rembrandt_-_Moses_with_the_Ten_Commandments_-_Google_Art_Project.jpg",
  },
  2: {
    title: "The Creation of Adam",
    artist: "Michelangelo",
    filename: "Michelangelo_-_Creation_of_Adam_(cropped).jpg",
  },
  3: {
    title: "The Creation of Light",
    artist: "John Martin",
    filename: "The_Creation_of_Light_-_John_Martin.jpg",
  },
  4: {
    title: "Expulsion from the Garden of Eden",
    artist: "Thomas Cole",
    filename: "Thomas_Cole_-_Expulsion_from_the_Garden_of_Eden_-_Google_Art_Project.jpg",
  },
  5: {
    title: "The Eve of the Deluge",
    artist: "John Martin",
    filename: "John_Martin_(1789-1854)_-_The_Eve_of_the_Deluge_-_RCIN_407176_-_Royal_Collection.jpg",
  },
  6: {
    title: "The Eve of the Deluge",
    artist: "John Martin",
    filename: "John_Martin_(1789-1854)_-_The_Eve_of_the_Deluge_-_RCIN_407176_-_Royal_Collection.jpg",
  },
  7: {
    title: "Noah's Ark",
    artist: "Edward Hicks",
    filename: "Edward_Hicks,_American_-_Noah's_Ark_-_Google_Art_Project.jpg",
  },
  8: {
    title: "Journey of the Family of Abraham",
    artist: "Giovanni Benedetto Castiglione",
    filename: "Grechetto_(Giovanni_Benedetto_Castiglione)_-_Journey_of_the_Family_of_Abraham_-_Google_Art_Project.jpg",
  },
  9: {
    title: "The Sacrifice of Isaac",
    artist: "Rembrandt",
    filename: "Rembrandt_-_Abraham's_sacrifice_-_Google_Art_Project.jpg",
  },
  10: {
    title: "Jacob's Dream",
    artist: "Jusepe de Ribera",
    filename: "José_de_Ribera_-_Jacob's_Dream_-_WGA19383.jpg",
  },
  11: {
    title: "Joseph and his Brothers",
    artist: "Abraham Bloemaert",
    filename: "Abraham_Bloemaert_-_Joseph_and_his_Brothers_-_Google_Art_Project.jpg",
  },
  12: {
    title: "Joseph and his Brothers",
    artist: "Abraham Bloemaert",
    filename: "Abraham_Bloemaert_-_Joseph_and_his_Brothers_-_Google_Art_Project.jpg",
  },
  13: {
    title: "Moses in the Bulrushes",
    artist: "Elizabeth Jane Gardner",
    filename: "Elizabeth_Jane_Gardner_-_Moses_in_the_Bulrushes.jpg",
  },
  14: {
    title: "The Resurrection",
    artist: "Carl Bloch",
    filename: "Carl_Heinrich_Bloch_-_The_Resurrection.jpg",
  },
  15: {
    title: "The Departure of the Israelites",
    artist: "David Roberts",
    filename: "David_Roberts-IsraelitesLeavingEgypt_1828.jpg",
  },
  16: {
    title: "The Destruction of Pharaoh's Host",
    artist: "John Martin",
    filename: "The_Destruction_of_Pharaoh's_Host,_by_John_Martin_(Getty_103QTX).jpg",
  },
  17: {
    title: "Moses with the Ten Commandments",
    artist: "Philippe de Champaigne",
    filename: "Philippe_de_Champaigne_-_Moses_with_the_Ten_Commandments_-_WGA04717.jpg",
  },
  18: {
    title: "Moses with the Ten Commandments",
    artist: "Philippe de Champaigne",
    filename: "Philippe_de_Champaigne_-_Moses_with_the_Ten_Commandments_-_WGA04717.jpg",
  },
  19: {
    title: "The Brazen Serpent",
    artist: "Peter Paul Rubens",
    filename: "Peter_Paul_Rubens_-_The_Brazen_Serpent.jpg",
  },
  20: {
    title: "Moses with the Ten Commandments",
    artist: "Philippe de Champaigne",
    filename: "Philippe_de_Champaigne_-_Moses_with_the_Ten_Commandments_-_WGA04717.jpg",
  },
  21: {
    title: "Joshua Commanding the Sun to Stand Still",
    artist: "John Martin",
    filename: "John_Martin_-_Joshua_Commanding_the_Sun_to_Stand_Still_-_Google_Art_Project.jpg",
  },
  22: {
    title: "Samson and Delilah",
    artist: "Peter Paul Rubens",
    filename: "Samson_and_Delilah_by_Rubens,_1609.jpg",
  },
  23: {
    title: "Ruth and Naomi",
    artist: "Philip Hermogenes Calderon",
    filename: "Philip_Hermogenes_Calderon_-_Ruth_and_Naomi.jpg",
  },
  24: {
    title: "The Anointment of David",
    artist: "Paolo Veronese",
    filename: "Paolo_Caliari,_called_Veronese_-_The_Anointment_of_David_-_Google_Art_Project.jpg",
  },
  25: {
    title: "David and Goliath",
    artist: "Osmar Schindler",
    filename: "Osmar_Schindler_-_David_und_Goliath.jpg",
  },
  26: {
    title: "The Judgment of Solomon",
    artist: "Nicolas Poussin",
    filename: "Le_Jugement_de_Salomon_-_1649_-_Nicolas_Poussin_-_Louvre_-_INV_7277_;_MR_2316.jpg",
  },
  27: {
    title: "Elijah in the Desert",
    artist: "Washington Allston",
    filename: "Washington_Allston_-_Elijah_in_the_Desert_-_Google_Art_Project.jpg",
  },
  28: {
    title: "Elijah in the Desert",
    artist: "Washington Allston",
    filename: "Washington_Allston_-_Elijah_in_the_Desert_-_Google_Art_Project.jpg",
  },
  29: {
    title: "Isaiah",
    artist: "Michelangelo",
    filename: "Jesaja_(Michelangelo).jpg",
  },
  30: {
    title: "King David Playing the Harp",
    artist: "Gerard van Honthorst",
    filename: "Gerard_van_Honthorst_-_King_David_Playing_the_Harp_-_Google_Art_Project.jpg",
  },
  31: {
    title: "King David Playing the Harp",
    artist: "Gerard van Honthorst",
    filename: "Gerard_van_Honthorst_-_King_David_Playing_the_Harp_-_Google_Art_Project.jpg",
  },
  32: {
    title: "Esther before Ahasuerus",
    artist: "Artemisia Gentileschi",
    filename: "Esther_before_Ahasuerus_(Artemisia_Gentileschi).jpg",
  },
  33: {
    title: "Job and his Friends",
    artist: "Ilya Repin",
    filename: "Job_and_his_friends.jpg",
  },
  34: {
    title: "King David Playing the Harp",
    artist: "Gerard van Honthorst",
    filename: "Gerard_van_Honthorst_-_King_David_Playing_the_Harp_-_Google_Art_Project.jpg",
  },
  35: {
    title: "King David Playing the Harp",
    artist: "Gerard van Honthorst",
    filename: "Gerard_van_Honthorst_-_King_David_Playing_the_Harp_-_Google_Art_Project.jpg",
  },
  36: {
    title: "King David Playing the Harp",
    artist: "Gerard van Honthorst",
    filename: "Gerard_van_Honthorst_-_King_David_Playing_the_Harp_-_Google_Art_Project.jpg",
  },
  37: {
    title: "The Judgment of Solomon",
    artist: "Nicolas Poussin",
    filename: "Le_Jugement_de_Salomon_-_1649_-_Nicolas_Poussin_-_Louvre_-_INV_7277_;_MR_2316.jpg",
  },
  38: {
    title: "Isaiah",
    artist: "Michelangelo",
    filename: "Jesaja_(Michelangelo).jpg",
  },
  39: {
    title: "Isaiah",
    artist: "Michelangelo",
    filename: "Jesaja_(Michelangelo).jpg",
  },
  40: {
    title: "Isaiah",
    artist: "Michelangelo",
    filename: "Jesaja_(Michelangelo).jpg",
  },
  41: {
    title: "Isaiah",
    artist: "Michelangelo",
    filename: "Jesaja_(Michelangelo).jpg",
  },
  42: {
    title: "Isaiah",
    artist: "Michelangelo",
    filename: "Jesaja_(Michelangelo).jpg",
  },
  43: {
    title: "Jeremiah Lamenting the Destruction of Jerusalem",
    artist: "Rembrandt",
    filename: "Rembrandt_Harmensz._van_Rijn_-_Jeremia_treurend_over_de_verwoesting_van_Jeruzalem_-_Google_Art_Project.jpg",
  },
  44: {
    title: "Jeremiah Lamenting the Destruction of Jerusalem",
    artist: "Rembrandt",
    filename: "Rembrandt_Harmensz._van_Rijn_-_Jeremia_treurend_over_de_verwoesting_van_Jeruzalem_-_Google_Art_Project.jpg",
  },
  45: {
    title: "Jeremiah Lamenting the Destruction of Jerusalem",
    artist: "Rembrandt",
    filename: "Rembrandt_Harmensz._van_Rijn_-_Jeremia_treurend_over_de_verwoesting_van_Jeruzalem_-_Google_Art_Project.jpg",
  },
  46: {
    title: "Daniel in the Lions' Den",
    artist: "Briton Rivière",
    filename: "Daniel_in_the_Lions'_Den,_by_Briton_Rivière.jpg",
  },
  47: {
    title: "The Infant Samuel at Prayer",
    artist: "Sir Joshua Reynolds",
    filename: "The_Infant_Samuel_at_Prayer_-_Sir_Joshua_Reynolds.png",
  },
  48: {
    title: "Jonah and the Whale",
    artist: "Pieter Lastman",
    filename: "Pieter_Lastman_-_Jonah_and_the_Whale_-_Google_Art_Project.jpg",
  },
  49: {
    title: "Moses with the Ten Commandments",
    artist: "Philippe de Champaigne",
    filename: "Philippe_de_Champaigne_-_Moses_with_the_Ten_Commandments_-_WGA04717.jpg",
  },
  50: {
    title: "King David Playing the Harp",
    artist: "Gerard van Honthorst",
    filename: "Gerard_van_Honthorst_-_King_David_Playing_the_Harp_-_Google_Art_Project.jpg",
  },
  51: {
    title: "Isaiah",
    artist: "Michelangelo",
    filename: "Jesaja_(Michelangelo).jpg",
  },
  52: {
    title: "The Shepherds and the Angel",
    artist: "Carl Bloch",
    filename: "The_Shepherds_and_the_Angel.jpg",
  },
};

export default function LessonArt({
  week,
  className,
}: {
  week: number;
  className?: string;
}) {
  const artwork = ARTWORKS[week] || ARTWORKS[1];
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden group select-none ${className || ""}`}>
      {/* Background/Loading state placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1c1710] to-[#0f0d0a] flex flex-col items-center justify-center p-2 text-center">
        {!loaded && !error && (
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#c9a24b]/50" />
        )}
        {error && (
          <div className="space-y-0.5">
            <p className="font-display text-[10px] font-semibold text-[#f2ecdd]/80 line-clamp-2 leading-tight">
              {artwork.title}
            </p>
            <p className="text-[8px] text-[#a2947a] leading-tight">
              {artwork.artist}
            </p>
          </div>
        )}
      </div>

      {!error && (
        <img
          src={commonsImage(artwork.filename)}
          alt={`"${artwork.title}" by ${artwork.artist}`}
          title={`"${artwork.title}" by ${artwork.artist}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-in-out ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {/* Elegant overlay showing painting details on hover */}
      {loaded && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <p className="font-display text-[10px] font-semibold italic text-white truncate leading-normal">
            {artwork.title}
          </p>
          <p className="text-[8px] text-[#d8cdb4] truncate leading-normal">
            {artwork.artist}
          </p>
        </div>
      )}
    </div>
  );
}
