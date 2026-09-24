export const handleImgError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
) => {
  const img = e.target as HTMLImageElement;
  console.error(`Image not found: ${img.src}`);
  img.src = `./assets/placeholder.png`;
};
