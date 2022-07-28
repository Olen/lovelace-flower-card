# Release

This fork of the flower-card depends on this patch to the internal Plant component:
https://github.com/Olen/homeassistant-plant

Instead of reading the max/min-values from the huge data-file, it gets the values from the plant entity.  

![image](https://user-images.githubusercontent.com/203184/181523876-4185c023-fd9a-4e1d-b415-7f98f40481ce.png)

The card adapts to both °C and °F

![image](https://user-images.githubusercontent.com/203184/181524097-23e203bc-27bd-474b-9bcb-5d0525f3e6be.png)

You can also select what bars you want to show for each card

![image](https://user-images.githubusercontent.com/203184/181523597-a4b4e617-efad-421b-a157-813d15564c11.png)



### Dependencies
* lovelace-card-tools (https://github.com/thomasloven/lovelace-card-tools)
* Patched Plant sensor (https://github.com/Olen/homeassistant-plant)

### Instructions

1: Install the card

#### Install via HACS

#### Install manually


 1a: Go to Configuration -> Lovelace Dashboards -> Resources -> press the + (lower right corner of screen) and add the following information:

```yaml
  Url: /local/lovelace-flower-card/flower-card.js
  Resource type: JavaScript Module
```
![image](https://user-images.githubusercontent.com/45675902/80322223-ebd41880-8823-11ea-992d-7070d4197f8b.png)

 1b: Press *Create* afterwards to add the new resource.

2: Setup card

```yaml
type: custom:flower-card
entity: plant.my_plant
show_bars:
- brigthness
- humidity
- moisture
- conductivity
- temperature
```

### Disclaimer
I looked into several forks of the original card https://github.com/thomasloven/lovelace-flower-card. Some forks were very interesting and I edited several of those source codes changes into my own new fork. Credits to those original authors.

