# 🌸 Flower Card for Home Assistant

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)
[![GitHub Release](https://img.shields.io/github/v/release/Olen/lovelace-flower-card?style=for-the-badge)](https://github.com/Olen/lovelace-flower-card/releases)

A Lovelace card for displaying plant data from the [Plant Monitor](https://github.com/Olen/homeassistant-plant) integration. Shows sensor readings, thresholds, and health status in a compact visual layout.

> [!IMPORTANT]
> This card requires the [Plant Monitor](https://github.com/Olen/homeassistant-plant) custom integration. It is **not** compatible with the built-in plant integration.

---

## 📑 Table of Contents

- [🌸 Flower Card for Home Assistant](#-flower-card-for-home-assistant)
  - [📦 Installation](#-installation)
  - [⚙️ Configuration](#️-configuration)
  - [🖼️ Display Types](#️-display-types)
  - [📊 Show Bars](#-show-bars)
  - [🔋 Battery Sensor](#-battery-sensor)
  - [🏷️ Extra Badges](#️-extra-badges)
  - [🎨 Other Options](#-other-options)
  - [☕ Support](#-support)

---

## 📦 Installation

### Via HACS *(recommended)*

1. Add this repo as a [Custom Repository](https://hacs.xyz/docs/faq/custom_repositories/) with type **Dashboard**
2. Click **Install** in the "Flower Card" card in HACS
3. Refresh the frontend (shift-reload your browser)

### Manual Installation

1. Download `flower-card.js` and place it in your `<config>/www/` folder
2. Go to **Settings** → **Dashboards** → **Resources**
3. Add the resource:
   ```yaml
   Url: /local/<path to>/flower-card.js
   Resource type: JavaScript Module
   ```
4. Refresh the frontend

---

## ⚙️ Configuration

The card can be set up from the GUI:

![GUI editor](https://github.com/user-attachments/assets/a2b1aea4-c2ed-4305-9b14-10ae2d17a34a)

Or via YAML:

```yaml
type: custom:flower-card
entity: plant.my_plant
```

### All Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **Required** | The plant entity ID |
| `name` | string | Entity name | Custom display name |
| `display_type` | string | `full` | Display mode: `full` or `compact` |
| `hide_units` | boolean | Based on display_type | Hide value/unit next to bars |
| `bars_per_row` | number | Based on display_type | Number of bars per row (1 or 2) |
| `battery_sensor` | string | — | Entity ID of a battery sensor |
| `show_bars` | list | All | Measurement bars to show |
| `hide_species` | boolean | `false` | Hide the species name |
| `hide_image` | boolean | `false` | Hide the plant image |
| `extra_badges` | list | — | Additional icons ([details](EXTRA_BADGES.md)) |

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

<img width="484" height="256" alt="Full card example" src="https://github.com/user-attachments/assets/faeaeb66-7990-4bbe-9af4-3a4d8648c1c8" />

---

## 🖼️ Display Types

### Full *(default)*

```yaml
type: custom:flower-card
entity: plant.my_plant
display_type: full
```

### Compact

A smaller card layout with hidden units and single-column bars:

```yaml
type: custom:flower-card
entity: plant.my_plant
display_type: compact
```

<img width="483" height="291" alt="Compact card" src="https://github.com/user-attachments/assets/4951c49f-a112-43af-9684-c399bd30dd94" />

### Fine-Grained Overrides

The display type sets defaults you can override individually:

| Setting | Full | Compact |
|---------|------|---------|
| `hide_units` | `false` | `true` |
| `bars_per_row` | `2` | `1` |

```yaml
# Compact header but 2 bars per row with units
type: custom:flower-card
entity: plant.my_plant
display_type: compact
bars_per_row: 2
hide_units: false
```

---

## 📊 Show Bars

Select which measurement bars to display:

```yaml
show_bars:
  - moisture
  - temperature
  - illuminance
```

Available bars: `moisture`, `temperature`, `conductivity`, `illuminance`, `humidity`, `dli`, `co2`, `soil_temperature`

---

## 🔋 Battery Sensor

Add a battery indicator to the card header. The icon changes color based on level:

| Level | Color |
|-------|-------|
| >= 40% | 🟢 Green |
| 20–39% | 🟠 Orange |
| < 20% | 🔴 Red |

```yaml
battery_sensor: sensor.plant_sensor_battery
```

![Battery sensor](https://user-images.githubusercontent.com/203184/190199923-6060efbf-7306-49e5-bbc4-26dc922d3180.png)

---

## 🏷️ Extra Badges

Add additional icons next to the battery icon — sensor values, binary states, action buttons, or static labels.

```yaml
extra_badges:
  - entity: sensor.room_humidity
    icon: mdi:water-percent
  - entity: binary_sensor.grow_light_on
    icon: mdi:lightbulb
    color_on: yellow
    color_off: grey
  - entity: input_button.water_plant
```

For the full reference with all badge types and options, see **[EXTRA_BADGES.md](EXTRA_BADGES.md)**.

---

## 🎨 Other Options

### Custom Name

```yaml
name: "Living Room Monstera"
```

### Hide Species / Image

```yaml
hide_species: true
hide_image: true
```

---

## ☕ Support

<a href="https://www.buymeacoffee.com/olatho" target="_blank">
<img src="https://user-images.githubusercontent.com/203184/184674974-db7b9e53-8c5a-40a0-bf71-c01311b36b0a.png" style="height: 50px !important;">
</a>

---

*This card is a fork of [thomasloven/lovelace-flower-card](https://github.com/thomasloven/lovelace-flower-card). After version 3.0.0 the card was largely rewritten; only the original design and layout have been kept.*
