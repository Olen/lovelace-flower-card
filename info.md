# BREAKING CHANGES COMING UP

>**Warning**
>
> **This card is about to be completely rewritten.  The next version will *not* be compatible with the original plant integration in HA or with this release.**

## Breaking Changes

This card will, from version 2.0.0, only work with version 2.0.0 or higher of https://github.com/Olen/homeassistant-plant/.  Please read the README from that repository carefully before upgrading.

## Requires
1. [Lovelace card tools](https://github.com/thomasloven/lovelace-card-tools)
2. [Custom plant integration](https://github.com/Olen/homeassistant-plant/)


## Features in v1.0.0

* Will use attributes from the plant _entity_ to display thresholds.
* Displays nice bars for moisture, conductivity, temperature, illumination

![v1.0.0](https://github.com/remkolems/lovelace-flower-card/blob/master/lovelace-flower-card_popup.png)


## Features coming in v2.0.0

* Will use attributes from the plant _device_ to display thresholds.
* Displays nice bars for moisture, conductivity, temperature, illumination, _humidity_ and _daily light integral_
* Configuration of the card to select which bars to display
* Make sure you install version 2.0.0 or higher of https://github.com/Olen/homeassistant-plant/. 

![v2.0.0](https://user-images.githubusercontent.com/203184/182670259-9abd27c3-8641-444f-9002-4ffc0a80c016.png)

