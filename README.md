# Synthetic UX Lab

Create a clean, modern, desktop-first internal web application called Synthetic UX Lab.

The product helps UX and product teams compare 2–3 interface variants using AI-generated synthetic user simulations.

For this first version, build only the frontend application shell with realistic mock data. Do not build the real AI system, backend architecture, authentication, database, or complex integrations yet.

Core screens

1. Experiments

Create a simple dashboard showing:

Recent experiments

Status: Draft, Running, Complete

Number of variants

Simulation size

Predicted winner where available

“New Experiment” button

Include 3–4 realistic mock experiments.

2. New Experiment

Create a simple experiment setup flow with:

Experiment

Experiment name

User context

Primary persona description

User task / use case

Success criteria

UI variants
Allow 2–3 variants.

Each variant should support:

Name: Variant A, B, C

Screenshot/image upload placeholder

URL/HTML input placeholder

No real upload processing is needed yet.

Simulation scale

Two stages:

Pilot

100 simulations

500 simulations

1,000 simulations

Test

10,000

100,000

1,000,000

10,000,000

Show Test mode as available in the interface, but mark it clearly as a future/advanced capability for now.

Add a primary Run Simulation button.

3. Experiment Results

Create a results dashboard using mock simulation data.

Show:

Predicted Winner

Confidence: High / Medium / Low

Total synthetic simulations

Pilot or Test label

Compare Variant A, B and C using:

Task success

Error-free sessions

Interaction efficiency

Correct first action / discoverability

Backtracking

Abandonment

Include a simple comparison chart.

Then show:

Why this variant performed better
A short AI-generated-looking explanation.

Observed usability issues
3–5 concise findings.

Behavioural segments
Show a few example groups such as:

Hurried users

Cautious users

Experienced users

Low-familiarity users

Recommendation
Example:
“Take Variant B into human validation.”

Product positioning

Use language such as:

Synthetic UX Pre-Testing

and:

“Simulate user journeys across competing designs to identify likely usability problems and promising variants before human validation.”

Do not present synthetic users as a replacement for real users or usability research.

Visual direction

Make it feel like a professional internal product/research tool.

Use:

clean layout

strong information hierarchy

restrained use of colour

modern cards and tables

clear metrics

generous spacing

polished empty/loading/result states

Avoid:

excessive gradients

flashy AI visuals

marketing-style landing pages

unnecessary animations

overly rounded playful UI

Technical constraints for this first generation

Keep the codebase simple and easy for developers to continue locally.

Use mock data only.

Do NOT implement:

AI model integration

simulation engine

browser agents

authentication

database

payments

external APIs

complex backend logic

Structure the frontend cleanly so these capabilities can be added later.

The immediate goal is to create a polished, navigable frontend prototype that can be connected to GitHub and developed further locally.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e46e0443-35a8-4c98-879b-0e84ebaaf082).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
