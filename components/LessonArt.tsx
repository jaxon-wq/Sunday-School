"use client";

import { useState } from "react";

interface Artwork {
  title: string;
  artist: string;
  url: string;
}

const ARTWORKS: Record<number, Artwork> = {
  1: {
    title: "Moses with the Tablets of the Law",
    artist: "Rembrandt",
    url: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Rembrandt_-_Moses_with_the_Ten_Commandments_-_Google_Art_Project.jpg",
  },
  2: {
    title: "The Creation of Adam",
    artist: "Michelangelo",
    url: "https://upload.wikimedia.org/wikipedia/commons/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg",
  },
  3: {
    title: "The Creation of Light",
    artist: "John Martin",
    url: "https://upload.wikimedia.org/wikipedia/commons/0/09/The_Creation_of_Light_-_John_Martin.jpg",
  },
  4: {
    title: "Expulsion from the Garden of Eden",
    artist: "Thomas Cole",
    url: "https://upload.wikimedia.org/wikipedia/commons/1/14/Thomas_Cole_-_Expulsion_from_the_Garden_of_Eden_-_Google_Art_Project.jpg",
  },
  5: {
    title: "The Eve of the Deluge",
    artist: "John Martin",
    url: "https://upload.wikimedia.org/wikipedia/commons/b/b3/John_Martin_-_The_Eve_of_the_Deluge_-_Google_Art_Project.jpg",
  },
  6: {
    title: "The Eve of the Deluge",
    artist: "John Martin",
    url: "https://upload.wikimedia.org/wikipedia/commons/b/b3/John_Martin_-_The_Eve_of_the_Deluge_-_Google_Art_Project.jpg",
  },
  7: {
    title: "Noah's Ark",
    artist: "Edward Hicks",
    url: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Edward_Hicks_-_Noah%27s_Ark_-_Google_Art_Project.jpg",
  },
  8: {
    title: "Abraham's Journey",
    artist: "József Molnár",
    url: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Moln%C3%A1r_Abraham%27s_Journey.jpg",
  },
  9: {
    title: "The Sacrifice of Isaac",
    artist: "Rembrandt",
    url: "https://upload.wikimedia.org/wikipedia/commons/d/de/Rembrandt_-_The_Sacrifice_of_Isaac_-_Google_Art_Project.jpg",
  },
  10: {
    title: "Jacob's Dream",
    artist: "Jusepe de Ribera",
    url: "https://upload.wikimedia.org/wikipedia/commons/d/dd/Jusepe_de_Ribera_-_Jacob%27s_Dream_-_Prado.jpg",
  },
  11: {
    title: "Joseph and his Brothers",
    artist: "Abraham Bloemaert",
    url: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Abraham_Bloemaert_-_Joseph_and_his_Brothers_-_Google_Art_Project.jpg",
  },
  12: {
    title: "Joseph and his Brothers",
    artist: "Abraham Bloemaert",
    url: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Abraham_Bloemaert_-_Joseph_and_his_Brothers_-_Google_Art_Project.jpg",
  },
  13: {
    title: "Moses in the Bulrushes",
    artist: "Frederick Goodall",
    url: "https://upload.wikimedia.org/wikipedia/commons/3/30/Frederick_Goodall_-_Moses_in_the_Bulrushes.jpg",
  },
  14: {
    title: "The Resurrection",
    artist: "Carl Bloch",
    url: "https://upload.wikimedia.org/wikipedia/commons/4/4c/The_Resurrection_%28Bloch%29.jpg",
  },
  15: {
    title: "The Departure of the Israelites",
    artist: "David Roberts",
    url: "https://upload.wikimedia.org/wikipedia/commons/a/ad/David_Roberts_-_The_Departure_of_the_Israelites_-_Google_Art_Project.jpg",
  },
  16: {
    title: "The Destruction of Pharaoh's Host",
    artist: "John Martin",
    url: "https://upload.wikimedia.org/wikipedia/commons/e/ec/John_Martin_-_The_Destruction_of_Pharaoh%27s_Host_-_Google_Art_Project.jpg",
  },
  17: {
    title: "Moses with the Ten Commandments",
    artist: "Philippe de Champaigne",
    url: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Philippe_de_Champaigne_-_Moses_with_the_Ten_Commandments_-_Google_Art_Project.jpg",
  },
  18: {
    title: "Moses with the Ten Commandments",
    artist: "Philippe de Champaigne",
    url: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Philippe_de_Champaigne_-_Moses_with_the_Ten_Commandments_-_Google_Art_Project.jpg",
  },
  19: {
    title: "The Brazen Serpent",
    artist: "Peter Paul Rubens",
    url: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Peter_Paul_Rubens_-_The_Brazen_Serpent.jpg",
  },
  20: {
    title: "Moses with the Ten Commandments",
    artist: "Philippe de Champaigne",
    url: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Philippe_de_Champaigne_-_Moses_with_the_Ten_Commandments_-_Google_Art_Project.jpg",
  },
  21: {
    title: "Joshua Commanding the Sun to Stand Still",
    artist: "John Martin",
    url: "https://upload.wikimedia.org/wikipedia/commons/a/ae/John_Martin_-_Joshua_Commanding_the_Sun_to_Stand_Still_upon_Gibeon_-_Google_Art_Project.jpg",
  },
  22: {
    title: "Samson and Delilah",
    artist: "Peter Paul Rubens",
    url: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Samson_and_Delilah_by_Rubens%2C_1609.jpg",
  },
  23: {
    title: "Ruth and Naomi",
    artist: "Philip Hermogenes Calderon",
    url: "https://upload.wikimedia.org/wikipedia/commons/a/af/Calderon_Ruth_and_Naomi.jpg",
  },
  24: {
    title: "The Anointment of David",
    artist: "Paolo Veronese",
    url: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Paolo_Caliari%2C_called_Veronese_-_The_Anointment_of_David_-_Google_Art_Project.jpg",
  },
  25: {
    title: "David and Goliath",
    artist: "Osmar Schindler",
    url: "https://upload.wikimedia.org/wikipedia/commons/8/87/Osmar_Schindler_-_David_und_Goliath.jpg",
  },
  26: {
    title: "The Judgment of Solomon",
    artist: "Nicolas Poussin",
    url: "https://upload.wikimedia.org/wikipedia/commons/7/74/Nicolas_Poussin_-_The_Judgment_of_Solomon_-_Google_Art_Project.jpg",
  },
  27: {
    title: "Elijah in the Desert",
    artist: "Washington Allston",
    url: "https://upload.wikimedia.org/wikipedia/commons/3/39/Washington_Allston_-_Elijah_in_the_Desert_-_Google_Art_Project.jpg",
  },
  28: {
    title: "Elijah in the Desert",
    artist: "Washington Allston",
    url: "https://upload.wikimedia.org/wikipedia/commons/3/39/Washington_Allston_-_Elijah_in_the_Desert_-_Google_Art_Project.jpg",
  },
  29: {
    title: "Isaiah",
    artist: "Michelangelo",
    url: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Michelangelo_Isaiah.jpg",
  },
  30: {
    title: "King David Playing the Harp",
    artist: "Gerard van Honthorst",
    url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Gerard_van_Honthorst_-_King_David_Playing_the_Harp_-_Google_Art_Project.jpg",
  },
  31: {
    title: "King David Playing the Harp",
    artist: "Gerard van Honthorst",
    url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Gerard_van_Honthorst_-_King_David_Playing_the_Harp_-_Google_Art_Project.jpg",
  },
  32: {
    title: "Esther before Ahasuerus",
    artist: "Artemisia Gentileschi",
    url: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Artemisia_Gentileschi_-_Esther_before_Ahasuerus_-_Google_Art_Project.jpg",
  },
  33: {
    title: "Job and his Friends",
    artist: "Ilya Repin",
    url: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Job_and_his_friends_by_Ilya_Repin.jpg",
  },
  34: {
    title: "King David Playing the Harp",
    artist: "Gerard van Honthorst",
    url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Gerard_van_Honthorst_-_King_David_Playing_the_Harp_-_Google_Art_Project.jpg",
  },
  35: {
    title: "King David Playing the Harp",
    artist: "Gerard van Honthorst",
    url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Gerard_van_Honthorst_-_King_David_Playing_the_Harp_-_Google_Art_Project.jpg",
  },
  36: {
    title: "King David Playing the Harp",
    artist: "Gerard van Honthorst",
    url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Gerard_van_Honthorst_-_King_David_Playing_the_Harp_-_Google_Art_Project.jpg",
  },
  37: {
    title: "The Judgment of Solomon",
    artist: "Nicolas Poussin",
    url: "https://upload.wikimedia.org/wikipedia/commons/7/74/Nicolas_Poussin_-_The_Judgment_of_Solomon_-_Google_Art_Project.jpg",
  },
  38: {
    title: "Isaiah",
    artist: "Michelangelo",
    url: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Michelangelo_Isaiah.jpg",
  },
  39: {
    title: "Isaiah",
    artist: "Michelangelo",
    url: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Michelangelo_Isaiah.jpg",
  },
  40: {
    title: "Isaiah",
    artist: "Michelangelo",
    url: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Michelangelo_Isaiah.jpg",
  },
  41: {
    title: "Isaiah",
    artist: "Michelangelo",
    url: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Michelangelo_Isaiah.jpg",
  },
  42: {
    title: "Isaiah",
    artist: "Michelangelo",
    url: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Michelangelo_Isaiah.jpg",
  },
  43: {
    title: "Jeremiah Lamenting on the Ruins of Jerusalem",
    artist: "Rembrandt",
    url: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Rembrandt_Harmensz._van_Rijn_-_Jeremiah_Lamenting_on_the_Ruins_of_Jerusalem_-_Google_Art_Project.jpg",
  },
  44: {
    title: "Jeremiah Lamenting on the Ruins of Jerusalem",
    artist: "Rembrandt",
    url: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Rembrandt_Harmensz._van_Rijn_-_Jeremiah_Lamenting_on_the_Ruins_of_Jerusalem_-_Google_Art_Project.jpg",
  },
  45: {
    title: "Jeremiah Lamenting on the Ruins of Jerusalem",
    artist: "Rembrandt",
    url: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Rembrandt_Harmensz._van_Rijn_-_Jeremiah_Lamenting_on_the_Ruins_of_Jerusalem_-_Google_Art_Project.jpg",
  },
  46: {
    title: "Daniel in the Lions' Den",
    artist: "Briton Rivière",
    url: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Daniel_in_the_Lions%27_Den%2C_by_Briton_Rivi%C3%A8re.jpg",
  },
  47: {
    title: "The Infant Samuel at Prayer",
    artist: "Sir Joshua Reynolds",
    url: "https://upload.wikimedia.org/wikipedia/commons/b/ba/The_Infant_Samuel_at_Prayer_-_Sir_Joshua_Reynolds.png",
  },
  48: {
    title: "Jonah and the Whale",
    artist: "Pieter Lastman",
    url: "https://upload.wikimedia.org/wikipedia/commons/2/23/Pieter_Lastman_-_Jonah_and_the_Whale_-_Google_Art_Project.jpg",
  },
  49: {
    title: "Moses with the Ten Commandments",
    artist: "Philippe de Champaigne",
    url: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Philippe_de_Champaigne_-_Moses_with_the_Ten_Commandments_-_Google_Art_Project.jpg",
  },
  50: {
    title: "King David Playing the Harp",
    artist: "Gerard van Honthorst",
    url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Gerard_van_Honthorst_-_King_David_Playing_the_Harp_-_Google_Art_Project.jpg",
  },
  51: {
    title: "Isaiah",
    artist: "Michelangelo",
    url: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Michelangelo_Isaiah.jpg",
  },
  52: {
    title: "The Nativity",
    artist: "Carl Bloch",
    url: "https://upload.wikimedia.org/wikipedia/commons/5/52/The_Nativity_%28Bloch%29.jpg",
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
      <div className="absolute inset-0 bg-gradient-to-br from-[#121620] to-[#080a10] flex flex-col items-center justify-center p-2 text-center">
        {!loaded && !error && (
          <div className="text-[9px] uppercase tracking-[0.15em] text-white/40 animate-pulse font-medium">
            Gospel Art Loading...
          </div>
        )}
        {error && (
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-white/80 line-clamp-2 leading-tight">
              {artwork.title}
            </p>
            <p className="text-[8px] text-white/50 leading-tight">
              {artwork.artist}
            </p>
          </div>
        )}
      </div>

      {!error && (
        <img
          src={artwork.url}
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
          <p className="text-[10px] font-bold text-white truncate leading-normal">
            {artwork.title}
          </p>
          <p className="text-[8px] text-gray-300 truncate leading-normal">
            {artwork.artist}
          </p>
        </div>
      )}
    </div>
  );
}
