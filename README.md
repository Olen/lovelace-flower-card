# Release

See https://community.home-assistant.io/t/miflora-sensor-plant-database/53131 for more information of this particular MiFlora / Home-Assistant card.
Also see my detailed post in this same thread at https://community.home-assistant.io/t/miflora-sensor-plant-database/53131/73

![](https://github.com/remkolems/lovelace-flower-card/blob/master/lovelace-flower-card_popup.png)

### Disclaimer
I looked into several forks of the original card https://github.com/thomasloven/lovelace-flower-card. Some forks were very interesting and I edited several of those source codes changes into my own new fork. Credits to those original authors.

### Dependencies
1. lovelace-card-tools (https://github.com/thomasloven/lovelace-card-tools)
2. MiFlora database (PlantDB_5335_U0.csv)

### Instructions

1: Install card (`type: module`)
```yaml
  - type: module
    url: /local/lovelace-flower-card/flower-card.js
```
2: Get CSV database file (https://github.com/khronimo/MiFloraDB)

3: Run `python3 convert.py DBFileName.csv > data.js`
3a: Execute convert.py on a Linux machine (not Windows)
3b: Check data.js via cli command: file data.js. Correct is:
```
data.js: ASCII text, with very long lines
```

4: Move `data.js` to `www/lovelace-flower-card/data/data.js`

5: Get flower images and extract to `www/lovelace-flower-card/data/Images`

6: Setup card

```yaml
type: custom:flower-card
entity: plant.my_plant
species: "tulipa 'hollandia'"
```

To get a list of the available species run `python3 convert.py DBFilename.csv species`. The value you want is the one after the colon. Enter it exactly like it says, with quotes and all.

7: configuration.yaml
Add the following to configuration.yaml (bottom of this file)
```plant: !include plants.yaml```
I do this to separate my config files.

8: plants.yaml
Create, edit and add the following to plants.yaml. Change accordingly. Repeat this section for other plants. Separate each section with a blank line.
```
spathiphyllum_bingo_cupido:
  sensors:
    moisture: sensor.spathiphyllum_moisture
    battery: sensor.spathiphyllum_battery
    temperature: sensor.spathiphyllum_temperature
    conductivity: sensor.spathiphyllum_conductivity
    brightness: sensor.spathiphyllum_brightness
```
