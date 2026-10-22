const fs = require('fs');
const path = require('path');

const ASSETS = path.join(__dirname, 'assets');
const PARENT = path.dirname(__dirname);
const BRAIN1 = path.join(PARENT, '..', '..', 'brain', '7036ee86-b865-4082-8ab4-c5d1dd6a638d');
const BRAIN2 = path.join(PARENT, '..', '..', 'brain', '35ee362b-fb15-4db2-8f2a-064c4b310061');
const BRAIN3 = path.join(PARENT, '..', '..', 'brain', '273b073b-3506-40bd-bdad-21a45d8b28ea');

const filesToCopy = [
  // Parent directory files
  { src: path.join(PARENT, 'logo.png'), dest: path.join(ASSETS, 'logo.png') },
  { src: path.join(PARENT, 'aerial_urubo.jpg'), dest: path.join(ASSETS, 'aerial_urubo.jpg') },
  
  // Brain conversation 1
  { src: path.join(BRAIN1, 'urubo_familia_donut_white_1778178275280.png'), dest: path.join(ASSETS, 'urubo_familia_donut_white.png') },
  { src: path.join(BRAIN1, 'urubo_familia_bbq_white_1778178310880.png'), dest: path.join(ASSETS, 'urubo_familia_bbq_white.png') },
  { src: path.join(BRAIN1, 'urubo_ninos_jugando_white_final_1778181081384.png'), dest: path.join(ASSETS, 'urubo_ninos_jugando_white_final.png') },
  { src: path.join(BRAIN1, 'urubo_strategy_hand_cloud_1778182719897.png'), dest: path.join(ASSETS, 'urubo_strategy_hand_cloud.png') },
  { src: path.join(BRAIN1, 'urubo_familia_pool_grill_final_1778183743916.png'), dest: path.join(ASSETS, 'urubo_familia_pool_grill_final.png') },
  { src: path.join(BRAIN1, 'urubo_familia_playground_final_1778185057651.png'), dest: path.join(ASSETS, 'urubo_familia_playground_final.png') },
  
  // Brain conversation 2
  { src: path.join(BRAIN2, 'urubo_entrance_final_text_1778186924524.png'), dest: path.join(ASSETS, 'urubo_entrance_final_text.png') },
  { src: path.join(BRAIN2, 'urubo_family_pool_luxury_1778188014188.png'), dest: path.join(ASSETS, 'urubo_family_pool_luxury.png') },
  { src: path.join(BRAIN2, 'urubo_lifestyle_park_running_1778189125137.png'), dest: path.join(ASSETS, 'urubo_lifestyle_park_running.png') },
  { src: path.join(BRAIN2, 'urubo_bolivia_independence_day_1778189345162.png'), dest: path.join(ASSETS, 'urubo_bolivia_independence_day.png') },
  { src: path.join(BRAIN2, 'urubo_family_palm_park_sunset_1778190459802.png'), dest: path.join(ASSETS, 'urubo_family_palm_park_sunset.png') },
  { src: path.join(BRAIN2, 'urubo_father_kids_playing_livingroom_1778190687907.png'), dest: path.join(ASSETS, 'urubo_father_kids_playing_livingroom.png') },
  { src: path.join(BRAIN2, 'urubo_couple_luxury_pool_lifestyle_1778190968945.png'), dest: path.join(ASSETS, 'urubo_couple_luxury_pool_lifestyle.png') },
  
  // Brain conversation 3
  { src: path.join(BRAIN3, 'urubo_christmas_clubhouse_houses_1778251073377.png'), dest: path.join(ASSETS, 'urubo_christmas_clubhouse_houses.png') },
  { src: path.join(BRAIN3, 'urubo_january_2027_new_beginnings_1778251612441.png'), dest: path.join(ASSETS, 'urubo_january_2027_new_beginnings.png') },
  { src: path.join(BRAIN3, 'urubo_february_2027_romance_1778252189462.png'), dest: path.join(ASSETS, 'urubo_february_2027_romance.png') },
  { src: path.join(BRAIN3, 'urubo_march_2027_family_1778252211775.png'), dest: path.join(ASSETS, 'urubo_march_2027_family.png') },
  { src: path.join(BRAIN3, 'urubo_april_2027_nature_1778252241963.png'), dest: path.join(ASSETS, 'urubo_april_2027_nature.png') },
  { src: path.join(BRAIN3, 'urubo_may_2027_mother_1778252265478.png'), dest: path.join(ASSETS, 'urubo_may_2027_mother.png') },
  { src: path.join(BRAIN3, 'urubo_june_2027_community_1778252296276.png'), dest: path.join(ASSETS, 'urubo_june_2027_community.png') },
  { src: path.join(BRAIN3, 'urubo_final_closing_zen_1778253187350.png'), dest: path.join(ASSETS, 'urubo_final_closing_zen.png') },
];

// Ensure assets directory exists
if (!fs.existsSync(ASSETS)) {
  fs.mkdirSync(ASSETS, { recursive: true });
}

let success = 0;
let failed = 0;

filesToCopy.forEach(({ src, dest }) => {
  try {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`OK: ${path.basename(dest)}`);
      success++;
    } else {
      console.log(`MISSING SOURCE: ${src}`);
      failed++;
    }
  } catch (err) {
    console.log(`ERROR copying ${path.basename(dest)}: ${err.message}`);
    failed++;
  }
});

console.log(`\nDone! ${success} copied, ${failed} failed.`);
console.log(`Files in assets:`, fs.readdirSync(ASSETS).length);
