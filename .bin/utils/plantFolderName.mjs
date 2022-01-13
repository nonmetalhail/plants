export function plantFolderName(plant){
  return plant.binomialName.replace(/[^a-z0-9\s]/gi, '').replaceAll(' ', '_').toLowerCase();
}