# Release

This fork of the flower-card depends on this patch to the internal Plant component:
https://github.com/Olen/homeassistant-plant

Instead of reading the max/min-values from the huge data-file, it gets the values from the plant entity.  

![](https://github.com/remkolems/lovelace-flower-card/blob/master/lovelace-flower-card_popup.png)

## Disclaimer
I looked into several forks of the original card https://github.com/thomasloven/lovelace-flower-card. Some forks were very interesting and I edited several of those source codes changes into my own new fork. Credits to those original authors.

## Dependencies
1. lovelace-card-tools (https://github.com/thomasloven/lovelace-card-tools)
3. Patched Plant sensor (https://github.com/Olen/homeassistant-plant)

## Instructions

### Install via HACS

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge)](https://github.com/Olen/lovelace-flower-card/)

* Add this repo as a "Custom repository" with type "Lovelace"
* Click "Install" in the new "Home Assistant Plant" card in HACS


### Install manually
1: Download the file flower-card.js and add it to your /config/www folder in HA 
 
2: Click your profile picture in the bottom left corner -> Turn on Advanced Mode.
 
3: Go to Configuration -> Lovelace Dashboards -> Resources -> press the + (lower right corner of screen) and add the following information:

```yaml
  Url: /local/lovelace-flower-card/flower-card.js
  Resource type: JavaScript Module
```
![image](https://user-images.githubusercontent.com/45675902/80322223-ebd41880-8823-11ea-992d-7070d4197f8b.png)

4: Press *Create* afterwards to add the new resource.

5: Get flower images and extract to `www/images/plants/<species>.jpg`

6: Setup card

```yaml
type: custom:flower-card
entity: plant.my_plant
```
