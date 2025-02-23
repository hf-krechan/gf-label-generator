<script lang="ts">
  import { browser } from '$app/environment';
  import { onDestroy } from 'svelte';
  import { base } from '$app/paths';

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
  $: showPreview = (
    (selectedPart === 'Screw' && Boolean(threadSize) && Boolean(length) && Boolean(standard) && Boolean(material)) ||
    (selectedPart === 'Nut' && Boolean(threadSize) && Boolean(standard) && Boolean(material)) ||
    (selectedPart === 'Washer' && Boolean(threadSize) && Boolean(standard) && Boolean(material))
  );

  // Replace the materials array with a material map
  const materialMap = new Map([
    ['A2', 'Stainless Steel'],
    ['A4', 'Stainless Steel'],
    ['gvZn', 'Zinc-Plated Steel'],
    ['BO', 'Black Oxide Steel']
  ]);

  // Replace the standards map with separate maps for screws, nuts, and washers
  const screwStandardsMap = new Map([
    ['DIN 912', 'Socket Head Cap Screw'],
    ['DIN 933', 'Hex Head Screw'],
    ['ISO 4762', 'Socket Head Cap Screw'],
    ['ISO 4014', 'Hex Head Screw']
  ]);

  const nutStandardsMap = new Map([
    ['DIN 934', 'Hex Nut'],
    ['DIN 985', 'Nylon Insert Lock Nut'],
    ['DIN 439', 'Thin Hex Nut'],
    ['DIN 936', 'Low Hex Nut'],
    ['DIN 1587', 'Domed Cap Nut (High Form)'],
    ['DIN 986', 'Nylon Insert Lock Nut'],
    ['DIN 917', 'Low Domed Cap Nut'],
    ['DIN 928', 'Square Weld Nut'],
    ['DIN 929', 'Hex Weld Nut']
  ]);

  const washerStandardsMap = new Map([
    ['DIN 125', 'Flat Washer'],
    ['DIN 1052', 'Flat Washer'],
    ['DIN 127', 'Split Lock Washer'],
    ['DIN 9021', 'Large Flat Washer'],
    ['DIN 433', 'Reduced Outer Diameter Washer'],
    ['DIN 7349', 'Thick Flat Washer'],
    ['DIN 6916', 'HV Washer (Structural Bolting)'],
    ['DIN 6796', 'Conical Spring Washer (Belleville)'],
    ['DIN 137A', 'Curved Spring Washer'],
    ['DIN 137B', 'Wave Spring Washer'],
    ['DIN 7980', 'Spring Lock Washer for Socket Screws']
  ]);

  // Add a helper function to get the correct standards map
  function getStandardsMap(partType: string): Map<string, string> {
    switch (partType) {
      case 'Screw':
        return screwStandardsMap;
      case 'Nut':
        return nutStandardsMap;
      case 'Washer':
        return washerStandardsMap;
      default:
        return new Map();
    }
  }

  // Function to generate the label text (e.g., "M6x25")
  function getLabelText() {
    if (!threadSize) return '';
    
    if (selectedPart === 'Screw' && length) {
      return `${threadSize}x${length}`;
    }
    
    if (selectedPart === 'Nut' || selectedPart === 'Washer') {
      return threadSize;
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

  // Update function name and logic to handle both part types
  function getPartImagePath(standard: string, partType: string): string {
    const standardLower = standard.toLowerCase().replace(' ', '');
    return `${base}/images/${partType.toLowerCase()}s/${standardLower}.svg`;
  }

  // Add a variable to store the SVG content
  let screwSvgContent = '';

  // Add stroke width state with localStorage
  let strokeWidth = browser ? Number(localStorage.getItem('strokeWidth')) || 1.05833 : 1.05833;

  // Save stroke width preference
  $: if (browser) localStorage.setItem('strokeWidth', strokeWidth.toString());

  // First, I'll update the reactive statement to watch both standard and strokeWidth changes
  $: if (standard && strokeWidth) {
    fetchPartSvg(standard);
  }

  // Then, I'll modify the adjustStrokeWidth function to be more thorough
  function adjustStrokeWidth(svgContent: string, width: number): string {
    // Handle both attribute and style-based stroke widths
    return svgContent
        .replace(/stroke-width="[^"]*"/g, `stroke-width="${width}"`)
        .replace(/stroke-width:\s*[^;}"']*[;}"']/g, `stroke-width:${width}`)
        .replace(/strokeWidth="[^"]*"/g, `strokeWidth="${width}"`);
  }

  // Update the fetch function to apply stroke width
  async function fetchPartSvg(standard: string) {
    try {
      const response = await fetch(getPartImagePath(standard, selectedPart));
      const svgText = await response.text();
      const match = svgText.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
      if (match) {
        const adjusted = adjustStrokeWidth(match[1], strokeWidth);
        console.log('Original SVG:', match[1]);
        console.log('Adjusted SVG:', adjusted);
        screwSvgContent = adjusted;
      } else {
        console.error('No SVG content found in response');
        screwSvgContent = '';
      }
    } catch (error) {
      console.error('Error loading SVG:', error);
    }
  }

  // Watch standard changes to update SVG content
  $: if (standard) {
    fetchPartSvg(standard);
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
  $: strokeWidthError = strokeWidth ? validateNumber(strokeWidth.toString(), 0.1, 5) : '';

  // Add state for input helper text
  let lengthHelper = '';
  let horizontalMarginHelper = '';
  let verticalMarginHelper = '';
  let textGapHelper = '';
  let strokeWidthHelper = '';

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
    if (input.id === 'stroke-width') strokeWidthHelper = helperText;
    
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
      case 'gvZn':
      case 'BO':
        return strengthClasses.steel;
      default:
        return [];
    }
  }

  // First, let's define our types
  interface PartData {
    threadSize: string;
    standard: string;
    material: string;
  }

  interface ScrewData extends PartData {
    length: string;
    strengthClass: string;
  }

  interface NutData extends PartData {
    // Add nut-specific fields here if needed
  }

  interface WasherData extends PartData {
    // Add washer-specific fields here if needed
  }

  // Create a type-safe storage manager
  class PartStorageManager {
    private getStorageKey(partType: string): string {
      return `part_${partType.toLowerCase()}_data`;
    }

    save(partType: string, data: PartData | ScrewData | NutData | WasherData): void {
      if (browser) {
        localStorage.setItem(this.getStorageKey(partType), JSON.stringify(data));
      }
    }

    load(partType: string): PartData | ScrewData | NutData | WasherData | null {
      if (!browser) return null;
      
      const stored = localStorage.getItem(this.getStorageKey(partType));
      if (!stored) return null;
      
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
  }

  // Initialize the storage manager
  const storageManager = new PartStorageManager();

  // Update the state management
  let currentData: PartData | ScrewData | NutData | WasherData = {
    threadSize: '',
    standard: '',
    material: '',
    length: '',
    strengthClass: ''
  };

  // Update the watch for part type changes
  $: if (selectedPart) {
    // Load data for new part type first
    const loadedData = storageManager.load(selectedPart);
    if (loadedData) {
      // Update individual bindings
      threadSize = loadedData.threadSize || '';
      standard = loadedData.standard || '';
      material = loadedData.material || '';
      
      if ('length' in loadedData) {
        length = loadedData.length || '';
      }
      if ('strengthClass' in loadedData) {
        strengthClass = loadedData.strengthClass || '';
      }
      
      // Update currentData after loading
      currentData = loadedData;
    } else {
      // Reset to empty state for new part type
      threadSize = '';
      standard = '';
      material = '';
      length = '';
      strengthClass = '';
      
      currentData = {
        threadSize: '',
        standard: '',
        material: '',
        length: '',
        strengthClass: ''
      };
    }
  }

  // Separate reactive statement for saving changes
  $: if (browser && selectedPart && threadSize) {
    currentData = {
      ...currentData,
      threadSize,
      standard,
      material,
      ...(selectedPart === 'Screw' ? { length, strengthClass } : {})
    };
    storageManager.save(selectedPart, currentData);
  }

  // Add this to handle component cleanup
  onDestroy(() => {
    if (selectedPart && (currentData.threadSize || currentData.material || currentData.standard)) {
      storageManager.save(selectedPart, currentData);
    }
  });

  // Optional: Add new debug logging for the current setup
  $: console.log('Selected Part:', selectedPart);
  $: if (selectedPart) {
    console.log('Available Standards:', Array.from(getStandardsMap(selectedPart).keys()));
  }

  // Add available fonts
  const availableFonts = [
    'Arimo',
    'Noto Sans',
    'Radio Canada',
    'Roboto'
  ];

  // Add font selection with localStorage
  let selectedFont = browser ? localStorage.getItem('selectedFont') || 'Roboto' : 'Roboto';

  // Save font selection
  $: if (browser) localStorage.setItem('selectedFont', selectedFont);

  // Update font weight options with more descriptive names
  const fontWeights = [
    { value: '400', label: 'Regular' },
    { value: '500', label: 'Medium' },
    { value: '600', label: 'Semi Bold' },
    { value: '700', label: 'Bold' }
  ];

  // Add separate font weight selections with localStorage
  let labelFontWeight = browser ? localStorage.getItem('labelFontWeight') || '700' : '700';
  let materialFontWeight = browser ? localStorage.getItem('materialFontWeight') || '400' : '400';
  let standardFontWeight = browser ? localStorage.getItem('standardFontWeight') || '600' : '600';

  // Save font weight selections
  $: if (browser) {
    localStorage.setItem('labelFontWeight', labelFontWeight);
    localStorage.setItem('materialFontWeight', materialFontWeight);
    localStorage.setItem('standardFontWeight', standardFontWeight);
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

  {#if selectedPart === 'Screw' || selectedPart === 'Nut' || selectedPart === 'Washer'}
    <div class="mb-4">
      <label for="thread-size" class="mb-2 block font-medium text-gray-700">Select Thread Size:</label>
      <select id="thread-size" bind:value={threadSize} class="w-full rounded border border-gray-300 p-2 text-base">
        <option value="">Choose size...</option>
        {#each threadSizes as size}
          <option value={size}>{size}</option>
        {/each}
      </select>
    </div>

    {#if selectedPart === 'Screw'}
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
    {/if}

    <div class="mb-4">
      <label for="standard" class="mb-2 block font-medium text-gray-700">Select Standard:</label>
      <select id="standard" bind:value={standard} class="w-full rounded border border-gray-300 p-2 text-base">
        <option value="">Choose standard...</option>
        {#if selectedPart}
          {#each Array.from(getStandardsMap(selectedPart).entries()) as [norm, name]}
            <option value={norm}>{norm} - {name}</option>
          {/each}
        {/if}
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

    {#if selectedPart === 'Screw'}
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
    {/if}

    <!-- After the part-specific fields (strength class) but before preview -->
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

    <!-- Replace the current font selector section with this -->
    <div class="mb-4">
      <div class="mb-4">
        <label for="font-family" class="mb-2 block font-medium text-gray-700">Select Font:</label>
        <select id="font-family" bind:value={selectedFont} class="w-full rounded border border-gray-300 p-2 text-base">
          {#each availableFonts as font}
            <option value={font}>{font}</option>
          {/each}
        </select>
      </div>
      
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label for="label-weight" class="mb-2 block font-medium text-gray-700">Label Weight:</label>
          <select id="label-weight" bind:value={labelFontWeight} class="w-full rounded border border-gray-300 p-2 text-base">
            {#each fontWeights as {value, label}}
              <option value={value}>{label}</option>
            {/each}
          </select>
        </div>
        <div>
          <label for="material-weight" class="mb-2 block font-medium text-gray-700">Material Weight:</label>
          <select id="material-weight" bind:value={materialFontWeight} class="w-full rounded border border-gray-300 p-2 text-base">
            {#each fontWeights as {value, label}}
              <option value={value}>{label}</option>
            {/each}
          </select>
        </div>
        <div>
          <label for="standard-weight" class="mb-2 block font-medium text-gray-700">Standard Weight:</label>
          <select id="standard-weight" bind:value={standardFontWeight} class="w-full rounded border border-gray-300 p-2 text-base">
            {#each fontWeights as {value, label}}
              <option value={value}>{label}</option>
            {/each}
          </select>
        </div>
      </div>
    </div>

    <!-- Add after the margin controls -->
    <div class="mb-4">
      <label for="stroke-width" class="mb-2 block font-medium text-gray-700">Line Thickness:</label>
      <input 
        id="stroke-width"
        type="number"
        min="0.1"
        max="5"
        step="0.1"
        bind:value={strokeWidth}
        placeholder="Line thickness"
        class="w-full rounded border border-gray-300 p-2 text-base {strokeWidthError ? 'border-red-500' : ''}"
        aria-invalid={Boolean(strokeWidthError)}
      />
      {#if strokeWidthHelper}
        <p class="mt-1 text-sm text-gray-500">{strokeWidthHelper}</p>
      {/if}
      {#if strokeWidthError}
        <p class="mt-1 text-sm text-red-600">{strokeWidthError}</p>
      {/if}
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
            font-weight={standardFontWeight}
            fill="white" 
            text-anchor="middle"
            dominant-baseline="middle"
            transform={`rotate(-90, ${STANDARD_BOX_WIDTH/2}, ${effectiveHeight/2})`}
            font-family="{selectedFont}"
          >{standard}</text>
        </g>

        <!-- Text elements -->
        <text 
          x={textXPosition}
          y={verticalMargin * 10 + 40} 
          font-size={LABEL_FONT_SIZE}
          font-weight={labelFontWeight}
          font-family="{selectedFont}"
          text-anchor="end"
        >{getLabelText()}</text>
        <text 
          x={textXPosition}
          y={verticalMargin * 10 + 90} 
          font-size={MATERIAL_FONT_SIZE}
          font-weight={materialFontWeight}
          font-family="{selectedFont}"
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
