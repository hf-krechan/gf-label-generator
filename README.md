# Screw Visualization App

A web application for visualizing and exploring different types of screws, built with SvelteKit.

## Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd [repository-name]
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
# or
yarn install
```

## Development

To start the development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

The app will be available at `http://localhost:5173` by default.

## Building for Production

To create a production version of the app:

```bash
npm run build
```

You can preview the production build with:
```bash
npm run preview
```

## Features

- Interactive 3D visualization of various screw types
- Detailed specifications and measurements
- Easy-to-use interface for exploring different screw variants

## Technology Stack

- SvelteKit - Frontend framework
- Three.js - 3D visualization
- TypeScript - Type safety and better developer experience

## Image Guidelines

### Technical Specifications

- Image Format: SVG (created in Inkscape)
- Dimensions: 95mm × 50mm (width × height)
- Stroke Width: 1.25mm
- Resolution: Vector-based for optimal scaling
- Location: `static/images/screws/`, `static/images/washers/`, `static/images/nuts/`

### Best Practices

- Use metric units (mm) for consistency with engineering standards
- Ensure drawings are to scale
- Include key measurements and specifications
- Use black strokes on white background for optimal print quality
- Export as optimized SVG for web use

### File Naming Convention

- Screws: `[standard]-[type].svg` (e.g., `din912.svg`)
- Washers: `washer-[type].svg`
- Nuts: `nut-[type].svg`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
