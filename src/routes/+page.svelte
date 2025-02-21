<script lang="ts">
  import { browser } from '$app/environment';

  // Physical dimensions including margins
  const PHYSICAL_WIDTH = 38;  // Already includes margins
  const PHYSICAL_HEIGHT = 12; // Already includes margins

  // SVG viewport dimensions (used for internal coordinates)
  const SVG_WIDTH = PHYSICAL_WIDTH * 10;
  const SVG_HEIGHT = PHYSICAL_HEIGHT * 10;

  // SVG dimensions constants
  const SOURCE_SVG_WIDTH = 100;  // Width of the source SVG (din912.svg)
  const DESIRED_SCREW_WIDTH = 130;  // Desired width in SVG units
  const SCREW_IMAGE_HEIGHT = 100;
  const STANDARD_BOX_WIDTH = 30;  // Width of the black box
  
  // Add font size constants
  const LABEL_FONT_SIZE = 38;     // Size for the main label (e.g., "M6x25")
  const MATERIAL_FONT_SIZE = 20;   // Size for the material text
  const STANDARD_FONT_SIZE = 15;   // Size for the standard text in black box

  // Calculate scale based on desired width
  const SCREW_SCALE = DESIRED_SCREW_WIDTH / SOURCE_SVG_WIDTH;  // This will give us 1.4

  // Calculate effective height after scaling (used for vertical positioning)
  const EFFECTIVE_SCREW_HEIGHT = SCREW_IMAGE_HEIGHT * SCREW_SCALE;

  // Initialize with stored values or empty strings
  let selectedPart = browser ? localStorage.getItem('selectedPart') || '' : '';
  let threadSize = browser ? localStorage.getItem('threadSize') || '' : '';
  let length = browser ? localStorage.getItem('length') || '' : '';
  let standard = browser ? localStorage.getItem('standard') || '' : '';
  let material = browser ? localStorage.getItem('material') || '' : '';
  
  // Add new margin controls with default values
  let horizontalMargin = browser ? Number(localStorage.getItem('horizontalMargin')) || 2 : 2;
  let verticalMargin = browser ? Number(localStorage.getItem('verticalMargin')) || 1 : 1;
  
  // Add new gap control with default value
  let textGap = browser ? Number(localStorage.getItem('textGap')) || 10 : 10;
  
  const partTypes = ['Screw', 'Nut', 'Washer'];
  const threadSizes = ['M3', 'M4', 'M5', 'M6', 'M8', 'M10'];
  const standards = ['DIN 912', 'DIN 933', 'ISO 4762', 'ISO 4014'];

  // Replace the single strengthClasses array with material-specific arrays
  const strengthClasses = {
    steel: ['8.8', '10.9', '12.9'],
    A2: ['70', '80'],
    A4: ['70', '80']
  };

  // Add new state variable with localStorage
  let strengthClass = browser ? localStorage.getItem('strengthClass') || '' : '';

  // Add localStorage save for strength class
  $: if (browser && strengthClass) localStorage.setItem('strengthClass', strengthClass);

  // Save individual values when they change
  $: if (browser && selectedPart) localStorage.setItem('selectedPart', selectedPart);
  $: if (browser && threadSize) localStorage.setItem('threadSize', threadSize);
  $: if (browser && length) localStorage.setItem('length', length);
  $: if (browser && standard) localStorage.setItem('standard', standard);
  $: if (browser && material) localStorage.setItem('material', material);
  
  // Save margin values as strings in localStorage
  $: if (browser) localStorage.setItem('horizontalMargin', horizontalMargin.toString());
  $: if (browser) localStorage.setItem('verticalMargin', verticalMargin.toString());
  
  // Save gap value in localStorage
  $: if (browser) localStorage.setItem('textGap', textGap.toString());
  
  // Calculate effective dimensions based on margins
  $: effectiveWidth = SVG_WIDTH - 2 * (horizontalMargin * 10);
  $: effectiveHeight = SVG_HEIGHT - 2 * (verticalMargin * 10);
  
  // Adjust x positions based on margin
  $: screwXPosition = horizontalMargin * 10;
  $: standardXPosition = effectiveWidth - STANDARD_BOX_WIDTH + horizontalMargin * 10;
  $: textXPosition = standardXPosition - textGap;

  // Update Y position calculation to use effective height
  $: screwYPosition = SVG_HEIGHT / 2 - (EFFECTIVE_SCREW_HEIGHT / 2);

  // Reactive statement for preview
  $: showPreview = selectedPart === 'Screw' && 
                   Boolean(threadSize) && 
                   Boolean(length) && 
                   Boolean(standard) && 
                   Boolean(material);

  // Replace the materials array with a material map
  const materialMap = new Map([
    ['A2', 'Stainless Steel'],
    ['A4', 'Stainless Steel'],
    ['Zn', 'Zinc-Plated Steel'],
    ['BO', 'Black Oxide Steel']
  ]);

  // Replace the standards array with a standards map
  const standardsMap = new Map([
    ['DIN 912', 'Socket Head Cap Screw'],
    ['DIN 933', 'Hex Head Screw'],
    ['ISO 4762', 'Socket Head Cap Screw'],
    ['ISO 4014', 'Hex Head Screw']
  ]);

  // Function to generate the label text (e.g., "M6x25")
  function getLabelText() {
    if (selectedPart === 'Screw' && threadSize && length) {
      return `${threadSize}x${length}`;
    }
    return '';
  }

  // Function to get material text in German format
  function getMaterialText() {
    if (!material) return '';
    
    if (!strengthClass) return material;
    
    
    // For other materials, show short format with strength class
    return `${material} - ${strengthClass}`;
  }

  // Function to get the correct SVG path based on the standard
  function getScrewImagePath(standard: string): string {
    const standardLower = standard.toLowerCase().replace(' ', '');
    return `/images/screws/${standardLower}.svg`;
  }

  // Add a variable to store the SVG content
  let screwSvgContent = '';

  // Modify the function to fetch SVG content
  async function fetchScrewSvg(standard: string) {
    try {
      const response = await fetch(getScrewImagePath(standard));
      const svgText = await response.text();
      // Extract the content inside the svg tags
      const match = svgText.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
      screwSvgContent = match ? match[1] : '';
    } catch (error) {
      console.error('Error loading SVG:', error);
    }
  }

  // Watch standard changes to update SVG content
  $: if (standard) {
    fetchScrewSvg(standard);
  }

  // Update the download function to be simpler
  async function downloadSVG() {
    const svgElement = document.querySelector('.preview-svg');
    if (!svgElement) return;
    
    // Create clone of the SVG
    const svgClone = svgElement.cloneNode(true) as SVGElement;
    
    // Remove the background rectangle from the clone
    const backgroundRect = svgClone.querySelector('rect[width="' + SVG_WIDTH + '"]');
    if (backgroundRect) {
        backgroundRect.remove();
    }
    
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgClone);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${threadSize}x${length}_${standard}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Add toggle for margin visualization
  let showMargins = false;

  // Validation functions
  function validateNumber(value: string, min: number, max?: number): string {
    const num = Number(value);
    if (isNaN(num)) return 'Must be a number';
    if (num < min) return `Must be at least ${min}`;
    if (max && num > max) return `Must be less than ${max}`;
    return '';
  }

  // Reactive validation
  $: lengthError = length ? validateNumber(length, 1) : '';
  $: horizontalMarginError = horizontalMargin ? validateNumber(horizontalMargin.toString(), 0, 30) : '';
  $: verticalMarginError = verticalMargin ? validateNumber(verticalMargin.toString(), 0, 30) : '';
  $: textGapError = textGap ? validateNumber(textGap.toString(), 0, 100) : '';

  // Add state for input helper text
  let lengthHelper = '';
  let horizontalMarginHelper = '';
  let verticalMarginHelper = '';
  let textGapHelper = '';

  // Update input handler to show/hide helper text
  function handleInput(event: Event, setter: (val: string) => void) {
    const input = event.target as HTMLInputElement;
    const originalValue = input.value;
    const cleanValue = originalValue.replace(/[^\d]/g, '');
    
    // Show helper text if non-numeric characters were removed
    const helperText = originalValue !== cleanValue ? 'Only numbers allowed' : '';
    
    // Update helper text based on input id
    if (input.id === 'length') lengthHelper = helperText;
    if (input.id === 'horizontal-margin') horizontalMarginHelper = helperText;
    if (input.id === 'vertical-margin') verticalMarginHelper = helperText;
    if (input.id === 'text-gap') textGapHelper = helperText;
    
    setter(cleanValue);
  }

  // In the input handlers, convert string to number
  function handleMarginInput(event: Event, setter: (val: number) => void) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^\d]/g, '');
    setter(Number(value));
  }

  // Add helper function to get appropriate strength classes
  function getStrengthClassesForMaterial(material: string): string[] {
    switch (material) {
      case 'A2':
        return strengthClasses.A2;
      case 'A4':
        return strengthClasses.A4;
      case 'Zn':
      case 'BO':
        return strengthClasses.steel;
      default:
        return [];
    }
  }
