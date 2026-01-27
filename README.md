# Flower Card

**This fork of the flower-card depends on this Plant component:
https://github.com/Olen/homeassistant-plant**

The card can be set up from the GUI

![image](https://github.com/user-attachments/assets/a2b1aea4-c2ed-4305-9b14-10ae2d17a34a)

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **Required** | The plant entity ID |
| `name` | string | Entity name | Custom display name for the plant |
| `display_type` | string | `full` | Display mode: `full` or `compact` |
| `hide_units` | boolean | Based on display_type | Hide value/unit next to bars |
| `bars_per_row` | number | Based on display_type | Number of bars per row (1 or 2) |
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
<img width="484" height="256" alt="image" src="https://github.com/user-attachments/assets/faeaeb66-7990-4bbe-9af4-3a4d8648c1c8" />



### Display Type

Set `display_type` to `compact` for a smaller card layout:

```yaml
type: custom:flower-card
entity: plant.my_plant
display_type: compact
```
<img width="483" height="291" alt="image" src="https://github.com/user-attachments/assets/4951c49f-a112-43af-9684-c399bd30dd94" />


### Fine-grained Display Settings

The `display_type` sets defaults for several display options. You can override these individually:

| Setting | Full (default) | Compact |
|---------|----------------|---------|
| `hide_units` | `false` | `true` |
| `bars_per_row` | `2` | `1` |

Mix and match settings to customize the layout:

```yaml
# Compact header but show 2 bars per row with units
type: custom:flower-card
entity: plant.my_plant
display_type: compact
bars_per_row: 2
hide_units: false
```

```yaml
# Full header but hide units
type: custom:flower-card
entity: plant.my_plant
display_type: full
hide_units: true
```

```yaml
# Full header with 1 bar per row (vertical layout)
type: custom:flower-card
entity: plant.my_plant
bars_per_row: 1
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
- \>= 40%: Green
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

Available bars: `moisture`, `temperature`, `conductivity`, `illuminance`, `humidity`, `dli`, `co2`, `soil_temperature`

### Extra Badges

Add additional icons next to the battery icon. Useful for displaying room sensors, binary states, or static labels.

**Note:** Extra badges must be configured via YAML. GUI configuration is not currently supported for this option.

By default, only the icon is displayed. Hovering over the icon shows a tooltip with the entity name and state. Set `show_state: true` to display the state value next to the icon.

#### Extra Badge Options

| Option | Type | Description |
|--------|------|-------------|
| `entity` | string | Entity ID of a sensor or binary_sensor |
| `attribute` | string | Entity attribute to display instead of state (e.g., `last_changed`) |
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

#### Attribute Badge

Display an entity attribute instead of its state. Useful for showing `last_changed`, `last_updated`, or any custom attribute:

```yaml
extra_badges:
  - entity: sensor.plant_moisture
    attribute: last_changed
    icon: mdi:clock
```

Display the attribute value next to the icon:

```yaml
extra_badges:
  - entity: sensor.plant_moisture
    attribute: last_changed
    icon: mdi:clock
    show_state: true
```

Display a custom attribute (e.g., battery level from a sensor's attributes):

```yaml
extra_badges:
  - entity: sensor.plant_moisture
    attribute: battery_level
    icon: mdi:battery
    show_state: true
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

Display text only (no icon) by setting `icon: none`:

```yaml
extra_badges:
  - text: Kitchen
    icon: none
    color: blue
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
```

#### Triggering Automations with Input Button

You can use an `input_button` entity with extra_badges to trigger scripts or automations directly from the plant card. When clicked, the button press triggers your automation.

**Step 1:** Create an input_button helper in Home Assistant:

```yaml
# configuration.yaml or via UI: Settings → Devices & Services → Helpers
input_button:
  water_plant:
    name: Water Plant
    icon: mdi:watering-can
```

**Step 2:** Add the button to your plant card:

```yaml
type: custom:flower-card
entity: plant.my_plant
extra_badges:
  - entity: input_button.water_plant
```

**Step 3:** Create an automation that triggers when the button is pressed:

```yaml
automation:
  - alias: "Water plant when button pressed"
    triggers:
      - trigger: state
        entity_id: input_button.water_plant
    actions:
      - action: switch.turn_on
        target:
          entity_id: switch.plant_water_pump
      - delay: "00:00:30"
      - action: switch.turn_off
        target:
          entity_id: switch.plant_water_pump
```

This allows you to control plant-related devices (pumps, grow lights, etc.) directly from the flower card.

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
