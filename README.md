# EARLY BETA

![](https://user-images.githubusercontent.com/1299821/56608848-fb66c300-660b-11e9-843e-369327c75926.png)

### Instructions

1: Install card

2: Get CSV database file (No. I won't tell you where)

3: Run `python3 convert.py DBFileName.csv > data.js`

4: Move `data.js` to `www/lovelace-flower-card/data/data.js`

5: Get flower images and extract to `www/lovelace-flower-card/data/Images`

6: Setup card

```yaml
type: custom:flower-card
entity: plant.my_plant
species: "tulipa 'hollandia'"
```

To get a list of the available species run `python3 convert.py DBFilename.csv species`. The value you want is the one after the colon. Enter it exactly like it says, with quotes and all.
