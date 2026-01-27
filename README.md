# Flower Card

**This fork of the flower-card depends on this Plant component:
https://github.com/Olen/homeassistant-plant**

The card can be set up from the GUI (requires version 3.0.0)

![image](https://github.com/Olen/lovelace-flower-card/assets/203184/a31ad564-9458-41b4-9c1f-9da13f84f2ae)

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **Required** | The plant entity ID |
| `name` | string | Entity name | Custom display name for the plant |
| `display_type` | string | `full` | Display mode: `full` or `compact` |
| `battery_sensor` | string | - | Entity ID of a battery sensor to display |
| `show_bars` | list | All | List of measurement bars to show |
| `hide_species` | boolean | `false` | Hide the species name |
| `hide_image` | boolean | `false` | Hide the plant image |
| `extra_badges` | list | - | Additional icons to display (see below) |

### Basic Example

```yaml
type: custom:flower-card
entity: plant.my_plant
```

### Full Example

```yaml
type: custom:flower-card
entity: plant.my_plant
name: "My Monstera"
display_type: full
battery_sensor: sensor.plant_sensor_battery
hide_species: false
hide_image: false
show_bars:
  - illuminance
  - humidity
  - moisture
  - conductivity
  - temperature
  - dli
extra_badges:
  - entity: sensor.room_humidity
    icon: mdi:water-percent
  - entity: binary_sensor.window_open
    color_on: orange
    color_off: grey
```

### Display Type

Set `display_type` to `compact` for a smaller card layout:

```yaml
type: custom:flower-card
entity: plant.my_plant
display_type: compact
```

### Custom Name

Override the default entity name:

```yaml
type: custom:flower-card
entity: plant.my_plant
name: "Living Room Monstera"
```

### Hide Species / Image

Hide the species name or plant image:

```yaml
type: custom:flower-card
entity: plant.my_plant
hide_species: true
hide_image: true
```

### Battery Sensor

Add a battery sensor icon to the card header. The icon changes color based on battery level:
- >= 40%: Green
- 20-39%: Orange
- < 20%: Red

```yaml
type: custom:flower-card
entity: plant.my_plant
battery_sensor: sensor.plant_sensor_battery
```

![image](https://user-images.githubusercontent.com/203184/190199923-6060efbf-7306-49e5-bbc4-26dc922d3180.png)

### Show Bars

Select which measurement bars to display:

```yaml
type: custom:flower-card
entity: plant.my_plant
show_bars:
  - moisture
  - temperature
  - illuminance
```

Available bars: `moisture`, `temperature`, `conductivity`, `illuminance`, `humidity`, `dli`

### Extra Badges

Add additional icons next to the battery icon. Useful for displaying room sensors, binary states, or static labels.

By default, only the icon is displayed. Hovering over the icon shows a tooltip with the entity name and state. Set `show_state: true` to display the state value next to the icon.

#### Extra Badge Options

| Option | Type | Description |
|--------|------|-------------|
| `entity` | string | Entity ID of a sensor or binary_sensor |
| `text` | string | Static text to display (alternative to entity) |
| `icon` | string | Icon to display (default: entity's icon or `mdi:information`) |
| `color` | string | Icon color for sensors/text |
| `color_on` | string | Icon color when binary_sensor is "on" (default: primary color) |
| `color_off` | string | Icon color when binary_sensor is "off" (default: disabled color) |
| `show_state` | boolean | Show the entity's state value next to the icon (default: `false`) |

#### Entity-based Badge

Display a sensor with an icon (tooltip shows state on hover):

```yaml
extra_badges:
  - entity: sensor.room_temperature
    icon: mdi:thermometer
```

Display a sensor with icon and state value visible:

```yaml
extra_badges:
  - entity: sensor.room_humidity
    icon: mdi:water-percent
    show_state: true
```

#### Binary Sensor Badge

Display a binary sensor with different colors for on/off states:

```yaml
extra_badges:
  - entity: binary_sensor.window_open
    icon: mdi:window-open-variant
    color_on: orange
    color_off: grey
  - entity: binary_sensor.plant_needs_water
    icon: mdi:water-alert
    color_on: red
    color_off: green
```

#### Static Icon/Text Badge

Display a decorative icon with no text or tooltip:

```yaml
extra_badges:
  - icon: mdi:flower
    color: pink
```

Display a static icon (tooltip shows text on hover):

```yaml
extra_badges:
  - text: Indoor
    icon: mdi:home
    color: blue
```

Display a static icon with text visible next to it:

```yaml
extra_badges:
  - text: Zone A
    icon: mdi:map-marker
    color: green
    show_state: true
```

#### Combined Example

```yaml
type: custom:flower-card
entity: plant.my_plant
battery_sensor: sensor.plant_battery
extra_badges:
  - entity: sensor.room_humidity
    icon: mdi:water-percent
  - entity: binary_sensor.grow_light_on
    icon: mdi:lightbulb
    color_on: yellow
    color_off: grey
  - text: Kitchen
    icon: mdi:silverware-fork-knife
    color: var(--secondary-text-color)

## Dependencies
1. Custom Plant integration (https://github.com/Olen/homeassistant-plant)

## Installation
[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)

This can be installed manually or through HACS
### Via HACS
* Add this repo as a "Custom repository" with type "Dashboard"
  * Click HACS in your Home Assistant
  * Click Frontend
  * Click the 3 dots in the top right corner and select "Custom Repositories"
  * Add the URL to this github repository and type "Dashboard"
* Click "Install" in the new "Flower Card" card in HACS.
* Wait for install to complete
* You should not need to restart Home Assistant, but will probably need to refresh the frontend and/or "shift-reload" to refresh the browser cache.

### Manual Installation
1: Download the file flower-card.js and add it to somewhere in your `<config>/www/` folder in HA 
 
2: Click your profile picture in the bottom left corner -> Turn on Advanced Mode.
 
3: Go to Configuration -> Lovelace Dashboards -> Resources -> press the + (lower right corner of screen) and add the following information:

```yaml
  Url: /local/<path to>/flower-card.js
  Resource type: JavaScript Module
```
![image](https://user-images.githubusercontent.com/45675902/80322223-ebd41880-8823-11ea-992d-7070d4197f8b.png)

4: Press *Create* afterwards to add the new resource.

5: You should not need to restart Home Assistant, but will probably need to refresh the frontend and/or "shift-reload" to refresh the browser cache.


### Disclaimer
I looked into several forks of the original card https://github.com/thomasloven/lovelace-flower-card. Some forks were very interesting and I edited several of those source codes changes into my own new fork. Credits to those original authors. After version 3.0.0 the card was more or less completely rewritten, and only the design and layout of the original card has been kept.

<a href="https://www.buymeacoffee.com/olatho" target="_blank">
<img src="https://user-images.githubusercontent.com/203184/184674974-db7b9e53-8c5a-40a0-bf71-c01311b36b0a.png" style="height: 50px !important;"> 
</a>