</script>

<main class="container mx-auto max-w-2xl p-8">
  <h1 class="mb-8 text-center text-2xl font-bold text-gray-800">Hardware Part Label Creator</h1>
  
  <div class="mb-4">
    <label for="part-type" class="mb-2 block font-medium text-gray-700">Select Part Type:</label>
    <select id="part-type" bind:value={selectedPart} class="w-full rounded border border-gray-300 p-2 text-base">
      <option value="">Choose a part...</option>
      {#each partTypes as part}
        <option value={part}>{part}</option>
      {/each}
    </select>
  </div>

  {#if selectedPart === 'Screw'}
    <div class="mb-4">
      <label for="thread-size" class="mb-2 block font-medium text-gray-700">Select Thread Size:</label>
      <select id="thread-size" bind:value={threadSize} class="w-full rounded border border-gray-300 p-2 text-base">
        <option value="">Choose size...</option>
        {#each threadSizes as size}
          <option value={size}>{size}</option>
        {/each}
      </select>
    </div>

    <div class="mb-4">
      <label for="length" class="mb-2 block font-medium text-gray-700">Screw Length (mm):</label>
      <input 
        id="length"
        type="number"
        min="1"
        step="1"
        bind:value={length}
        on:beforeinput={(e) => {
          if (!/^\d*$/.test(e.data || '')) {
            e.preventDefault();
            lengthHelper = 'Only numbers allowed';
          } else {
            lengthHelper = '';
          }
        }}
        placeholder="Enter length in mm"
        class="w-full rounded border border-gray-300 p-2 text-base {lengthError ? 'border-red-500' : ''}"
        aria-invalid={Boolean(lengthError)}
      />
      {#if lengthHelper}
        <p class="mt-1 text-sm text-gray-500">{lengthHelper}</p>
      {/if}
      {#if lengthError}
        <p class="mt-1 text-sm text-red-600">{lengthError}</p>
      {/if}
    </div>

    <div class="mb-4">
      <label for="standard" class="mb-2 block font-medium text-gray-700">Select Standard:</label>
      <select id="standard" bind:value={standard} class="w-full rounded border border-gray-300 p-2 text-base">
        <option value="">Choose standard...</option>
        {#each Array.from(standardsMap.entries()) as [norm, name]}
          <option value={norm}>{norm} - {name}</option>
        {/each}
      </select>
    </div>

    <div class="mb-4">
      <label for="material" class="mb-2 block font-medium text-gray-700">Select Material:</label>
      <select id="material" bind:value={material} class="w-full rounded border border-gray-300 p-2 text-base">
        <option value="">Choose material...</option>
        {#each Array.from(materialMap.entries()) as [shortName, longName]}
          <option value={shortName}>{shortName} - {longName}</option>
        {/each}
      </select>
    </div>

    <!-- Add after the material select element -->
    <div class="mb-4">
      <label for="strength" class="mb-2 block font-medium text-gray-700">Select Strength Class:</label>
      <select 
        id="strength" 
        bind:value={strengthClass} 
        class="w-full rounded border border-gray-300 p-2 text-base"
        disabled={!material}
      >
        <option value="">Choose strength class...</option>
        {#each getStrengthClassesForMaterial(material) as sc}
          <option value={sc}>{sc}</option>
        {/each}
      </select>
    </div>

    <!-- Add after the length input, but before the preview section -->
    <div class="flex gap-4 mb-4">
      <div class="flex-1">
        <label for="horizontal-margin" class="mb-2 block font-medium text-gray-700">Horizontal Margin (mm):</label>
        <input 
          id="horizontal-margin"
          type="number"
          min="0"
          max="30"
          step="1"
          bind:value={horizontalMargin}
          on:beforeinput={(e) => {
            if (!/^\d*$/.test(e.data || '')) {
              e.preventDefault();
              horizontalMarginHelper = 'Only numbers allowed';
            } else {
              horizontalMarginHelper = '';
            }
          }}
          placeholder="Left/Right margin"
          class="w-full rounded border border-gray-300 p-2 text-base {horizontalMarginError ? 'border-red-500' : ''}"
          aria-invalid={Boolean(horizontalMarginError)}
        />
        {#if horizontalMarginHelper}
          <p class="mt-1 text-sm text-gray-500">{horizontalMarginHelper}</p>
        {/if}
        {#if horizontalMarginError}
          <p class="mt-1 text-sm text-red-600">{horizontalMarginError}</p>
        {/if}
      </div>
      <div class="flex-1">
        <label for="vertical-margin" class="mb-2 block font-medium text-gray-700">Vertical Margin (mm):</label>
        <input 
          id="vertical-margin"
          type="number"
          min="0"
          max="30"
          step="1"
          bind:value={verticalMargin}
          on:input={(e) => {
            const value = e.currentTarget.value;
            if (!/^\d*$/.test(value)) {
              verticalMarginHelper = 'Only numbers allowed';
            } else {
              verticalMarginHelper = '';
            }
          }}
          placeholder="Top/Bottom margin"
          class="w-full rounded border border-gray-300 p-2 text-base {verticalMarginError ? 'border-red-500' : ''}"
          aria-invalid={Boolean(verticalMarginError)}
        />
        {#if verticalMarginHelper}
          <p class="mt-1 text-sm text-gray-500">{verticalMarginHelper}</p>
        {/if}
        {#if verticalMarginError}
          <p class="mt-1 text-sm text-red-600">{verticalMarginError}</p>
        {/if}
      </div>
      <div class="flex-1">
        <label for="text-gap" class="mb-2 block font-medium text-gray-700">Text Gap (mm):</label>
        <input 
          id="text-gap"
          type="number"
          min="0"
          max="100"
          step="1"
          bind:value={textGap}
          on:beforeinput={(e) => {
            if (!/^\d*$/.test(e.data || '')) {
              e.preventDefault();
              textGapHelper = 'Only numbers allowed';
            } else {
              textGapHelper = '';
            }
          }}
          placeholder="Text distance"
          class="w-full rounded border border-gray-300 p-2 text-base {textGapError ? 'border-red-500' : ''}"
          aria-invalid={Boolean(textGapError)}
        />
        {#if textGapHelper}
          <p class="mt-1 text-sm text-gray-500">{textGapHelper}</p>
        {/if}
        {#if textGapError}
          <p class="mt-1 text-sm text-red-600">{textGapError}</p>
        {/if}
      </div>
    </div>

    <!-- Add after the margin inputs -->
    <div class="mb-4">
      <label class="flex items-center gap-2">
        <input 
          type="checkbox" 
          bind:checked={showMargins}
          class="h-4 w-4 rounded border-gray-300"
        />
        <span class="font-medium text-gray-700">Show margins</span>
      </label>
    </div>
  {/if}


  {#if showPreview}
    <div class="mt-8 rounded border border-gray-300 bg-white p-4">
      <h2 class="mb-4 text-xl font-semibold text-gray-700">Label Preview</h2>
      <svg 
        class="preview-svg"
        width={`${PHYSICAL_WIDTH}mm`}
        height={`${PHYSICAL_HEIGHT}mm`}
        viewBox="0 0 {SVG_WIDTH} {SVG_HEIGHT}" 
        preserveAspectRatio="xMidYMid meet"
      >
        <!-- Background -->
        <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="#E0E0E0"/>
        
        <!-- Screw image -->
        {#if screwSvgContent}
          <g 
            transform="translate({screwXPosition} {screwYPosition}) scale({SCREW_SCALE})"
          >
            {@html screwSvgContent}
          </g>
        {/if}

        <!-- Standard (DIN) in black box -->
        <g transform={`translate(${standardXPosition},${verticalMargin * 10})`}>
          <rect 
            width={STANDARD_BOX_WIDTH}
            height={effectiveHeight}
            fill="black"
          />
          <text 
            x={STANDARD_BOX_WIDTH/2}
            y={effectiveHeight/2} 
            font-size={STANDARD_FONT_SIZE}
            font-weight="bold" 
            fill="white" 
            text-anchor="middle"
            dominant-baseline="middle"
            transform={`rotate(-90, ${STANDARD_BOX_WIDTH/2}, ${effectiveHeight/2})`}
            font-family="Verdana"
          >{standard}</text>
        </g>

        <!-- Text elements -->
        <text 
          x={textXPosition}
          y={verticalMargin * 10 + 40} 
          font-size={LABEL_FONT_SIZE}
          font-weight="bold" 
          font-family="Verdana"
          text-anchor="end"
        >{getLabelText()}</text>
        <text 
          x={textXPosition}
          y={verticalMargin * 10 + 90} 
          font-size={MATERIAL_FONT_SIZE}
          font-family="Verdana"
          text-anchor="end"
        >{getMaterialText()}</text>

        <!-- Margin visualization -->
        {#if showMargins}
          <!-- Left margin -->
          <rect 
            x="0" 
            y="0" 
            width={horizontalMargin * 10} 
            height={SVG_HEIGHT} 
            fill="rgba(255,0,0,0.2)"
          />
          <!-- Right margin -->
          <rect 
            x={SVG_WIDTH - horizontalMargin * 10} 
            y="0" 
            width={horizontalMargin * 10} 
            height={SVG_HEIGHT} 
            fill="rgba(255,0,0,0.2)"
          />
          <!-- Top margin -->
          <rect 
            x="0" 
            y="0" 
            width={SVG_WIDTH} 
            height={verticalMargin * 10} 
            fill="rgba(255,0,0,0.2)"
          />
          <!-- Bottom margin -->
          <rect 
            x="0" 
            y={SVG_HEIGHT - verticalMargin * 10} 
            width={SVG_WIDTH} 
            height={verticalMargin * 10} 
            fill="rgba(255,0,0,0.2)"
          />
        {/if}
      </svg>
      <button 
        class="mt-4 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        on:click={downloadSVG}
      >
        Download SVG
      </button>
    </div>
  {/if}
</main>

<style>
  .preview-svg {
    /* Make preview larger for better visibility */
    width: 140mm;
    height: 48mm;
  }
</style>
