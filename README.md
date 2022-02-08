# plants
A visualization of my plant taxonomies

# Commands

Node 16 is required for these scripts.

## General
 ### build:d3
 Builds the d3 bundle specified in `src/d3_bundle`

## Building the plant data
### build:data
Run both the taxonmy and treedata commands, appending new data to existing data

### build:data:force
Run the taxonmy and treedata commands, starting from scratch

### taxonomy:update
Queries the https://api.gbif.org/ API for taxonomy data for plants in plants.mjs. Only fetches new data and ignores data that has already been fetched and entries found in manual-taxonomy.mjs. Logs problems in failures.log for manual inspection. Script: `./bin/getTaxonomy`

### taxonomy:overwrite
Gets taxonomy data from the API but fetches all plant entries that are not in manual-taxonomy.mjs

### treedata
Builds a data structure mixing together plants.mjs and the taxonomy data files. Script: `./bin/buildTreeData`

## Images

### image:dir
Creates directories for all plants found in plants.mjs. Script: `./bin/createImageDir`

### image:build
Processes all images and then creates a data file mapping all plants to their corresponding image files.

### image:process
Processes all images found in the images directory and creates webp versions for each image. Skips images that have already been processed. Script: `./bin/processImages`

### image:process:force
Processes all images re-processing any previously created images.


### image:data
Scans the images directory for images and creates a mapping of all image files. Also mixes in any images that are listed in external-images.mjs. Script: `./bin/createImageData`

