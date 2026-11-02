# Thesis experiments archive

Historical prototypes from the dissertation **Visualization of Information in VR Environments to Support the Monitoring and Analysis of Objects in Space**.

This branch preserves six complete, independent repository snapshots. The contents of every snapshot are identical to the original branch tree, including source code, assets, documents, dependency manifests and lockfiles. The archive commit retains all six source commits as parents, preserving their histories. Original branches are retained and each source commit also has an annotated `archive/experiments/...` tag.

## Catalogue

| Experiment | Snapshot | Suggested project directory | Original commit |
| --- | --- | --- | --- |
| Grouping objects | [experiments/group-objects](experiments/group-objects) | `Exploration/A-frame/Conjunctions` | [`71075f3`](https://github.com/ze-antunes/vi-vr-space-visualization-masters-thesis/commit/71075f3a874adb1311c61e476fa694f5c26b8e0b) |
| Controller and hand interaction | [experiments/controllers-and-hands](experiments/controllers-and-hands) | `Exploration/A-frame/Globe` | [`8e2cbc7`](https://github.com/ze-antunes/vi-vr-space-visualization-masters-thesis/commit/8e2cbc7b302bfbb2d7a05058b82135316715e875) |
| Covariance projection shader | [experiments/covariance-projection-shader](experiments/covariance-projection-shader) | `.` | [`2276757`](https://github.com/ze-antunes/vi-vr-space-visualization-masters-thesis/commit/2276757c57cf50b2c8c560f562346eaafbee2996) |
| EME2000 positions and trajectories | [experiments/eme2000-positions-and-trajectories](experiments/eme2000-positions-and-trajectories) | `Exploration/A-frame/Globe` | [`cc7f472`](https://github.com/ze-antunes/vi-vr-space-visualization-masters-thesis/commit/cc7f472e506c38358ac53f7a1c4b7f33eea5a88e) |
| Globe representation | [experiments/globe-representation](experiments/globe-representation) | `Exploration/A-frame/Globe` | [`08e3fca`](https://github.com/ze-antunes/vi-vr-space-visualization-masters-thesis/commit/08e3fca8a79e902c5de3593d6ac4c62d7e01b7dc) |
| Menu panels | [experiments/menu-panels](experiments/menu-panels) | `.` | [`4a9f048`](https://github.com/ze-antunes/vi-vr-space-visualization-masters-thesis/commit/4a9f0487c71fe16ace395c0cbcff2924f68ed2bb) |

See [catalogue.json](catalogue.json) for original branch names, exact commit and tree hashes, archival tags, source dates and all project directories with a development script. Each snapshot also retains its original README and design documents.

## Opening a prototype

Clone the archive separately to avoid sharing installed dependencies with v1 or v2:

```sh
git clone --branch experiments https://github.com/ze-antunes/vi-vr-space-visualization-masters-thesis.git thesis-experiments
cd thesis-experiments
cd experiments/globe-representation/Exploration/A-frame/Globe
npm ci
npm run dev
```

For another prototype, use its snapshot path followed by the suggested project directory above. A `.` means the root of that snapshot. Install dependencies **inside that project directory**, where its own `package.json` and lockfile reside. The archive root has no application or shared npm installation.

These are historical research snapshots, not a modernised or validated release of the application. Their original dependencies, external CDN references and incomplete experiments are preserved; this archival operation does not certify that every prototype currently builds or runs. Do not apply automatic dependency upgrades to the archive if you want to preserve the original work. Make repairs in a separate working branch.

## Versions

- `v1.0.0`: thesis version, branch `v1.0_september_2024`.
- `v2.0.0-beta.1`: improved VR analysis workspace, branch `v2.0_november_2026`.
- `experiments-2024`: this archive, branch `experiments`.

The archive is organised by prototype rather than merged into one application. Repeated assets refer to the same Git objects where their contents match, although checking out or downloading all snapshots requires space for every copy.
