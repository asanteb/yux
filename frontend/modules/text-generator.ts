import {
  uniqueNamesGenerator,
  Config,
  names,
  colors,
  animals,
  adjectives,
} from "unique-names-generator";
import { list } from "./summaries.json";

export const randomNameGenerator = () => {
  return uniqueNamesGenerator({
    dictionaries: [names],
  });
};

export const randomRoomNameGenerator = () => {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    length: 3,
    separator: " ",
  });
};

export const randomDescriptionGenerator = () => {
  const limit = list.length;
  const idx = Math.floor(Math.random() * limit);
  return list[idx].plot;
};
