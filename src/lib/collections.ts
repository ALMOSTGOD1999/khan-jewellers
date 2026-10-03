import goldImg from "@/assets/gold-collection.jpg";
import silverImg from "@/assets/silver-collection.jpg";
import pearlImg from "@/assets/pearl-collection.jpg";
import goldM2 from "@/assets/gold-model-2.jpg";
import goldM3 from "@/assets/gold-model-3.jpg";
import goldP1 from "@/assets/gold-p1.jpg";
import goldP2 from "@/assets/gold-p2.jpg";
import goldP3 from "@/assets/gold-p3.jpg";
import goldP4 from "@/assets/gold-p4.jpg";
import silverM2 from "@/assets/silver-model-2.jpg";
import silverM3 from "@/assets/silver-model-3.jpg";
import silverP1 from "@/assets/silver-p1.jpg";
import silverP2 from "@/assets/silver-p2.jpg";
import silverP3 from "@/assets/silver-p3.jpg";
import silverP4 from "@/assets/silver-p4.jpg";
import pearlM2 from "@/assets/pearl-model-2.jpg";
import pearlM3 from "@/assets/pearl-model-3.jpg";
import pearlP1 from "@/assets/pearl-p1.jpg";
import pearlP2 from "@/assets/pearl-p2.jpg";
import pearlP3 from "@/assets/pearl-p3.jpg";
import pearlP4 from "@/assets/pearl-p4.jpg";

export const SHOP = {
  name: "Khan Jewellers",
  address: ["Khan Jewellers", "Noipukur, Rajarhat", "North 24 Parganas, West Bengal 700135"],
  phones: ["8240570878", "7439491412"],
  mapQuery: "Khan Jewellers, Noipukur, Rajarhat, North 24 Parganas, West Bengal 700135",
};

export const collections = {
  gold: {
    label: "Gold Jewellery",
    tag: "22K & 18K Hallmarked",
    img: goldImg,
    gallery: [goldM2, goldM3],
    products: [
      { name: "Temple Necklace", img: goldP1 },
      { name: "Temple Jhumkas", img: goldP2 },
      { name: "Carved Gold Kada", img: goldP3 },
      { name: "Classic Gold Chain", img: goldP4 },
    ],
    copy: "Bridal haars, temple work, kundan chokers and everyday chains — hand-finished by karigars from Bengal's oldest goldsmith families.",
    items: ["Bridal Necklace Sets", "Temple Jewellery", "Bangles & Kada", "Jhumkas & Chandbali"],
  },
  silver: {
    label: "Silver Jewellery",
    tag: "92.5 Sterling & Oxidised",
    img: silverImg,
    gallery: [silverM2, silverM3],
    products: [
      { name: "Oxidised Tribal Necklace", img: silverP1 },
      { name: "Filigree Earrings", img: silverP2 },
      { name: "Ghungroo Anklets", img: silverP3 },
      { name: "Silver Toe Rings", img: silverP4 },
    ],
    copy: "Tribal oxidised statement pieces, filigree from Cuttack and clean modern silver for the everyday wardrobe.",
    items: ["Oxidised Statement Sets", "Filigree Craft", "Anklets & Toe Rings", "Silver Gifting"],
  },
  pearl: {
    label: "Pearl Collection",
    tag: "Natural & Cultured",
    img: pearlImg,
    gallery: [pearlM2, pearlM3],
    products: [
      { name: "Five-strand Pearl Mala", img: pearlP1 },
      { name: "Pearl Drop Earrings", img: pearlP2 },
      { name: "Pearl & Polki Choker", img: pearlP3 },
      { name: "Pearl Solitaire Ring", img: pearlP4 },
    ],
    copy: "Lustrous South Sea, Basra and freshwater pearls strung in our own workshop, clasped in 18K gold.",
    items: ["Multi-strand Malas", "Pearl Drop Earrings", "Pearl & Polki", "Rings & Studs"],
  },
} as const;

export type CollectionKey = keyof typeof collections;
