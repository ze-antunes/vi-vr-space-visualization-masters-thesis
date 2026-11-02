# [Visualization of Information in VR Environments to Support the Monitoring and Analysis of Objects in Space](https://baes.uc.pt/handle/10316/118087?mode=full)

<p align="center">
  <img src="./Documents/%5BDS%5D%20Design/VRSatelliteVisualization-GoogleChrome2025-03-1322-30-18-ezgif.com-video-to-gif-converter.gif" alt="Preview" width="100%"/>
</p>

**Dissertation Project**  
[Master in Design and Multimedia – University of Coimbra](https://www.uc.pt/fctuc/dei/ensino/mestrados/mdm/)  
September 2024

- Project Deploy - <https://vr-satellite-visualization.vercel.app/>
- Dissertation Paper - <https://baes.uc.pt/handle/10316/118087?mode=full>

## Contributors

- [José Pedro Antunes](https://github.com/ze-antunes) - design and development
- [Evgheni Polisciuc](https://cdv.dei.uc.pt/people/evgheni-polisciuc) - supervision
- [Jorge C. S. Cardoso](https://www.cisuc.uc.pt/en/people/jorgecardoso) - supervision

## Table of Contents

- [Visualization of Information in VR Environments to Support the Monitoring and Analysis of Objects in Space](#visualization-of-information-in-vr-environments-to-support-the-monitoring-and-analysis-of-objects-in-space)
  - [Contributors](#contributors)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Motivation \& Objectives](#motivation--objectives)
    - [Motivation](#motivation)
    - [Objectives](#objectives)
  - [Project Background](#project-background)
  - [Methodology \& Development](#methodology--development)
  - [Technologies \& Tools](#technologies--tools)
  - [Repository Structure](#repository-structure)
  - [Usage \& Setup](#usage--setup)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Additional Setup](#additional-setup)
  - [Images \& Diagrams](#images--diagrams)
    - [Project Overview](#project-overview)
    - [Design Mockups](#design-mockups)
    - [VR Environment Screenshots](#vr-environment-screenshots)
  - [Acknowledgements](#acknowledgements)
  - [Contact](#contact)

## Overview

This repository contains the source code and supporting materials for my dissertation project titled **"Visualization of Information in VR Environments to Support the Monitoring and Analysis of Objects in Space."** The project explores innovative techniques for spatial data visualization using virtual reality (VR), addressing the growing need for effective monitoring of satellites and other space objects to prevent collisions.

## Motivation & Objectives

### Motivation

- The rapid increase in the number of satellites and space objects has amplified the risk of collisions.
- Traditional 2D visualization methods lack the depth and interactivity needed for effective spatial analysis.
- VR offers an immersive solution, allowing users to “step inside” the data, manipulate 3D representations, and gain better insights into complex spatial relationships.

### Objectives

1. **Explore VR Visualization Techniques:** Develop methods to leverage immersive 3D environments for data visualization.
2. **Interactive Data Manipulation:** Enable interactive exploration of satellite data, including position, trajectory, and uncertainty.
3. **Collision Prevention:** Support the analysis and prediction of potential collisions through dynamic visualizations.
4. **Multi-Platform Integration:** Create a tool that functions seamlessly across desktop, mobile, and VR devices.

## Project Background

The dissertation was developed under the guidance of Professors Evgheni Polisciuc and Jorge C. S. Cardoso and in collaboration with Neuraspace, a company specializing in space traffic management using artificial intelligence. The research focuses on combining traditional information visualization techniques with modern VR capabilities to create an effective system for monitoring and analyzing spatial data.

Key aspects of the dissertation include:

- **Literature Review & State of the Art:** Analyzing existing visualization methods, VR techniques, and their limitations.
- **Data Integration:** Using historical satellite conjunction data provided by Neuraspace to explore positions, baseline uncertainty, and supplied manoeuvre metrics.
- **Design & Prototyping:** Iterative design process including mockups, UI prototypes, and usability testing.
- **Development & Implementation:** Building the visualization module, integrating VR interfaces, and addressing technical challenges (e.g., performance, interaction design).

## Methodology & Development

The development of the project followed a structured approach:

1. **Preliminary Work:**
   - Analysis of spatial data and exploration of VR tools and frameworks (e.g., Three.js, A-Frame).
   - Initial prototyping and design iterations based on early mockups and user feedback.

2. **Design & Prototyping:**
   - Creating detailed design mockups for the visualization module.
   - Conducting usability tests and refining the interface.

3. **Implementation:**
   - Integration of a historical Neuraspace sample into a VR environment.
   - Development of interactive elements such as globe visualization and dynamic dashboards.
   - Overcoming challenges related to performance, hand tracking, and VR sickness.

4. **Evaluation:**
   - Prototype usability testing; numerical regression and browser tests were added during the 2026 maintenance work. Operational prediction accuracy has not been validated.
   - Collecting feedback from potential users to inform future improvements.

## Technologies & Tools

- **Frontend & VR Frameworks:**
  - Three.js (the A-Frame-compatible super-three build), A-Frame, WebXR APIs

- **Data Processing:**
  - A bundled historical Neuraspace JSON sample, with no live API connection

- **Design & Prototyping:**
  - Figma, ShapesXR, Adobe Photoshop

- **Other Tools:**
  - Git for version control
  - Vite and Vercel

## Repository Structure

The project structure is as follows:

```plain
Visualization_of_Information_in_VR_Environments_of_Objects_in_Space/
│
├── Documents/                   # Documentation related to the project
│   ├── %5BDS%5D%20Design/             # Design files, mockups, and prototypes
│   └── [QA] Quality/            # Quality assurance documents and processes
│
├── Exploration/                 # Experimental explorations and tests
│   ├── A-frame/                 # Tests using A-frame for VR visualization
│   ├── Resources/               # Additional resources
│   └── exp_conjunctions.json    # Sample from the Neuraspace dataset (exp_ => exporation)
│
├── src/                         # Main source code for the VR application
│   ├── Experience/              # Core application logic and VR experience management
│   │   ├── Shaders/             # Custom shaders for rendering effects
│   │   ├── Utils/               # Utility functions and helpers
│   │   ├── World/               # 3D world setup and scene management
│   │   ├── Camera.js            # Handles VR camera and user perspective
│   │   ├── Experience.js        # Main experience manager
│   │   ├── Renderer.js          # Manages rendering pipeline
│   │   └── sources.js           # Handles asset sources
│   ├── fonts/                   # Fonts used in the project
│   ├── index.html               # Main HTML file
│   ├── script.js                # Main JavaScript file
│   ├── style.css                # Main CSS file
│   └── test.html                # Test file
│
├── static/                      # Static assets such as models and textures
│   ├── models/                  # 3D models used in the VR environment
│   ├── textures/                # Textures for materials and objects
│   ├── conjunctions.json        # Main sample from Neuraspace dataset for conjunction analysis
│   └── exp_conjunctions.json    # Sample dataset from Neuraspace for exploratory analysis
│
├── .gitignore                   # Specifies files and folders to ignore in version control
├── LICENSE                      # License information for the project
├── package-lock.json            # Auto-generated dependency lock file
├── package.json                 # Project dependencies and scripts
├── README.md                    # This file
└── vite.config.js               # Configuration for Vite (build tool)
```

## Usage & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) 22.13+ (22.x) or 24+, npm 10.8.3+, and Git
- A modern WebGL browser; an HTTPS origin and a compatible WebXR browser/headset for immersive VR

### Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/ze-antunes/Visualization_of_Information_in_VR_Environments_of_Objects_in_Space.git
   cd Visualization_of_Information_in_VR_Environments_of_Objects_in_Space
   ```

2. **Install dependencies:**

   ```sh
   npm ci
   ```

3. **Run the application:**

   ```sh
   npm run dev
   ```

### VR experience and technical maintenance

This remains a VR research prototype. The original three-mesh-ui card layouts, colours, icons and loading animation are preserved. Selection, simulation and display controls are consolidated into a tabbed 3D workspace. The desktop browser previews and interacts with the same 3D interface; there is no separate HTML dashboard.

- Select conjunction and manoeuvre cards with the mouse or either controller trigger. Use the original arrow buttons to access every manoeuvre.
- In VR, the catalogue can follow the left controller. X toggles it; Y recenters the workspace around the current viewpoint. Grip moves a simulation. Outside VR, left drag looks around and WASD moves the camera. Right drag rotates the pointed simulation; the wheel resizes that simulation uniformly. R restores the camera and scene framing.
- Desktop shortcuts: **R** resets the scene, **U** toggles baseline uncertainty, **P** toggles covariance projections, **M** toggles controller-mounted menus, and **E** toggles A-Frame statistics.
- The original search icon opens a 3D keyboard for filtering conjunctions by either object's name or COSPAR ID. Desktop typing also works; Enter/Escape closes it and Clear restores the full list.
- The original column icon switches the manoeuvre list between one and two columns (7 or 14 records per page).
- The shared console has **Analyse**, **Display**, **Details** and **Help** tabs. Analyse combines the A/B metrics and timeline; Display holds uncertainty, projections, sigma and scale options; Details shows epochs, fuel/duration and baseline metrics.
- **Compare A / B** opens two independent simulations. Select an A/B card in the console, then choose its manoeuvre from the catalogue. Each simulation retains its own selection, orientation and clock. Both share the conjunction and display scale. Switching conjunction exits comparison.
- A/B metric cards share the same console. Supplied PoC, miss distance and delta-v stay beside the estimated instantaneous separation; further details are opt-in, without automatic selection popups.
- Globe playback covers +/-300 seconds around each candidate's TCA; Room playback covers +/-0.5 seconds. Playback supports play/pause, reverse, speed, steps, direct timeline dragging and optional looping. **Link A/B** synchronises relative TCA offsets; independent clocks remain the default. Changing view returns both to TCA.
- **Position focus** enlarges the local encounter while applying one explicitly labelled, uniform display factor to baseline covariance. Disable it for equal physical scaling of positions and uncertainty. This preserves covariance shape and orientation; the reduced display envelope must not be treated as a physical collision region.
- The room has opaque interior walls, an open front and ceiling, and grids. Green/blue covariance ellipses project onto the back XY, floor XZ and left ZY planes in scene coordinates. Their visual overlap is not a PoC calculation.

There are two permanent information surfaces: **Catalogue** (Conjunctions / Manoeuvres) and **Analysis console**. Selecting a conjunction opens its manoeuvre catalogue. Sort by PoC (ascending), miss distance (descending) or delta-v (ascending) without changing record IDs. **Catalogue** hides the list and **Focus** collapses the console to its navigation ribbon. Both options preserve the scene state.

The workspace is anchored in front of the user's POV when recentered; it does not continuously follow head turns. Changing display options or list columns does not move the simulations. The catalogue can be controller-mounted while the console stays world-anchored below the analysis area.

| Control | Action |
| --- | --- |
| Right A | Play/pause active simulation (or linked pair) |
| Right B | Globe / Room |
| Right thumbstick | Horizontal: scrub time; vertical: resize active scene |
| Left X / Y | Toggle catalogue / recenter workspace |
| Trigger held on timeline | Drag time continuously |
| Grip | Move pointed scene |
| Space / T / C / F | Play-pause / TCA / comparison / collapse console |
| [ / ] | Step backward / forward |

Moving solid trails complement the dashed coasting paths. Playback stops at the window boundary unless Loop is enabled; reversing and speed changes preserve the current position. These controls animate estimated orbital/encounter motion, rather than a validated reconstruction of thrust execution.

The bundled dataset contains four historical conjunctions from July 2024, with 100, 31, 7 and 36 manoeuvres. It does not provide live data or recompute operational collision predictions. Missing metrics remain unavailable.

Dashed trajectories are numerical two-body coasting estimates from the supplied position/velocity states. Globe shows 5700 seconds of orbital context. Room shows simultaneous relative motion over +/-0.5 seconds in a translating EME2000 frame following the baseline target. Baseline states are propagated to each candidate's epoch, retaining sub-millisecond TCA differences. The candidate state is anchored at its own supplied TCA. This does not reconstruct the burns, drag, J2 or other perturbations, and does not propagate covariance.

The estimated separation can differ from the supplied miss distance: for the first Swarm-B candidate, the aligned two-body estimate at TCA is about 3421 m while the dataset supplies 4702 m. The interface keeps both values distinct. The estimate must not replace the supplied PoC or miss-distance prediction. [CelesTrak explains the accuracy/complexity trade-off in orbital propagation](https://www.celestrak.org/columns/v01n01/).

Positions are interpreted as EME2000 in metres and velocity in m/s; baseline covariance is RTN in m². The scene uses `(X, Y, Z) = (EME X, EME Z, -EME Y)`. Both local simulations use a common scale computed from all candidate tracks. Baseline covariance stays anchored at its supplied epoch. Its display factor is the same for A and B and is shown below each scene. The default envelope is 3 sigma, without assigning a 99.7% joint probability to it. There is no post-manoeuvre covariance in the sample. Satellite icons have symbolic sizes, sunlight is illustrative, and Earth orientation uses approximate GMST at baseline TCA.

The preview camera uses a 60-degree FOV with aspect-aware layout; WebXR projection remains controlled by the headset. UI materials form an information layer so walls, Earth and trajectories cannot cut through the cards. The supplementary panels reuse the original dark background, gray rounded cards, Roboto typography and yellow selection outline.

### Validation and dependencies

```sh
npm run check
npx playwright install chromium
npm run test:e2e
npm audit
npm run preview
```

Eleven numerical tests cover coordinate transforms, uncertainty and projection maths, data validation, pagination and demonstrative propagation. Seventeen browser regressions exercise the original 3D panels, pagination, selection, room scale, projections, search, column layout, independent simulations, camera controls and framing at multiple aspect ratios, loading failures and resource stability. They do not validate tracking, native XR sessions or comfort on a physical headset.

Dependencies are pinned. A-Frame 1.8.0, the application and three-mesh-ui share `three`, aliased to `super-three` 0.184.0. Keep that version aligned with A-Frame; `npm outdated` may intentionally report a newer fork. Unused GSAP, CSG, stats.js and Vercel CLI dependencies were removed. The audit reported zero vulnerabilities on 2 November 2026 after updating `follow-redirects` to 1.16.2 and overriding ESLint's transitive `minimatch` to 11.0.4. The scoped override is needed while ESLint and its config-array dependency still request minimatch 10; remove it when their supported ranges include a patched version. See the [follow-redirects advisory](https://github.com/advisories/GHSA-mrwp-f3q8-3g9p) and [minimatch advisory](https://github.com/advisories/GHSA-g3hv-75wg-m249). Upstream A-Frame dependencies still include a Git package and deprecated `phin`; their installation warnings remain expected.

For a headset on the local network, expose the development server explicitly with `node node_modules/vite/bin/vite.js --host 0.0.0.0` and use a trusted HTTPS origin for WebXR. Build with `npm run build` and publish `dist/` for static hosting. Nothing is deployed by the checks above. Anything in `static` is public.

See [the technical review](Documents/REVISAO_TECNICA_2026-10-18.md) and [implementation notes](Documents/MELHORIAS_2026-10-18.md) and [the design intent derived from the thesis and images](Documents/INTENCAO_DE_DESIGN.md).

## Images & Diagrams

### Project Overview

<p align="center">
  <img src="./Documents/%5BDS%5D%20Design/screen_shots/image4.jpg" alt="Project Overview 1" width="45%"/>
  <img src="./Documents/%5BDS%5D%20Design/screen_shots/image55.jpg" alt="Project Overview 2" width="45%"/>
</p>

### Design Mockups

<p align="center">
  <img src="./Documents/%5BDS%5D%20Design/screen_shots/image35.jpg" alt="ShapesXR 1" width="45%"/>
  <img src="./Documents/%5BDS%5D%20Design/screen_shots/Imagem_shapes1.jpg" alt="ShapesXR 2" width="45%"/>
</p>

<p align="center">
  <img src="./Documents/%5BDS%5D%20Design/screen_shots/Group 1881.png" alt="UI" width="91%"/>
</p>

### VR Environment Screenshots

<p align="center">
  <img src="./Documents/%5BDS%5D%20Design/screen_shots/image41.jpg" alt="VR Environment Screenshots 1" width="45%"/>
  <img src="./Documents/%5BDS%5D%20Design/screen_shots/Imagem WhatsApp 2024-09-06 às 09.20.30_afddc5c6.jpg" alt="VR Environment Screenshots 2" width="45%"/>
</p>

## Acknowledgements

I would like to express my sincere gratitude to:

- **Professors Evgheni Polisciuc and Jorge C. S. Cardoso** for their invaluable guidance throughout this project.
- **Neuraspace** for providing the data and collaboration that made this research possible.
- My colleagues, friends, and family for their continuous support and encouragement during this journey.

## Contact

For any questions or further information, please feel free to reach out:

- **Name:** José Pedro da Rocha Antunes
- **Email:** <jprantunes2000@gmail.com>

---

_Made with ❤️ as part of my Master’s Dissertation._
