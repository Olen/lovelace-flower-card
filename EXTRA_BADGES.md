# 🏷️ Extra Badges

Add additional icons and information next to the battery icon in your Flower Card. Useful for displaying room sensors, binary states, action buttons, or static labels.

> [!NOTE]
> Extra badges must be configured via YAML. GUI configuration is not currently supported for this option.

By default, only the icon is displayed. Hovering shows a tooltip with the entity name and state. Set `show_state: true` to display the state value next to the icon.

---

## 📑 Table of Contents

- [🏷️ Extra Badges](#️-extra-badges)
  - [⚙️ Badge Options](#️-badge-options)
  - [📡 Entity-Based Badge](#-entity-based-badge)
  - [🔘 Binary Sensor Badge](#-binary-sensor-badge)
  - [📋 Attribute Badge](#-attribute-badge)
  - [🏷️ Static Icon/Text Badge](#️-static-icontext-badge)
  - [🔲 Action Button Badge](#-action-button-badge)
  - [🧩 Combined Example](#-combined-example)

---

## ⚙️ Badge Options

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

---

## 📡 Entity-Based Badge

Display a sensor with an icon (tooltip shows state on hover):

```yaml
extra_badges:
  - entity: sensor.room_temperature
    icon: mdi:thermometer
```

Display a sensor with icon **and** state value visible:

```yaml
extra_badges:
  - entity: sensor.room_humidity
    icon: mdi:water-percent
    show_state: true
```

---

## 🔘 Binary Sensor Badge

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

---

## 📋 Attribute Badge

Display an entity attribute instead of its state. Useful for `last_changed`, `last_updated`, or any custom attribute:

```yaml
extra_badges:
  - entity: sensor.plant_moisture
    attribute: last_changed
    icon: mdi:clock
```

With the attribute value visible:

```yaml
extra_badges:
  - entity: sensor.plant_moisture
    attribute: last_changed
    icon: mdi:clock
    show_state: true
```

Custom attribute (e.g., battery level from a sensor's attributes):

```yaml
extra_badges:
  - entity: sensor.plant_moisture
    attribute: battery_level
    icon: mdi:battery
    show_state: true
```

---

## 🏷️ Static Icon/Text Badge

Decorative icon with no text or tooltip:

```yaml
extra_badges:
  - icon: mdi:flower
    color: pink
```

Static icon with tooltip text on hover:

```yaml
extra_badges:
  - text: Indoor
    icon: mdi:home
    color: blue
```

Static icon with text visible next to it:

```yaml
extra_badges:
  - text: Zone A
    icon: mdi:map-marker
    color: green
    show_state: true
```

Text only (no icon) — set `icon: none`:

```yaml
extra_badges:
  - text: Kitchen
    icon: none
    color: blue
    show_state: true
```

---

## 🔲 Action Button Badge

Use an `input_button` entity to trigger scripts or automations directly from the plant card.

**Step 1:** Create an input_button helper:

```yaml
# configuration.yaml or via UI: Settings → Devices & Services → Helpers
input_button:
  water_plant:
    name: Water Plant
    icon: mdi:watering-can
```

**Step 2:** Add the button to your card:

```yaml
extra_badges:
  - entity: input_button.water_plant
```

**Step 3:** Create an automation for the button press:

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

This lets you control plant-related devices (pumps, grow lights, etc.) directly from the Flower Card.

---

## 🧩 Combined Example

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
  - entity: input_button.water_plant
```
