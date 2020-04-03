# Release

![](https://github.com/remkolems/lovelace-flower-card/blob/master/lovelace-flower-card_popup.png)

### Dependencies
1: lovelace-card-tools
2: MiFlora database (PlantDB_5335_U0.csv)

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
