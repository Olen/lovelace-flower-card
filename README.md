# Release

This fork of the flower-card depends on this patch to the internal Plant component:
https://github.com/Olen/homeassistant-plant

Instead of reading the max/min-values from the huge data-file, it gets the values from the plant entity.  

![](https://github.com/remkolems/lovelace-flower-card/blob/master/lovelace-flower-card_popup.png)

### Disclaimer
I looked into several forks of the original card https://github.com/thomasloven/lovelace-flower-card. Some forks were very interesting and I edited several of those source codes changes into my own new fork. Credits to those original authors.

### Dependencies
1. lovelace-card-tools (https://github.com/thomasloven/lovelace-card-tools)
3. Patched Plant sensor (https://github.com/Olen/homeassistant-plant)

### Instructions

1: Install the card

 1a: Go to Configuration -> Lovelace Dashboards -> Resources -> press the + (lower right corner of screen) and add the following information:

```yaml
  Url: /local/lovelace-flower-card/flower-card.js
  Resource type: JavaScript Module
```
![image](https://user-images.githubusercontent.com/45675902/80322223-ebd41880-8823-11ea-992d-7070d4197f8b.png)

 1b: Press *Create* afterwards to add the new resource.

5: Get flower images and extract to `www/images/plants/<species>.jpg`

6: Setup card

```yaml
type: custom:flower-card
entity: plant.my_plant

7: configuration.yaml

Add the following to configuration.yaml (bottom of this file)
```plant: !include plants.yaml```

I do this to separate my config files.

8: plants.yaml

Create, edit and add the following to plants.yaml. Change accordingly. Repeat this section for other plants. Separate each section with a blank line.
```
spathiphyllum_bingo_cupido:
  species: spathiphyllum bingo cupido
  sensors:
    moisture: sensor.spathiphyllum_moisture
    battery: sensor.spathiphyllum_battery
    temperature: sensor.spathiphyllum_temperature
    conductivity: sensor.spathiphyllum_conductivity
    brightness: sensor.spathiphyllum_brightness
```
