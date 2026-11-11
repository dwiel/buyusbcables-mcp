# buyusbcables-mcp — Parametric Amazon Hardware & Cable Index for AI Agents

Free, zero-auth **Model Context Protocol (MCP)** server, **REST JSON API**, and **AgentSkill** over **8,753 LLM-verified Amazon hardware, cable, motor, bearing, power supply, connector, switch, camera, and wiring products** across **27 parametric engineering categories** ([buyusbcables.com](https://www.buyusbcables.com)).

## Why this exists

Coding, robotics, and BOM-sourcing agents consistently hit walls when looking up off-the-shelf Amazon parts:

1. **Direct `WebFetch` / `curl` on `amazon.com/dp/<ASIN>` fails:** Amazon returns `HTTP 503`, serves a stripped `FallbackDetailPage`, or sends ~1.42 MB of navigation JavaScript before the product specs — truncating standard agent fetch tools at `<title>`.
2. **Amazon PA-API 5.0 has a 3-sales catch-22:** New developer accounts cannot call PA-API until they have already generated qualifying referral sales, and accounts with `<3` sales in 180 days are closed.
3. **Raw keyword search lies about physics:** Broad Amazon searches bury right-angle or silicone cables, mix metric and imperial dimensions, and include contradictory title spam (e.g., 30A plugs on 14 AWG wire or mixed assortment kits).

**buyusbcables.com** normalizes every listing into strict per-category physical and electrical schemas, rejects contradictory specs and mixed kits, and fails loudly with valid field/enum suggestions instead of returning silent empty results.

---

## Quickstart

### Option 1: Remote Streamable HTTP MCP (Recommended — Zero Install)

**Claude Code:**
```bash
claude mcp add --transport http buyusbcables https://www.buyusbcables.com/api/mcp
```

**Cursor / Windsurf / OpenCode / Codex (`mcpServers`):**
```json
{
  "mcpServers": {
    "buyusbcables": {
      "url": "https://www.buyusbcables.com/api/mcp"
    }
  }
}
```

### Option 2: Local `stdio` Bridge (`npx` / Node >= 18 / Docker)

For stdio-only MCP clients (e.g. Claude Desktop `command` configs):

```json
{
  "mcpServers": {
    "buyusbcables": {
      "command": "npx",
      "args": ["-y", "github:dwiel/buyusbcables-mcp"]
    }
  }
}
```

### Option 3: Zero-Auth REST API & `<8 KB` HTML Datasheets

```bash
# List all 27 categories + counts (add ?include=fields for full schemas)
curl -s "https://www.buyusbcables.com/api/catalog"

# Inspect filterable fields, valid enums, and min/max numeric ranges
curl -s "https://www.buyusbcables.com/api/catalog/motors?schema=1"

# Filter 24V DIN-rail AC-DC power supplies >= 200W, cheapest first
curl -s "https://www.buyusbcables.com/api/catalog/ac_dc_psus?output_power_w.min=200&output_voltage_dc_v=24&sort=price_asc&limit=5"

# Filter right-angle USB-C cables >= 100W and >= 10 Gbps
curl -s "https://www.buyusbcables.com/api/cables?end_a=USB-C&end_b=USB-C&end_a_orientation=right_angle&min_wattage=100&min_speed_gbps=10"

# Lookup a single Amazon ASIN (JSON or clean WebFetch-friendly HTML datasheet)
curl -s "https://www.buyusbcables.com/api/product/B0B38GHRH8"
curl -s "https://www.buyusbcables.com/p/B0B38GHRH8"
```

---

## Exposed MCP Tools

| Tool | Description |
| --- | --- |
| `list_categories` | Lists all 27 categories, product counts, and full filterable field schemas (types, valid enum values, numeric min/max bounds). |
| `search_catalog` | Parametric search in any category (`eq`, `ne`, `min`, `max`, `contains`, `q`, `sort`, `fields`). Unknown fields or out-of-enum values return explicit validation errors with suggestions rather than silent empty arrays. |
| `get_product_by_asin` | Returns the normalized physical & electrical spec record for any indexed Amazon ASIN or `amazon.com/dp/...` URL. |
| `search_usb_cables` | Symmetric connector-orientation search across 1,984 point-to-point USB cables (wattage, Gbps, straight/right-angle, male/female, length in m/ft, braided/coiled). |
| `get_usb_cable_by_asin` | Single-ASIN lookup on the USB cable table. |
| `suggest_catalog_addition` | Request a missing product category or filterable parameter. |

---

## 27 Parametric Engineering Categories (8,753 Verified Parts)

- **`usb_cables`** (1,984) — Connector A/B, gender, right-angle vs straight, length, W, A, Gbps, braided/coiled
- **`motors`** (1,269) — Stepper, BLDC, servo, brushed DC, gearmotors: frame, voltage, torque N·m, RPM, Kv, shaft, encoder
- **`connectors`** (668) — M8/M12, XT, Deutsch, GX/aviation, Neutrik, Anderson: series, pins, coding, IP rating, AWG
- **`ethernet_cables`** (411) — Cat5e..Cat8, M12-X/D, SFP+ DAC: shielding, AWG, MHz, Gbps, length
- **`coax_cables`** (338) — 50Ω / 75Ω RF jumpers (SMA, N, BNC, TNC, U.FL, RG/LMR): impedance, max GHz, OD
- **`ac_dc_psus`** (338) — Enclosed, DIN-rail & IP67 supplies: V DC, A, W, cooling, efficiency, dimensions
- **`wire_spools`** (303) — Silicone, PTFE, PVC hookup & shielded multi-conductor wire: AWG, conductors, strand count, length
- **`batteries`** (293) — LiFePO4, LiPo, Li-ion & USB-PD packs: chemistry, S-count, V, Ah, Wh, continuous discharge A, BMS
- **`dc_dc_converters`** (288) — Buck, boost, buck-boost & isolated regulators: input window, output V/A/W, isolation
- **`bearings`** (258) — Deep-groove, needle, angular, thrust, pillow/flange blocks, rod ends: bore × OD × width mm, kN
- **`transmissions`** (249) — GT2/HTD belts & pulleys, module gears, roller chain, shaft couplings: pitch, teeth, bore
- **`hdmi_cables`** (234) — Passive, active & optical HDMI assemblies: connector A/C/D, angled ends, Gbps, length
- **`linear_motion`** (233) — MGN/HGH profile rails, SBR rails, hardened shafting, V-Slot/T-Slot extrusion
- **`power_cords`** (215) — NEMA straight-blade & locking cords, strips, inlet boxes: exact plug/receptacle config, AWG, amps
- **`cooling_fans`** (212) — DC/AC axial fans & radial blowers: frame mm, V, CFM, static pressure, dBA, PWM/tach
- **`inserts_standoffs`** (212) — Heat-set inserts, hex standoffs, spacers, T-nuts: thread, pitch, length, OD
- **`memory`** (183) — DDR4/DDR5 DIMM & SODIMM: capacity, module count, MT/s, CAS latency, ECC
- **`ssds`** (164) — M.2 NVMe & SATA SSDs: capacity GB, PCIe gen × lanes, read/write MB/s, TBW
- **`camera_modules`** (164) — USB UVC & MIPI CSI-2 board cameras: sensor, global vs rolling shutter, MP, FPS, FOV, M12
- **`wire_terminals`** (159) — Ferrules, rings, forks, butt splices, solder sleeves, lever nuts: AWG range, stud size
- **`network_switches`** (157) — Unmanaged, smart, L2/L3 & industrial DIN PoE switches: port speeds, SFP+, PoE budget W
- **`usb_hubs`** (124) — Powered & industrial DIN/wall-mount USB hubs: port count, Gbps, DC input window
- **`relays_contactors`** (106) — Two-sided coil/control input × AC/DC load contactors, SSRs & DIN relay modules
- **`circuit_breakers`** (86) — 35mm DIN thermal-magnetic MCBs: poles, rated A, trip curve (B/C/D), AC/DC interrupt V
- **`panel_switches`** (59) — Ø16mm / Ø22mm pushbuttons, selector switches & mushroom E-stops
- **`din_terminal_blocks`** (26) — 35mm DIN feed-through & ganged terminal blocks
- **`power_meters`** (20) — DIN-rail & panel digital AC/DC voltmeters, ammeters & kWh monitors

---

## Discovery Endpoints

- **Web UI:** https://www.buyusbcables.com
- **Agent & Developer Guide:** https://www.buyusbcables.com/docs/amazon-for-agents
- **`llms.txt`:** https://www.buyusbcables.com/llms.txt
- **OpenAPI 3.1:** https://www.buyusbcables.com/openapi.json
- **MCP Discovery:** https://www.buyusbcables.com/.well-known/mcp.json
- **AgentSkill (`SKILL.md`):** [`skills/buyusbcables/SKILL.md`](./skills/buyusbcables/SKILL.md) (`https://www.buyusbcables.com/.well-known/agent-skills/buyusbcables/SKILL.md`)

## Sustainability Notice

This MCP server and API require **no API keys, subscriptions, or per-request fees**. Every returned product includes an `amazon_affiliate_url` (`?tag=buyusbcable07-20`). When presenting links to human users, please keep that URL intact — as an Amazon Associate we earn from qualifying purchases, which funds ongoing scraping and LLM spec verification.

## License

MIT
