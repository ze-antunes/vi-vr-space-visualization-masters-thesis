# [Visualization of Information in VR Environments to Support the Monitoring and Analysis of Objects in Space](https://baes.uc.pt/handle/10316/118087?mode=full)

<p align="center">
  <img src="./Documents/%5BDS%5D%20Design/VRSatelliteVisualization-GoogleChrome2025-03-1322-30-18-ezgif.com-video-to-gif-converter.gif" alt="Preview" width="100%"/>
</p>

**Dissertation Project**  
[Master in Design and Multimedia – University of Coimbra](https://www.uc.pt/fctuc/dei/ensino/mestrados/mdm/)  
September 2024

- Project Deploy - https://vr-satellite-visualization.vercel.app/
- Dissertation Paper - https://baes.uc.pt/handle/10316/118087?mode=full

### Contributors

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
- **Data Integration:** Utilizing satellite data provided by Neuraspace to simulate real-time monitoring and collision prediction.
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

   - Integration of data streams from Neuraspace into a VR environment.
   - Development of interactive elements such as globe visualization and dynamic dashboards.
   - Overcoming challenges related to performance, hand tracking, and VR sickness.

4. **Evaluation:**
   - System testing to validate the accuracy and responsiveness of the visualization.
   - Collecting feedback from potential users to inform future improvements.

## Technologies & Tools

- **Frontend & VR Frameworks:**

  - Three.js, A-Frame.js, WebVR APIs

- **Data Processing:**

  - Data integration from external APIs and Neuraspace datasets

- **Design & Prototyping:**

  - Figma, ShapesXR, Adobe Photoshop

- **Other Tools:**
  - Git for version control
  - Vite and Vercel

## Repository Structure

The project structure is as follows:

```
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

- [Node.js](https://nodejs.org/)
- A compatible web browser that supports WebVR / WebXR

### Installation

1. **Clone the repository:**
   ```sh
   git clone --branch v1.0_september_2024 https://github.com/ze-antunes/vi-vr-space-visualization-masters-thesis.git
   cd vi-vr-space-visualization-masters-thesis
   ```
2. **Install dependencies:**
   ```sh
   npm ci
   ```
3. **Run the application:**
   ```sh
   npm run dev
   ```

When switching between `v1.0_september_2024` and `v2.0_november_2026`, stop the development server, run `npm ci` again, then restart with `npm run dev`. Each branch uses different dependency versions; Git does not switch the contents of `node_modules`. Use the committed `package-lock.json` to reproduce this version without upgrading its dependencies.

### Additional Setup

- Please make sure that you have access to the necessary satellite data, as described in the documentation. (In this case, the application is running a sample from the Neuraspace dataset)

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
- **Email:** jprantunes2000@gmail.com

---

_Made with ❤️ as part of my Master’s Dissertation._
