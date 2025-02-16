<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let selectedPart = '';
  let threadSize = '';
  let length = '';
  let standard = '';
  let material = '';
  
  const partTypes = ['Screw', 'Nut', 'Washer'];
  const threadSizes = ['M3', 'M4', 'M5', 'M6', 'M8', 'M10'];
  const standards = ['DIN 912', 'DIN 933', 'ISO 4762', 'ISO 4014'];
  const materials = ['Stainless Steel A2', 'Stainless Steel A4', 'Zinc-Plated Steel', 'Black Oxide Steel'];

  let showPreview = false;

  // Add this reactive statement
  $: showPreview = selectedPart === 'Screw' && 
                   Boolean(threadSize) && 
                   Boolean(length) && 
                   Boolean(standard) && 
                   Boolean(material);

  // Load saved data on component mount
  onMount(() => {
    if (browser) {
      const savedData = localStorage.getItem('partLabelData');
      if (savedData) {
        const data = JSON.parse(savedData);
        selectedPart = data.selectedPart;
        threadSize = data.threadSize;
        length = data.length;
        standard = data.standard;
        material = data.material;
      }
    }
  });

  // Save data whenever any value changes
  $: {
    if (browser) {
      const data = { selectedPart, threadSize, length, standard, material };
      localStorage.setItem('partLabelData', JSON.stringify(data));
    }
  }

  // Function to generate the label text (e.g., "M6x25")
  function getLabelText() {
    if (selectedPart === 'Screw' && threadSize && length) {
      return `${threadSize}x${length}`;
    }
    return '';
  }

  // Function to get material text in German format
  function getMaterialText() {
    if (material === 'Zinc-Plated Steel') return 'Stahl vz';
    // Add other material translations as needed
    return material;
  }

  // Function to get the correct SVG path based on the standard
  function getScrewImagePath(standard: string): string {
    const standardLower = standard.toLowerCase().replace(' ', '');
    return `/images/screws/${standardLower}.svg`;
  }

  async function downloadSVG() {
    const svgElement = document.querySelector('.svg-preview svg');
    if (!svgElement) return;
    
    // Create clone and set original dimensions for download
    const svgClone = svgElement.cloneNode(true) as SVGElement;
    svgClone.setAttribute('width', '35mm');
    svgClone.setAttribute('height', '12mm');
    
    // Fetch and convert screw image to base64
    const screwResponse = await fetch(getScrewImagePath(standard));
    const screwBlob = await screwResponse.blob();
    const screwBase64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(screwBlob);
    });

    // Create a clone of the SVG and update the image href
    const imageElement = svgClone.querySelector('image');
    if (imageElement) {
      imageElement.setAttribute('href', screwBase64 as string);
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
      <label for="standard" class="mb-2 block font-medium text-gray-700">Select Standard:</label>
      <select id="standard" bind:value={standard} class="w-full rounded border border-gray-300 p-2 text-base">
        <option value="">Choose standard...</option>
        {#each standards as std}
          <option value={std}>{std}</option>
        {/each}
      </select>
    </div>

    <div class="mb-4">
      <label for="material" class="mb-2 block font-medium text-gray-700">Select Material:</label>
      <select id="material" bind:value={material} class="w-full rounded border border-gray-300 p-2 text-base">
        <option value="">Choose material...</option>
        {#each materials as mat}
          <option value={mat}>{mat}</option>
        {/each}
      </select>
    </div>

    <div class="mb-4">
      <label for="length" class="mb-2 block font-medium text-gray-700">Screw Length (mm):</label>
      <input 
        id="length"
        type="number"
        min="1"
        bind:value={length}
        placeholder="Enter length in mm"
        class="w-full rounded border border-gray-300 p-2 text-base"
      />
    </div>
  {/if}

  {#if selectedPart}
    <div class="mt-8 rounded border border-gray-300 p-4">
      <h2 class="mb-4 text-xl font-semibold text-gray-700">Label Preview:</h2>
      <div class="rounded bg-gray-100 p-4">
        <p class="mb-2">{selectedPart}</p>
        {#if selectedPart === 'Screw'}
          {#if threadSize}
            <p class="mb-2">Thread: {threadSize}</p>
          {/if}
          {#if length}
            <p class="mb-2">Length: {length}mm</p>
          {/if}
          {#if standard}
            <p class="mb-2">Standard: {standard}</p>
          {/if}
          {#if material}
            <p class="mb-2">Material: {material}</p>
          {/if}
        {/if}
      </div>
    </div>
  {/if}

  {#if showPreview}
    <div class="mt-8 rounded border border-gray-300 bg-white p-4">
      <svg 
        width="140mm" 
        height="48mm" 
        viewBox="0 0 350 120" 
        preserveAspectRatio="xMidYMid meet"
        class="preview-svg"
      >
        <!-- Background -->
        <rect width="350" height="120" fill="#E0E0E0"/>
        
        <!-- Screw image -->
        <image 
          x="15" 
          y="30"
          width="90"
          height="60"
          href={getScrewImagePath(standard)}
        />

        <!-- Standard (DIN) in black box -->
        <g transform="translate(300,0)">
          <rect width="30" height="120" fill="black"/>
          <text 
            x="15" 
            y="60" 
            font-size="13" 
            font-weight="bold" 
            fill="white" 
            text-anchor="middle"
            dominant-baseline="middle"
            transform="rotate(-90, 15, 60)"
            font-family="Verdana"
          >{standard}</text>
        </g>

        <!-- Text elements -->
        <text 
          x="280" 
          y="40" 
          font-size="35" 
          font-weight="bold" 
          font-family="Verdana"
          text-anchor="end"
        >{getLabelText()}</text>
        <text 
          x="280" 
          y="90" 
          font-size="12" 
          font-family="Verdana"
          text-anchor="end"
        >{getMaterialText()}</text>
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
  /* Keep only SVG-specific styles */
  .preview-svg {
    width: 140mm;
    height: 48mm;
  }

  svg {
    width: 35mm;
    height: 12mm;
  }
</style>
