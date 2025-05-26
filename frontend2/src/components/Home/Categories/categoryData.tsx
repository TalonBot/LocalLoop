import {
  Milk,
  Apple,
  Carrot,
  Drumstick,
  Wine,
  Flower,
  MoreHorizontal,
  FlaskConical, // as replacement for Jar
  Croissant, // as replacement for Bread
} from "lucide-react";

const data = [
  {
    title: "Honey",
    icon: <FlaskConical size={36} color="#FBBF24" />,
  },
  {
    title: "Vegetables",
    icon: <Carrot size={36} color="#34D399" />,
  },
  {
    title: "Fruits",
    icon: <Apple size={36} color="#F87171" />,
  },
  {
    title: "Dairy",
    icon: <Milk size={36} color="#60A5FA" />,
  },
  {
    title: "Bread",
    icon: <Croissant size={36} color="#F59E42" />,
  },
  {
    title: "Meat",
    icon: <Drumstick size={36} color="#EF4444" />,
  },
  {
    title: "Beverages",
    icon: <Wine size={36} color="#A78BFA" />,
  },
  {
    title: "Crafts",
    icon: <Flower size={36} color="#F472B6" />,
  },
  {
    title: "Other",
    icon: <MoreHorizontal size={36} color="#6B7280" />,
  },
];

export default data;
